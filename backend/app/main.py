import asyncio
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import auth, users, courses, tutor, uploads, voice, avatar, mobile_api
from app.database import engine, Base, SessionLocal
from app.config import settings
from app.services.course_bootstrap import ensure_seed_course_rag, ensure_seed_courses
from sqlalchemy.exc import OperationalError


def _cors_origins() -> list[str]:
    raw = (settings.CORS_ORIGINS or "").strip()
    if not raw:
        # Default: allow local web dev + any origin (React Native sends no Origin header)
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    return origins


app = FastAPI(
    title="AI Tutor API",
    description="Personalized AI Tutoring Platform",
    version="1.0.0",
)


@app.on_event("startup")
async def on_startup() -> None:
    """Create DB tables and mount static files; retry DB connection briefly for Docker."""
    # Ensure uploads directory exists and mount it for static serving
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

    last_err: Exception | None = None
    for _ in range(20):
        try:
            Base.metadata.create_all(bind=engine)
            db = SessionLocal()
            try:
                ensure_seed_courses(db)
                ensure_seed_course_rag(db)
            finally:
                db.close()
            last_err = None
            break
        except OperationalError as e:
            last_err = e
            await asyncio.sleep(1)
        except Exception as e:
            print("COURSE_BOOTSTRAP_WARNING:", repr(e))
            last_err = None
            break
    if last_err:
        raise last_err


# CORS middleware
# React Native apps do not send an Origin header, so allow_origins=["*"] is safe
# when paired with JWT authentication on all protected routes.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(tutor.router, prefix="/api/tutor", tags=["tutor"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])
app.include_router(voice.router, prefix="/api", tags=["voice"])
app.include_router(avatar.router, prefix="/api", tags=["avatar"])
app.include_router(mobile_api.router, tags=["mobile-aliases"])


@app.get("/")
async def root():
    return {"message": "AI Tutor API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
