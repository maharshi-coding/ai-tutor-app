from typing import Any, Dict, Optional
import json

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Course, User
from app.rag import retrieve_relevant_passages
from app.routers.auth import get_current_user
from app.schemas import AskTutorRequest, AskTutorResponse, TutorMessage, TutorResponse
from app.services.course_bootstrap import ensure_seed_courses, get_blueprint_by_slug


router = APIRouter()

TUTOR_SCOPE_INSTRUCTION = (
    "Stay focused on the student's question, but go deep enough that they can build real understanding. "
    "Prefer a clear structure, explain why things work, and avoid rushing past important intuition."
)

TEACHING_STYLE_INSTRUCTION = (
    "You are an expert instructor teaching a course. Explain concepts step-by-step using clear language. "
    "Provide examples when possible and aim to help the student truly understand the topic."
)

COURSE_MATERIAL_INSTRUCTION = (
    "When course material is provided, ground your answer in it first, synthesize across the passages, "
    "and clearly separate supported facts from any extra background knowledge."
)


def _build_rag_enhanced_prompt(
    message: str,
    course_id: Optional[int],
) -> tuple[str, Optional[str]]:
    """
    If we have RAG data for this course, prepend it as context to the message.
    Returns (full_message, context_summary_for_logs).
    """
    if course_id is None:
        return message, None

    try:
        passages = retrieve_relevant_passages(course_id=course_id, query=message, top_k=5)
    except Exception:
        return message, None

    if not passages:
        return message, None

    blocks: list[str] = []
    for index, passage in enumerate(passages, start=1):
        metadata = passage.get("metadata") or {}
        title = metadata.get("title") or f"Course Passage {index}"
        source = metadata.get("source")
        path_value = metadata.get("path")
        label_parts = [title]
        if source:
            label_parts.append(f"source: {source}")
        if path_value:
            label_parts.append(f"path: {path_value}")
        blocks.append(f"[{index}] {' | '.join(label_parts)}\n{passage['text']}")

    joined = "\n\n---\n\n".join(blocks)
    rag_block = (
        "Use the following course material context to guide your answer. "
        "Stay faithful to the content, synthesize the relevant sections, and still explain things in simple language.\n\n"
        f"COURSE CONTEXT:\n{joined}\n\n"
        f"STUDENT QUESTION:\n{message}"
    )
    return rag_block, joined


def _system_prompt(course_context: Optional[str]) -> str:
    prompt = (
        f"{TEACHING_STYLE_INSTRUCTION} {TUTOR_SCOPE_INSTRUCTION} {COURSE_MATERIAL_INSTRUCTION}"
    )
    if course_context:
        prompt += f"\nCurrent course context: {course_context}"
    return prompt


async def _get_gemini_tutor_response(
    message: str,
    course_context: Optional[str] = None,
) -> Optional[str]:
    if not settings.GEMINI_API_KEY:
        return None

    payload: Dict[str, Any] = {
        "contents": [
            {"role": "user", "parts": [{"text": _system_prompt(course_context)}]},
            {"role": "user", "parts": [{"text": message}]},
        ]
    }

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.GEMINI_MODEL}:generateContent"
    )

    resp = None
    try:
        async with httpx.AsyncClient(timeout=40) as client:
            resp = await client.post(
                url,
                params={"key": settings.GEMINI_API_KEY},
                json=payload,
            )
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        print("GEMINI_API_ERROR:", repr(exc))
        if resp is not None:
            try:
                print("GEMINI_API_RESPONSE_TEXT:", resp.text)
            except Exception:
                pass
        return None

    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as exc:
        print("GEMINI_API_PARSE_ERROR:", repr(exc))
        print("GEMINI_API_FULL_RESPONSE:", data)
        return None


async def _get_openai_tutor_response(
    message: str,
    course_context: Optional[str] = None,
    api_key: Optional[str] = None,
) -> Optional[str]:
    api_key = api_key or settings.OPENAI_API_KEY
    if not api_key:
        return None

    try:
        import openai

        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": _system_prompt(course_context)},
                {"role": "user", "content": message},
            ],
            max_tokens=500,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception:
        return None


async def _get_openrouter_tutor_response(
    message: str,
    course_context: Optional[str] = None,
) -> Optional[str]:
    api_key = settings.OPENROUTER_API_KEY
    model = settings.OPENROUTER_MODEL
    if not api_key or not model:
        return None

    payload: Dict[str, Any] = {
        "model": model,
        "messages": [
            {"role": "system", "content": _system_prompt(course_context)},
            {"role": "user", "content": message},
        ],
        "max_tokens": 500,
        "temperature": 0.7,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.OPENROUTER_REFERER or "http://localhost:8000",
        "X-Title": settings.OPENROUTER_APP_TITLE or "AI Tutor App",
    }

    resp = None
    try:
        async with httpx.AsyncClient(timeout=40) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
            )
        resp.raise_for_status()
        data = resp.json()
        content = (data.get("choices") or [{}])[0].get("message", {}).get("content")
        if content is None or (isinstance(content, str) and not content.strip()):
            print(
                "OPENROUTER_API_WARNING: response had no content; full keys:",
                list(data.keys()),
            )
            return None
        return content
    except Exception as exc:
        print("OPENROUTER_API_ERROR:", repr(exc))
        if resp is not None:
            try:
                print("OPENROUTER_API_STATUS:", resp.status_code)
                print("OPENROUTER_API_RESPONSE_TEXT:", (resp.text or "")[:500])
            except Exception:
                pass
        return None


