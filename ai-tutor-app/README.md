# AI Tutor App - Personalized Learning Platform

A modern web application for personalized AI tutoring where users can create their own AI tutor using their face and voice.

## Features

- 🎭 **Personal Avatar**: Upload your photo to create an interactive 3D avatar
- 🎤 **Voice Cloning**: Upload voice samples for personalized TTS
- 📚 **Course Selection**: Choose from various courses and subjects
- 💬 **Interactive Learning**: Chat with your AI tutor in real-time
- 📊 **Progress Tracking**: Track your learning progress across courses
- 🎨 **Modern UI**: Beautiful, responsive interface with smooth animations

## Tech Stack

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **JWT** - Authentication
- **OpenAI API** - AI tutor (can use Hugging Face as alternative)

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
- PostgreSQL database
- (Optional) OpenAI API key or Hugging Face API key

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

### Uploads
- `POST /api/uploads/photo` - Upload profile photo
- `POST /api/uploads/voice` - Upload voice sample
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
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── courses.py
│   │       ├── tutor.py
│   │       └── uploads.py
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

- [ ] Enhanced 3D avatar models with facial animation
- [ ] Real-time voice synthesis using Coqui TTS or similar
- [ ] Quiz system with progress tracking
- [ ] More course content and subjects
- [ ] User-generated courses
- [ ] Social features and leaderboards
- [ ] Mobile app support

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
