# AI Tutor App - Personalized Learning Platform

A modern web application for personalized AI tutoring where users can create their own AI tutor using their face and voice.

## Features

- 🎭 **Personal Avatar**: Upload your photo to create an interactive 3D avatar
- 🎤 **Voice Cloning**: Upload voice samples for personalized TTS
- 📚 **Course Selection**: Choose from various courses and subjects
- 💬 **Interactive Learning**: Chat with your AI tutor in real-time
- 📊 **Progress Tracking**: Track your learning progress across courses
- 🎨 **Modern UI**: Beautiful, responsive interface with smooth animations
- 🧠 **RAG Pipeline**: Upload course materials (PDF, DOCX, TXT, MD) for context-aware tutoring
- 🗣 **Kokoro TTS**: Local text-to-speech for natural voice output
- 👄 **SadTalker Avatar**: Lip-synced talking-head video generation from a reference image
- 🔁 **Streaming Responses**: Server-Sent Events for real-time token streaming
- 🏠 **Fully Local & Free**: Supports Ollama for 100% offline, open-source LLM inference

## Tech Stack

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL / SQLite** - Database
- **SQLAlchemy** - ORM
- **JWT** - Authentication
- **Ollama** - Local LLM inference (Llama 3, Mistral, DeepSeek, Phi)
- **LangChain-style RAG** - ChromaDB + Sentence Transformers
- **Kokoro TTS** - Local text-to-speech
- **SadTalker** - Talking-head avatar video generation
- **OpenRouter / Gemini / OpenAI** - Optional cloud LLM providers

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Three.js / React Three Fiber** - 3D avatar rendering
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Query** - Data fetching

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL database (or SQLite for quick local dev)
- **Ollama** (recommended for free local LLM) — [install from ollama.com](https://ollama.com)
- (Optional) Kokoro TTS for voice generation
- (Optional) SadTalker for talking-head avatar videos
- (Optional) OpenAI / Gemini / OpenRouter API key for cloud LLMs

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and secret key
```

5. Create PostgreSQL database:
```sql
CREATE DATABASE ai_tutor_db;
```

6. Run migrations (tables are auto-created on first run):
```bash
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your API URL
```

4. Run development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Avatar generation (Stable Diffusion WebUI)

The "Generate my character" feature uses your uploaded photo and an img2img API to create a realistic avatar. For best results:

1. **Run Stable Diffusion WebUI with the API** (in your SD WebUI project):
   ```bash
   ./webui.sh --api
   ```
   It will listen on `http://127.0.0.1:7860`.

2. **Point the backend at it** in `backend/.env`:
   ```env
   SD_API_URL=http://127.0.0.1:7860
   ```
   If the backend runs in Docker, use `http://host.docker.internal:7860` (or your host IP).

3. **Better-looking avatars (recommended)**  
   The default SD 1.5 model is okay; for more realistic faces:
   - Download a **realistic SD 1.5 checkpoint** (e.g. [Realistic Vision V5.1](https://civitai.com/models/4201/realistic-vision-v51)) and put it in your WebUI `models/Stable-diffusion/` folder.
   - In `backend/.env`, set the checkpoint name so the app uses it for avatar generation:
     ```env
     SD_MODEL_CHECKPOINT=Realistic_Vision_V5.1_fp16.safetensors
     ```
   (Use the exact filename as shown in the WebUI dropdown.)

4. **Face restoration**  
   The app requests face restoration (GFPGAN/CodeFormer). The WebUI may download the face-restoration model on first use; ensure you have a few hundred MB free.

## Usage

1. **Register/Login**: Create an account or sign in
2. **Setup Avatar**: Upload your photo and voice sample in the Profile page
3. **Select Course**: Choose a course from the dashboard
4. **Start Learning**: Interact with your AI tutor, ask questions, and learn!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses/` - Get all courses
- `GET /api/courses/{id}` - Get course details
- `GET /api/courses/{id}/progress` - Get course progress
- `POST /api/courses/{id}/progress` - Update course progress

### Tutor
- `POST /api/tutor/chat` - Chat with AI tutor
- `POST /api/tutor/generate-lesson` - Generate lesson content
- `GET /api/tutor/stream` - Stream AI response via SSE (token-by-token)

### Voice (Kokoro TTS)
- `POST /api/voice` - Generate speech audio from text

### Avatar Video (SadTalker)
- `POST /api/avatar` - Generate talking-head video from audio + image

### Uploads
- `POST /api/uploads/photo` - Upload profile photo
- `POST /api/uploads/voice` - Upload voice sample
- `POST /api/uploads/course-document` - Upload course materials (PDF, DOCX, TXT, MD)
- `GET /api/uploads/avatar-config` - Get avatar configuration

## Project Structure

```
ai-tutor-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── rag.py
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── courses.py
│   │       ├── tutor.py
│   │       ├── uploads.py
│   │       ├── voice.py
│   │       └── avatar.py
│   ├── tests/
│   │   └── test_ai_tutor_integration.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── courses/[id]/
│   ├── components/
│   │   └── Avatar.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── store/
│   │   └── authStore.ts
│   └── package.json
└── README.md
```

## Future Enhancements

- [x] Ollama local LLM support (free, offline)
- [x] RAG-based course document ingestion
- [x] Kokoro TTS voice generation
- [x] SadTalker talking-head avatar video
- [x] Streaming AI responses via SSE
- [ ] Enhanced 3D avatar models with facial animation
- [ ] Quiz system with progress tracking
- [ ] More course content and subjects
- [ ] User-generated courses
- [ ] Social features and leaderboards
- [ ] Mobile app support

## Ollama Setup (Local LLM)

To use Ollama for free, local LLM inference:

1. Install Ollama: https://ollama.com
2. Pull a model:
```bash
ollama pull llama3
```
3. Ollama runs at `http://localhost:11434` by default — the app auto-connects.
4. Change the model in `.env`:
```env
OLLAMA_MODEL=llama3
```

## Running Tests

```bash
cd backend
pip install pytest pytest-asyncio
pytest tests/ -v
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
