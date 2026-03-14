"""Local text-to-speech endpoints used by the avatar pipeline and web preview flows."""

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
    speed = req.speed if req.speed is not None else 1.0
    artifact = await ensure_voice_audio(
        current_user.id,
        req.text,
        voice=req.voice,
        speed=speed,
    )
    return VoiceResponse(
        audio_url=artifact.audio_url,
        duration_ms=artifact.duration_ms,
        provider=artifact.provider,
    )
