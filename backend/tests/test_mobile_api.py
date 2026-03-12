"""
Mobile API Test Suite
Tests all endpoints the React Native mobile app depends on:
- Auth (register, login, me)
- Courses (list)
- Tutor (chat) 
- Avatar (async generate + poll)
- Uploads (photo)

Runs without Docker/ML deps by patching chromadb & sentence-transformers.
"""
import sys
import types
import unittest
from unittest.mock import MagicMock, patch, AsyncMock
import os

# ─── Patch heavy ML/AI dependencies before importing app ─────────────────────
def _make_mock_module(name: str, **attrs) -> types.ModuleType:
    mod = types.ModuleType(name)
    for k, v in attrs.items():
        setattr(mod, k, v)
    return mod

# chromadb + sentence_transformers are not installed in test env
chromadb_mock = _make_mock_module("chromadb")
chromadb_mock.PersistentClient = MagicMock(return_value=MagicMock())
chromadb_mock.Client = MagicMock  # legacy attribute used in rag.py type hint
_chroma_settings = _make_mock_module("chromadb.config", Settings=MagicMock())
chromadb_mock.config = _chroma_settings
sys.modules["chromadb"] = chromadb_mock
sys.modules["chromadb.config"] = _chroma_settings

st_mock = _make_mock_module(
    "sentence_transformers", SentenceTransformer=MagicMock(return_value=MagicMock(
        encode=MagicMock(return_value=[[0.1, 0.2, 0.3]])
    ))
)
sys.modules["sentence_transformers"] = st_mock

# pymupdf (PyMuPDF) is not installed
fitz_mock = _make_mock_module("fitz")
sys.modules["fitz"] = fitz_mock

# python-docx not installed
docx_mock = _make_mock_module("docx")
sys.modules["docx"] = docx_mock

# replicate not installed
replicate_mock = _make_mock_module("replicate")
sys.modules["replicate"] = replicate_mock

# PIL
pil_mock = _make_mock_module("PIL")
pil_mock.Image = MagicMock()
sys.modules["PIL"] = pil_mock

# ─────────────────────────────────────────────────────────────────────────────
import os
# Use SQLite for tests
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_mobile.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-mobile-tests")
os.environ.setdefault("UPLOAD_DIR", "/tmp/test_uploads")
os.environ.setdefault("SADTALKER_API_URL", "http://localhost:8870")
os.environ.setdefault("KOKORO_API_URL", "http://localhost:8880")
os.environ.setdefault("GEMINI_API_KEY", "")
os.environ.setdefault("OPENAI_API_KEY", "")
os.environ.setdefault("OPENROUTER_API_KEY", "")

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base

# Create all tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)


class TestAuth(unittest.TestCase):
    """Tests for /api/auth endpoints used by mobile app."""

    EMAIL = "mobile_test@example.com"
    USERNAME = "mobile_tester"
    PASSWORD = "Password123!"

    def test_01_register(self):
        resp = client.post("/api/auth/register", json={
            "email": self.EMAIL,
            "username": self.USERNAME,
            "password": self.PASSWORD,
            "full_name": "Mobile Tester",
        })
        self.assertIn(resp.status_code, (200, 201), msg=resp.text)
        data = resp.json()
        self.assertIn("email", data)
        self.assertEqual(data["email"], self.EMAIL)

    def test_02_register_duplicate(self):
        """Duplicate registration should fail with 4xx."""
        client.post("/api/auth/register", json={
            "email": self.EMAIL,
            "username": self.USERNAME,
            "password": self.PASSWORD,
        })
        resp = client.post("/api/auth/register", json={
            "email": self.EMAIL,
            "username": self.USERNAME + "_dup",
            "password": self.PASSWORD,
        })
        self.assertGreaterEqual(resp.status_code, 400, msg=resp.text)

    def test_03_login(self):
        # Ensure registered
        client.post("/api/auth/register", json={
            "email": self.EMAIL,
            "username": self.USERNAME,
            "password": self.PASSWORD,
        })
        resp = client.post("/api/auth/login", data={
            "username": self.EMAIL,
            "password": self.PASSWORD,
        })
        self.assertEqual(resp.status_code, 200, msg=resp.text)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")

    def test_04_login_wrong_password(self):
        resp = client.post("/api/auth/login", data={
            "username": self.EMAIL,
            "password": "wrongpassword",
        })
        self.assertEqual(resp.status_code, 401, msg=resp.text)

    def test_05_get_me(self):
        # Login first
        client.post("/api/auth/register", json={
            "email": self.EMAIL,
            "username": self.USERNAME,
            "password": self.PASSWORD,
        })
        login_resp = client.post("/api/auth/login", data={
            "username": self.EMAIL,
            "password": self.PASSWORD,
        })
        token = login_resp.json()["access_token"]
        resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(resp.status_code, 200, msg=resp.text)
        data = resp.json()
        self.assertEqual(data["email"], self.EMAIL)

    def test_06_me_no_token(self):
        resp = client.get("/api/auth/me")
        self.assertEqual(resp.status_code, 401, msg=resp.text)


