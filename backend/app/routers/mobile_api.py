"""Root-level aliases for the React Native mobile app."""

from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.routers.avatar import (
    LegacyAvatarSpeakRequest,
    create_avatar,
    generate_avatar_video_legacy,
    get_avatar_job,
    speak_with_avatar,
)
from app.routers.tutor import ask_tutor
from app.routers.uploads import upload_photo_and_generate_avatar
from app.routers.voice import VoiceRequest, VoiceResponse, generate_voice
from app.schemas import AskTutorRequest, AskTutorResponse, AvatarCreateResponse, AvatarJobResponse, AvatarSpeakRequest


router = APIRouter()


@router.post("/ask-tutor", response_model=AskTutorResponse)
async def ask_tutor_alias(
    request: AskTutorRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await ask_tutor(
        request=request,
        current_user=current_user,
        db=db,
    )


@router.post("/upload-photo")
async def upload_photo_alias(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await upload_photo_and_generate_avatar(
        file=file,
        background_tasks=background_tasks,
        current_user=current_user,
        db=db,
    )


@router.post("/avatar/create", response_model=AvatarCreateResponse)
async def create_avatar_alias(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await create_avatar(
        file=file,
        background_tasks=background_tasks,
        current_user=current_user,
        db=db,
    )


@router.post("/avatar/speak", response_model=AvatarJobResponse)
async def speak_with_avatar_alias(
    request: AvatarSpeakRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await speak_with_avatar(
        req=request,
        current_user=current_user,
        db=db,
    )


@router.get("/avatar/job/{job_id}", response_model=AvatarJobResponse)
async def get_avatar_job_alias(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await get_avatar_job(
        job_id=job_id,
        current_user=current_user,
        db=db,
    )


@router.post("/generate-avatar-video", response_model=AvatarJobResponse)
async def generate_avatar_video_alias(
    request: LegacyAvatarSpeakRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await generate_avatar_video_legacy(
        req=request,
        current_user=current_user,
        db=db,
    )


@router.post("/generate-voice", response_model=VoiceResponse)
async def generate_voice_alias(
    request: VoiceRequest,
    current_user: User = Depends(get_current_user),
):
    return await generate_voice(req=request, current_user=current_user)
