from __future__ import annotations

import asyncio
from dataclasses import dataclass
from functools import lru_cache
import hashlib
import io
from pathlib import Path
from typing import Optional
import wave

import httpx
from fastapi import HTTPException

from app.config import settings

try:
    from piper import PiperVoice
    from piper.config import SynthesisConfig
except ImportError:  # pragma: no cover - exercised when optional dependency is missing
    PiperVoice = None
    SynthesisConfig = None


BACKEND_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = Path(settings.UPLOAD_DIR)
VOICE_OUTPUT_DIR = UPLOAD_DIR / "voice_output"


@dataclass
class GeneratedAudio:
    audio_url: str
    absolute_path: Path
    duration_ms: Optional[int]
    provider: str


def _provider_order(
    preferred_provider: Optional[str] = None,
    strict_provider: bool = False,
) -> list[str]:
    configured = (preferred_provider or settings.TTS_PROVIDER or "auto").strip().lower()
    default_order = ["piper", "coqui", "kokoro"]
    if strict_provider and configured not in {"", "auto"}:
        return [configured]
    if not configured or configured in {"auto", "piper"}:
        return default_order
    if configured == "coqui":
        return ["coqui", "piper", "kokoro"]
    if configured == "kokoro":
        return ["kokoro", "piper", "coqui"]
    return [configured, *[provider for provider in default_order if provider != configured]]


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


def _resolve_backend_path(path_value: str) -> Path:
    candidate = Path(path_value)
    if candidate.is_absolute():
        return candidate

    for base_dir in (Path.cwd(), BACKEND_DIR, BACKEND_DIR.parent):
        resolved = (base_dir / candidate).resolve()
        if resolved.exists():
            return resolved

    return (BACKEND_DIR / candidate).resolve()


def _piper_model_path(voice: Optional[str]) -> Path:
    configured_model = _resolve_backend_path(settings.PIPER_MODEL_PATH)
    requested_voice = (voice or "").strip()
    if not requested_voice or requested_voice in {
        settings.PIPER_DEFAULT_VOICE,
        configured_model.stem,
    }:
        return configured_model

    if requested_voice.endswith(".onnx") or ("/" in requested_voice) or ("\\" in requested_voice):
        return _resolve_backend_path(requested_voice)

    return configured_model.with_name(f"{requested_voice}.onnx")


@lru_cache(maxsize=4)
def _load_piper_voice(model_path_str: str):
    if PiperVoice is None:
        raise RuntimeError("piper-tts is not installed")

    model_path = Path(model_path_str)
    if not model_path.exists():
        raise RuntimeError(f"Piper model not found at {model_path}")

    config_path = Path(f"{model_path}.json")
    if not config_path.exists():
        raise RuntimeError(f"Piper config not found at {config_path}")

    return PiperVoice.load(
        model_path=model_path,
        config_path=config_path,
        download_dir=model_path.parent,
    )


def _speed_to_length_scale(speed: float) -> float:
    if speed <= 0:
        raise HTTPException(status_code=400, detail="Speed must be greater than 0")
    return max(0.25, min(4.0, 1.0 / speed))


def _wav_bytes_from_chunks(audio_chunks) -> bytes:
    buffer = io.BytesIO()
    chunk_count = 0

    with wave.open(buffer, "wb") as wav_file:
        for chunk in audio_chunks:
            if chunk_count == 0:
                wav_file.setnchannels(chunk.sample_channels)
                wav_file.setsampwidth(chunk.sample_width)
                wav_file.setframerate(chunk.sample_rate)
            wav_file.writeframes(chunk.audio_int16_bytes)
            chunk_count += 1

    if chunk_count == 0:
        raise RuntimeError("Piper returned no audio")

    return buffer.getvalue()


def _synthesize_piper_locally_sync(
    text: str,
    voice: Optional[str],
    speed: float,
) -> bytes:
    if SynthesisConfig is None:
        raise RuntimeError("piper-tts is not installed")

    model_path = _piper_model_path(voice)
    piper_voice = _load_piper_voice(str(model_path))
    syn_config = SynthesisConfig(length_scale=_speed_to_length_scale(speed))
    return _wav_bytes_from_chunks(
        piper_voice.synthesize(text, syn_config=syn_config)
    )


async def _request_piper_audio_bytes(
    text: str,
    voice: Optional[str],
    speed: float,
) -> bytes:
    model_path = _piper_model_path(voice)
    if model_path.exists():
        return await asyncio.to_thread(_synthesize_piper_locally_sync, text, voice, speed)

    if settings.PIPER_TTS_URL:
        payload = {
            "text": text,
            "voice": voice or _default_voice_for("piper"),
            "speed": speed,
        }
        return await _call_json_audio_endpoint(settings.PIPER_TTS_URL, payload)

    raise RuntimeError(
        f"Piper model is not available at {model_path} and Piper endpoint is not configured"
    )


async def _request_coqui_audio_bytes(
    text: str,
    voice: Optional[str],
    speed: float,
) -> bytes:
    if not settings.COQUI_TTS_URL:
        raise RuntimeError("Coqui endpoint is not configured")

    payload = {
        "text": text,
        "speaker": voice or _default_voice_for("coqui"),
        "speed": speed,
    }
    return await _call_json_audio_endpoint(settings.COQUI_TTS_URL, payload)


async def _request_kokoro_audio_bytes(
    text: str,
    voice: Optional[str],
    speed: float,
) -> bytes:
    payload = {
        "text": text,
        "voice": voice or _default_voice_for("kokoro"),
        "speed": speed,
    }
    return await _call_json_audio_endpoint(
        f"{settings.KOKORO_API_URL}/v1/audio/speech",
        payload,
    )


async def _request_audio_bytes(
    text: str,
    voice: Optional[str],
    speed: float,
    preferred_provider: Optional[str] = None,
    strict_provider: bool = False,
) -> tuple[bytes, str]:
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text must not be empty")

    provider_errors: list[str] = []

    for provider in _provider_order(
        preferred_provider=preferred_provider,
        strict_provider=strict_provider,
    ):
        try:
            if provider == "piper":
                audio_bytes = await _request_piper_audio_bytes(text, voice, speed)
                return audio_bytes, provider

            if provider == "coqui":
                audio_bytes = await _request_coqui_audio_bytes(text, voice, speed)
                return audio_bytes, provider

            if provider == "kokoro":
                audio_bytes = await _request_kokoro_audio_bytes(text, voice, speed)
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
    preferred_provider: Optional[str] = None,
    strict_provider: bool = False,
) -> GeneratedAudio:
    VOICE_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    cache_key = hashlib.sha256(
        f"{user_id}|{text}|{voice or ''}|{speed}|{preferred_provider or ''}|{strict_provider}".encode(
            "utf-8"
        )
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

    audio_bytes, provider = await _request_audio_bytes(
        text,
        voice,
        speed,
        preferred_provider=preferred_provider,
        strict_provider=strict_provider,
    )
    if not audio_bytes:
        raise HTTPException(status_code=502, detail="TTS provider returned empty audio")

    output_path.write_bytes(audio_bytes)
    return GeneratedAudio(
        audio_url=f"/uploads/voice_output/{filename}",
        absolute_path=output_path,
        duration_ms=_wave_duration_ms(audio_bytes),
        provider=provider,
    )
