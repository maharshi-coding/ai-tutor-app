"""Voice generation endpoints for tutor narration."""

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.models import User
from app.routers.auth import get_current_user
from app.services.tts import ensure_voice_audio


router = APIRouter()


class VoiceRequest(BaseModel):
    text: str
    voice: Optional[str] = None
    speed: Optional[float] = 1.0


class VoiceResponse(BaseModel):
    audio_url: str
    duration_ms: Optional[int] = None
    provider: Optional[str] = None


@router.post("/voice", response_model=VoiceResponse)
@router.post("/generate-voice", response_model=VoiceResponse)
async def generate_voice(
    req: VoiceRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Generate tutor speech audio using Piper, Coqui, or Kokoro.

    Provider order is controlled by TTS_PROVIDER:
      - auto  -> Piper, then Coqui, then Kokoro fallback
      - piper -> Piper only
      - coqui -> Coqui only
      - kokoro -> Kokoro only
    """
    artifact = await ensure_voice_audio(
        user_id=current_user.id,
        text=req.text,
        voice=req.voice,
        speed=req.speed or 1.0,
    )
    return VoiceResponse(
        audio_url=artifact.audio_url,
        duration_ms=artifact.duration_ms,
        provider=artifact.provider,
    )
