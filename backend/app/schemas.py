from pydantic import BaseModel, EmailStr, constr
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    # bcrypt safely supports passwords up to 72 bytes;
    # enforce a reasonable limit at the API layer.
    password: constr(min_length=8, max_length=72)


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    avatar_photo_path: Optional[str] = None
    voice_sample_path: Optional[str] = None
    
    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Course Schemas
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str
    difficulty_level: str


class CourseCreate(CourseBase):
    content: Optional[Dict[str, Any]] = None


class CourseResponse(CourseBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Progress Schemas
class ProgressBase(BaseModel):
    course_id: int
    current_lesson: int = 0


class ProgressResponse(ProgressBase):
    id: int
    user_id: int
    completed_lessons: List[int]
    completion_percentage: int
    last_accessed: datetime
    
    class Config:
        from_attributes = True


class TutorHistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


# Tutor Schemas
class TutorMessage(BaseModel):
    message: str
    course_id: Optional[int] = None
    lesson_id: Optional[int] = None
    history: Optional[List[TutorHistoryMessage]] = None


class TutorResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = None


class AskTutorRequest(BaseModel):
    message: str
    course_id: Optional[int] = None
    course_slug: Optional[str] = None
    history: Optional[List[TutorHistoryMessage]] = None


class AskTutorResponse(TutorResponse):
    course_id: Optional[int] = None
    course_title: Optional[str] = None


class AvatarCreateResponse(BaseModel):
    avatar_id: str
    avatar_provider: str
    avatar_image_url: Optional[str] = None
    cached: bool = False
    message: str


class AvatarSpeakRequest(BaseModel):
    avatar_id: str
    text: str


class AvatarJobResponse(BaseModel):
    job_id: str
    avatar_id: Optional[str] = None
    status: str  # pending | processing | done | failed
    video_url: Optional[str] = None
    error: Optional[str] = None


class DailyVideoResponse(BaseModel):
    avatar_ready: bool
    avatar_id: Optional[str] = None
    avatar_image_url: Optional[str] = None
    status: str
    job_id: Optional[str] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    highlights: List[str] = []
    source_urls: List[str] = []
    video_url: Optional[str] = None
    generated_at: Optional[str] = None
    error: Optional[str] = None


# Quiz Schemas
class Question(BaseModel):
    question: str
    options: List[str]
    correct_answer: int  # Index of correct answer


class QuizCreate(BaseModel):
    course_id: int
    lesson_id: int
    questions: List[Question]


class QuizResponse(BaseModel):
    id: int
    course_id: int
    lesson_id: int
    questions: List[Question]
    
    class Config:
        from_attributes = True


class QuizSubmission(BaseModel):
    quiz_id: int
    answers: List[int]  # List of answer indices


class QuizResultResponse(BaseModel):
    id: int
    score: int
    total_questions: int
    percentage: float
    completed_at: datetime
    
    class Config:
        from_attributes = True
