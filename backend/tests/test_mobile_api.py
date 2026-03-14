"""
Mobile API test suite for the React Native app.

The current mobile contract depends on:
- Auth (register, login, me)
- Courses (list)
- Tutor text responses
- Hedra avatar create / speak / poll routes
- Daily tech video routes
- Photo upload alias

Runs without Docker or heavyweight ML dependencies by patching optional imports.
"""

import os
import sys
import types
import unittest
from unittest.mock import AsyncMock, MagicMock, patch


def _make_mock_module(name: str, **attrs) -> types.ModuleType:
    module = types.ModuleType(name)
    for key, value in attrs.items():
        setattr(module, key, value)
    return module


chromadb_mock = _make_mock_module("chromadb")
chromadb_mock.PersistentClient = MagicMock(return_value=MagicMock())
chromadb_mock.Client = MagicMock
chroma_settings = _make_mock_module("chromadb.config", Settings=MagicMock())
chromadb_mock.config = chroma_settings
sys.modules["chromadb"] = chromadb_mock
sys.modules["chromadb.config"] = chroma_settings

st_mock = _make_mock_module(
    "sentence_transformers",
    SentenceTransformer=MagicMock(
        return_value=MagicMock(encode=MagicMock(return_value=[[0.1, 0.2, 0.3]]))
    ),
)
sys.modules["sentence_transformers"] = st_mock

fitz_mock = _make_mock_module("fitz")
sys.modules["fitz"] = fitz_mock

docx_mock = _make_mock_module("docx")
sys.modules["docx"] = docx_mock

replicate_mock = _make_mock_module("replicate")
sys.modules["replicate"] = replicate_mock

pil_mock = _make_mock_module("PIL")
pil_mock.Image = MagicMock()
pil_mock.ImageEnhance = MagicMock()
pil_mock.ImageFilter = MagicMock()
pil_mock.ImageOps = MagicMock()
sys.modules["PIL"] = pil_mock

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_mobile.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-mobile-tests")
os.environ.setdefault("UPLOAD_DIR", "/tmp/test_uploads")
os.environ.setdefault("GEMINI_API_KEY", "")
os.environ.setdefault("OPENAI_API_KEY", "")
os.environ.setdefault("OPENROUTER_API_KEY", "")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app


Base.metadata.create_all(bind=engine)
client = TestClient(app)


class TestAuth(unittest.TestCase):
    EMAIL = "mobile_test@example.com"
    USERNAME = "mobile_tester"
    PASSWORD = "Password123!"

    def test_01_register(self):
        resp = client.post(
            "/api/auth/register",
            json={
                "email": self.EMAIL,
                "username": self.USERNAME,
                "password": self.PASSWORD,
                "full_name": "Mobile Tester",
            },
        )
        self.assertIn(resp.status_code, (200, 201), msg=resp.text)
        self.assertEqual(resp.json()["email"], self.EMAIL)

    def test_02_register_duplicate(self):
        client.post(
            "/api/auth/register",
            json={
                "email": self.EMAIL,
                "username": self.USERNAME,
                "password": self.PASSWORD,
            },
        )
        resp = client.post(
            "/api/auth/register",
            json={
                "email": self.EMAIL,
                "username": self.USERNAME + "_dup",
                "password": self.PASSWORD,
            },
        )
        self.assertGreaterEqual(resp.status_code, 400, msg=resp.text)

    def test_03_login(self):
        client.post(
            "/api/auth/register",
            json={
                "email": self.EMAIL,
                "username": self.USERNAME,
                "password": self.PASSWORD,
            },
        )
        resp = client.post(
            "/api/auth/login",
            data={"username": self.EMAIL, "password": self.PASSWORD},
        )
        self.assertEqual(resp.status_code, 200, msg=resp.text)
        self.assertIn("access_token", resp.json())

    def test_04_login_wrong_password(self):
        resp = client.post(
            "/api/auth/login",
            data={"username": self.EMAIL, "password": "wrongpassword"},
        )
        self.assertEqual(resp.status_code, 401, msg=resp.text)

    def test_05_get_me(self):
        client.post(
            "/api/auth/register",
            json={
                "email": self.EMAIL,
                "username": self.USERNAME,
                "password": self.PASSWORD,
            },
        )
        login_resp = client.post(
            "/api/auth/login",
            data={"username": self.EMAIL, "password": self.PASSWORD},
        )
        token = login_resp.json()["access_token"]
        resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(resp.status_code, 200, msg=resp.text)
        self.assertEqual(resp.json()["email"], self.EMAIL)

    def test_06_me_no_token(self):
        resp = client.get("/api/auth/me")
        self.assertEqual(resp.status_code, 401, msg=resp.text)


