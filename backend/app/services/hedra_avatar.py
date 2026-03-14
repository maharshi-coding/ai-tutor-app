from __future__ import annotations

import asyncio
import base64
import hashlib
import mimetypes
import re
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Optional

import httpx
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from sqlalchemy.orm import Session

from app.config import settings
from app.models import User
from app.services.tech_updates import build_daily_tech_update
from app.services.tts import ensure_voice_audio


BACKEND_DIR = Path(__file__).resolve().parents[2]


def _resolve_storage_path(path_value: str) -> Path:
    candidate = Path(path_value)
    if candidate.is_absolute():
        return candidate
    return (BACKEND_DIR / candidate).resolve()


UPLOAD_DIR = _resolve_storage_path(settings.UPLOAD_DIR)
VIDEO_STORAGE_DIR = _resolve_storage_path(settings.VIDEO_STORAGE_PATH)
AVATAR_DIR = UPLOAD_DIR / "avatars"

# Maps job_id -> state for authenticated polling.
_jobs: dict[str, dict[str, Any]] = {}


class AvatarPipelineError(RuntimeError):
    """Raised when the avatar media pipeline is not configured or returns an error."""


def _require_hedra_api_key() -> str:
    api_key = (settings.HEDRA_API_KEY or "").strip()
    if not api_key:
        raise AvatarPipelineError(
            "Hedra is not configured. Set HEDRA_API_KEY in the backend environment."
        )
    return api_key


def _public_file_url(path_value: str | Path | None) -> Optional[str]:
    if not path_value:
        return None

    file_path = Path(path_value)
    try:
        relative_upload_path = file_path.relative_to(UPLOAD_DIR)
        return f"/uploads/{relative_upload_path.as_posix()}"
    except Exception:
        try:
            relative_video_path = file_path.relative_to(VIDEO_STORAGE_DIR)
            return f"/generated-videos/{relative_video_path.as_posix()}"
        except Exception:
            return str(path_value)


def _hash_file(file_path: Path) -> str:
    digest = hashlib.sha256()
    with open(file_path, "rb") as file_handle:
        while chunk := file_handle.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def _user_avatar_config(user: User) -> dict[str, Any]:
    return dict(user.avatar_config or {})


def _avatar_preview_url(user: User) -> Optional[str]:
    config = _user_avatar_config(user)
    return (
        config.get("character_image_url")
        or config.get("avatar_image_url")
        or _public_file_url(user.avatar_photo_path)
    )


def _content_type_for(path: Path) -> str:
    guessed, _ = mimetypes.guess_type(str(path))
    return guessed or "application/octet-stream"


def _hedra_client() -> httpx.AsyncClient:
    api_key = _require_hedra_api_key()
    return httpx.AsyncClient(
        base_url=settings.HEDRA_API_BASE_URL.rstrip("/"),
        timeout=settings.HEDRA_REQUEST_TIMEOUT_SECONDS,
        headers={
            "X-API-Key": api_key,
            "Accept": "application/json",
        },
    )


def _extract_error_message(payload: Any) -> str:
    if isinstance(payload, dict):
        for key in ("message", "error", "detail", "description"):
            value = payload.get(key)
            if isinstance(value, str) and value.strip():
                return value
    if isinstance(payload, str) and payload.strip():
        return payload
    return "The avatar media provider returned an unexpected response."


def _normalize_speech_text(text: str) -> str:
    normalized = re.sub(r"```.*?```", " ", text, flags=re.DOTALL)
    normalized = re.sub(r"`([^`]*)`", r"\1", normalized)
    normalized = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", normalized)
    normalized = re.sub(r"(^|\n)\s{0,3}#{1,6}\s*", r"\1", normalized)
    normalized = re.sub(r"(^|\n)\s*[-*+]\s+", r"\1", normalized)
    normalized = re.sub(r"(^|\n)\s*\d+\.\s+", r"\1", normalized)
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized.strip()


def _truncate_words(text: str, max_words: int) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text.strip()
    truncated = " ".join(words[:max_words]).rstrip(" ,;:-")
    if "." not in truncated[-20:]:
        truncated += "."
    return truncated


