"""Root-level aliases for the mobile avatar tutor workflow."""

from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.routers.avatar import AvatarJobCreate, AvatarJobStatus, generate_avatar_async
from app.routers.tutor import ask_tutor
from app.routers.uploads import upload_photo_and_generate_avatar
from app.routers.voice import VoiceRequest, VoiceResponse, generate_voice
from app.schemas import AskTutorRequest, AskTutorResponse


router = APIRouter()


@router.post("/ask-tutor", response_model=AskTutorResponse)
async def ask_tutor_alias(
    request: AskTutorRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await ask_tutor(
        request=request,
        background_tasks=background_tasks,
        current_user=current_user,
        db=db,
    )


@router.post("/upload-photo")
async def upload_photo_alias(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await upload_photo_and_generate_avatar(
        file=file,
        current_user=current_user,
        db=db,
    )


@router.post("/generate-voice", response_model=VoiceResponse)
async def generate_voice_alias(
    request: VoiceRequest,
    current_user: User = Depends(get_current_user),
):
    return await generate_voice(req=request, current_user=current_user)


@router.post("/generate-avatar-video", response_model=AvatarJobStatus)
async def generate_avatar_video_alias(
    request: AvatarJobCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    return await generate_avatar_async(
        req=request,
        background_tasks=background_tasks,
        current_user=current_user,
    )
