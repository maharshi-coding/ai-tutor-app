"""Kokoro TTS voice generation endpoint.

Sends text to a locally-running Kokoro TTS service and returns the
generated audio as a WAV file.  When Kokoro is unavailable the endpoint
returns a clear error so the frontend can fall back gracefully.
"""

from pathlib import Path
from typing import Optional
import hashlib
import time

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.models import User
from app.routers.auth import get_current_user

router = APIRouter()

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
VOICE_OUTPUT_DIR = UPLOAD_DIR / "voice_output"


class VoiceRequest(BaseModel):
    text: str
    voice: Optional[str] = "af_heart"
    speed: Optional[float] = 1.0


class VoiceResponse(BaseModel):
    audio_url: str
    duration_ms: Optional[int] = None


@router.post("/voice", response_model=VoiceResponse)
async def generate_voice(
    req: VoiceRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Generate speech audio from text using a local Kokoro TTS service.

    Expects Kokoro TTS running at KOKORO_API_URL (default http://localhost:8880).
    The service should expose a POST endpoint that accepts JSON with
    ``text``, ``voice``, and ``speed`` fields and returns WAV audio bytes.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text must not be empty")

    VOICE_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Deterministic filename for caching identical requests
    cache_key = hashlib.sha256(
        f"{req.text}|{req.voice}|{req.speed}".encode()
    ).hexdigest()[:16]
    filename = f"{current_user.id}_{cache_key}.wav"
    out_path = VOICE_OUTPUT_DIR / filename

    # Return cached file if it exists
    if out_path.exists():
        return VoiceResponse(audio_url=f"/uploads/voice_output/{filename}")

    payload = {
        "text": req.text,
        "voice": req.voice,
        "speed": req.speed,
    }

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{settings.KOKORO_API_URL}/v1/audio/speech",
                json=payload,
            )
        resp.raise_for_status()
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Kokoro TTS service is not running. Start it at "
            f"{settings.KOKORO_API_URL}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Kokoro TTS error: {exc!r}",
        )

    audio_bytes = resp.content
    if not audio_bytes:
        raise HTTPException(status_code=502, detail="Kokoro TTS returned empty audio")

    out_path.write_bytes(audio_bytes)

    return VoiceResponse(audio_url=f"/uploads/voice_output/{filename}")
