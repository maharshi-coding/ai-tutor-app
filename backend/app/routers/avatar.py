"""SadTalker avatar video generation endpoint.

Sync endpoint  : POST /api/avatar          (legacy, kept for web UI)
Async endpoints: POST /api/avatar/generate  → {job_id}
                 GET  /api/avatar/job/{job_id} → {status, video_url?}

Mobile clients (React Native) use the async pair so the UI can poll
without blocking, while the original sync endpoint is preserved for the
Next.js web frontend.
"""

from pathlib import Path
from typing import Optional
import hashlib
import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel

from app.config import settings
from app.models import User
from app.routers.auth import get_current_user

router = APIRouter()

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
AVATAR_VIDEO_DIR = UPLOAD_DIR / "avatar_videos"

# ── In-memory job store ────────────────────────────────────────────────────────
# Maps job_id → {"status": str, "video_url": str|None, "error": str|None}
# For production, replace with a Redis or DB-backed store.
_jobs: dict[str, dict] = {}


class AvatarRequest(BaseModel):
    audio_url: Optional[str] = None
    text: Optional[str] = None
    image_url: Optional[str] = None


class AvatarResponse(BaseModel):
    video_url: str


class AvatarJobCreate(BaseModel):
    """Request body for the async /api/avatar/generate endpoint."""
    text: Optional[str] = None
    audio_url: Optional[str] = None
    image_url: Optional[str] = None


class AvatarJobStatus(BaseModel):
    job_id: str
    status: str  # pending | processing | done | failed
    video_url: Optional[str] = None
    error: Optional[str] = None


async def _tts_audio_bytes(text: str) -> bytes:
    """Generate audio via Kokoro TTS and return raw WAV bytes."""
    payload = {"text": text, "voice": "af_heart", "speed": 1.0}
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{settings.KOKORO_API_URL}/v1/audio/speech",
            json=payload,
        )
    resp.raise_for_status()
    return resp.content


