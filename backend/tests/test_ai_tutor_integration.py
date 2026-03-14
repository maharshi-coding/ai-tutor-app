"""Tests for the new AI Tutor integration endpoints.

Run with:  cd backend && pytest tests/test_ai_tutor_integration.py -v
"""

import json
import io
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch
import wave

import pytest
import pytest_asyncio
import httpx

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_ai_tutor.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key")

from app.main import app  # noqa: E402
from app.database import Base, engine  # noqa: E402

Base.metadata.create_all(bind=engine)

_test_counter = 0


def _minimal_wav_bytes() -> bytes:
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(22050)
        wav_file.writeframes(b"\x00\x00" * 2205)
    return buffer.getvalue()


async def _get_auth_token(client: httpx.AsyncClient) -> str:
    global _test_counter
    _test_counter += 1
    email = f"test_tutor_{_test_counter}@example.com"
    username = f"testtutor{_test_counter}"
    password = "testpassword123"

    await client.post(
        "/api/auth/register",
        json={
            "email": email,
            "username": username,
            "password": password,
            "full_name": "Test User",
        },
    )
    resp = await client.post(
        "/api/auth/login",
        data={"username": email, "password": password},
    )
    return resp.json()["access_token"]


async def _auth_header(client: httpx.AsyncClient) -> dict:
    token = await _get_auth_token(client)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def ac():
    transport = httpx.ASGITransport(app=app)  # type: ignore[arg-type]
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as c:
        yield c


# ---------------------------------------------------------------------------
# Root / health tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_root(ac):
    resp = await ac.get("/")
    assert resp.status_code == 200
    assert resp.json()["message"] == "AI Tutor API is running"


@pytest.mark.asyncio
async def test_health(ac):
    resp = await ac.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


