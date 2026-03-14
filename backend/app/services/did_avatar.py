from __future__ import annotations

import base64
import hashlib
import mimetypes
import re
from pathlib import Path
from typing import Any, Optional

import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.models import User


UPLOAD_DIR = Path(settings.UPLOAD_DIR)

# Maps job_id -> state for authenticated polling.
_jobs: dict[str, dict[str, Any]] = {}


class DIdAvatarError(RuntimeError):
    """Raised when the D-ID avatar provider returns an invalid response."""


def _require_did_api_key() -> str:
    api_key = (settings.DID_API_KEY or "").strip()
    if not api_key:
        raise DIdAvatarError(
            "D-ID is not configured. Set DID_API_KEY in the backend environment."
        )
    return api_key


def _basic_auth_value(api_key: str) -> str:
    if ":" in api_key:
        token = base64.b64encode(api_key.encode("utf-8")).decode("ascii")
        return f"Basic {token}"
    return f"Basic {api_key}"


def _public_upload_url(path_value: str | Path | None) -> Optional[str]:
    if not path_value:
        return None

    file_path = Path(path_value)
    try:
        relative_path = file_path.relative_to(UPLOAD_DIR)
        return f"/uploads/{relative_path.as_posix()}"
    except Exception:
        return str(path_value)


def _hash_file(file_path: Path) -> str:
    digest = hashlib.sha256()
    with open(file_path, "rb") as file_handle:
        while chunk := file_handle.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def _user_avatar_config(user: User) -> dict[str, Any]:
    config = user.avatar_config or {}
    return dict(config)


def _avatar_preview_url(user: User) -> Optional[str]:
    return _public_upload_url(user.avatar_photo_path)


def _user_avatar_identity(user: User) -> tuple[Optional[str], Optional[str], Optional[str]]:
    config = _user_avatar_config(user)
    return (
        config.get("avatar_id"),
        config.get("did_source_url"),
        config.get("did_photo_hash"),
    )


def _content_type_for(path: Path) -> str:
    guessed, _ = mimetypes.guess_type(str(path))
    return guessed or "application/octet-stream"


def _did_client() -> httpx.AsyncClient:
    api_key = _require_did_api_key()
    headers = {
        "Authorization": _basic_auth_value(api_key),
        "Accept": "application/json",
    }
    return httpx.AsyncClient(
        base_url=settings.DID_API_BASE_URL.rstrip("/"),
        timeout=settings.DID_REQUEST_TIMEOUT_SECONDS,
        headers=headers,
    )


def _extract_error_message(payload: Any) -> str:
    if isinstance(payload, dict):
        for key in ("description", "message", "error", "detail"):
            value = payload.get(key)
            if isinstance(value, str) and value.strip():
                return value
    if isinstance(payload, str) and payload.strip():
        return payload
    return "D-ID request failed"


def _normalize_speech_text(text: str) -> str:
    # D-ID should receive only the final spoken explanation, not markdown or code.
    normalized = re.sub(r"```.*?```", " ", text, flags=re.DOTALL)
    normalized = re.sub(r"`([^`]*)`", r"\1", normalized)
    normalized = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", normalized)
    normalized = re.sub(r"(^|\n)\s{0,3}#{1,6}\s*", r"\1", normalized)
    normalized = re.sub(r"(^|\n)\s*[-*+]\s+", r"\1", normalized)
    normalized = re.sub(r"(^|\n)\s*\d+\.\s+", r"\1", normalized)
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized.strip()


async def _upload_image_to_did(photo_path: Path) -> dict[str, Any]:
    async with _did_client() as client:
        response = await client.post(
            "/images",
            files={
                "image": (
                    photo_path.name,
                    photo_path.read_bytes(),
                    _content_type_for(photo_path),
                )
            },
        )

    if response.is_error:
        raise DIdAvatarError(_extract_error_message(response.text))

    payload = response.json()
    if not isinstance(payload, dict):
        raise DIdAvatarError("D-ID image upload returned an invalid payload.")

    return payload