async def _get_ollama_tutor_response(
    message: str,
    course_context: Optional[str] = None,
) -> Optional[str]:
    payload: Dict[str, Any] = {
        "model": settings.OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": _system_prompt(course_context)},
            {"role": "user", "content": message},
        ],
        "stream": False,
    }

    url = f"{settings.OLLAMA_BASE_URL}/api/chat"
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        content = data.get("message", {}).get("content")
        if content and content.strip():
            return content
        return None
    except Exception as exc:
        print("OLLAMA_API_ERROR:", repr(exc))
        return None


async def get_tutor_response(
    message: str,
    course_context: str | None = None,
    api_key: str | None = None,
    course_id: int | None = None,
) -> str:
    enriched_message, _ = _build_rag_enhanced_prompt(message, course_id)

    ollama_resp = await _get_ollama_tutor_response(enriched_message, course_context)
    if ollama_resp:
        return ollama_resp

    openrouter_resp = await _get_openrouter_tutor_response(enriched_message, course_context)
    if openrouter_resp:
        return openrouter_resp

    gemini_resp = await _get_gemini_tutor_response(enriched_message, course_context)
    if gemini_resp:
        return gemini_resp

    openai_resp = await _get_openai_tutor_response(
        enriched_message,
        course_context,
        api_key=api_key,
    )
    if openai_resp:
        return openai_resp

    return (
        "Here is a clear explanation: "
        f"{message}. I will walk through it step by step, use simple language, "
        "and give an example where helpful."
    )


def _resolve_course(
    db: Session,
    course_id: Optional[int],
    course_slug: Optional[str] = None,
) -> Optional[Course]:
    ensure_seed_courses(db)

    if course_id:
        return db.query(Course).filter(Course.id == course_id).first()

    blueprint = get_blueprint_by_slug(course_slug)
    if blueprint is None:
        return None

    return db.query(Course).filter(Course.title == blueprint.title).first()


def _follow_up_suggestions(course: Optional[Course]) -> list[str]:
    course_name = course.title if course else "this topic"
    return [
        "Can you explain that step by step?",
        f"Show me a simple {course_name} example.",
        "Give me a short practice exercise.",
        "What should I learn next?",
    ]


@router.post("/chat", response_model=TutorResponse)
async def chat_with_tutor(
    tutor_message: TutorMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = _resolve_course(db, tutor_message.course_id)
    course_context = f"{course.title} - {course.subject}" if course else None

    response_text = await get_tutor_response(
        tutor_message.message,
        course_context=course_context,
        course_id=course.id if course else tutor_message.course_id,
    )

    return TutorResponse(
        response=response_text,
        suggestions=_follow_up_suggestions(course),
    )


@router.post("/ask-tutor", response_model=AskTutorResponse)
async def ask_tutor(
    request: AskTutorRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Shared text-only tutor endpoint used by both AI Chat and Live Tutor mode.

    Avatar video generation is intentionally handled by separate avatar routes.
    """
    course = _resolve_course(db, request.course_id, request.course_slug)
    course_context = f"{course.title} - {course.subject}" if course else None

    response_text = await get_tutor_response(
        request.message,
        course_context=course_context,
        course_id=course.id if course else request.course_id,
    )

    return AskTutorResponse(
        response=response_text,
        suggestions=_follow_up_suggestions(course),
        course_id=course.id if course else request.course_id,
        course_title=course.title if course else None,
    )


@router.post("/generate-lesson")
async def generate_lesson(
    course_id: int = Query(...),
    lesson_topic: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    prompt = (
        f"Create a lesson plan for '{lesson_topic}' in the context of {course.subject}. "
        "Include: learning objectives, key concepts, examples, and practice questions."
    )

    lesson_content = await get_tutor_response(prompt, course_context=course.title)

    return {
        "topic": lesson_topic,
        "content": lesson_content,
        "course_id": course_id,
    }


@router.get("/stream")
async def stream_tutor_response(
    message: str = Query(...),
    course_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Stream AI tutor response token-by-token using Server-Sent Events.

    Tries Ollama streaming first; falls back to chunked non-streaming output.
    """
    course_context = None
    if course_id:
        course = db.query(Course).filter(Course.id == course_id).first()
        if course:
            course_context = f"{course.title} - {course.subject}"

    enriched_message, _ = _build_rag_enhanced_prompt(message, course_id)

    async def _ollama_stream():
        payload: Dict[str, Any] = {
            "model": settings.OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": _system_prompt(course_context)},
                {"role": "user", "content": enriched_message},
            ],
            "stream": True,
        }
        url = f"{settings.OLLAMA_BASE_URL}/api/chat"
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                async with client.stream("POST", url, json=payload) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if not line.strip():
                            continue
                        chunk = json.loads(line)
                        token = chunk.get("message", {}).get("content", "")
                        if token:
                            yield f"data: {json.dumps({'token': token})}\n\n"
                        if chunk.get("done"):
                            break
            yield "data: [DONE]\n\n"
        except Exception:
            full = await get_tutor_response(
                enriched_message,
                course_context=course_context,
                course_id=course_id,
            )
            yield f"data: {json.dumps({'token': full})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(_ollama_stream(), media_type="text/event-stream")
