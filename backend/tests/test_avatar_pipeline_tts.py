from pathlib import Path

import pytest

from app.services import avatar_pipeline
from app.services.tts import GeneratedAudio


def _minimal_wav_bytes() -> bytes:
    return (
        b"RIFF(\x00\x00\x00WAVEfmt "
        b"\x10\x00\x00\x00\x01\x00\x01\x00"
        b"\x22\x56\x00\x00\x44\xac\x00\x00"
        b"\x02\x00\x10\x00data\x04\x00\x00\x00"
        b"\x00\x00\x00\x00"
    )


class _DummyResponse:
    content = b"fake-video"

    def raise_for_status(self) -> None:
        return None


class _DummyAsyncClient:
    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def post(self, *args, **kwargs):
        return _DummyResponse()


@pytest.mark.asyncio
async def test_render_avatar_video_generates_tts_audio_before_animation(
    tmp_path: Path,
    monkeypatch,
):
    image_path = tmp_path / "avatar.png"
    image_path.write_bytes(b"fake-image")

    audio_path = tmp_path / "voice.wav"
    audio_path.write_bytes(_minimal_wav_bytes())

    generated_audio = GeneratedAudio(
        audio_url="/uploads/voice_output/voice.wav",
        absolute_path=audio_path,
        duration_ms=100,
        provider="piper",
    )

    async def fake_ensure_voice_audio(user_id: int, text: str, voice=None, speed: float = 1.0):
        assert user_id == 7
        assert text == "Explain fractions"
        return generated_audio

    monkeypatch.setattr(avatar_pipeline, "ensure_voice_audio", fake_ensure_voice_audio)
    monkeypatch.setattr(avatar_pipeline.httpx, "AsyncClient", _DummyAsyncClient)
    monkeypatch.setattr(avatar_pipeline, "AVATAR_VIDEO_DIR", tmp_path / "videos")
    monkeypatch.setattr(avatar_pipeline, "_maybe_compress_video", lambda video_path: None)
    monkeypatch.setattr(
        avatar_pipeline,
        "_update_last_generated_clip",
        lambda user_id, video_url: None,
    )

    video_url = await avatar_pipeline.render_avatar_video(
        avatar_pipeline.AvatarJobRequest(
            user_id=7,
            avatar_photo_path=str(image_path),
            avatar_config={},
            text="Explain fractions",
        )
    )

    assert video_url.startswith("/uploads/avatar_videos/")
    video_name = video_url.rsplit("/", 1)[-1]
    assert (tmp_path / "videos" / video_name).exists()
