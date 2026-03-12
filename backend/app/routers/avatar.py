"""Talking avatar endpoints backed by SadTalker."""

from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel

from app.models import User
from app.routers.auth import get_current_user
from app.services.avatar_pipeline import (
    AvatarJobRequest,
    create_avatar_job,
    get_job_status,
    render_avatar_video,
    run_avatar_job,
)


router = APIRouter()


class AvatarRequest(BaseModel):
    audio_url: Optional[str] = None
    text: Optional[str] = None
    image_url: Optional[str] = None


class AvatarResponse(BaseModel):
    video_url: str


class AvatarJobCreate(BaseModel):
    text: Optional[str] = None
    audio_url: Optional[str] = None
    image_url: Optional[str] = None
    wait_for_completion: bool = False


class AvatarJobStatus(BaseModel):
    job_id: Optional[str] = None
    status: str  # pending | processing | done | failed
    video_url: Optional[str] = None
    error: Optional[str] = None


def _build_job_request(req: AvatarJobCreate | AvatarRequest, user: User) -> AvatarJobRequest:
    return AvatarJobRequest(
        user_id=user.id,
        avatar_photo_path=user.avatar_photo_path,
        avatar_config=user.avatar_config or {},
        text=req.text,
        audio_url=req.audio_url,
        image_url=req.image_url,
    )


@router.post("/avatar", response_model=AvatarResponse)
async def generate_avatar_video(
    req: AvatarRequest,
    current_user: User = Depends(get_current_user),
):
    """Legacy synchronous avatar route kept for compatibility."""
    try:
        video_url = await render_avatar_video(_build_job_request(req, current_user))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"SadTalker error: {exc!r}")

    return AvatarResponse(video_url=video_url)


@router.post("/avatar/generate", response_model=AvatarJobStatus)
@router.post("/generate-avatar-video", response_model=AvatarJobStatus)
async def generate_avatar_async(
    req: AvatarJobCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    """
    Start avatar generation and return a job id for mobile polling.

    When wait_for_completion=true, this route returns the finished video directly.
    """
    job_request = _build_job_request(req, current_user)

    if req.wait_for_completion:
        try:
            video_url = await render_avatar_video(job_request)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"SadTalker error: {exc!r}")
        return AvatarJobStatus(status="done", video_url=video_url)

    job_id = create_avatar_job(job_request)
    background_tasks.add_task(run_avatar_job, job_id, job_request)
    return AvatarJobStatus(job_id=job_id, status="pending")


@router.get("/avatar/job/{job_id}", response_model=AvatarJobStatus)
async def get_avatar_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
):
    """Poll the status of an async avatar generation job."""
    job = get_job_status(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return AvatarJobStatus(
        job_id=job_id,
        status=job["status"] or "pending",
        video_url=job.get("video_url"),
        error=job.get("error"),
    )
