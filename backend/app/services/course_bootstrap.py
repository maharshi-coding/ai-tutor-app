from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from app.models import Course
from app.rag import delete_course_chunks, ingest_course_chunks, split_text_for_rag
from app.services.course_content import CourseContentDocument, load_course_documents


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
    content_paths: tuple[str, ...]


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
            "Python syntax and data model",
            "Control flow and functions",
            "Collections and algorithms",
            "Modules, packages, and files",
            "Object-oriented programming",
            "Typing, testing, and debugging",
            "Iterators, generators, and decorators",
            "Concurrency and performance",
        ),
        lesson_count=24,
        content_paths=("python",),
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
            "Machine learning workflow",
            "Data preprocessing and feature engineering",
            "Regression and classification",
            "Model evaluation and diagnostics",
            "Clustering and dimensionality reduction",
            "Tree ensembles and probabilistic methods",
            "Neural networks and deep learning",
            "Deployment, ethics, and MLOps",
        ),
        lesson_count=26,
        content_paths=("machine_learning",),
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
            "Intelligent agents and problem solving",
            "Search, planning, and optimization",
            "Knowledge representation and reasoning",
            "Learning, perception, and neural models",
            "Generative AI and large language models",
            "Responsible AI, safety, and alignment",
        ),
        lesson_count=28,
        content_paths=("artificial_intelligence",),
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
        content_paths=("data_science_workflow.txt",),
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
            catalog = _load_catalog(blueprint)
            course = Course(
                title=blueprint.title,
                description=blueprint.description,
                subject=blueprint.subject,
                difficulty_level=blueprint.difficulty_level,
                content={
                    "slug": blueprint.slug,
                    "lessons": blueprint.lesson_count,
                    "topics": list(blueprint.topics),
                    **catalog,
                },
            )
            db.add(course)
            db.flush()
        else:
            content: dict[str, Any] = dict(course.content or {})
            content["slug"] = blueprint.slug
            content["lessons"] = blueprint.lesson_count
            content["topics"] = list(blueprint.topics)
            content.update(_load_catalog(blueprint))
            course.description = blueprint.description
            course.subject = blueprint.subject
            course.difficulty_level = blueprint.difficulty_level
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

        documents = _load_blueprint_documents(blueprint)
        fingerprint = _fingerprint_documents(documents)
        manifest_key = str(course.id)
        existing = manifest.get(manifest_key, {})
        if existing.get("fingerprint") == fingerprint:
            continue

        previous_chunk_ids = existing.get("chunk_ids") or []
        if previous_chunk_ids:
            delete_course_chunks(course.id, list(previous_chunk_ids))

        chunks = _build_rag_chunks(course.id, blueprint.slug, documents)
        ingest_course_chunks(course.id, chunks)
        manifest[manifest_key] = {
            "fingerprint": fingerprint,
            "chunk_ids": [chunk_id for chunk_id, *_ in chunks],
            "document_count": len(documents),
            "slug": blueprint.slug,
        }
        changed = True

    if changed:
        _save_manifest(manifest)


def _load_blueprint_documents(blueprint: CourseBlueprint) -> list[CourseContentDocument]:
    documents: list[CourseContentDocument] = []
    for relative_path in blueprint.content_paths:
        content_path = COURSE_CONTENT_DIR / relative_path
        documents.extend(load_course_documents(content_path))
    return documents


def _build_rag_chunks(
    course_id: int,
    course_slug: str,
    documents: list[CourseContentDocument],
) -> list[tuple[str, str, dict[str, Any]]]:
    chunks: list[tuple[str, str, dict[str, Any]]] = []
    for document in documents:
        split_chunks = split_text_for_rag(
            document.text,
            metadata={"course_id": course_id, "slug": course_slug},
        )
        for index, chunk in enumerate(split_chunks):
            chunk_id = f"seed-{course_id}-{document.doc_id}-{index}"
            metadata = {
                "course_id": course_id,
                "slug": course_slug,
                "title": document.title,
                "source": document.source_name,
                "source_url": document.source_url,
                "path": document.relative_path,
            }
            chunks.append((chunk_id, chunk, metadata))
    return chunks


def _fingerprint_documents(documents: list[CourseContentDocument]) -> str:
    digest = hashlib.sha256()
    for document in documents:
        digest.update(document.relative_path.encode("utf-8"))
        digest.update(b"\0")
        digest.update(document.text.encode("utf-8"))
        digest.update(b"\0")
    return digest.hexdigest()


def _load_catalog(blueprint: CourseBlueprint) -> dict[str, Any]:
    for relative_path in blueprint.content_paths:
        catalog_path = COURSE_CONTENT_DIR / relative_path / "catalog.json"
        if not catalog_path.exists():
            continue
        try:
            payload = json.loads(catalog_path.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(payload, dict):
            continue
        return {
            "knowledge_base_path": relative_path,
            "knowledge_base_documents": payload.get("documentCount"),
            "knowledge_base_sources": payload.get("sourceCount"),
            "knowledge_base_topics": payload.get("topicCount"),
        }
    return {}


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