async def _create_talk(source_url: str, text: str) -> dict[str, Any]:
    speech_text = _normalize_speech_text(text)
    if not speech_text:
        raise DIdAvatarError("Text is required to generate an avatar video.")

    payload = {
        "source_url": source_url,
        "script": {
            "type": "text",
            "input": speech_text,
            "provider": {
                "type": settings.DID_VOICE_PROVIDER,
                "voice_id": settings.DID_DEFAULT_VOICE,
            },
        },
    }

    async with _did_client() as client:
        response = await client.post("/talks", json=payload)

    if response.is_error:
        try:
            raise DIdAvatarError(_extract_error_message(response.json()))
        except ValueError:
            raise DIdAvatarError(_extract_error_message(response.text))

    talk_payload = response.json()
    if not isinstance(talk_payload, dict):
        raise DIdAvatarError("D-ID talk creation returned an invalid payload.")
    return talk_payload


async def _get_talk(talk_id: str) -> dict[str, Any]:
    async with _did_client() as client:
        response = await client.get(f"/talks/{talk_id}")

    if response.is_error:
        try:
            raise DIdAvatarError(_extract_error_message(response.json()))
        except ValueError:
            raise DIdAvatarError(_extract_error_message(response.text))

    payload = response.json()
    if not isinstance(payload, dict):
        raise DIdAvatarError("D-ID talk polling returned an invalid payload.")
    return payload


def _map_talk_status(raw_status: Optional[str]) -> str:
    normalized = (raw_status or "").strip().lower()
    if normalized in {"done", "completed"}:
        return "done"
    if normalized in {"error", "failed", "rejected"}:
        return "failed"
    if normalized in {"pending", "queued"}:
        return "pending"
    return "processing"


def _persist_avatar_config(
    db: Session,
    user: User,
    *,
    avatar_id: str,
    source_url: str,
    photo_hash: str,
) -> dict[str, Any]:
    config = _user_avatar_config(user)
    preview_url = _avatar_preview_url(user)
    config.update(
        {
            "avatar_provider": "d-id",
            "avatar_id": avatar_id,
            "did_source_url": source_url,
            "did_photo_hash": photo_hash,
            "avatar_image_url": preview_url,
            "character_image_url": preview_url,
            "avatar_ready": True,
        }
    )
    user.avatar_config = config
    db.commit()
    db.refresh(user)
    return config


def _update_avatar_runtime_state(
    db: Session,
    user: User,
    *,
    last_script: Optional[str] = None,
    last_generated_clip_url: Optional[str] = None,
    last_talk_id: Optional[str] = None,
) -> None:
    config = _user_avatar_config(user)
    if last_script is not None:
        config["last_script"] = last_script
    if last_generated_clip_url is not None:
        config["last_generated_clip_url"] = last_generated_clip_url
    if last_talk_id is not None:
        config["last_talk_id"] = last_talk_id
    user.avatar_config = config
    db.commit()
    db.refresh(user)


