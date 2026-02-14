import asyncio
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import auth, users, courses, tutor, uploads
from app.database import engine, Base
from app.config import settings
from sqlalchemy.exc import OperationalError


def _cors_origins() -> list[str]:
    raw = (settings.CORS_ORIGINS or "").strip()
    if not raw:
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    return [o.strip() for o in raw.split(",") if o.strip()]


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
            last_err = None
            break
        except OperationalError as e:
            last_err = e
            await asyncio.sleep(1)
    if last_err:
        raise last_err


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(tutor.router, prefix="/api/tutor", tags=["tutor"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])


@app.get("/")
async def root():
    return {"message": "AI Tutor API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
