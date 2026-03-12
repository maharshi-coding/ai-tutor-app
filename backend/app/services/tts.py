from __future__ import annotations

from dataclasses import dataclass
import hashlib
import io
from pathlib import Path
from typing import Optional
import wave

import httpx
from fastapi import HTTPException

from app.config import settings


UPLOAD_DIR = Path(settings.UPLOAD_DIR)
VOICE_OUTPUT_DIR = UPLOAD_DIR / "voice_output"


@dataclass
class GeneratedAudio:
    audio_url: str
    absolute_path: Path
    duration_ms: Optional[int]
    provider: str


def _provider_order() -> list[str]:
    configured = (settings.TTS_PROVIDER or "auto").strip().lower()
    if configured and configured != "auto":
        return [configured]
    return ["piper", "coqui", "kokoro"]


def _default_voice_for(provider: str) -> str:
    if provider == "piper":
        return settings.PIPER_DEFAULT_VOICE
    if provider == "coqui":
        return settings.COQUI_DEFAULT_VOICE
    return settings.KOKORO_DEFAULT_VOICE


def _wave_duration_ms(audio_bytes: bytes) -> Optional[int]:
    try:
        with wave.open(io.BytesIO(audio_bytes), "rb") as wav_file:
            frame_rate = wav_file.getframerate()
            frames = wav_file.getnframes()
        if frame_rate <= 0:
            return None
        return int((frames / frame_rate) * 1000)
    except Exception:
        return None


async def _call_json_audio_endpoint(
    endpoint_url: str,
    payload: dict[str, object],
) -> bytes:
    async with httpx.AsyncClient(timeout=settings.TTS_REQUEST_TIMEOUT_SECONDS) as client:
        resp = await client.post(endpoint_url, json=payload)
    resp.raise_for_status()
    return resp.content


async def _request_audio_bytes(
    text: str,
    voice: Optional[str],
    speed: float,
) -> tuple[bytes, str]:
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text must not be empty")

    provider_errors: list[str] = []

    for provider in _provider_order():
        try:
            if provider == "piper":
                if not settings.PIPER_TTS_URL:
                    raise RuntimeError("Piper endpoint is not configured")
                payload = {
                    "text": text,
                    "voice": voice or _default_voice_for(provider),
                    "speed": speed,
                }
                audio_bytes = await _call_json_audio_endpoint(
                    settings.PIPER_TTS_URL,
                    payload,
                )
                return audio_bytes, provider

            if provider == "coqui":
                if not settings.COQUI_TTS_URL:
                    raise RuntimeError("Coqui endpoint is not configured")
                payload = {
                    "text": text,
                    "speaker": voice or _default_voice_for(provider),
                    "speed": speed,
                }
                audio_bytes = await _call_json_audio_endpoint(
                    settings.COQUI_TTS_URL,
                    payload,
                )
                return audio_bytes, provider

            if provider == "kokoro":
                payload = {
                    "text": text,
                    "voice": voice or _default_voice_for(provider),
                    "speed": speed,
                }
                audio_bytes = await _call_json_audio_endpoint(
                    f"{settings.KOKORO_API_URL}/v1/audio/speech",
                    payload,
                )
                return audio_bytes, provider

            raise RuntimeError(f"Unsupported TTS provider: {provider}")
        except httpx.ConnectError:
            provider_errors.append(f"{provider}: service unavailable")
        except Exception as exc:
            provider_errors.append(f"{provider}: {exc!r}")

    raise HTTPException(
        status_code=503,
        detail=(
            "No text-to-speech provider is currently available. "
            + " | ".join(provider_errors)
        ),
    )


async def ensure_voice_audio(
    user_id: int,
    text: str,
    voice: Optional[str] = None,
    speed: float = 1.0,
) -> GeneratedAudio:
    VOICE_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    cache_key = hashlib.sha256(
        f"{user_id}|{text}|{voice or ''}|{speed}".encode("utf-8")
    ).hexdigest()[:20]
    filename = f"{user_id}_{cache_key}.wav"
    output_path = VOICE_OUTPUT_DIR / filename

    if output_path.exists():
        audio_bytes = output_path.read_bytes()
        return GeneratedAudio(
            audio_url=f"/uploads/voice_output/{filename}",
            absolute_path=output_path,
            duration_ms=_wave_duration_ms(audio_bytes),
            provider="cache",
        )

    audio_bytes, provider = await _request_audio_bytes(text, voice, speed)
    if not audio_bytes:
        raise HTTPException(status_code=502, detail="TTS provider returned empty audio")

    output_path.write_bytes(audio_bytes)
    return GeneratedAudio(
        audio_url=f"/uploads/voice_output/{filename}",
        absolute_path=output_path,
        duration_ms=_wave_duration_ms(audio_bytes),
        provider=provider,
    )