async def ensure_avatar_for_user(user: User, db: Session) -> dict[str, Any]:
    if not user.avatar_photo_path:
        raise DIdAvatarError("Upload a photo before creating an avatar.")

    photo_path = Path(user.avatar_photo_path)
    if not photo_path.exists():
        raise DIdAvatarError("The saved avatar photo could not be found on the server.")

    photo_hash = _hash_file(photo_path)
    stored_avatar_id, stored_source_url, stored_photo_hash = _user_avatar_identity(user)
    preview_url = _avatar_preview_url(user)

    if stored_avatar_id and stored_source_url and stored_photo_hash == photo_hash:
        config = _user_avatar_config(user)
        config.update(
            {
                "avatar_provider": "d-id",
                "avatar_ready": True,
                "avatar_image_url": preview_url,
                "character_image_url": preview_url,
            }
        )
        user.avatar_config = config
        db.commit()
        db.refresh(user)
        return {
            "avatar_id": stored_avatar_id,
            "avatar_provider": "d-id",
            "avatar_image_url": preview_url,
            "cached": True,
        }

    upload_payload = await _upload_image_to_did(photo_path)
    source_url = upload_payload.get("url") or upload_payload.get("source_url")
    if not isinstance(source_url, str) or not source_url.strip():
        raise DIdAvatarError("D-ID did not return a usable avatar image URL.")

    raw_avatar_id = upload_payload.get("id")
    avatar_id = str(raw_avatar_id).strip() if raw_avatar_id else photo_hash[:20]
    _persist_avatar_config(
        db,
        user,
        avatar_id=avatar_id,
        source_url=source_url,
        photo_hash=photo_hash,
    )

    return {
        "avatar_id": avatar_id,
        "avatar_provider": "d-id",
        "avatar_image_url": preview_url,
        "cached": False,
    }


async def create_avatar_speech_job(
    *,
    user: User,
    db: Session,
    avatar_id: str,
    text: str,
) -> dict[str, Any]:
    if not text.strip():
        raise DIdAvatarError("Text is required to generate an avatar video.")

    stored_avatar_id, stored_source_url, _ = _user_avatar_identity(user)
    if not stored_avatar_id or not stored_source_url:
        raise DIdAvatarError("Create an avatar before requesting live tutor video.")
    if avatar_id != stored_avatar_id:
        raise DIdAvatarError("The requested avatar does not match the current user.")

    talk_payload = await _create_talk(stored_source_url, text)
    talk_id = talk_payload.get("id")
    if not isinstance(talk_id, str) or not talk_id.strip():
        raise DIdAvatarError("D-ID did not return a talk id for the avatar response.")

    status = _map_talk_status(talk_payload.get("status"))
    video_url = talk_payload.get("result_url")
    error = (
        _extract_error_message(talk_payload.get("error"))
        if talk_payload.get("error")
        else None
    )

    _jobs[talk_id] = {
        "user_id": user.id,
        "talk_id": talk_id,
        "avatar_id": avatar_id,
        "status": status,
        "video_url": video_url,
        "error": error,
    }

    _update_avatar_runtime_state(
        db,
        user,
        last_script=_normalize_speech_text(text),
        last_generated_clip_url=video_url if isinstance(video_url, str) else None,
        last_talk_id=talk_id,
    )

    return {
        "job_id": talk_id,
        "avatar_id": avatar_id,
        "status": status,
        "video_url": video_url,
        "error": error,
    }


async def get_avatar_job_status(
    *,
    job_id: str,
    user: User,
    db: Session,
) -> Optional[dict[str, Any]]:
    job = _jobs.get(job_id)
    if job is None or job.get("user_id") != user.id:
        config = _user_avatar_config(user)
        if config.get("last_talk_id") != job_id:
            return None
        job = {
            "user_id": user.id,
            "talk_id": job_id,
            "avatar_id": config.get("avatar_id"),
            "status": "pending",
            "video_url": config.get("last_generated_clip_url"),
            "error": None,
        }
        _jobs[job_id] = job

    talk_payload = await _get_talk(str(job["talk_id"]))
    status = _map_talk_status(talk_payload.get("status"))
    video_url = talk_payload.get("result_url")
    error = None
    if status == "failed":
        error = _extract_error_message(
            talk_payload.get("error") or talk_payload.get("description") or talk_payload
        )

    job.update(
        {
            "status": status,
            "video_url": video_url,
            "error": error,
        }
    )

    if status == "done" and isinstance(video_url, str) and video_url.strip():
        _update_avatar_runtime_state(
            db,
            user,
            last_generated_clip_url=video_url,
            last_talk_id=str(job["talk_id"]),
        )

    return {
        "job_id": job_id,
        "avatar_id": job.get("avatar_id"),
        "status": status,
        "video_url": video_url,
        "error": error,
    }
