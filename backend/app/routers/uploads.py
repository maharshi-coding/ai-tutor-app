import hashlib
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Course, User
from app.rag import ingest_course_chunks, split_text_for_rag
from app.routers.auth import get_current_user
from app.services.course_content import TEXT_FILE_EXTENSIONS, extract_text_from_file
from app.services.daily_video_scheduler import spawn_detached_daily_video_job
from app.services.hedra_avatar import AvatarPipelineError, ensure_avatar_for_user


router = APIRouter()

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "photos").mkdir(exist_ok=True)
(UPLOAD_DIR / "voices").mkdir(exist_ok=True)
(UPLOAD_DIR / "course_docs").mkdir(exist_ok=True)
(UPLOAD_DIR / "avatars").mkdir(exist_ok=True)


def _to_public_upload_url(path_value: str | Path | None) -> Optional[str]:
    if not path_value:
        return None

    file_path = Path(path_value)
    try:
        relative_path = file_path.relative_to(UPLOAD_DIR)
        return f"/uploads/{relative_path.as_posix()}"
    except Exception:
        return str(path_value)


async def _save_uploaded_photo(
    file: UploadFile,
    current_user: User,
    db: Session,
) -> dict[str, Any]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    file_extension = Path(file.filename or "photo.jpg").suffix or ".jpg"
    filename = f"{current_user.id}_photo{file_extension}"
    file_path = UPLOAD_DIR / "photos" / filename

    for existing_photo in (UPLOAD_DIR / "photos").glob(f"{current_user.id}_photo.*"):
        if existing_photo != file_path:
            existing_photo.unlink(missing_ok=True)

    current_size = 0
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            current_size += len(chunk)
            if current_size > settings.MAX_FILE_SIZE:
                file_path.unlink(missing_ok=True)
                raise HTTPException(status_code=400, detail="File too large")
            buffer.write(chunk)

    current_user.avatar_photo_path = str(file_path)
    photo_url = _to_public_upload_url(file_path)
    config = dict(current_user.avatar_config or {})
    config.update(
        {
            "avatar_ready": False,
            "avatar_provider": "hedra",
            "avatar_image_url": photo_url,
            "character_image_url": photo_url,
            "last_generated_clip_url": None,
            "last_script": None,
            "last_job_id": None,
            "daily_video_job_id": None,
            "daily_video_status": "idle",
            "daily_video_url": None,
            "daily_video_error": None,
            "daily_video_title": None,
            "daily_video_summary": None,
            "daily_video_highlights": [],
            "daily_video_source_urls": [],
            "daily_video_generated_at": None,
        }
    )
    current_user.avatar_config = config
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Photo uploaded successfully",
        "file_path": photo_url,
        "user_id": current_user.id,
    }


@router.post("/photo")
async def upload_photo(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload_result = await _save_uploaded_photo(file, current_user, db)

    try:
        avatar_result = await ensure_avatar_for_user(current_user, db)
    except AvatarPipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    if background_tasks is not None:
        background_tasks.add_task(spawn_detached_daily_video_job, current_user.id, False)

    return {
        **upload_result,
        "avatar_id": avatar_result["avatar_id"],
        "avatar_provider": avatar_result["avatar_provider"],
        "avatar_image_url": avatar_result.get("avatar_image_url"),
        "avatar_ready": True,
        "cached": avatar_result.get("cached", False),
    }


@router.post("/voice")
async def upload_voice(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    allowed_types = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/webm"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="File must be an audio file (wav, mp3, webm)",
        )

    file_extension = Path(file.filename or "voice.webm").suffix or ".webm"
    filename = f"{current_user.id}_voice{file_extension}"
    file_path = UPLOAD_DIR / "voices" / filename

    current_size = 0
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            current_size += len(chunk)
            if current_size > settings.MAX_FILE_SIZE:
                file_path.unlink(missing_ok=True)
                raise HTTPException(status_code=400, detail="File too large")
            buffer.write(chunk)

    current_user.voice_sample_path = str(file_path)
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Voice sample uploaded successfully",
        "file_path": f"/uploads/voices/{filename}",
        "user_id": current_user.id,
    }


@router.get("/avatar-config")
async def get_avatar_config(current_user: User = Depends(get_current_user)):
    config: Dict[str, Any] = current_user.avatar_config or {}
    photo_url = _to_public_upload_url(current_user.avatar_photo_path)
    avatar_image_url = config.get("avatar_image_url") or photo_url
    return {
        "has_photo": current_user.avatar_photo_path is not None,
        "has_voice": current_user.voice_sample_path is not None,
        "photo_path": photo_url,
        "voice_path": _to_public_upload_url(current_user.voice_sample_path),
        "avatar_id": config.get("avatar_id"),
        "avatar_ready": bool(
            current_user.avatar_photo_path
            and config.get("avatar_ready")
            and config.get("avatar_id")
        ),
        "avatar_provider": config.get("avatar_provider"),
        "avatar_image_url": avatar_image_url,
        "character_image_url": avatar_image_url,
        "last_generated_clip_url": config.get("last_generated_clip_url"),
        "last_script": config.get("last_script"),
        "daily_video_url": config.get("daily_video_url"),
        "daily_video_title": config.get("daily_video_title"),
        "daily_video_summary": config.get("daily_video_summary"),
        "daily_video_highlights": config.get("daily_video_highlights") or [],
        "daily_video_source_urls": config.get("daily_video_source_urls") or [],
        "daily_video_status": config.get("daily_video_status"),
        "daily_video_generated_at": config.get("daily_video_generated_at"),
        "daily_video_error": config.get("daily_video_error"),
    }


