"""
Database initialization script
Run this to create tables and add sample courses
"""
from app.database import engine, Base
from app.models import Course
from sqlalchemy.orm import sessionmaker

# Create all tables
Base.metadata.create_all(bind=engine)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Check if courses already exist
    if db.query(Course).count() == 0:
        print("Adding sample courses...")
        
        sample_courses = [
            Course(
                title="Introduction to Python Programming",
                description="Learn the fundamentals of Python programming from scratch. Perfect for beginners who want to start their coding journey.",
                subject="Computer Science",
                difficulty_level="Beginner",
                content={
                    "lessons": 10,
                    "topics": ["Variables and Data Types", "Control Flow", "Functions", "Data Structures", "Object-Oriented Programming"]
                }
            ),
            Course(
                title="Mathematics Fundamentals",
                description="Master basic mathematical concepts and problem-solving techniques. Build a strong foundation in mathematics.",
                subject="Mathematics",
                difficulty_level="Beginner",
                content={
                    "lessons": 12,
                    "topics": ["Algebra", "Geometry", "Calculus Basics", "Statistics"]
                }
            ),
            Course(
                title="World History Overview",
                description="Explore major events and civilizations throughout history. Understand how the past shapes the present.",
                subject="History",
                difficulty_level="Intermediate",
                content={
                    "lessons": 15,
                    "topics": ["Ancient Civilizations", "Medieval Period", "World Wars", "Modern Era"]
                }
            ),
            Course(
                title="Introduction to Physics",
                description="Understand the fundamental principles of physics. Learn about motion, energy, and the laws that govern our universe.",
                subject="Science",
                difficulty_level="Intermediate",
                content={
                    "lessons": 14,
                    "topics": ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics"]
                }
            ),
            Course(
                title="Web Development Basics",
                description="Learn HTML, CSS, and JavaScript to build modern websites. Start your journey as a web developer.",
                subject="Computer Science",
                difficulty_level="Beginner",
                content={
                    "lessons": 16,
                    "topics": ["HTML Structure", "CSS Styling", "JavaScript Fundamentals", "DOM Manipulation"]
                }
            ),
        ]
        
        for course in sample_courses:
            db.add(course)
        
        db.commit()
        print(f"✓ Added {len(sample_courses)} sample courses")
    else:
        print("Courses already exist. Skipping sample data.")
    
    print("✓ Database initialization complete!")
    
except Exception as e:
    print(f"Error initializing database: {e}")
    db.rollback()
finally:
    db.close()
