# AI Tutor App - Avatar Tutor Upgrade

A full-stack AI tutoring app with a FastAPI backend, web frontend, and React Native mobile client. The current version adds an end-to-end avatar tutor workflow: photo upload, cartoon avatar generation, course-aware tutoring, voice synthesis, and SadTalker video responses.

## What Is Included

- Ollama-powered tutor chat with `llama3` by default and `mistral` support
- RAG-backed answers using ChromaDB with LangChain-style text chunking
- Seeded courses for Python, Machine Learning, Artificial Intelligence, and Data Science
- Photo upload that generates a cartoon tutor portrait through Stable Diffusion WebUI or Replicate img2img
- Voice generation through Piper or Coqui, with Kokoro kept as a fallback
- Talking avatar video generation through SadTalker
- React Native tutor flow with:
  - Avatar Tutor screen
  - Course Selection screen
  - Tutor Chat screen
  - Avatar Video Player screen
- Upload-your-own study materials pipeline for course-specific RAG
- Cached embeddings, cached TTS audio, cached avatar videos, and optional ffmpeg compression

## Architecture

### Backend

- FastAPI
- SQLAlchemy + SQLite/Postgres
- Ollama for local LLM inference
- ChromaDB + sentence-transformers for retrieval
- LangChain text splitters for chunking when installed
- Piper / Coqui / Kokoro for TTS
- Stable Diffusion WebUI or Replicate for avatar image generation
- SadTalker for talking-avatar videos

### Mobile

- React Native
- React Navigation
- Zustand
- Axios
- `react-native-video`
- `react-native-image-picker`
- `react-native-document-picker`

## End-to-End Flow

1. User uploads a photo.
2. Backend stores the image and attempts cartoon avatar generation.
3. User selects a course.
4. User asks a tutor question.
5. Backend answers with RAG-backed tutor text.
6. Backend generates speech audio.
7. Backend renders a SadTalker video.
8. Mobile app polls the avatar job and plays the tutor response.

## Key API Endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Tutor

- `POST /api/tutor/chat` - existing chat endpoint
- `POST /api/tutor/ask-tutor` - tutor response plus optional media orchestration
- `POST /ask-tutor` - root alias used by the mobile client
- `GET /api/tutor/stream` - SSE token streaming

### Voice

- `POST /api/voice`
- `POST /api/generate-voice`
- `POST /generate-voice`

### Avatar Video

- `POST /api/avatar` - legacy synchronous route
- `POST /api/avatar/generate` - async avatar job creation
- `POST /api/generate-avatar-video`
- `POST /generate-avatar-video`
- `GET /api/avatar/job/{job_id}` - poll avatar job status

### Uploads

- `POST /api/uploads/photo`
- `POST /api/uploads/upload-photo`
- `POST /upload-photo`
- `POST /api/uploads/course-document`
- `GET /api/uploads/avatar-config`

## Backend Setup

### Requirements

- Python 3.9+
- Node.js 18+
- Ollama
- One image backend:
  - Stable Diffusion WebUI with `--api`, or
  - Replicate API token
- One TTS backend:
  - Piper HTTP wrapper, or
  - Coqui HTTP wrapper
- SadTalker
- `ffmpeg` on PATH if video compression is enabled

### Install

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### Recommended `.env`

```env
DATABASE_URL=sqlite:///./ai_tutor.db
SECRET_KEY=change-me-in-production

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

TTS_PROVIDER=auto
PIPER_TTS_URL=http://localhost:5001/synthesize
# or:
# COQUI_TTS_URL=http://localhost:5002/api/tts

SADTALKER_API_URL=http://localhost:8870
ENABLE_VIDEO_COMPRESSION=true
FFMPEG_BINARY=ffmpeg
VIDEO_COMPRESSION_CRF=30

# choose one image backend
# REPLICATE_API_TOKEN=...
# or
# SD_API_URL=http://127.0.0.1:7860
```

### Start Local Services

```bash
ollama pull llama3
ollama serve
```

Optional alternate model:

```bash
ollama pull mistral
```

Start the API:

```bash
uvicorn app.main:app --reload
```

On startup the backend:

- creates database tables
- seeds the AI course catalog
- ingests default course notes into the RAG store

## Stable Diffusion Notes

For the avatar portrait flow:

1. Run Stable Diffusion WebUI with API enabled:
```bash
./webui.sh --api
```
2. Set `SD_API_URL=http://127.0.0.1:7860` in `backend/.env`.
3. Use a stylized or cartoon-friendly checkpoint for better tutor portraits:
```env
SD_MODEL_CHECKPOINT=your_cartoon_checkpoint.safetensors
```

## Mobile Setup

```bash
cd mobile
npm install
cmd /c npm run android
```

The mobile app will use the root alias endpoints:

- `/ask-tutor`
- `/upload-photo`
- `/generate-voice`
- `/generate-avatar-video`

## Default Seeded Courses

- Python Programming Foundations
- Machine Learning Fundamentals
- Artificial Intelligence Essentials
- Data Science Workflow

## Verification

The React Native client typechecks and lints cleanly:

```bash
cd mobile
cmd /c npm run typecheck
cmd /c npm run lint
```

Backend tests live under `backend/tests/`. Run them in an environment with Python installed:

```bash
cd backend
pytest tests/ -v
```

## Project Structure

```text
ai-tutor-app/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── config.py
│   │   ├── main.py
│   │   ├── rag.py
│   │   └── schemas.py
│   ├── course_content/
│   └── tests/
├── frontend/
└── mobile/
    └── src/
        ├── navigation/
        ├── screens/
        ├── services/
        ├── store/
        └── types/
```
