"""Talking avatar endpoints backed by Hedra and Coqui."""

from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.routers.uploads import _save_uploaded_photo
from app.schemas import AvatarCreateResponse, AvatarJobResponse, AvatarSpeakRequest
from app.services.daily_video_scheduler import spawn_detached_daily_video_job
from app.services.hedra_avatar import (
    AvatarPipelineError,
    create_avatar_speech_job,
    ensure_avatar_for_user,
    get_avatar_job_status,
)


router = APIRouter()


class LegacyAvatarSpeakRequest(BaseModel):
    text: Optional[str] = None
    audio_url: Optional[str] = None
    image_url: Optional[str] = None


def _avatar_service_error(exc: AvatarPipelineError) -> HTTPException:
    message = str(exc)
    if (
        "Upload a photo" in message
        or "Create an avatar" in message
        or "could not be found" in message
        or "does not match" in message
    ):
        return HTTPException(status_code=400, detail=message)
    return HTTPException(status_code=503, detail=message)


@router.post("/avatar/create", response_model=AvatarCreateResponse)
async def create_avatar(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    await _save_uploaded_photo(file, current_user, db)

    try:
        avatar_result = await ensure_avatar_for_user(current_user, db)
    except AvatarPipelineError as exc:
        raise _avatar_service_error(exc)

    if background_tasks is not None:
        background_tasks.add_task(spawn_detached_daily_video_job, current_user.id, False)

    return AvatarCreateResponse(
        avatar_id=avatar_result["avatar_id"],
        avatar_provider=avatar_result["avatar_provider"],
        avatar_image_url=avatar_result.get("avatar_image_url"),
        cached=avatar_result.get("cached", False),
        message="Avatar ready for Hedra-powered video updates.",
    )


@router.post("/avatar/speak", response_model=AvatarJobResponse)
async def speak_with_avatar(
    req: AvatarSpeakRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        result = await create_avatar_speech_job(
            user=current_user,
            db=db,
            avatar_id=req.avatar_id,
            text=req.text,
        )
    except AvatarPipelineError as exc:
        raise _avatar_service_error(exc)

    return AvatarJobResponse(
        job_id=result["job_id"],
        avatar_id=result.get("avatar_id"),
        status=result["status"],
        video_url=result.get("video_url"),
        error=result.get("error"),
    )


@router.post("/avatar", response_model=AvatarJobResponse)
@router.post("/avatar/generate", response_model=AvatarJobResponse)
@router.post("/generate-avatar-video", response_model=AvatarJobResponse)
async def generate_avatar_video_legacy(
    req: LegacyAvatarSpeakRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.audio_url:
        raise HTTPException(
            status_code=400,
            detail="audio_url is no longer supported. Send text to /avatar/speak instead.",
        )
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="text is required for avatar speech.")

    try:
        avatar_result = await ensure_avatar_for_user(current_user, db)
        result = await create_avatar_speech_job(
            user=current_user,
            db=db,
            avatar_id=avatar_result["avatar_id"],
            text=req.text,
        )
    except AvatarPipelineError as exc:
        raise _avatar_service_error(exc)

    return AvatarJobResponse(
        job_id=result["job_id"],
        avatar_id=result.get("avatar_id"),
        status=result["status"],
        video_url=result.get("video_url"),
        error=result.get("error"),
    )


@router.get("/avatar/job/{job_id}", response_model=AvatarJobResponse)
async def get_avatar_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        job = await get_avatar_job_status(job_id=job_id, user=current_user, db=db)
    except AvatarPipelineError as exc:
        raise _avatar_service_error(exc)

    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    return AvatarJobResponse(
        job_id=job["job_id"],
        avatar_id=job.get("avatar_id"),
        status=job["status"],
        video_url=job.get("video_url"),
        error=job.get("error"),
    )