def _shrink_script(text: str, keep_ratio: float = 0.85) -> str:
    words = text.split()
    next_count = max(24, int(len(words) * keep_ratio))
    return _truncate_words(" ".join(words[:next_count]), next_count)


def _map_generation_status(raw_status: Optional[str]) -> str:
    normalized = (raw_status or "").strip().lower()
    if normalized in {"complete", "completed", "done", "succeeded"}:
        return "done"
    if normalized in {"failed", "error", "rejected", "cancelled"}:
        return "failed"
    if normalized in {"pending", "queued"}:
        return "pending"
    return "processing"


def _avatar_id_for_user(user_id: int) -> str:
    return f"avatar-{user_id}"


def _avatar_file_path(user_id: int) -> Path:
    return AVATAR_DIR / f"{user_id}_avatar.png"


def _video_file_path(user_id: int, generation_id: str, label: str) -> Path:
    safe_label = re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-") or "video"
    return VIDEO_STORAGE_DIR / f"{user_id}_{safe_label}_{generation_id}.mp4"


def _center_square(image: Image.Image) -> Image.Image:
    width, height = image.size
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    return image.crop((left, top, left + side, top + side))


def _stylize_avatar_image(source_path: Path, output_path: Path) -> None:
    AVATAR_DIR.mkdir(parents=True, exist_ok=True)

    with Image.open(source_path).convert("RGB") as original:
        avatar = _center_square(original).resize((768, 768))
        softened = avatar.filter(ImageFilter.SMOOTH_MORE).filter(ImageFilter.SMOOTH_MORE)
        posterized = ImageOps.posterize(softened, 4)
        posterized = posterized.quantize(colors=40, method=Image.FASTOCTREE).convert("RGB")

        edges = avatar.filter(ImageFilter.FIND_EDGES).convert("L")
        edges = ImageOps.autocontrast(edges)
        edges = edges.point(lambda pixel: 0 if pixel < 48 else min(255, int(pixel * 1.45)))
        edges = ImageOps.invert(edges)

        stylized = Image.blend(avatar, posterized, 0.72)
        stylized = ImageEnhance.Color(stylized).enhance(1.28)
        stylized = ImageEnhance.Contrast(stylized).enhance(1.16)
        stylized = ImageEnhance.Sharpness(stylized).enhance(1.5)
        stylized = Image.composite(stylized, avatar, edges)
        stylized = stylized.filter(ImageFilter.SMOOTH_MORE)
        stylized.save(output_path, format="PNG")


def _persist_avatar_config(
    db: Session,
    user: User,
    updates: dict[str, Any],
) -> dict[str, Any]:
    config = _user_avatar_config(user)
    config.update(updates)
    user.avatar_config = config
    db.commit()
    db.refresh(user)
    return config


def _update_avatar_runtime_state(
    db: Session,
    user: User,
    updates: dict[str, Any],
) -> None:
    _persist_avatar_config(db, user, updates)


async def _create_asset(asset_type: str, name: str) -> str:
    payload = {
        "name": name,
        "type": asset_type,
    }
    async with _hedra_client() as client:
        response = await client.post("/assets", json=payload)

    if response.is_error:
        try:
            raise AvatarPipelineError(_extract_error_message(response.json()))
        except ValueError:
            raise AvatarPipelineError(_extract_error_message(response.text))

    data = response.json()
    asset_id = data.get("id")
    if not isinstance(asset_id, str) or not asset_id.strip():
        raise AvatarPipelineError("Hedra did not return an asset id.")
    return asset_id


async def _upload_asset_bytes(asset_id: str, file_path: Path) -> None:
    async with _hedra_client() as client:
        response = await client.post(
            f"/assets/{asset_id}/upload",
            files={
                "file": (
                    file_path.name,
                    file_path.read_bytes(),
                    _content_type_for(file_path),
                )
            },
        )

    if response.is_error:
        try:
            raise AvatarPipelineError(_extract_error_message(response.json()))
        except ValueError:
            raise AvatarPipelineError(_extract_error_message(response.text))


