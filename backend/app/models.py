from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Avatar and voice settings
    avatar_photo_path = Column(String, nullable=True)
    voice_sample_path = Column(String, nullable=True)
    avatar_config = Column(JSON, nullable=True)  # Store avatar generation settings
    
    # Relationships
    progress = relationship("Progress", back_populates="user")
    quiz_results = relationship("QuizResult", back_populates="user")


class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String, nullable=False)  # e.g., "Mathematics", "Science", "History"
    difficulty_level = Column(String, nullable=False)  # "Beginner", "Intermediate", "Advanced"
    content = Column(JSON, nullable=True)  # Store course content structure
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    progress = relationship("Progress", back_populates="course")
    quizzes = relationship("Quiz", back_populates="course")


class Progress(Base):
    __tablename__ = "progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    current_lesson = Column(Integer, default=0)
    completed_lessons = Column(JSON, default=list)  # List of completed lesson IDs
    completion_percentage = Column(Integer, default=0)
    last_accessed = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="progress")
    course = relationship("Course", back_populates="progress")


class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    lesson_id = Column(Integer, nullable=False)
    questions = Column(JSON, nullable=False)  # List of question objects
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    course = relationship("Course", back_populates="quizzes")
    results = relationship("QuizResult", back_populates="quiz")


class QuizResult(Base):
    __tablename__ = "quiz_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    answers = Column(JSON, nullable=False)  # User's answers
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="quiz_results")
    quiz = relationship("Quiz", back_populates="results")