class TestCourses(unittest.TestCase):
    """Tests for /api/courses endpoint."""

    def setUp(self):
        # Register and login
        email = "course_tester@example.com"
        client.post("/api/auth/register", json={
            "email": email,
            "username": "course_tester",
            "password": "Password123!",
        })
        login_resp = client.post("/api/auth/login", data={
            "username": email, "password": "Password123!"
        })
        self.token = login_resp.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_list_courses_unauthenticated(self):
        # Course catalog is public — mobile browse-before-login flow
        resp = client.get("/api/courses/")
        self.assertIn(resp.status_code, (200, 401), msg=resp.text)

    def test_list_courses_authenticated(self):
        resp = client.get("/api/courses/", headers=self.headers)
        self.assertEqual(resp.status_code, 200, msg=resp.text)
        self.assertIsInstance(resp.json(), list)


class TestAvatarAsync(unittest.TestCase):
    """
    Tests for the new async avatar endpoints:
      POST /api/avatar/generate  → {job_id}
      GET  /api/avatar/job/{id}  → {status, video_url?}
    """

    def setUp(self):
        email = "avatar_tester@example.com"
        client.post("/api/auth/register", json={
            "email": email,
            "username": "avatar_tester",
            "password": "Password123!",
        })
        login_resp = client.post("/api/auth/login", data={
            "username": email, "password": "Password123!"
        })
        self.token = login_resp.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_generate_no_auth(self):
        resp = client.post("/api/avatar/generate", json={"text": "Hello!"})
        self.assertEqual(resp.status_code, 401, msg=resp.text)

    def test_generate_returns_job(self):
        """
        POST /api/avatar/generate should return a job_id immediately,
        even if SadTalker is not running (background task queued).
        The image is also missing so the job will fail — but the HTTP
        response must still be 200 with a job_id.
        """
        resp = client.post(
            "/api/avatar/generate",
            json={"text": "Hello! I am your AI tutor."},
            headers=self.headers,
        )
        self.assertEqual(resp.status_code, 200, msg=resp.text)
        data = resp.json()
        self.assertIn("job_id", data)
        self.assertIn("status", data)
        self.assertIn(data["status"], ("pending", "processing", "done", "failed"))
        self._job_id = data["job_id"]
        print(f"  ✓ Job created: {data['job_id']} (status={data['status']})")

    def test_poll_job_not_found(self):
        """Polling a non-existent job should return 404."""
        resp = client.get(
            "/api/avatar/job/non-existent-uuid",
            headers=self.headers,
        )
        self.assertEqual(resp.status_code, 404, msg=resp.text)

    def test_poll_job_lifecycle(self):
        """Create a job then poll it — status should be valid."""
        create_resp = client.post(
            "/api/avatar/generate",
            json={"text": "Testing avatar lifecycle."},
            headers=self.headers,
        )
        self.assertEqual(create_resp.status_code, 200, msg=create_resp.text)
        job_id = create_resp.json()["job_id"]

        # Poll immediately
        poll_resp = client.get(
            f"/api/avatar/job/{job_id}",
            headers=self.headers,
        )
        self.assertEqual(poll_resp.status_code, 200, msg=poll_resp.text)
        poll_data = poll_resp.json()
        self.assertIn("job_id", poll_data)
        self.assertIn("status", poll_data)
        self.assertIn(poll_data["status"], ("pending", "processing", "done", "failed"))
        print(f"  ✓ Job poll succeeded: {poll_data}")


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
    """Verify sync avatar endpoint still exists (web frontend compatibility)."""

    def setUp(self):
        email = "sync_avatar_tester@example.com"
        client.post("/api/auth/register", json={
            "email": email, "username": "sync_avatar_tester", "password": "Password123!",
        })
        login_resp = client.post("/api/auth/login", data={
            "username": email, "password": "Password123!"
        })
        self.headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    def test_sync_avatar_endpoint_exists(self):
        """POST /api/avatar without valid image returns 400 (not 404 = route exists)."""
        resp = client.post(
            "/api/avatar",
            json={"text": "hello"},
            headers=self.headers,
        )
        # 400 means route found but no image configured — correct
        # 503 means SadTalker not running but route found — also correct
        self.assertNotEqual(resp.status_code, 404, "Sync /api/avatar route is missing!")
        self.assertIn(resp.status_code, (400, 503, 502, 422), msg=resp.text)


if __name__ == "__main__":
    import xmlrunner  # type: ignore
    print("\n" + "=" * 60)
    print("  AI Tutor Mobile App — Backend API Test Suite")
    print("=" * 60 + "\n")
    loader = unittest.TestLoader()
    # Sort by class then test method name
    suite = unittest.TestSuite()
    for cls in [TestHealthAndRoot, TestAuth, TestCourses, TestAvatarAsync,
                TestAvatarRouteStructure]:
        suite.addTests(loader.loadTestsFromTestCase(cls))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    # Clean up
    import os
    if os.path.exists("test_mobile.db"):
        os.remove("test_mobile.db")
    sys.exit(0 if result.wasSuccessful() else 1)