class TestCourses(unittest.TestCase):
    def setUp(self):
        email = "course_tester@example.com"
        client.post(
            "/api/auth/register",
            json={
                "email": email,
                "username": "course_tester",
                "password": "Password123!",
            },
        )
        login_resp = client.post(
            "/api/auth/login",
            data={"username": email, "password": "Password123!"},
        )
        self.token = login_resp.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_list_courses_unauthenticated(self):
        resp = client.get("/api/courses/")
        self.assertIn(resp.status_code, (200, 401), msg=resp.text)

    def test_list_courses_authenticated(self):
        resp = client.get("/api/courses/", headers=self.headers)
        self.assertEqual(resp.status_code, 200, msg=resp.text)
        self.assertIsInstance(resp.json(), list)


class TestAvatarAsync(unittest.TestCase):
    def setUp(self):
        email = "avatar_tester@example.com"
        client.post(
            "/api/auth/register",
            json={
                "email": email,
                "username": "avatar_tester",
                "password": "Password123!",
            },
        )
        login_resp = client.post(
            "/api/auth/login",
            data={"username": email, "password": "Password123!"},
        )
        self.token = login_resp.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_speak_requires_auth(self):
        resp = client.post(
            "/avatar/speak",
            json={"avatar_id": "avatar-1", "text": "Hello!"},
        )
        self.assertEqual(resp.status_code, 401, msg=resp.text)

    def test_create_requires_auth(self):
        resp = client.post(
            "/avatar/create",
            files={"file": ("avatar.png", b"fake-image", "image/png")},
        )
        self.assertEqual(resp.status_code, 401, msg=resp.text)

    def test_speak_returns_job(self):
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
            resp = client.post(
                "/avatar/speak",
                json={"avatar_id": "avatar-123", "text": "Teach me recursion."},
                headers=self.headers,
            )

        self.assertEqual(resp.status_code, 200, msg=resp.text)
        data = resp.json()
        self.assertEqual(data["job_id"], "talk-123")
        self.assertEqual(data["status"], "pending")

    def test_poll_job_not_found(self):
        resp = client.get(
            "/avatar/job/non-existent-uuid",
            headers=self.headers,
        )
        self.assertEqual(resp.status_code, 404, msg=resp.text)

    def test_poll_job_lifecycle(self):
        with patch(
            "app.routers.avatar.get_avatar_job_status",
            new=AsyncMock(
                return_value={
                    "job_id": "talk-123",
                    "avatar_id": "avatar-123",
                    "status": "done",
                    "video_url": "https://example.com/talk.mp4",
                    "error": None,
                }
            ),
        ):
            poll_resp = client.get(
                "/avatar/job/talk-123",
                headers=self.headers,
            )

        self.assertEqual(poll_resp.status_code, 200, msg=poll_resp.text)
        poll_data = poll_resp.json()
        self.assertEqual(poll_data["job_id"], "talk-123")
        self.assertEqual(poll_data["status"], "done")
        self.assertEqual(poll_data["video_url"], "https://example.com/talk.mp4")

    def test_daily_video_requires_auth(self):
        resp = client.get("/api/daily-video")
        self.assertEqual(resp.status_code, 401, msg=resp.text)

    def test_daily_video_generate_returns_job(self):
        with patch(
            "app.routers.daily_video.create_daily_update_video_job",
            new=AsyncMock(
                return_value={
                    "job_id": "generation-123",
                    "avatar_id": "avatar-123",
                    "status": "pending",
                    "video_url": None,
                    "error": None,
                }
            ),
        ):
            resp = client.post(
                "/api/daily-video/generate",
                headers=self.headers,
            )

        self.assertEqual(resp.status_code, 200, msg=resp.text)
        data = resp.json()
        self.assertEqual(data["job_id"], "generation-123")
        self.assertEqual(data["status"], "pending")


class TestHealthAndRoot(unittest.TestCase):
    def test_root(self):
        resp = client.get("/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("message", resp.json())

    def test_health(self):
        resp = client.get("/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "healthy")


class TestAvatarRouteStructure(unittest.TestCase):
    def setUp(self):
        email = "sync_avatar_tester@example.com"
        client.post(
            "/api/auth/register",
            json={
                "email": email,
                "username": "sync_avatar_tester",
                "password": "Password123!",
            },
        )
        login_resp = client.post(
            "/api/auth/login",
            data={"username": email, "password": "Password123!"},
        )
        self.headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    def test_legacy_generate_avatar_endpoint_exists(self):
        resp = client.post(
            "/generate-avatar-video",
            json={"text": "hello"},
            headers=self.headers,
        )
        self.assertNotEqual(resp.status_code, 404, "Legacy /generate-avatar-video route is missing!")
        self.assertIn(resp.status_code, (200, 400, 503, 422), msg=resp.text)


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  AI Tutor Mobile App - Backend API Test Suite")
    print("=" * 60 + "\n")
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    for cls in [
        TestHealthAndRoot,
        TestAuth,
        TestCourses,
        TestAvatarAsync,
        TestAvatarRouteStructure,
    ]:
        suite.addTests(loader.loadTestsFromTestCase(cls))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    if os.path.exists("test_mobile.db"):
        os.remove("test_mobile.db")
    sys.exit(0 if result.wasSuccessful() else 1)