async def _ensure_hedra_avatar_asset(user: User, db: Session) -> str:
    config = _user_avatar_config(user)
    avatar_file_path = config.get("avatar_file_path")
    if not avatar_file_path:
        raise AvatarPipelineError("Create an avatar before requesting a video.")

    avatar_path = Path(avatar_file_path)
    if not avatar_path.exists():
        raise AvatarPipelineError("The stored avatar image could not be found on the server.")

    avatar_hash = _hash_file(avatar_path)
    cached_asset_id = config.get("hedra_image_asset_id")
    cached_asset_hash = config.get("hedra_image_asset_hash")
    if isinstance(cached_asset_id, str) and cached_asset_hash == avatar_hash:
        return cached_asset_id

    asset_id = await _create_asset("image", f"user-{user.id}-avatar")
    await _upload_asset_bytes(asset_id, avatar_path)
    _update_avatar_runtime_state(
        db,
        user,
        {
            "hedra_image_asset_id": asset_id,
            "hedra_image_asset_hash": avatar_hash,
        },
    )
    return asset_id


async def _create_audio_asset(audio_path: Path, user_id: int) -> str:
    asset_id = await _create_asset("audio", f"user-{user_id}-audio")
    await _upload_asset_bytes(asset_id, audio_path)
    return asset_id


async def _create_generation(
    *,
    image_asset_id: str,
    audio_asset_id: str,
    duration_ms: Optional[int],
) -> dict[str, Any]:
    generated_video_inputs: dict[str, Any] = {
        "text_prompt": settings.HEDRA_VIDEO_PROMPT,
        "aspect_ratio": settings.HEDRA_VIDEO_ASPECT_RATIO,
        "resolution": settings.HEDRA_VIDEO_RESOLUTION,
    }
    if duration_ms:
        generated_video_inputs["duration_ms"] = duration_ms

    payload = {
        "type": "video",
        "ai_model_id": settings.HEDRA_VIDEO_MODEL_ID,
        "start_keyframe_id": image_asset_id,
        "audio_id": audio_asset_id,
        "generated_video_inputs": generated_video_inputs,
    }

    async with _hedra_client() as client:
        response = await client.post("/generations", json=payload)

    if response.is_error:
        try:
            raise AvatarPipelineError(_extract_error_message(response.json()))
        except ValueError:
            raise AvatarPipelineError(_extract_error_message(response.text))

    data = response.json()
    if not isinstance(data, dict):
        raise AvatarPipelineError("Hedra did not return a valid generation payload.")
    return data


async def _get_generation(generation_id: str) -> dict[str, Any]:
    async with _hedra_client() as client:
        response = await client.get(f"/generations/{generation_id}")

    if response.is_error:
        try:
            raise AvatarPipelineError(_extract_error_message(response.json()))
        except ValueError:
            raise AvatarPipelineError(_extract_error_message(response.text))

    data = response.json()
    if not isinstance(data, dict):
        raise AvatarPipelineError("Hedra did not return a valid generation status payload.")
    return data


def _result_video_url(payload: dict[str, Any]) -> Optional[str]:
    candidates = [
        payload.get("download_url"),
        payload.get("url"),
        payload.get("video_url"),
    ]
    result = payload.get("result")
    if isinstance(result, dict):
        candidates.extend(
            [
                result.get("download_url"),
                result.get("url"),
                result.get("video_url"),
            ]
        )
    for candidate in candidates:
        if isinstance(candidate, str) and candidate.strip():
            return candidate.strip()
    return None


async def _download_video_to_storage(
    *,
    source_url: str,
    output_path: Path,
) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    async with httpx.AsyncClient(timeout=settings.HEDRA_REQUEST_TIMEOUT_SECONDS) as client:
        response = await client.get(source_url)
        response.raise_for_status()
    output_path.write_bytes(response.content)
    return output_path


