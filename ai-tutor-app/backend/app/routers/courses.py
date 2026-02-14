from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Course, Progress, User
from app.schemas import CourseResponse, ProgressResponse
from app.routers.auth import get_current_user

router = APIRouter()


# Initialize with some sample courses
def init_sample_courses(db: Session):
    """Initialize sample courses if none exist"""
    if db.query(Course).count() == 0:
        sample_courses = [
            Course(
                title="Introduction to Python Programming",
                description="Learn the fundamentals of Python programming from scratch",
                subject="Computer Science",
                difficulty_level="Beginner",
                content={"lessons": 10, "topics": ["Variables", "Loops", "Functions", "Data Structures"]}
            ),
            Course(
                title="Mathematics Fundamentals",
                description="Master basic mathematical concepts and problem-solving",
                subject="Mathematics",
                difficulty_level="Beginner",
                content={"lessons": 12, "topics": ["Algebra", "Geometry", "Calculus Basics"]}
            ),
            Course(
                title="World History Overview",
                description="Explore major events and civilizations throughout history",
                subject="History",
                difficulty_level="Intermediate",
                content={"lessons": 15, "topics": ["Ancient Civilizations", "World Wars", "Modern Era"]}
            ),
            Course(
                title="Introduction to Physics",
                description="Understand the fundamental principles of physics",
                subject="Science",
                difficulty_level="Intermediate",
                content={"lessons": 14, "topics": ["Mechanics", "Thermodynamics", "Electromagnetism"]}
            ),
        ]
        for course in sample_courses:
            db.add(course)
        db.commit()


@router.get("/", response_model=List[CourseResponse])
async def get_courses(db: Session = Depends(get_db)):
    init_sample_courses(db)
    courses = db.query(Course).all()
    return courses


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/{course_id}/progress", response_model=ProgressResponse)
async def get_course_progress(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    progress = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.course_id == course_id
    ).first()
    
    if not progress:
        # Create new progress entry
        progress = Progress(
            user_id=current_user.id,
            course_id=course_id,
            current_lesson=0,
            completed_lessons=[],
            completion_percentage=0
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
    
    return progress


@router.post("/{course_id}/progress", response_model=ProgressResponse)
async def update_course_progress(
    course_id: int,
    current_lesson: int,
    completed_lessons: List[int],
    completion_percentage: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    progress = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.course_id == course_id
    ).first()
    
    if not progress:
        progress = Progress(
            user_id=current_user.id,
            course_id=course_id,
            current_lesson=current_lesson,
            completed_lessons=completed_lessons,
            completion_percentage=completion_percentage
        )
        db.add(progress)
    else:
        progress.current_lesson = current_lesson
        progress.completed_lessons = completed_lessons
        progress.completion_percentage = completion_percentage
    
    db.commit()
    db.refresh(progress)
    return progress
