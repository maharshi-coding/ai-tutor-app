# AI Tutor App - Hedra Daily Updates

A full-stack AI tutoring app with a FastAPI backend, a Next.js web frontend, and a React Native mobile client. The current avatar stack uses a Hedra.ai + Coqui TTS pipeline to generate short daily technology update videos for each user.

## What Is Included

- Ollama-powered tutor chat with `llama3` by default and `mistral` support
- RAG-backed answers using ChromaDB with chunked course content
- Seeded courses for Python, Machine Learning, Artificial Intelligence, and Data Science
- User photo upload plus reusable stylized avatar generation
- Daily technology update ingestion from configurable RSS and Atom feeds
- Coqui TTS audio generation for avatar speech
- Hedra.ai animation for personalized talking-avatar videos capped at 1 minute
- React Native flows for avatar setup, daily briefing playback, and tutor chat
- Stored avatar images, generated audio, and generated video assets for reuse

## Architecture

### Backend

- FastAPI
- SQLAlchemy + SQLite/Postgres
- Ollama for local LLM inference
- ChromaDB + sentence-transformers for retrieval
- RSS/Atom aggregation for daily tech updates
- Pillow-based avatar stylization
- Coqui TTS for avatar audio
- Hedra.ai for talking-avatar video generation

### Clients

- Next.js web app
- React Native mobile app
- `react-native-video` for briefing playback

## Daily Video Flow

1. The user uploads a photo.
2. The backend stores the photo and generates a stylized avatar image.
3. A daily job fetches recent technology and computer science updates from configured feeds.
4. The backend summarizes those updates into a script that fits in under 1 minute.
5. Coqui TTS converts the script into speech audio.
6. Hedra animates the stored avatar with the generated audio.
7. The backend stores the finished video and saves the latest URL in the user profile.
8. The web and mobile clients load the latest daily briefing video for playback.

## Key API Endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Tutor

- `POST /api/tutor/chat`
- `POST /api/tutor/ask-tutor`
- `POST /ask-tutor`
- `GET /api/tutor/stream`

### Avatar Media

- `POST /api/uploads/photo`
- `POST /api/uploads/upload-photo`
- `POST /upload-photo`
- `POST /api/uploads/avatar/generate-character`
- `POST /api/avatar/create`
- `POST /api/avatar/speak`
- `POST /api/avatar`
- `POST /api/avatar/generate`
- `POST /generate-avatar-video`
- `GET /api/avatar/job/{job_id}`

### Daily Videos

- `GET /api/daily-video`
- `POST /api/daily-video/generate`

### Uploads

- `POST /api/uploads/voice`
- `POST /api/uploads/course-document`
- `GET /api/uploads/avatar-config`

## Backend Setup

### Requirements

- Python 3.9+
- Node.js 18+
- Ollama
- A reachable Coqui TTS HTTP service
- A Hedra.ai API key

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

TTS_PROVIDER=coqui
COQUI_TTS_URL=http://localhost:5002/api/tts

HEDRA_API_KEY=your-hedra-key
HEDRA_API_BASE_URL=https://api.hedra.com/web-app/public
VIDEO_STORAGE_PATH=./uploads/generated_videos
MAX_AVATAR_VIDEO_DURATION_SECONDS=60

ENABLE_DAILY_VIDEO_SCHEDULER=true
DAILY_VIDEO_HOUR=8
DAILY_VIDEO_MINUTE=0
DAILY_VIDEO_TIMEZONE=America/Chicago

TECH_UPDATES_LOOKBACK_DAYS=2
TECH_UPDATES_MAX_ITEMS=5
TECH_UPDATES_FEEDS=https://techcrunch.com/feed/,https://www.theverge.com/rss/index.xml,https://hnrss.org/frontpage
```

### Start Local Services

```bash
ollama pull llama3
ollama serve
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

On startup the backend:

- creates database tables
- seeds the AI course catalog
- ingests default course notes into the RAG store
- starts the daily video scheduler when enabled

## Mobile Setup

```bash
cd mobile
npm install
cmd /c npm run android
```

The mobile app uses these avatar and daily-video routes:

- `/upload-photo`
- `/generate-avatar-video`
- `/api/daily-video`
- `/api/daily-video/generate`

## Default Seeded Courses

- Python Programming Foundations
- Machine Learning Fundamentals
- Artificial Intelligence Essentials
- Data Science Workflow

## Verification

Backend tests live under `backend/tests/`:

```bash
cd backend
pytest tests/ -v
```

Mobile checks:

```bash
cd mobile
cmd /c npm run typecheck
```

## Project Structure

```text
ai-tutor-app/
|-- backend/
|   |-- app/
|   |   |-- routers/
|   |   |-- services/
|   |   |-- config.py
|   |   |-- main.py
|   |   `-- schemas.py
|   |-- course_content/
|   `-- tests/
|-- frontend/
`-- mobile/
    `-- src/
        |-- navigation/
        |-- screens/
        |-- services/
        |-- store/
        `-- types/
```
