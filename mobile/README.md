# AI Tutor – React Native Mobile App

A **React Native Android app** for your AI-powered personal tutor. Users upload a photo to generate a
talking avatar via SadTalker, ask questions in a chat interface, and receive AI responses with
animated avatar video replies. Learning materials (PDF / DOCX / TXT) can be uploaded to give the
tutor context-specific knowledge.

---

## Project structure

```
ai-tutor-app/
├── backend/            FastAPI backend (unchanged from web version)
├── frontend/           Next.js web app (legacy – kept for reference)
└── mobile/             ← React Native Android app  ✨ new
    ├── App.tsx
    ├── index.js
    ├── app.json
    ├── package.json
    ├── tsconfig.json
    ├── babel.config.js
    ├── metro.config.js
    └── src/
        ├── navigation/
        │   └── AppNavigator.tsx   Stack + Bottom-tab navigation
        ├── screens/
        │   ├── SplashScreen.tsx   Animated launch screen
        │   ├── LoginScreen.tsx
        │   ├── RegisterScreen.tsx
        │   ├── HomeScreen.tsx     Course list + quick actions
        │   ├── ChatScreen.tsx     AI chat + live avatar video panel
        │   ├── AvatarSetupScreen.tsx  Photo upload → async SadTalker job
        │   └── ProfileScreen.tsx  Material upload + account settings
        ├── services/
        │   ├── api.ts             Axios client + all API helpers
        │   └── avatarService.ts   Async job creation + polling loop
        ├── store/
        │   └── authStore.ts       Zustand auth store (AsyncStorage)
        └── types/
            └── index.ts           Shared TypeScript interfaces
```

---

## Key features

| Feature | Detail |
|---|---|
| Auth | JWT login / register, token persisted in AsyncStorage |
| Chat | AI tutor Q&A (Ollama → OpenRouter → Gemini → OpenAI waterfall) |
| Avatar generation | Photo upload → async SadTalker job → polling → video playback |
| RAG | Upload PDF/DOCX/TXT; ChromaDB indexes it; tutor answers from it |
| Courses | Browse & open course-specific chat sessions |
| Talking avatar video | Displayed in hero panel above chat messages |

---

## Avatar async flow

```
Mobile                          Backend (FastAPI)              SadTalker
──────                          ─────────────────              ─────────
POST /api/avatar/generate ───► creates background job ──────► animates photo
                          ◄─── {job_id}

loop every 2.5 s:
GET /api/avatar/job/{id}  ───► returns {status, video_url?}
  status=pending/processing    ...
  status=done              ◄─── {video_url: "/uploads/..."}
Play video in hero panel
```

---

## Prerequisites

- Node.js ≥ 18
- React Native CLI (`npm install -g react-native`)
- Android Studio with SDK 34+ and an emulator (API 33+) or physical device
- JDK 17
- The backend running (see [backend setup](../SETUP.md))

---

## Quick start

### 1. Start the backend

```bash
cd ai-tutor-app
docker compose up --build
# API available at http://localhost:8000
```

### 2. Install mobile dependencies

```bash
cd mobile
npm install
```

### 3. Android native setup

```bash
# Link react-native-vector-icons (if not auto-linked)
npx react-native link react-native-vector-icons

# Generate Android project files if they don't exist
npx react-native init AiTutorMobile --skip-install
# Copy/merge the android/ folder into this directory if needed
```

### 4. Run on Android emulator

```bash
# In one terminal — start Metro bundler
npm start

# In another terminal — build & launch on emulator
npm run android
```

> **Physical device**: change `BASE_URL` in `src/services/api.ts` from
> `http://10.0.2.2:8000` to your machine's LAN IP, e.g. `http://192.168.1.50:8000`.

---

## API base URL

| Target | URL to use |
|---|---|
| Android emulator | `http://10.0.2.2:8000` (default) |
| Physical Android device | `http://<your-LAN-ip>:8000` |
| Production | Set via env / update `BASE_URL` in `src/services/api.ts` |

---

## Environment / configuration

All runtime config lives in `src/services/api.ts`:

```ts
export const BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000'   // Android emulator
  : 'https://your-api.com';   // Production
```

---

## Dependencies

| Package | Purpose |
|---|---|
| `@react-navigation/native` + `native-stack` + `bottom-tabs` | Navigation |
| `zustand` | Global auth state |
| `@react-native-async-storage/async-storage` | Token persistence |
| `axios` | HTTP client |
| `react-native-video` | Avatar video playback |
| `react-native-image-picker` | Photo selection for avatar |
| `react-native-document-picker` | PDF / DOCX / TXT selection |
| `react-native-gesture-handler` | Navigation gesture support |
| `react-native-safe-area-context` + `react-native-screens` | Navigation internals |

---

## Backend changes made

- **`backend/app/routers/avatar.py`** — Added:
  - `POST /api/avatar/generate` → starts background job, returns `{job_id}`
  - `GET  /api/avatar/job/{job_id}` → returns `{status, video_url?, error?}`
  - Original sync `POST /api/avatar` preserved for the web frontend
- **`backend/app/main.py`** — CORS updated to `allow_origins=["*"]` so React
  Native requests (which carry no `Origin` header) are never blocked. All routes
  are still protected by JWT.

---

## Screen tour

### Splash → Login / Register
Animated launch screen auto-redirects to the dashboard if a valid token is stored.

### Home
Course grid with quick-action buttons for *Ask AI Tutor*, *My Avatar*, and *Materials*.

### Chat (AI Tutor)
- Hero avatar video panel at the top (updates after each AI response)
- Message bubbles with timestamps
- AI suggestion chips for follow-up questions
- Typing indicator while the AI is processing

### Avatar Setup
Step-by-step:
1. Pick & upload a front-facing photo
2. Tap "Generate Avatar" — job queued asynchronously
3. App polls every 2.5 s until the video is ready, then previews it

### Profile
- Upload PDFs / DOCX / TXT to a selected course (ingested into ChromaDB RAG)
- Shows avatar & voice badge status
- Sign out