@router.post("/avatar/generate-character")
async def generate_character_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    try:
        avatar_result = await ensure_avatar_for_user(current_user, db)
    except AvatarPipelineError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    return {
        "message": "Stylized avatar generated for Hedra.",
        "avatar_id": avatar_result["avatar_id"],
        "avatar_provider": avatar_result["avatar_provider"],
        "character_image_url": avatar_result.get("avatar_image_url"),
        "cached": avatar_result.get("cached", False),
    }


@router.post("/upload-photo")
async def upload_photo_and_generate_avatar(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    upload_result = await _save_uploaded_photo(file, current_user, db)
    photo_url = upload_result["file_path"]

    try:
        avatar_result = await ensure_avatar_for_user(current_user, db)
        if background_tasks is not None:
            background_tasks.add_task(
                spawn_detached_daily_video_job,
                current_user.id,
                False,
            )
        return {
            "message": "Photo uploaded and Hedra avatar is ready",
            "photo_url": photo_url,
            "avatar_url": avatar_result.get("avatar_image_url"),
            "avatar_id": avatar_result["avatar_id"],
            "avatar_provider": avatar_result["avatar_provider"],
            "avatar_generation_status": "cached"
            if avatar_result.get("cached")
            else "ready",
            "cached": avatar_result.get("cached", False),
        }
    except AvatarPipelineError as exc:
        return {
            "message": "Photo uploaded, but the avatar setup is not ready yet",
            "photo_url": photo_url,
            "avatar_url": photo_url,
            "avatar_id": None,
            "avatar_provider": "hedra",
            "avatar_generation_status": "failed",
            "avatar_error": str(exc),
        }
    except Exception as exc:
        return {
            "message": "Photo uploaded, but avatar setup hit an unexpected error",
            "photo_url": photo_url,
            "avatar_url": photo_url,
            "avatar_id": None,
            "avatar_provider": "hedra",
            "avatar_generation_status": "failed",
            "avatar_error": repr(exc),
        }


ALLOWED_DOC_EXTENSIONS = set(TEXT_FILE_EXTENSIONS)


def _extract_text_from_file(file_path: Path) -> str:
    return extract_text_from_file(file_path)


def _chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> List[str]:
    chunks = split_text_for_rag(text)
    if chunks:
        return chunks

    words = text.split()
    fallback_chunks: List[str] = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        if chunk.strip():
            fallback_chunks.append(chunk)
        start += chunk_size - overlap
    return fallback_chunks


@router.post("/course-document")
async def upload_course_document(
    file: UploadFile = File(...),
    course_id: Optional[int] = Form(None),
    course_id_query: Optional[int] = Query(None, alias="course_id"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resolved_course_id = course_id or course_id_query
    if resolved_course_id is None:
        raise HTTPException(status_code=400, detail="course_id is required")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_DOC_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_DOC_EXTENSIONS))}",
        )

    course = db.query(Course).filter(Course.id == resolved_course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    base_name = Path(file.filename or "upload").name
    safe_name = f"{resolved_course_id}_{current_user.id}_{base_name}"
    file_path = UPLOAD_DIR / "course_docs" / safe_name

    current_size = 0
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            current_size += len(chunk)
            if current_size > settings.MAX_COURSE_FILE_SIZE:
                file_path.unlink(missing_ok=True)
                raise HTTPException(status_code=400, detail="File too large (max 50 MB)")
            buffer.write(chunk)

    try:
        raw_text = extract_text_from_file(file_path)
    except ValueError as exc:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=str(exc))
    if not raw_text.strip():
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=400,
            detail="Could not extract any text from the document",
        )

    text_chunks = _chunk_text(raw_text)
    chunk_tuples = [
        (
            hashlib.sha256(f"{resolved_course_id}:{safe_name}:{index}".encode()).hexdigest()[:20],
            chunk,
        )
        for index, chunk in enumerate(text_chunks)
    ]

    ingest_course_chunks(resolved_course_id, chunk_tuples)

    return {
        "message": "Document uploaded and ingested successfully",
        "filename": file.filename,
        "course_id": resolved_course_id,
        "chunks_ingested": len(chunk_tuples),
    }
