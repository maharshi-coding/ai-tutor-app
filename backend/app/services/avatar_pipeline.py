from __future__ import annotations

from dataclasses import dataclass
import hashlib
from pathlib import Path
import shutil
import subprocess
from typing import Optional
import uuid

import httpx

from app.config import settings
from app.database import SessionLocal
from app.models import User
from app.services.tts import ensure_voice_audio


UPLOAD_DIR = Path(settings.UPLOAD_DIR)
AVATAR_VIDEO_DIR = UPLOAD_DIR / "avatar_videos"

# Maps job_id -> {"status": str, "video_url": str|None, "error": str|None}
_jobs: dict[str, dict[str, Optional[str]]] = {}


@dataclass(frozen=True)
class AvatarJobRequest:
    user_id: int
    avatar_photo_path: Optional[str]
    avatar_config: Optional[dict]
    text: Optional[str] = None
    audio_url: Optional[str] = None
    image_url: Optional[str] = None


def get_job_status(job_id: str) -> dict[str, Optional[str]] | None:
    return _jobs.get(job_id)


def create_avatar_job(_request: AvatarJobRequest) -> str:
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"status": "pending", "video_url": None, "error": None}
    return job_id


def mark_job_status(
    job_id: str,
    *,
    status: str,
    video_url: Optional[str] = None,
    error: Optional[str] = None,
) -> None:
    _jobs[job_id] = {
        "status": status,
        "video_url": video_url,
        "error": error,
    }


def resolve_reference_image(
    avatar_photo_path: Optional[str],
    avatar_config: Optional[dict],
    image_url: Optional[str] = None,
) -> Optional[Path]:
    if image_url:
        candidate = UPLOAD_DIR / image_url.lstrip("/").removeprefix("uploads/")
        if candidate.exists():
            return candidate

    config = avatar_config or {}
    generated_avatar = config.get("character_image_url")
    if isinstance(generated_avatar, str) and generated_avatar.strip():
        candidate = UPLOAD_DIR / generated_avatar.lstrip("/").removeprefix("uploads/")
        if candidate.exists():
            return candidate

    if avatar_photo_path:
        candidate = Path(avatar_photo_path)
        if candidate.exists():
            return candidate

    if settings.SADTALKER_REF_IMAGE:
        candidate = Path(settings.SADTALKER_REF_IMAGE)
        if candidate.exists():
            return candidate

    return None


async def _resolve_audio_bytes(request: AvatarJobRequest) -> bytes:
    if request.audio_url:
        audio_path = UPLOAD_DIR / request.audio_url.lstrip("/").removeprefix("uploads/")
        if audio_path.exists():
            return audio_path.read_bytes()

    if request.text:
        artifact = await ensure_voice_audio(request.user_id, request.text)
        return artifact.absolute_path.read_bytes()

    raise ValueError("Provide either audio_url or text for avatar generation.")


def _cache_video_path(user_id: int, image_path: Path, audio_bytes: bytes) -> tuple[Path, str]:
    AVATAR_VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    with open(image_path, "rb") as image_file:
        image_head = image_file.read(1024)

    cache_key = hashlib.sha256(image_head + audio_bytes[:1024]).hexdigest()[:20]
    filename = f"{user_id}_{cache_key}.mp4"
    return AVATAR_VIDEO_DIR / filename, filename


def _maybe_compress_video(video_path: Path) -> None:
    if not settings.ENABLE_VIDEO_COMPRESSION:
        return
    if shutil.which(settings.FFMPEG_BINARY) is None:
        return

    optimized_path = video_path.with_name(f"{video_path.stem}_optimized{video_path.suffix}")
    cmd = [
        settings.FFMPEG_BINARY,
        "-y",
        "-i",
        str(video_path),
        "-vcodec",
        "libx264",
        "-crf",
        str(settings.VIDEO_COMPRESSION_CRF),
        "-preset",
        "veryfast",
        "-acodec",
        "aac",
        str(optimized_path),
    ]

    try:
        subprocess.run(
            cmd,
            capture_output=True,
            check=True,
            timeout=settings.VIDEO_COMPRESSION_TIMEOUT_SECONDS,
        )
        if optimized_path.exists() and optimized_path.stat().st_size > 0:
            optimized_path.replace(video_path)
    except Exception:
        optimized_path.unlink(missing_ok=True)


def _update_last_generated_clip(user_id: int, video_url: str) -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            return
        config = dict(user.avatar_config or {})
        config["last_generated_clip_url"] = video_url
        user.avatar_config = config
        db.commit()
    finally:
        db.close()


async def render_avatar_video(request: AvatarJobRequest) -> str:
    image_path = resolve_reference_image(
        request.avatar_photo_path,
        request.avatar_config,
        request.image_url,
    )
    if image_path is None:
        raise ValueError(
            "No reference image available. Upload a photo first or set SADTALKER_REF_IMAGE."
        )

    audio_bytes = await _resolve_audio_bytes(request)
    video_path, filename = _cache_video_path(request.user_id, image_path, audio_bytes)

    if video_path.exists():
        video_url = f"/uploads/avatar_videos/{filename}"
        _update_last_generated_clip(request.user_id, video_url)
        return video_url

    async with httpx.AsyncClient(timeout=settings.SADTALKER_TIMEOUT_SECONDS) as client:
        response = await client.post(
            f"{settings.SADTALKER_API_URL}/generate",
            files={
                "source_image": ("image.png", image_path.read_bytes(), "image/png"),
                "driven_audio": ("audio.wav", audio_bytes, "audio/wav"),
            },
        )
    response.raise_for_status()

    video_bytes = response.content
    if not video_bytes:
        raise ValueError("SadTalker returned empty video")

    video_path.write_bytes(video_bytes)
    _maybe_compress_video(video_path)

    video_url = f"/uploads/avatar_videos/{filename}"
    _update_last_generated_clip(request.user_id, video_url)
    return video_url


async def run_avatar_job(job_id: str, request: AvatarJobRequest) -> None:
    mark_job_status(job_id, status="processing")

    try:
        video_url = await render_avatar_video(request)
        mark_job_status(job_id, status="done", video_url=video_url)
    except httpx.ConnectError:
        mark_job_status(
            job_id,
            status="failed",
            error=f"SadTalker service is not running at {settings.SADTALKER_API_URL}",
        )
    except Exception as exc:
        mark_job_status(job_id, status="failed", error=repr(exc))