# ---------------------------------------------------------------------------
# Tutor chat tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_tutor_chat_fallback(ac):
    """When no LLM service is configured, chat should return the built-in fallback."""
    headers = await _auth_header(ac)
    resp = await ac.post(
        "/api/tutor/chat",
        json={"message": "What is Python?"},
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "response" in data
    assert len(data["response"]) > 0
    assert "suggestions" in data


@pytest.mark.asyncio
async def test_tutor_chat_requires_auth(ac):
    resp = await ac.post("/api/tutor/chat", json={"message": "Hello"})
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_ask_tutor_alias(ac):
    headers = await _auth_header(ac)
    resp = await ac.post(
        "/ask-tutor",
        json={
            "message": "Explain what a Python function does.",
        },
        headers=headers,
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "response" in data
    assert data.get("course_id") is None


@pytest.mark.asyncio
async def test_ask_tutor_passes_current_session_history(ac):
    headers = await _auth_header(ac)

    with patch(
        "app.routers.tutor.get_tutor_response",
        new=AsyncMock(return_value="## Explanation\n\nStructured answer."),
    ) as mocked_get_tutor_response:
        resp = await ac.post(
            "/ask-tutor",
            json={
                "message": "What about decorators in that example?",
                "history": [
                    {"role": "user", "content": "Show me a Python decorator."},
                    {
                        "role": "assistant",
                        "content": "## Explanation\n\nA decorator wraps another function.",
                    },
                ],
            },
            headers=headers,
        )

    assert resp.status_code == 200, resp.text
    mocked_get_tutor_response.assert_awaited_once()
    history = mocked_get_tutor_response.await_args.kwargs["history"]
    assert [(item.role, item.content) for item in history] == [
        ("user", "Show me a Python decorator."),
        ("assistant", "## Explanation\n\nA decorator wraps another function."),
    ]


# ---------------------------------------------------------------------------
# Ollama provider unit test
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_ollama_tutor_response():
    """Mock Ollama and verify the provider returns the LLM content."""
    from app.routers.tutor import _get_ollama_tutor_response

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {
        "message": {"content": "Python is a programming language."}
    }

    with patch("app.routers.tutor.httpx.AsyncClient") as MockClient:
        instance = AsyncMock()
        instance.post.return_value = mock_resp
        instance.__aenter__ = AsyncMock(return_value=instance)
        instance.__aexit__ = AsyncMock(return_value=False)
        MockClient.return_value = instance

        result = await _get_ollama_tutor_response("What is Python?")
        assert result == "Python is a programming language."


# ---------------------------------------------------------------------------
# Voice endpoint tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_voice_requires_auth(ac):
    resp = await ac.post("/api/voice", json={"text": "Hello world"})
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_generate_voice_alias_requires_auth(ac):
    resp = await ac.post("/generate-voice", json={"text": "Hello world"})
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_voice_empty_text(ac):
    headers = await _auth_header(ac)
    resp = await ac.post(
        "/api/voice",
        json={"text": "   "},
        headers=headers,
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_voice_route_returns_audio(ac):
    headers = await _auth_header(ac)
    from app.services.tts import GeneratedAudio

    with patch(
        "app.routers.voice.ensure_voice_audio",
        new=AsyncMock(
            return_value=GeneratedAudio(
                audio_url="/uploads/voice_output/test.wav",
                absolute_path=Path("test.wav"),
                duration_ms=1000,
                provider="piper",
            )
        ),
    ):
        resp = await ac.post(
            "/api/voice",
            json={"text": "Hello world"},
            headers=headers,
        )

    assert resp.status_code == 200, resp.text
    assert resp.json()["audio_url"] == "/uploads/voice_output/test.wav"
    assert resp.json()["provider"] == "piper"


# ---------------------------------------------------------------------------
# Avatar endpoint tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_avatar_requires_auth(ac):
    resp = await ac.post(
        "/avatar/speak",
        json={"avatar_id": "avatar-123", "text": "Hello"},
    )
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_avatar_create_requires_auth(ac):
    resp = await ac.post(
        "/avatar/create",
        files={"file": ("avatar.png", b"fake-image", "image/png")},
    )
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_generate_avatar_video_alias_requires_auth(ac):
    resp = await ac.post("/generate-avatar-video", json={"text": "Hello"})
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_avatar_speak_requires_existing_avatar(ac):
    headers = await _auth_header(ac)
    resp = await ac.post(
        "/avatar/speak",
        json={"avatar_id": "avatar-123", "text": "Hello"},
        headers=headers,
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_avatar_speak_returns_job(ac):
    headers = await _auth_header(ac)

    with patch(
        "app.routers.avatar.create_avatar_speech_job",
        new=AsyncMock(
            return_value={
                "job_id": "talk-123",
                "avatar_id": "avatar-123",
                "status": "pending",
                "video_url": None,
                "error": None,
            }
        ),
    ):
        resp = await ac.post(
            "/avatar/speak",
            json={"avatar_id": "avatar-123", "text": "Teach me recursion"},
            headers=headers,
        )

    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["job_id"] == "talk-123"
    assert data["status"] == "pending"


# ---------------------------------------------------------------------------
# Streaming endpoint tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_stream_requires_auth(ac):
    resp = await ac.get("/api/tutor/stream?message=Hello")
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_stream_returns_sse(ac):
    """Stream endpoint returns text/event-stream content type."""
    headers = await _auth_header(ac)
    resp = await ac.get(
        "/api/tutor/stream?message=What+is+Python",
        headers=headers,
    )
    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers.get("content-type", "")


# ---------------------------------------------------------------------------
# Course document upload tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_course_doc_upload_requires_auth(ac):
    resp = await ac.post(
        "/api/uploads/course-document",
        data={"course_id": "1"},
        files={"file": ("test.txt", b"hello", "text/plain")},
    )
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_upload_photo_alias_partial_success(ac):
    headers = await _auth_header(ac)
    resp = await ac.post(
        "/upload-photo",
        files={"file": ("avatar.png", b"not-a-real-image", "image/png")},
        headers=headers,
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["photo_url"].startswith("/uploads/photos/")
    assert data["avatar_generation_status"] in ("ready", "failed")


@pytest.mark.asyncio
async def test_course_doc_upload_bad_extension(ac):
    headers = await _auth_header(ac)
    resp = await ac.post(
        "/api/uploads/course-document",
        data={"course_id": "1"},
        files={"file": ("test.exe", b"bad", "application/octet-stream")},
        headers=headers,
    )
    assert resp.status_code == 400
    assert "Unsupported" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_course_doc_upload_course_not_found(ac):
    headers = await _auth_header(ac)
    resp = await ac.post(
        "/api/uploads/course-document",
        data={"course_id": "99999"},
        files={"file": ("notes.txt", b"some content", "text/plain")},
        headers=headers,
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# RAG pipeline unit tests
# ---------------------------------------------------------------------------


def test_chunk_text():
    from app.routers.uploads import _chunk_text

    text = " ".join(f"word{i}" for i in range(1200))
    chunks = _chunk_text(text, chunk_size=500, overlap=50)
    assert len(chunks) >= 2
    # Each chunk should have roughly 500 words (except possibly the last)
    assert len(chunks[0].split()) == 500


def test_extract_text_txt(tmp_path: Path):
    from app.routers.uploads import _extract_text_from_file

    f = tmp_path / "notes.txt"
    f.write_text("Hello world from a text file.")
    result = _extract_text_from_file(f)
    assert "Hello world" in result


def test_extract_text_md(tmp_path: Path):
    from app.routers.uploads import _extract_text_from_file

    f = tmp_path / "notes.md"
    f.write_text("# Heading\n\nSome **bold** text.")
    result = _extract_text_from_file(f)
    assert "Heading" in result


def test_extract_text_html(tmp_path: Path):
    from app.routers.uploads import _extract_text_from_file

    f = tmp_path / "lesson.html"
    f.write_text(
        "<html><body><nav>Menu</nav><main><h1>Loops</h1><p>Use for and while loops.</p></main></body></html>",
        encoding="utf-8",
    )
    result = _extract_text_from_file(f)
    assert "Loops" in result
    assert "Menu" not in result


def test_extract_text_ipynb(tmp_path: Path):
    from app.routers.uploads import _extract_text_from_file

    f = tmp_path / "lesson.ipynb"
    f.write_text(
        json.dumps(
            {
                "cells": [
                    {"cell_type": "markdown", "source": ["# Gradient Descent\n", "Intro text."]},
                    {
                        "cell_type": "code",
                        "source": ["print('step')"],
                        "outputs": [{"output_type": "stream", "text": ["step\n"]}],
                    },
                ]
            }
        ),
        encoding="utf-8",
    )
    result = _extract_text_from_file(f)
    assert "Gradient Descent" in result
    assert "print('step')" in result


# ---------------------------------------------------------------------------
# Config tests
# ---------------------------------------------------------------------------


def test_config_has_ollama_settings():
    from app.config import settings

    assert hasattr(settings, "OLLAMA_BASE_URL")
    assert hasattr(settings, "OLLAMA_MODEL")
    assert settings.OLLAMA_BASE_URL == "http://localhost:11434"


def test_default_ollama_base_url_uses_host_gateway_in_docker(monkeypatch):
    from app import config

    monkeypatch.setattr(config.Path, "exists", lambda self: str(self) == "/.dockerenv")

    assert config._default_ollama_base_url() == "http://host.docker.internal:11434"


def test_config_has_kokoro_settings():
    from app.config import settings

    assert hasattr(settings, "KOKORO_API_URL")


def test_config_has_did_settings():
    from app.config import settings

    assert hasattr(settings, "DID_API_KEY")
    assert hasattr(settings, "DID_API_BASE_URL")
    assert hasattr(settings, "DID_DEFAULT_VOICE")


def test_config_does_not_have_sadtalker_settings():
    from app.config import settings

    assert not hasattr(settings, "SADTALKER_API_URL")
    assert not hasattr(settings, "SADTALKER_TIMEOUT_SECONDS")
