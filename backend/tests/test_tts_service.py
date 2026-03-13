import io
from unittest.mock import AsyncMock
import wave

import pytest
from fastapi import HTTPException

from app.config import settings
from app.services import tts


def _minimal_wav_bytes() -> bytes:
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(22050)
        wav_file.writeframes(b"\x00\x00" * 2205)
    return buffer.getvalue()


def test_provider_order_prefers_piper_with_fallbacks(monkeypatch):
    monkeypatch.setattr(settings, "TTS_PROVIDER", "piper")
    assert tts._provider_order() == ["piper", "coqui", "kokoro"]


def test_speed_to_length_scale_rejects_non_positive_speed():
    with pytest.raises(HTTPException):
        tts._speed_to_length_scale(0)


@pytest.mark.asyncio
async def test_request_audio_falls_back_to_coqui_when_piper_fails(monkeypatch):
    monkeypatch.setattr(settings, "TTS_PROVIDER", "piper")
    monkeypatch.setattr(
        tts,
        "_request_piper_audio_bytes",
        AsyncMock(side_effect=RuntimeError("piper unavailable")),
    )
    monkeypatch.setattr(
        tts,
        "_request_coqui_audio_bytes",
        AsyncMock(return_value=_minimal_wav_bytes()),
    )
    monkeypatch.setattr(
        tts,
        "_request_kokoro_audio_bytes",
        AsyncMock(side_effect=AssertionError("kokoro should not run")),
    )

    audio_bytes, provider = await tts._request_audio_bytes("Fallback works", None, 1.0)

    assert provider == "coqui"
    assert audio_bytes.startswith(b"RIFF")
