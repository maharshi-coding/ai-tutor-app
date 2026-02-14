from typing import Any, Dict, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Course
from app.schemas import TutorMessage, TutorResponse
from app.routers.auth import get_current_user
from app.config import settings
from app.rag import retrieve_relevant_chunks

router = APIRouter()

# Shared instruction so the tutor answers only what was asked (no extra sections or tangents).
TUTOR_SCOPE_INSTRUCTION = (
    "Answer only the specific question the student asked. Do not add extra sections, "
    "tangential topics (e.g. 'Why is X popular?' when they only asked 'What is X?'), or "
    "'you might also want to know' content unless they explicitly ask for more. Be direct and concise. "
    "Use markdown for clarity: **bold**, `code`, short lists, or a single heading if needed—but keep the scope tight."
)


def _build_rag_enhanced_prompt(
    message: str,
    course_id: Optional[int],
) -> tuple[str, Optional[str]]:
    """
    If we have RAG data for this course, prepend it as 'context' to the message.
    Returns (full_message, context_summary_for_logs).
    """
    if course_id is None:
        return message, None

    # Try retrieving context; if the collection is empty, silently skip.
    try:
        chunks = retrieve_relevant_chunks(course_id=course_id, query=message, top_k=4)
    except Exception:
        # RAG is best-effort; do not break chat if it fails.
        return message, None

    if not chunks:
        return message, None

    joined = "\n\n---\n\n".join(chunks)
    rag_block = (
        "Use the following course material context to guide your answer. "
        "Stay faithful to the content, but still explain things in simple language.\n\n"
        f"COURSE CONTEXT:\n{joined}\n\n"
        f"STUDENT QUESTION:\n{message}"
    )
    return rag_block, joined


async def _get_gemini_tutor_response(
    message: str,
    course_context: Optional[str] = None,
) -> Optional[str]:
    """
    Call Gemini (if configured) to get a tutor-style response.

    This uses the public Gemini HTTP API. You must set GEMINI_API_KEY in .env.
    """
    if not settings.GEMINI_API_KEY:
        return None

    system_prompt = (
        "You are a friendly, engaging AI tutor. Your goal is to help students learn effectively. "
        "Explain concepts clearly and use examples when helpful. "
        f"{TUTOR_SCOPE_INSTRUCTION}"
    )
    if course_context:
        system_prompt += f"\nCurrent course context: {course_context}"

    payload: Dict[str, Any] = {
        "contents": [
            {"role": "user", "parts": [{"text": system_prompt}]},
            {"role": "user", "parts": [{"text": message}]},
        ]
    }

    # Use the v1beta Gemini endpoint, which supports gemini-1.5-* models.
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent"

    try:
        async with httpx.AsyncClient(timeout=40) as client:
            resp = await client.post(url, params={"key": settings.GEMINI_API_KEY}, json=payload)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        # Debug logging so we can see why Gemini failed and we fell back.
        print("GEMINI_API_ERROR:", repr(e))
        try:
            print("GEMINI_API_RESPONSE_TEXT:", resp.text)
        except Exception:
            pass
        return None

    # Debug: log shape of successful response and what we will return
    print("GEMINI_API_RESPONSE_OK keys:", list(data.keys()))
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        print("GEMINI_API_RETURNING_TEXT_SNIPPET:", repr(text[:120]))
        return text
    except (KeyError, IndexError) as e:
        print("GEMINI_API_PARSE_ERROR:", repr(e))
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

        system_prompt = (
            "You are a friendly, engaging AI tutor. Your goal is to help students learn effectively. "
            "Be encouraging and explain clearly. "
            f"{TUTOR_SCOPE_INSTRUCTION}"
        )
        if course_context:
            system_prompt += f"\n\nCurrent course context: {course_context}"

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
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
    """
    Call OpenRouter (e.g. DeepSeek) to get a tutor-style response.
    """
    api_key = settings.OPENROUTER_API_KEY
    model = settings.OPENROUTER_MODEL
    if not api_key or not model:
        return None

    system_prompt = (
        "You are a friendly, engaging AI tutor. Your goal is to help students learn effectively. "
        "Be encouraging and explain clearly. "
        f"{TUTOR_SCOPE_INSTRUCTION}"
    )
    if course_context:
        system_prompt += f"\n\nCurrent course context: {course_context}"

    payload: Dict[str, Any] = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        "max_tokens": 500,
        "temperature": 0.7,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    # OpenRouter often requires these for non-localhost keys (avoids 401 or stripped content)
    if getattr(settings, "OPENROUTER_REFERER", None):
        headers["HTTP-Referer"] = settings.OPENROUTER_REFERER
    else:
        headers["HTTP-Referer"] = "http://localhost:8000"
    if getattr(settings, "OPENROUTER_APP_TITLE", None):
        headers["X-Title"] = settings.OPENROUTER_APP_TITLE
    else:
        headers["X-Title"] = "AI Tutor App"

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
            print("OPENROUTER_API_WARNING: response had no content; full keys:", list(data.keys()))
            return None
        return content
    except Exception as e:
        print("OPENROUTER_API_ERROR:", repr(e))
        if resp is not None:
            try:
                print("OPENROUTER_API_STATUS:", resp.status_code)
                print("OPENROUTER_API_RESPONSE_TEXT:", (resp.text or "")[:500])
            except Exception:
                pass
        return None