async def _ensure_script_audio(
    *,
    user_id: int,
    raw_text: str,
) -> tuple[str, dict[str, Any]]:
    script = _truncate_words(
        _normalize_speech_text(raw_text),
        settings.MAX_AVATAR_VIDEO_DURATION_SECONDS * 2,
    )
    if not script.strip():
        raise AvatarPipelineError("Text is required to generate an avatar video.")

    for _ in range(4):
        artifact = await ensure_voice_audio(
            user_id,
            script,
            voice=settings.COQUI_DEFAULT_VOICE,
            speed=settings.AVATAR_TTS_SPEED,
            preferred_provider="coqui",
            strict_provider=True,
        )
        if artifact.duration_ms is None or (
            artifact.duration_ms <= settings.MAX_AVATAR_VIDEO_DURATION_SECONDS * 1000
        ):
            return script, {
                "audio_url": artifact.audio_url,
                "audio_path": artifact.absolute_path,
                "duration_ms": artifact.duration_ms,
                "provider": artifact.provider,
            }
        script = _shrink_script(script)

    raise AvatarPipelineError(
        "The generated audio is still longer than one minute after trimming."
    )


def _base_job_state(
    *,
    job_id: str,
    user_id: int,
    avatar_id: str,
    kind: str,
    title: Optional[str] = None,
    summary: Optional[str] = None,
    highlights: Optional[list[str]] = None,
    source_urls: Optional[list[str]] = None,
    date_key: Optional[str] = None,
) -> dict[str, Any]:
    return {
        "job_id": job_id,
        "user_id": user_id,
        "avatar_id": avatar_id,
        "status": "pending",
        "video_url": None,
        "error": None,
        "kind": kind,
        "title": title,
        "summary": summary,
        "highlights": highlights or [],
        "source_urls": source_urls or [],
        "date_key": date_key,
    }


async def _finalize_generation_if_ready(
    *,
    job: dict[str, Any],
    generation_payload: dict[str, Any],
    user: User,
    db: Session,
) -> dict[str, Any]:
    status = _map_generation_status(generation_payload.get("status"))
    error = None
    result_url = _result_video_url(generation_payload)
    local_url = job.get("video_url")

    if status == "failed":
        error = _extract_error_message(
            generation_payload.get("error")
            or generation_payload.get("description")
            or generation_payload
        )

    if status == "done" and result_url and not local_url:
        output_path = _video_file_path(user.id, job["job_id"], job.get("kind", "video"))
        await _download_video_to_storage(source_url=result_url, output_path=output_path)
        local_url = _public_file_url(output_path)

        updates = {
            "last_generated_clip_url": local_url,
            "last_job_id": job["job_id"],
            "last_job_status": status,
        }
        if job.get("kind") == "daily":
            updates.update(
                {
                    "daily_video_url": local_url,
                    "daily_video_title": job.get("title"),
                    "daily_video_summary": job.get("summary"),
                    "daily_video_highlights": job.get("highlights"),
                    "daily_video_source_urls": job.get("source_urls"),
                    "daily_video_date": job.get("date_key"),
                    "daily_video_job_id": job["job_id"],
                    "daily_video_status": status,
                    "daily_video_generated_at": datetime.now(UTC).isoformat(),
                }
            )
        _update_avatar_runtime_state(db, user, updates)

    elif status == "failed":
        updates = {
            "last_job_id": job["job_id"],
            "last_job_status": status,
        }
        if job.get("kind") == "daily":
            updates.update(
                {
                    "daily_video_job_id": job["job_id"],
                    "daily_video_status": status,
                    "daily_video_error": error,
                    "daily_video_date": job.get("date_key"),
                }
            )
        _update_avatar_runtime_state(db, user, updates)

    job.update(
        {
            "status": status,
            "video_url": local_url,
            "error": error,
        }
    )
    _jobs[job["job_id"]] = job
    return {
        "job_id": job["job_id"],
        "avatar_id": job.get("avatar_id"),
        "status": status,
        "video_url": local_url,
        "error": error,
    }


