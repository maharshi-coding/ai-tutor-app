from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from app.models import Course
from app.rag import delete_course_chunks, ingest_course_chunks, split_text_for_rag


BASE_DIR = Path(__file__).resolve().parents[2]
COURSE_CONTENT_DIR = BASE_DIR / "course_content"
RAG_MANIFEST_PATH = BASE_DIR / "rag_data" / "seed_manifest.json"


@dataclass(frozen=True)
class CourseBlueprint:
    slug: str
    title: str
    description: str
    subject: str
    difficulty_level: str
    topics: tuple[str, ...]
    lesson_count: int
    content_files: tuple[str, ...]


COURSE_BLUEPRINTS: tuple[CourseBlueprint, ...] = (
    CourseBlueprint(
        slug="python-programming",
        title="Python Programming Foundations",
        description=(
            "Learn Python syntax, core programming patterns, functions, "
            "data structures, and practical problem-solving."
        ),
        subject="Programming",
        difficulty_level="Beginner",
        topics=(
            "Variables and data types",
            "Control flow",
            "Functions",
            "Lists and dictionaries",
            "File handling",
            "Object-oriented Python",
        ),
        lesson_count=12,
        content_files=("python_intro.txt",),
    ),
    CourseBlueprint(
        slug="machine-learning",
        title="Machine Learning Fundamentals",
        description=(
            "Build intuition for supervised and unsupervised learning, "
            "model evaluation, and practical ML workflows."
        ),
        subject="Machine Learning",
        difficulty_level="Intermediate",
        topics=(
            "Supervised learning",
            "Unsupervised learning",
            "Train/validation/test splits",
            "Bias and variance",
            "Feature engineering",
            "Model evaluation",
        ),
        lesson_count=14,
        content_files=("machine_learning_fundamentals.txt",),
    ),
    CourseBlueprint(
        slug="artificial-intelligence",
        title="Artificial Intelligence Essentials",
        description=(
            "Study AI systems, search, reasoning, neural networks, "
            "generative models, and responsible AI principles."
        ),
        subject="Artificial Intelligence",
        difficulty_level="Intermediate",
        topics=(
            "AI foundations",
            "Knowledge representation",
            "Neural networks",
            "Generative AI",
            "AI safety and ethics",
        ),
        lesson_count=13,
        content_files=("artificial_intelligence_essentials.txt",),
    ),
    CourseBlueprint(
        slug="data-science",
        title="Data Science Workflow",
        description=(
            "Practice the end-to-end data science process from data "
            "collection and cleaning to analysis, modeling, and communication."
        ),
        subject="Data Science",
        difficulty_level="Beginner",
        topics=(
            "Data collection",
            "Cleaning and preprocessing",
            "Exploratory analysis",
            "Visualization",
            "Communicating findings",
        ),
        lesson_count=11,
        content_files=("data_science_workflow.txt",),
    ),
)


def get_blueprint_by_slug(slug: str | None) -> CourseBlueprint | None:
    if not slug:
        return None

    normalized = slug.strip().lower()
    for blueprint in COURSE_BLUEPRINTS:
        if blueprint.slug == normalized:
            return blueprint
    return None


def ensure_seed_courses(db: Session) -> list[Course]:
    seeded_courses: list[Course] = []

    for blueprint in COURSE_BLUEPRINTS:
        course = db.query(Course).filter(Course.title == blueprint.title).first()
        if course is None:
            course = Course(
                title=blueprint.title,
                description=blueprint.description,
                subject=blueprint.subject,
                difficulty_level=blueprint.difficulty_level,
                content={
                    "slug": blueprint.slug,
                    "lessons": blueprint.lesson_count,
                    "topics": list(blueprint.topics),
                },
            )
            db.add(course)
            db.flush()
        else:
            content: dict[str, Any] = dict(course.content or {})
            content.setdefault("slug", blueprint.slug)
            content.setdefault("lessons", blueprint.lesson_count)
            content.setdefault("topics", list(blueprint.topics))
            course.content = content

        seeded_courses.append(course)

    db.commit()
    for course in seeded_courses:
        db.refresh(course)
    return seeded_courses


def ensure_seed_course_rag(db: Session) -> None:
    courses_by_title = {
        course.title: course for course in db.query(Course).all()
    }
    manifest = _load_manifest()
    changed = False

    for blueprint in COURSE_BLUEPRINTS:
        course = courses_by_title.get(blueprint.title)
        if course is None:
            continue

        joined_text = _load_blueprint_text(blueprint)
        fingerprint = hashlib.sha256(joined_text.encode("utf-8")).hexdigest()
        manifest_key = str(course.id)
        existing = manifest.get(manifest_key, {})
        if existing.get("fingerprint") == fingerprint:
            continue

        previous_chunk_count = int(existing.get("chunk_count", 0))
        if previous_chunk_count > 0:
            delete_course_chunks(
                course.id,
                [f"seed-{course.id}-{index}" for index in range(previous_chunk_count)],
            )

        chunks = split_text_for_rag(
            joined_text,
            metadata={"course_id": course.id, "slug": blueprint.slug},
        )
        ingest_course_chunks(
            course.id,
            [
                (f"seed-{course.id}-{index}", chunk)
                for index, chunk in enumerate(chunks)
            ],
        )
        manifest[manifest_key] = {
            "fingerprint": fingerprint,
            "chunk_count": len(chunks),
            "slug": blueprint.slug,
        }
        changed = True

    if changed:
        _save_manifest(manifest)


def _load_blueprint_text(blueprint: CourseBlueprint) -> str:
    parts: list[str] = []
    for filename in blueprint.content_files:
        file_path = COURSE_CONTENT_DIR / filename
        if file_path.exists():
            parts.append(file_path.read_text(encoding="utf-8", errors="replace"))

    return "\n\n".join(part for part in parts if part.strip())


def _load_manifest() -> dict[str, dict[str, Any]]:
    if not RAG_MANIFEST_PATH.exists():
        return {}

    try:
        data = json.loads(RAG_MANIFEST_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}

    return data if isinstance(data, dict) else {}


def _save_manifest(manifest: dict[str, dict[str, Any]]) -> None:
    RAG_MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    RAG_MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, sort_keys=True),
        encoding="utf-8",
    )
