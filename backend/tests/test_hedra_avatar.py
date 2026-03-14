from pathlib import Path
from types import SimpleNamespace

import pytest
from PIL import Image

from app.services import hedra_avatar


class _DummyDb:
    def __init__(self) -> None:
        self.commits = 0
        self.refreshes = 0

    def commit(self) -> None:
        self.commits += 1

    def refresh(self, _user) -> None:
        self.refreshes += 1


@pytest.fixture(autouse=True)
def isolated_media_dirs(monkeypatch, tmp_path: Path):
    upload_dir = tmp_path / "uploads"
    avatar_dir = upload_dir / "avatars"
    video_dir = upload_dir / "generated_videos"
    (upload_dir / "photos").mkdir(parents=True, exist_ok=True)
    avatar_dir.mkdir(parents=True, exist_ok=True)
    video_dir.mkdir(parents=True, exist_ok=True)
    hedra_avatar._jobs.clear()
    monkeypatch.setattr(hedra_avatar, "UPLOAD_DIR", upload_dir)
    monkeypatch.setattr(hedra_avatar, "AVATAR_DIR", avatar_dir)
    monkeypatch.setattr(hedra_avatar, "VIDEO_STORAGE_DIR", video_dir)
    yield
    hedra_avatar._jobs.clear()


def _make_image(path: Path) -> None:
    Image.new("RGB", (64, 64), color=(36, 102, 192)).save(path, format="PNG")


def _make_user(tmp_path: Path, avatar_config=None):
    photo_path = hedra_avatar.UPLOAD_DIR / "photos" / "avatar.png"
    _make_image(photo_path)
    return SimpleNamespace(
        id=7,
        avatar_photo_path=str(photo_path),
        avatar_config=dict(avatar_config or {}),
    )


def test_normalize_speech_text_strips_markdown_and_code():
    raw_text = """
    ## Final Answer

    - Explain `sum()`
    1. Mention [docs](https://example.com)

    ```python
    print("skip this")
    ```
    """

    assert (
        hedra_avatar._normalize_speech_text(raw_text)
        == "Final Answer Explain sum() Mention docs"
    )


@pytest.mark.asyncio
async def test_ensure_avatar_for_user_reuses_matching_photo_hash(tmp_path: Path):
    user = _make_user(tmp_path)
    avatar_path = hedra_avatar.AVATAR_DIR / "7_avatar.png"
    _make_image(avatar_path)
    photo_hash = hedra_avatar._hash_file(Path(user.avatar_photo_path))
    user.avatar_config = {
        "avatar_id": "avatar-7",
        "avatar_photo_hash": photo_hash,
    }
    db = _DummyDb()

    result = await hedra_avatar.ensure_avatar_for_user(user, db)

    assert result == {
        "avatar_id": "avatar-7",
        "avatar_provider": "hedra",
        "avatar_image_url": "/uploads/avatars/7_avatar.png",
        "cached": True,
    }
    assert user.avatar_config["avatar_ready"] is True
    assert user.avatar_config["avatar_provider"] == "hedra"
    assert db.commits == 1
    assert db.refreshes == 1


@pytest.mark.asyncio
async def test_create_avatar_speech_job_tracks_latest_script(tmp_path: Path, monkeypatch):
    user = _make_user(
        tmp_path,
        avatar_config={
            "avatar_id": "avatar-7",
            "avatar_ready": True,
            "avatar_file_path": str(hedra_avatar.AVATAR_DIR / "7_avatar.png"),
        },
    )
    _make_image(Path(user.avatar_config["avatar_file_path"]))
    db = _DummyDb()

    async def fake_ensure_asset(_user, _db):
        return "asset-image-123"

    async def fake_ensure_script_audio(*, user_id: int, raw_text: str):
        assert user_id == 7
        assert "Explain `sum()`" in raw_text
        audio_path = hedra_avatar.UPLOAD_DIR / "audio.wav"
        audio_path.write_bytes(b"RIFFfake")
        return "Final Answer Explain sum()", {
            "audio_url": "/uploads/voice_output/test.wav",
            "audio_path": audio_path,
            "duration_ms": 12000,
            "provider": "coqui",
        }

    async def fake_create_audio_asset(_audio_path: Path, _user_id: int):
        return "asset-audio-456"

    async def fake_create_generation(**_kwargs):
        return {
            "id": "generation-123",
            "status": "pending",
        }

    monkeypatch.setattr(hedra_avatar, "_ensure_hedra_avatar_asset", fake_ensure_asset)
    monkeypatch.setattr(hedra_avatar, "_ensure_script_audio", fake_ensure_script_audio)
    monkeypatch.setattr(hedra_avatar, "_create_audio_asset", fake_create_audio_asset)
    monkeypatch.setattr(hedra_avatar, "_create_generation", fake_create_generation)

    result = await hedra_avatar.create_avatar_speech_job(
        user=user,
        db=db,
        avatar_id="avatar-7",
        text="## Final Answer\n- Explain `sum()`\n```python\nprint('skip')\n```",
    )

    assert result == {
        "job_id": "generation-123",
        "avatar_id": "avatar-7",
        "status": "pending",
        "video_url": None,
        "error": None,
    }
    assert user.avatar_config["last_script"] == "Final Answer Explain sum()"
    assert user.avatar_config["last_job_id"] == "generation-123"
    assert hedra_avatar._jobs["generation-123"]["user_id"] == 7


@pytest.mark.asyncio
async def test_get_avatar_job_status_downloads_video_when_complete(tmp_path: Path, monkeypatch):
    user = _make_user(
        tmp_path,
        avatar_config={
            "avatar_id": "avatar-7",
            "last_job_id": "generation-123",
            "last_generated_clip_url": None,
        },
    )
    db = _DummyDb()

    async def fake_get_generation(generation_id: str):
        assert generation_id == "generation-123"
        return {
            "id": generation_id,
            "status": "complete",
            "download_url": "https://cdn.example.com/generation-123.mp4",
        }

    async def fake_download_video_to_storage(*, source_url: str, output_path: Path):
        assert source_url == "https://cdn.example.com/generation-123.mp4"
        output_path.write_bytes(b"fake-video")
        return output_path

    monkeypatch.setattr(hedra_avatar, "_get_generation", fake_get_generation)
    monkeypatch.setattr(
        hedra_avatar,
        "_download_video_to_storage",
        fake_download_video_to_storage,
    )

    result = await hedra_avatar.get_avatar_job_status(
        job_id="generation-123",
        user=user,
        db=db,
    )

    assert result == {
        "job_id": "generation-123",
        "avatar_id": "avatar-7",
        "status": "done",
        "video_url": "/uploads/generated_videos/7_reply_generation-123.mp4",
        "error": None,
    }
    assert (
        user.avatar_config["last_generated_clip_url"]
        == "/uploads/generated_videos/7_reply_generation-123.mp4"
    )
    assert user.avatar_config["last_job_status"] == "done"
