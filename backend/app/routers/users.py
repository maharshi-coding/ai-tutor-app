from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserResponse
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    full_name: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if full_name:
        current_user.full_name = full_name
    db.commit()
    db.refresh(current_user)
    return current_user
