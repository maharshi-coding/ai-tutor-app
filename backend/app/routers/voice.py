"""Deprecated local voice endpoints kept only to return a clear migration message."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.models import User
from app.routers.auth import get_current_user


router = APIRouter()


class VoiceRequest(BaseModel):
    text: str
    voice: Optional[str] = None
    speed: Optional[float] = 1.0


class VoiceResponse(BaseModel):
    audio_url: str
    duration_ms: Optional[int] = None
    provider: Optional[str] = None


def _voice_disabled() -> None:
    raise HTTPException(
        status_code=410,
        detail=(
            "Local voice generation has been removed. "
            "Use the D-ID avatar endpoints for Live Tutor mode."
        ),
    )


@router.post("/voice", response_model=VoiceResponse)
@router.post("/generate-voice", response_model=VoiceResponse)
async def generate_voice(
    req: VoiceRequest,
    current_user: User = Depends(get_current_user),
):
    _ = (req, current_user)
    _voice_disabled()
