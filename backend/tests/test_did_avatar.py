from pathlib import Path
from types import SimpleNamespace

import pytest

from app.services import did_avatar


class _DummyDb:
    def __init__(self) -> None:
        self.commits = 0
        self.refreshes = 0

    def commit(self) -> None:
        self.commits += 1

    def refresh(self, _user) -> None:
        self.refreshes += 1


@pytest.fixture(autouse=True)
def clear_jobs(monkeypatch, tmp_path: Path):
    did_avatar._jobs.clear()
    upload_dir = tmp_path / "uploads"
    (upload_dir / "photos").mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(did_avatar, "UPLOAD_DIR", upload_dir)
    yield
    did_avatar._jobs.clear()


def _make_user(tmp_path: Path, avatar_config=None):
    photo_path = did_avatar.UPLOAD_DIR / "photos" / "avatar.png"
    photo_path.write_bytes(b"fake-image")
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

    assert did_avatar._normalize_speech_text(raw_text) == "Final Answer Explain sum() Mention docs"


@pytest.mark.asyncio
async def test_ensure_avatar_for_user_reuses_matching_photo_hash(tmp_path: Path):
    user = _make_user(tmp_path)
    photo_hash = did_avatar._hash_file(Path(user.avatar_photo_path))
    user.avatar_config = {
        "avatar_id": "avatar-123",
        "did_source_url": "https://cdn.example.com/avatar.png",
        "did_photo_hash": photo_hash,
    }
    db = _DummyDb()

    result = await did_avatar.ensure_avatar_for_user(user, db)

    assert result == {
        "avatar_id": "avatar-123",
        "avatar_provider": "d-id",
        "avatar_image_url": "/uploads/photos/avatar.png",
        "cached": True,
    }
    assert user.avatar_config["avatar_ready"] is True
    assert user.avatar_config["avatar_provider"] == "d-id"
    assert db.commits == 1
    assert db.refreshes == 1


@pytest.mark.asyncio
async def test_create_avatar_speech_job_tracks_normalized_script(
    tmp_path: Path,
    monkeypatch,
):
    user = _make_user(
        tmp_path,
        avatar_config={
            "avatar_id": "avatar-123",
            "did_source_url": "https://cdn.example.com/avatar.png",
        },
    )
    db = _DummyDb()

    async def fake_create_talk(source_url: str, text: str):
        assert source_url == "https://cdn.example.com/avatar.png"
        assert "Explain `sum()`" in text
        return {"id": "talk-123", "status": "pending"}

    monkeypatch.setattr(did_avatar, "_create_talk", fake_create_talk)

    result = await did_avatar.create_avatar_speech_job(
        user=user,
        db=db,
        avatar_id="avatar-123",
        text="## Final Answer\n- Explain `sum()`\n```python\nprint('skip')\n```",
    )

    assert result == {
        "job_id": "talk-123",
        "avatar_id": "avatar-123",
        "status": "pending",
        "video_url": None,
        "error": None,
    }
    assert user.avatar_config["last_script"] == "Final Answer Explain sum()"
    assert user.avatar_config["last_talk_id"] == "talk-123"
    assert did_avatar._jobs["talk-123"]["user_id"] == 7
    assert db.commits == 1
    assert db.refreshes == 1


@pytest.mark.asyncio
async def test_get_avatar_job_status_recovers_from_saved_talk_id(
    tmp_path: Path,
    monkeypatch,
):
    user = _make_user(
        tmp_path,
        avatar_config={
            "avatar_id": "avatar-123",
            "last_talk_id": "talk-123",
            "last_generated_clip_url": None,
        },
    )
    db = _DummyDb()

    async def fake_get_talk(talk_id: str):
        assert talk_id == "talk-123"
        return {
            "id": talk_id,
            "status": "done",
            "result_url": "https://cdn.example.com/talk-123.mp4",
        }

    monkeypatch.setattr(did_avatar, "_get_talk", fake_get_talk)

    result = await did_avatar.get_avatar_job_status(
        job_id="talk-123",
        user=user,
        db=db,
    )

    assert result == {
        "job_id": "talk-123",
        "avatar_id": "avatar-123",
        "status": "done",
        "video_url": "https://cdn.example.com/talk-123.mp4",
        "error": None,
    }
    assert user.avatar_config["last_generated_clip_url"] == "https://cdn.example.com/talk-123.mp4"
    assert user.avatar_config["last_talk_id"] == "talk-123"
    assert db.commits == 1
    assert db.refreshes == 1
