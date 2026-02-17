# Avatar Generation Flow - Complete Architecture

## Overview
This document explains the complete flow of avatar generation from user upload to UI display.

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │   Upload Photo (Step 1)  │
                    │   /profile page          │
                    └──────────────┬───────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                    POST /api/uploads/photo
                         (FormData with file)
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            BACKEND                                       │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ uploads.py: upload_photo()                                     │     │
│  │ 1. Stream file in 1MB chunks                                  │     │
│  │ 2. Save to ./uploads/photos/{user_id}_photo.{ext}            │     │
│  │ 3. Update user.avatar_photo_path in DB                        │     │
│  │ 4. Return: {"file_path": "/uploads/photos/..."}              │     │
│  └───────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │ Frontend updates state   │
                    │ Photo uploaded ✓         │
                    └──────────────┬───────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │ User clicks "Generate    │
                    │ my character" (Step 2)   │
                    └──────────────┬───────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                       │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ profile/page.tsx: handleGenerateCharacter()                    │     │
│  │ 1. Check if photo uploaded                                     │     │
│  │ 2. Set loading state                                           │     │
│  │ 3. Call uploadAPI.generateCharacterAvatar()                    │     │
│  └───────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
              POST /api/uploads/avatar/generate-character
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            BACKEND                                       │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ uploads.py: generate_character_avatar()                        │     │
│  │ 1. Load uploaded photo from disk                              │     │
│  │ 2. Prepare image (resize, base64 encode)                      │     │
│  │ 3. Call AI service (Replicate or SD WebUI)                    │     │
│  │    ┌─────────────────────────────────────────┐               │     │
│  │    │ Option A: Replicate API                 │               │     │
│  │    │ - Cloud-based (recommended)             │               │     │
│  │    │ - High quality results                   │               │     │
│  │    │ - Fast (5-15 seconds)                   │               │     │
│  │    └─────────────────────────────────────────┘               │     │
│  │    ┌─────────────────────────────────────────┐               │     │
│  │    │ Option B: Local SD WebUI                │               │     │
│  │    │ - Local installation required            │               │     │
│  │    │ - Customizable models                    │               │     │
│  │    │ - Slower (10-30 seconds)                │               │     │
│  │    └─────────────────────────────────────────┘               │     │
│  │ 4. Receive generated image bytes                              │     │
│  │ 5. Save to ./uploads/avatars/{user_id}_avatar.png            │     │
│  │ 6. Update user.avatar_config.character_image_url in DB        │     │
│  │ 7. Return: {                                                  │     │
│  │      "message": "Character avatar generated",                 │     │
│  │      "character_image_url": "/uploads/avatars/..."           │     │
│  │    }                                                           │     │
│  └───────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                       │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ profile/page.tsx: After generation completes                   │     │
│  │ 1. Receive response with character_image_url                   │     │
│  │ 2. Call uploadAPI.getAvatarConfig() to refresh                │     │
│  │ 3. Update state: setAvatarConfig({...config, _timestamp})     │     │
│  │ 4. Show success message                                        │     │
│  │ 5. React re-renders Image component                           │     │
│  └───────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       UI IMAGE RENDERING                                 │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ Next.js Image Component                                        │     │
│  │ src={API_URL + character_image_url + "?t=" + timestamp}       │     │
│  │                                                                │     │
│  │ Example:                                                       │     │
│  │ http://localhost:8000/uploads/avatars/1_avatar.png?t=170808.. │     │
│  └───────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                       ┌─────────────────────┐
                       │ Browser fetches     │
                       │ image from backend  │
                       └──────────┬──────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            BACKEND                                       │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ main.py: Static file serving                                   │     │
│  │ app.mount("/uploads", StaticFiles(...))                        │     │
│  │                                                                │     │
│  │ GET /uploads/avatars/1_avatar.png                             │     │
│  │ → Serves file from ./uploads/avatars/1_avatar.png             │     │
│  └───────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                       ┌─────────────────────┐
                       │ Browser receives    │
                       │ image and displays  │
                       │ ✓ Avatar visible!   │
                       └─────────────────────┘
```

## Key Components

### 1. Upload Directory Structure
```
uploads/
├── photos/              # Original uploaded photos
│   └── {user_id}_photo.{ext}
├── voices/              # Voice samples
│   └── {user_id}_voice.{ext}
└── avatars/             # Generated avatars
    └── {user_id}_avatar.png
```

### 2. Database Schema
```python
User:
  - avatar_photo_path: str           # Path to uploaded photo
  - voice_sample_path: str           # Path to voice sample
  - avatar_config: dict              # JSON with:
      - character_image_url: str     # URL to generated avatar
      - last_generated_clip_url: str # (future)
      - last_script: str             # (future)
```

### 3. Frontend State
```typescript
avatarConfig: {
  has_photo: boolean
  has_voice: boolean
  photo_path: string
  voice_path: string
  character_image_url: string  // Key field for display
  _timestamp: number           // For cache-busting
}
```

## Critical Points

### 🔑 Key Success Factors

1. **State Update with New Reference**
   ```typescript
   // ✗ Wrong - React may not detect change
   setAvatarConfig(config)
   
   // ✓ Correct - Forces re-render
   setAvatarConfig({ ...config, _timestamp: Date.now() })
   ```

2. **Cache-Busting Query Parameter**
   ```typescript
   // ✗ Wrong - Browser may cache old image
   src={`${API_URL}${url}`}
   
   // ✓ Correct - Unique URL forces fresh load
   src={`${API_URL}${url}?t=${timestamp}`}
   ```

3. **Static File Mounting**
   ```python
   # Must mount BEFORE including routers
   @app.on_event("startup")
   async def on_startup():
       app.mount("/uploads", StaticFiles(directory=upload_dir))
   ```

4. **Subdirectory Creation**
   ```python
   # Must create subdirectories on startup
   (UPLOAD_DIR / "photos").mkdir(exist_ok=True)
   (UPLOAD_DIR / "voices").mkdir(exist_ok=True)
   (UPLOAD_DIR / "avatars").mkdir(exist_ok=True)
   ```

## Debugging Checklist

When avatar doesn't appear:

- [ ] Check browser console for logs
- [ ] Verify Network tab shows 200 for image request
- [ ] Confirm file exists in `uploads/avatars/`
- [ ] Check backend logs for save confirmation
- [ ] Verify `character_image_url` is set in response
- [ ] Test direct URL: `http://localhost:8000/uploads/avatars/{id}_avatar.png`
- [ ] Clear browser cache and retry
- [ ] Check CORS settings in backend
- [ ] Verify Next.js Image remote patterns config

## Performance Considerations

### Image Size
- Generated avatars: ~500KB - 2MB
- Browser caches images automatically
- Cache-busting on regeneration prevents stale images

### Generation Time
- Replicate API: 5-15 seconds
- Local SD WebUI: 10-30 seconds (first run may download model)
- Frontend shows loading state during generation

### Memory Usage
- Streaming upload: Uses only 1MB at a time
- Image generation: Temporary memory during processing
- Saved file: Persistent on disk

## Future Enhancements

1. **Progress Indicator**
   - WebSocket for real-time progress
   - Show % completion during generation

2. **Multiple Styles**
   - Offer different avatar styles
   - Cartoon, anime, realistic, etc.

3. **Animation**
   - Add blinking eyes
   - Lip-sync with speech
   - Head movement

4. **Voice Integration**
   - Generate audio with cloned voice
   - Create talking avatar videos
   - Lip-sync to generated speech

5. **Caching & CDN**
   - Upload generated avatars to CDN
   - Faster global delivery
   - Reduce backend load