@router.post("/avatar", response_model=AvatarResponse)
async def generate_avatar_video(
    req: AvatarRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Generate a talking-head avatar video using SadTalker.

    Provide either ``audio_url`` (path to a WAV file already on the server)
    or ``text`` (will be converted to speech via Kokoro TTS first).
    Optionally supply ``image_url`` for the reference face image; otherwise
    the user's uploaded avatar photo or the configured default is used.
    """
    AVATAR_VIDEO_DIR.mkdir(parents=True, exist_ok=True)

    # --- Resolve reference image ------------------------------------------------
    image_path: Optional[Path] = None
    if req.image_url:
        candidate = UPLOAD_DIR / req.image_url.lstrip("/").removeprefix("uploads/")
        if candidate.exists():
            image_path = candidate
    if image_path is None and current_user.avatar_photo_path:
        candidate = Path(current_user.avatar_photo_path)
        if candidate.exists():
            image_path = candidate
    if image_path is None and settings.SADTALKER_REF_IMAGE:
        candidate = Path(settings.SADTALKER_REF_IMAGE)
        if candidate.exists():
            image_path = candidate
    if image_path is None:
        raise HTTPException(
            status_code=400,
            detail="No reference image available. Upload a photo first or set SADTALKER_REF_IMAGE.",
        )

    # --- Resolve audio ----------------------------------------------------------
    audio_bytes: Optional[bytes] = None
    if req.audio_url:
        audio_path = UPLOAD_DIR / req.audio_url.lstrip("/").removeprefix("uploads/")
        if audio_path.exists():
            audio_bytes = audio_path.read_bytes()
    if audio_bytes is None and req.text:
        try:
            audio_bytes = await _tts_audio_bytes(req.text)
        except Exception as exc:
            raise HTTPException(
                status_code=502,
                detail=f"TTS generation failed (needed for avatar): {exc!r}",
            )
    if audio_bytes is None:
        raise HTTPException(
            status_code=400,
            detail="Provide either audio_url or text for avatar generation.",
        )

    # --- Call SadTalker ----------------------------------------------------------
    with open(image_path, "rb") as f:
        img_head = f.read(1024)
    cache_key = hashlib.sha256(
        img_head + audio_bytes[:1024]
    ).hexdigest()[:16]
    video_filename = f"{current_user.id}_{cache_key}.mp4"
    video_path = AVATAR_VIDEO_DIR / video_filename

    if video_path.exists():
        return AvatarResponse(video_url=f"/uploads/avatar_videos/{video_filename}")

    try:
        async with httpx.AsyncClient(timeout=300) as client:
            files = {
                "source_image": ("image.png", image_path.read_bytes(), "image/png"),
                "driven_audio": ("audio.wav", audio_bytes, "audio/wav"),
            }
            resp = await client.post(
                f"{settings.SADTALKER_API_URL}/generate",
                files=files,
            )
        resp.raise_for_status()
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="SadTalker service is not running. Start it at "
            f"{settings.SADTALKER_API_URL}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"SadTalker error: {exc!r}",
        )

    video_bytes = resp.content
    if not video_bytes:
        raise HTTPException(status_code=502, detail="SadTalker returned empty video")

    video_path.write_bytes(video_bytes)

    return AvatarResponse(video_url=f"/uploads/avatar_videos/{video_filename}")


# ── Async avatar generation (mobile-friendly) ─────────────────────────────────

async def _run_avatar_job(
    job_id: str,
    req: AvatarJobCreate,
    user: User,
) -> None:
    """Background task: generate avatar video and update the job store."""
    _jobs[job_id]["status"] = "processing"
    AVATAR_VIDEO_DIR.mkdir(parents=True, exist_ok=True)

    try:
        # Resolve reference image
        image_path: Optional[Path] = None
        if req.image_url:
            candidate = UPLOAD_DIR / req.image_url.lstrip("/").removeprefix("uploads/")
            if candidate.exists():
                image_path = candidate
        if image_path is None and user.avatar_photo_path:
            candidate = Path(user.avatar_photo_path)
            if candidate.exists():
                image_path = candidate
        if image_path is None and settings.SADTALKER_REF_IMAGE:
            candidate = Path(settings.SADTALKER_REF_IMAGE)
            if candidate.exists():
                image_path = candidate
        if image_path is None:
            _jobs[job_id].update(
                status="failed",
                error="No reference image. Upload a photo first or set SADTALKER_REF_IMAGE.",
            )
            return

        # Resolve audio
        audio_bytes: Optional[bytes] = None
        if req.audio_url:
            audio_path = UPLOAD_DIR / req.audio_url.lstrip("/").removeprefix("uploads/")
            if audio_path.exists():
                audio_bytes = audio_path.read_bytes()
        if audio_bytes is None and req.text:
            audio_bytes = await _tts_audio_bytes(req.text)
        if audio_bytes is None:
            _jobs[job_id].update(
                status="failed",
                error="Provide either audio_url or text.",
            )
            return

        # Cache check
        with open(image_path, "rb") as f:
            img_head = f.read(1024)
        cache_key = hashlib.sha256(img_head + audio_bytes[:1024]).hexdigest()[:16]
        video_filename = f"{user.id}_{cache_key}.mp4"
        video_path = AVATAR_VIDEO_DIR / video_filename

        if video_path.exists():
            _jobs[job_id].update(
                status="done",
                video_url=f"/uploads/avatar_videos/{video_filename}",
            )
            return

        # Call SadTalker
        async with httpx.AsyncClient(timeout=300) as client:
            files = {
                "source_image": ("image.png", image_path.read_bytes(), "image/png"),
                "driven_audio": ("audio.wav", audio_bytes, "audio/wav"),
            }
            sadtalker_resp = await client.post(
                f"{settings.SADTALKER_API_URL}/generate",
                files=files,
            )
        sadtalker_resp.raise_for_status()

        video_bytes = sadtalker_resp.content
        if not video_bytes:
            _jobs[job_id].update(status="failed", error="SadTalker returned empty video")
            return

        video_path.write_bytes(video_bytes)
        _jobs[job_id].update(
            status="done",
            video_url=f"/uploads/avatar_videos/{video_filename}",
        )

    except httpx.ConnectError:
        _jobs[job_id].update(
            status="failed",
            error=f"SadTalker service is not running at {settings.SADTALKER_API_URL}",
        )
    except Exception as exc:
        _jobs[job_id].update(status="failed", error=repr(exc))


@router.post("/avatar/generate", response_model=AvatarJobStatus)
async def generate_avatar_async(
    req: AvatarJobCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    """
    Start an async avatar generation job (mobile-friendly).

    Returns a ``job_id`` immediately. Poll ``GET /api/avatar/job/{job_id}``
    every 2–3 seconds until ``status`` is ``done`` or ``failed``.
    """
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"status": "pending", "video_url": None, "error": None}
    background_tasks.add_task(_run_avatar_job, job_id, req, current_user)
    return AvatarJobStatus(job_id=job_id, status="pending")


@router.get("/avatar/job/{job_id}", response_model=AvatarJobStatus)
async def get_avatar_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
):
    """Poll the status of an async avatar generation job."""
    job = _jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return AvatarJobStatus(
        job_id=job_id,
        status=job["status"],
        video_url=job.get("video_url"),
        error=job.get("error"),
    )
