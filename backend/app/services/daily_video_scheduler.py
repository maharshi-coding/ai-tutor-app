from __future__ import annotations

import asyncio
from contextlib import suppress
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models import User
from app.services.hedra_avatar import (
    AvatarPipelineError,
    create_daily_update_video_job,
    wait_for_job_completion,
)


def _scheduler_timezone() -> ZoneInfo:
    try:
        return ZoneInfo(settings.DAILY_VIDEO_TIMEZONE)
    except Exception:
        return ZoneInfo("UTC")


def _next_run_at(now: datetime) -> datetime:
    run_at = now.replace(
        hour=settings.DAILY_VIDEO_HOUR,
        minute=settings.DAILY_VIDEO_MINUTE,
        second=0,
        microsecond=0,
    )
    if run_at <= now:
        run_at += timedelta(days=1)
    return run_at


async def generate_daily_videos_for_all_users(force: bool = False) -> None:
    db: Session = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            if not user.avatar_photo_path:
                continue
            try:
                result = await create_daily_update_video_job(user=user, db=db, force=force)
                if result["status"] not in {"done", "failed"}:
                    await wait_for_job_completion(job_id=result["job_id"], user=user, db=db)
            except AvatarPipelineError as exc:
                config = dict(user.avatar_config or {})
                config.update(
                    {
                        "daily_video_status": "failed",
                        "daily_video_error": str(exc),
                    }
                )
                user.avatar_config = config
                db.commit()
                db.refresh(user)
            except Exception as exc:
                config = dict(user.avatar_config or {})
                config.update(
                    {
                        "daily_video_status": "failed",
                        "daily_video_error": repr(exc),
                    }
                )
                user.avatar_config = config
                db.commit()
                db.refresh(user)
    finally:
        db.close()


async def scheduler_loop() -> None:
    timezone = _scheduler_timezone()
    while settings.ENABLE_DAILY_VIDEO_SCHEDULER:
        now = datetime.now(timezone)
        run_at = _next_run_at(now)
        sleep_for = max((run_at - now).total_seconds(), 1.0)
        await asyncio.sleep(sleep_for)
        await generate_daily_videos_for_all_users(force=False)


async def run_user_daily_video_job(user_id: int, force: bool = False) -> None:
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user is None or not user.avatar_photo_path:
            return
        result = await create_daily_update_video_job(user=user, db=db, force=force)
        if result["status"] not in {"done", "failed"}:
            await wait_for_job_completion(job_id=result["job_id"], user=user, db=db)
    finally:
        db.close()


def spawn_detached_daily_video_job(user_id: int, force: bool = False) -> None:
    async def _runner() -> None:
        with suppress(Exception):
            await run_user_daily_video_job(user_id=user_id, force=force)

    asyncio.create_task(_runner())
