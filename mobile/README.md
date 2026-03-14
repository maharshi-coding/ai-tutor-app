# AI Tutor Mobile App

The React Native client lets users upload a photo, generate a stylized avatar, watch a daily technology briefing video, and chat with the tutor.

## Main Flows

- Upload a photo and save it as the user's reusable avatar source image.
- Generate a stylized avatar preview on the backend.
- Request or view the latest daily tech update video generated with Coqui TTS and Hedra.
- Open course chat and continue using the tutor normally.

## Key Screens

- `AvatarSetupScreen.tsx`: upload a photo, generate the avatar, and trigger today's briefing
- `AvatarTutorScreen.tsx`: load and play the latest daily video for the signed-in user
- `ChatScreen.tsx`: chat with the tutor and optionally request avatar video playback
- `ProfileScreen.tsx`: manage account state and course materials

## Backend Endpoints Used

- `POST /upload-photo`
- `GET /api/uploads/avatar-config`
- `POST /api/uploads/avatar/generate-character`
- `POST /generate-avatar-video`
- `GET /api/avatar/job/{job_id}`
- `GET /api/daily-video`
- `POST /api/daily-video/generate`

## Local Setup

```bash
cd mobile
npm install
cmd /c npm run android
```

For Android emulators, the API base URL should point to `http://10.0.2.2:8000`.

## Verification

```bash
cd mobile
cmd /c npm run typecheck
```
