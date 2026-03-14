from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.schemas import AvatarJobResponse, DailyVideoResponse
from app.services.hedra_avatar import (
    AvatarPipelineError,
    create_daily_update_video_job,
    get_daily_video_state,
)


router = APIRouter()


def _daily_video_error(exc: AvatarPipelineError) -> HTTPException:
    message = str(exc)
    if "Upload a photo" in message or "Create an avatar" in message:
        return HTTPException(status_code=400, detail=message)
    return HTTPException(status_code=503, detail=message)


@router.get("/daily-video", response_model=DailyVideoResponse)
async def get_daily_video(
    current_user: User = Depends(get_current_user),
):
    return DailyVideoResponse(**get_daily_video_state(current_user))


@router.post("/daily-video/generate", response_model=AvatarJobResponse)
async def generate_daily_video(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        result = await create_daily_update_video_job(user=current_user, db=db, force=True)
    except AvatarPipelineError as exc:
        raise _daily_video_error(exc)

    return AvatarJobResponse(
        job_id=result["job_id"],
        avatar_id=result.get("avatar_id"),
        status=result["status"],
        video_url=result.get("video_url"),
        error=result.get("error"),
    )