async def ensure_avatar_for_user(user: User, db: Session) -> dict[str, Any]:
    if not user.avatar_photo_path:
        raise AvatarPipelineError("Upload a photo before creating an avatar.")

    photo_path = Path(user.avatar_photo_path)
    if not photo_path.exists():
        raise AvatarPipelineError("The saved avatar photo could not be found on the server.")

    photo_hash = _hash_file(photo_path)
    config = _user_avatar_config(user)
    avatar_path = _avatar_file_path(user.id)

    if (
        config.get("avatar_id")
        and config.get("avatar_photo_hash") == photo_hash
        and avatar_path.exists()
    ):
        preview_url = _public_file_url(avatar_path)
        _update_avatar_runtime_state(
            db,
            user,
            {
                "avatar_provider": "hedra",
                "avatar_ready": True,
                "avatar_image_url": preview_url,
                "character_image_url": preview_url,
                "avatar_file_path": str(avatar_path),
            },
        )
        return {
            "avatar_id": config["avatar_id"],
            "avatar_provider": "hedra",
            "avatar_image_url": preview_url,
            "cached": True,
        }

    _stylize_avatar_image(photo_path, avatar_path)
    preview_url = _public_file_url(avatar_path)
    _persist_avatar_config(
        db,
        user,
        {
            "avatar_id": _avatar_id_for_user(user.id),
            "avatar_provider": "hedra",
            "avatar_photo_hash": photo_hash,
            "avatar_file_path": str(avatar_path),
            "avatar_ready": True,
            "avatar_image_url": preview_url,
            "character_image_url": preview_url,
            "hedra_image_asset_id": None,
            "hedra_image_asset_hash": None,
        },
    )
    return {
        "avatar_id": _avatar_id_for_user(user.id),
        "avatar_provider": "hedra",
        "avatar_image_url": preview_url,
        "cached": False,
    }


async def _create_video_job(
    *,
    user: User,
    db: Session,
    avatar_id: str,
    text: str,
    kind: str,
    title: Optional[str] = None,
    summary: Optional[str] = None,
    highlights: Optional[list[str]] = None,
    source_urls: Optional[list[str]] = None,
    date_key: Optional[str] = None,
) -> dict[str, Any]:
    config = _user_avatar_config(user)
    stored_avatar_id = config.get("avatar_id")
    if not stored_avatar_id:
        raise AvatarPipelineError("Create an avatar before requesting a video.")
    if avatar_id != stored_avatar_id:
        raise AvatarPipelineError("The requested avatar does not match the current user.")

    image_asset_id = await _ensure_hedra_avatar_asset(user, db)
    script, audio = await _ensure_script_audio(user_id=user.id, raw_text=text)
    audio_asset_id = await _create_audio_asset(audio["audio_path"], user.id)
    generation_payload = await _create_generation(
        image_asset_id=image_asset_id,
        audio_asset_id=audio_asset_id,
        duration_ms=audio.get("duration_ms"),
    )
    generation_id = generation_payload.get("id")
    if not isinstance(generation_id, str) or not generation_id.strip():
        raise AvatarPipelineError("Hedra did not return a generation id for the video.")

    job = _base_job_state(
        job_id=generation_id,
        user_id=user.id,
        avatar_id=avatar_id,
        kind=kind,
        title=title,
        summary=summary,
        highlights=highlights,
        source_urls=source_urls,
        date_key=date_key,
    )
    _jobs[generation_id] = job

    updates = {
        "last_script": script,
        "last_job_id": generation_id,
        "last_job_status": _map_generation_status(generation_payload.get("status")),
        "last_generated_audio_url": audio["audio_url"],
        "last_generated_clip_url": None,
    }
    if kind == "daily":
        updates.update(
            {
                "daily_video_title": title,
                "daily_video_summary": summary,
                "daily_video_highlights": highlights or [],
                "daily_video_source_urls": source_urls or [],
                "daily_video_date": date_key,
                "daily_video_job_id": generation_id,
                "daily_video_status": "processing",
                "daily_video_error": None,
            }
        )
    _update_avatar_runtime_state(db, user, updates)

    return await _finalize_generation_if_ready(
        job=job,
        generation_payload=generation_payload,
        user=user,
        db=db,
    )


async def create_avatar_speech_job(
    *,
    user: User,
    db: Session,
    avatar_id: str,
    text: str,
) -> dict[str, Any]:
    if not text.strip():
        raise AvatarPipelineError("Text is required to generate an avatar video.")

    return await _create_video_job(
        user=user,
        db=db,
        avatar_id=avatar_id,
        text=text,
        kind="reply",
    )