async def get_tutor_response(
    message: str,
    course_context: str | None = None,
    api_key: str | None = None,
    course_id: int | None = None,
) -> str:
    """
    Get AI tutor response using Gemini (preferred) or OpenAI.
    Falls back to a simple handcrafted response if no API is configured.
    """
    # Optionally enhance the message with retrieved course context (RAG)
    enriched_message, _ = _build_rag_enhanced_prompt(message, course_id)

    # 1) OpenRouter / DeepSeek
    openrouter_resp = await _get_openrouter_tutor_response(enriched_message, course_context)
    if openrouter_resp:
        return openrouter_resp

    # 2) Gemini
    gemini_resp = await _get_gemini_tutor_response(enriched_message, course_context)
    if gemini_resp:
        return gemini_resp

    # 3) OpenAI
    openai_resp = await _get_openai_tutor_response(message, course_context, api_key=api_key)
    if openai_resp:
        return openai_resp

    # 4) Simple fallback
    return (
        "I'm here to help you learn! You asked: "
        f"{message}. Let me explain this concept step by step using simple language and examples."
    )


@router.post("/chat", response_model=TutorResponse)
async def chat_with_tutor(
    tutor_message: TutorMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course_context = None
    if tutor_message.course_id:
        course = db.query(Course).filter(Course.id == tutor_message.course_id).first()
        if course:
            course_context = f"{course.title} - {course.subject}"
    
    # Get API key from user's request headers or use default
    # In production, users would provide their own API keys
    response_text = await get_tutor_response(
        tutor_message.message,
        course_context=course_context,
        course_id=tutor_message.course_id,
    )
    
    # Generate suggestions for follow-up questions
    suggestions = [
        "Can you explain that in simpler terms?",
        "Can you give me an example?",
        "What should I practice next?",
        "I understand, what's next?"
    ]
    
    return TutorResponse(response=response_text, suggestions=suggestions)


@router.post("/generate-lesson")
async def generate_lesson(
    course_id: int = Query(...),
    lesson_topic: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate lesson content using AI"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Generate lesson content
    prompt = f"Create a lesson plan for '{lesson_topic}' in the context of {course.subject}. Include: learning objectives, key concepts, examples, and practice questions."
    
    lesson_content = await get_tutor_response(prompt, course_context=course.title)
    
    return {
        "topic": lesson_topic,
        "content": lesson_content,
        "course_id": course_id
    }
