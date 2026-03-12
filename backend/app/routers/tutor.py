from typing import Any, Dict, Optional
import json

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Course
from app.schemas import AskTutorRequest, AskTutorResponse, TutorMessage, TutorResponse
from app.routers.auth import get_current_user
from app.config import settings
from app.rag import retrieve_relevant_chunks
from app.services.avatar_pipeline import AvatarJobRequest, create_avatar_job, run_avatar_job
from app.services.course_bootstrap import ensure_seed_courses, get_blueprint_by_slug
from app.services.tts import ensure_voice_audio

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


async def _get_ollama_tutor_response(
    message: str,
    course_context: Optional[str] = None,
) -> Optional[str]:
    """
    Call a local Ollama instance to get a tutor-style response.

    Ollama must be running at OLLAMA_BASE_URL (default http://localhost:11434).
    Configure the model via OLLAMA_MODEL (default llama3).
    """
    system_prompt = (
        "You are a friendly, engaging AI tutor. Your goal is to help students learn effectively. "
        "Explain concepts clearly and use examples when helpful. "
        f"{TUTOR_SCOPE_INSTRUCTION}"
    )
    if course_context:
        system_prompt += f"\nCurrent course context: {course_context}"

    payload: Dict[str, Any] = {
        "model": settings.OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
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
    except Exception as e:
        print("OLLAMA_API_ERROR:", repr(e))
        return None


async def get_tutor_response(
    message: str,
    course_context: str | None = None,
    api_key: str | None = None,
    course_id: int | None = None,
) -> str:
    """
    Get AI tutor response trying providers in order:
    Ollama (local/free) → OpenRouter → Gemini → OpenAI → fallback.
    """
    # Optionally enhance the message with retrieved course context (RAG)
    enriched_message, _ = _build_rag_enhanced_prompt(message, course_id)

    # 1) Ollama (local, free, open-source)
    ollama_resp = await _get_ollama_tutor_response(enriched_message, course_context)
    if ollama_resp:
        return ollama_resp

    # 2) OpenRouter / DeepSeek
    openrouter_resp = await _get_openrouter_tutor_response(enriched_message, course_context)
    if openrouter_resp:
        return openrouter_resp

    # 3) Gemini
    gemini_resp = await _get_gemini_tutor_response(enriched_message, course_context)
    if gemini_resp:
        return gemini_resp

    # 4) OpenAI
    openai_resp = await _get_openai_tutor_response(message, course_context, api_key=api_key)
    if openai_resp:
        return openai_resp

    # 5) Simple fallback
    return (
        "I'm here to help you learn! You asked: "
        f"{message}. Let me explain this concept step by step using simple language and examples."
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
    db: Session = Depends(get_db)
):
    course = _resolve_course(db, tutor_message.course_id)
    course_context = None
    if course:
        course_context = f"{course.title} - {course.subject}"
    
    # Get API key from user's request headers or use default
    # In production, users would provide their own API keys
    response_text = await get_tutor_response(
        tutor_message.message,
        course_context=course_context,
        course_id=course.id if course else tutor_message.course_id,
    )
    
    suggestions = _follow_up_suggestions(course)
    
    return TutorResponse(response=response_text, suggestions=suggestions)


@router.post("/ask-tutor", response_model=AskTutorResponse)
async def ask_tutor(
    request: AskTutorRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Tutor endpoint for the mobile avatar workflow.

    Returns the text explanation immediately and can optionally:
    - generate voice audio
    - queue a talking avatar video job
    """
    course = _resolve_course(db, request.course_id, request.course_slug)
    course_context = f"{course.title} - {course.subject}" if course else None

    response_text = await get_tutor_response(
        request.message,
        course_context=course_context,
        course_id=course.id if course else request.course_id,
    )

    suggestions = _follow_up_suggestions(course)
    media_errors: list[str] = []
    audio_url: Optional[str] = None
    audio_duration_ms: Optional[int] = None
    avatar_job_id: Optional[str] = None
    avatar_status: Optional[str] = None

    if request.generate_voice:
        try:
            audio_artifact = await ensure_voice_audio(
                user_id=current_user.id,
                text=response_text,
                voice=request.voice,
                speed=request.speed,
            )
            audio_url = audio_artifact.audio_url
            audio_duration_ms = audio_artifact.duration_ms
        except HTTPException as exc:
            media_errors.append(str(exc.detail))
        except Exception as exc:
            media_errors.append(f"Voice generation failed: {exc!r}")

    if request.generate_avatar_video:
        try:
            avatar_request = AvatarJobRequest(
                user_id=current_user.id,
                avatar_photo_path=current_user.avatar_photo_path,
                avatar_config=current_user.avatar_config or {},
                text=None if audio_url else response_text,
                audio_url=audio_url,
                image_url=request.image_url,
            )
            avatar_job_id = create_avatar_job(avatar_request)
            background_tasks.add_task(run_avatar_job, avatar_job_id, avatar_request)
            avatar_status = "pending"
        except Exception as exc:
            media_errors.append(f"Avatar generation failed to start: {exc!r}")

    return AskTutorResponse(
        response=response_text,
        suggestions=suggestions,
        course_id=course.id if course else request.course_id,
        course_title=course.title if course else None,
        audio_url=audio_url,
        audio_duration_ms=audio_duration_ms,
        avatar_job_id=avatar_job_id,
        avatar_status=avatar_status,
        media_errors=media_errors or None,
    )


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

    system_prompt = (
        "You are a friendly, engaging AI tutor. Your goal is to help students learn effectively. "
        "Explain concepts clearly and use examples when helpful. "
        f"{TUTOR_SCOPE_INSTRUCTION}"
    )
    if course_context:
        system_prompt += f"\nCurrent course context: {course_context}"

    async def _ollama_stream():
        """Yield SSE tokens from Ollama streaming API."""
        payload: Dict[str, Any] = {
            "model": settings.OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
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
            # Fall back to non-streaming full response
            full = await get_tutor_response(
                enriched_message,
                course_context=course_context,
                course_id=course_id,
            )
            yield f"data: {json.dumps({'token': full})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(_ollama_stream(), media_type="text/event-stream")