async def create_daily_update_video_job(
    *,
    user: User,
    db: Session,
    force: bool = False,
) -> dict[str, Any]:
    avatar_result = await ensure_avatar_for_user(user, db)
    config = _user_avatar_config(user)
    if (
        not force
        and config.get("daily_video_date") == datetime.now(UTC).date().isoformat()
        and config.get("daily_video_url")
    ):
        return {
            "job_id": config.get("daily_video_job_id") or f"daily-{user.id}",
            "avatar_id": avatar_result["avatar_id"],
            "status": "done",
            "video_url": config.get("daily_video_url"),
            "error": None,
        }

    if (
        not force
        and config.get("daily_video_date") == datetime.now(UTC).date().isoformat()
        and config.get("daily_video_status") in {"pending", "processing"}
        and isinstance(config.get("daily_video_job_id"), str)
    ):
        return {
            "job_id": config["daily_video_job_id"],
            "avatar_id": avatar_result["avatar_id"],
            "status": config.get("daily_video_status", "processing"),
            "video_url": config.get("daily_video_url"),
            "error": config.get("daily_video_error"),
        }

    daily_update = await build_daily_tech_update(force_refresh=force)
    return await _create_video_job(
        user=user,
        db=db,
        avatar_id=avatar_result["avatar_id"],
        text=daily_update.script,
        kind="daily",
        title=daily_update.title,
        summary=daily_update.summary,
        highlights=daily_update.highlights,
        source_urls=daily_update.source_urls,
        date_key=daily_update.date_key,
    )


async def get_avatar_job_status(
    *,
    job_id: str,
    user: User,
    db: Session,
) -> Optional[dict[str, Any]]:
    job = _jobs.get(job_id)
    if job is None or job.get("user_id") != user.id:
        config = _user_avatar_config(user)
        known_job_id = config.get("last_job_id")
        daily_job_id = config.get("daily_video_job_id")
        if job_id not in {known_job_id, daily_job_id}:
            return None
        job = _base_job_state(
            job_id=job_id,
            user_id=user.id,
            avatar_id=str(config.get("avatar_id") or ""),
            kind="daily" if job_id == daily_job_id else "reply",
            title=config.get("daily_video_title"),
            summary=config.get("daily_video_summary"),
            highlights=list(config.get("daily_video_highlights") or []),
            source_urls=list(config.get("daily_video_source_urls") or []),
            date_key=config.get("daily_video_date"),
        )
        job["video_url"] = config.get("daily_video_url") or config.get("last_generated_clip_url")
        _jobs[job_id] = job

    generation_payload = await _get_generation(job_id)
    return await _finalize_generation_if_ready(
        job=job,
        generation_payload=generation_payload,
        user=user,
        db=db,
    )


def get_daily_video_state(user: User) -> dict[str, Any]:
    config = _user_avatar_config(user)
    return {
        "avatar_ready": bool(config.get("avatar_ready")),
        "avatar_id": config.get("avatar_id"),
        "avatar_image_url": _avatar_preview_url(user),
        "status": config.get("daily_video_status") or "idle",
        "job_id": config.get("daily_video_job_id"),
        "title": config.get("daily_video_title"),
        "summary": config.get("daily_video_summary"),
        "highlights": list(config.get("daily_video_highlights") or []),
        "source_urls": list(config.get("daily_video_source_urls") or []),
        "video_url": config.get("daily_video_url"),
        "generated_at": config.get("daily_video_generated_at"),
        "error": config.get("daily_video_error"),
    }


async def wait_for_job_completion(
    *,
    job_id: str,
    user: User,
    db: Session,
    poll_interval_seconds: float = 5.0,
    timeout_seconds: int = 240,
) -> Optional[dict[str, Any]]:
    deadline = asyncio.get_running_loop().time() + timeout_seconds
    while asyncio.get_running_loop().time() < deadline:
        job = await get_avatar_job_status(job_id=job_id, user=user, db=db)
        if job is None:
            return None
        if job["status"] in {"done", "failed"}:
            return job
        await asyncio.sleep(poll_interval_seconds)
    raise AvatarPipelineError("Timed out while waiting for the avatar video to finish.")
