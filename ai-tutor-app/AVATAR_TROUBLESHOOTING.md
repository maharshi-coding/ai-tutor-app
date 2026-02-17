# Avatar Generation Feature - Testing & Troubleshooting

## Overview
The avatar generation feature allows users to upload a photo and generate an animated avatar from it. This document explains how to test the feature and troubleshoot common issues.

## Prerequisites

### Option 1: Replicate API (Recommended - Cloud-based)
1. Sign up at https://replicate.com/account/api-tokens
2. Get your API token
3. Add to `backend/.env`:
   ```
   REPLICATE_API_TOKEN=r8_your_token_here
   ```

### Option 2: Local Stable Diffusion WebUI
1. Install and run Automatic1111 SD WebUI with API enabled:
   ```bash
   ./webui.sh --api
   ```
2. Add to `backend/.env`:
   ```
   SD_API_URL=http://127.0.0.1:7860
   ```
3. (Optional) For better results, download a realistic checkpoint:
   ```
   SD_MODEL_CHECKPOINT=Realistic_Vision_V5.1_fp16.safetensors
   ```

## How to Test Avatar Generation

### Step 1: Start the Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

### Step 2: Start the Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Test in Browser

1. **Navigate to Profile Page**
   - Open http://localhost:3000
   - Login or create an account
   - Go to Profile page

2. **Upload a Photo**
   - Click "Choose File" under "Profile Photo"
   - Select a clear face photo (JPG/PNG)
   - Wait for upload to complete

3. **Generate Avatar**
   - Click "Generate my character" button
   - Wait for generation (5-30 seconds depending on service)
   - Avatar should appear automatically after generation

### Expected Result
- After generation completes, you should see:
  - Success toast message: "Character avatar generated successfully!"
  - Avatar image appears in a circular frame above "Your tutor persona"
  - The generated avatar maintains facial similarity to uploaded photo

## Troubleshooting

### Issue 1: Avatar doesn't appear after generation

**Symptoms:**
- Success message shows but no image appears
- Or: Image placeholder shows but doesn't load

**Solutions:**

1. **Check Browser Console**
   ```
   Open DevTools (F12) → Console tab
   Look for:
   - "Avatar generation result:" log
   - "Updated avatar config:" log
   - Any network errors
   ```

2. **Check Network Tab**
   ```
   DevTools → Network tab
   After generation:
   - Look for GET request to /uploads/avatars/{id}_avatar.png
   - Status should be 200
   - If 404: File wasn't saved properly
   - If CORS error: Check backend CORS settings
   ```

3. **Check Backend Logs**
   ```
   In backend terminal, look for:
   [Avatar Generation] Saving avatar to: ...
   [Avatar Generation] Avatar saved successfully: X bytes
   [Avatar Generation] Config updated: /uploads/avatars/...
   ```

4. **Verify File Exists**
   ```bash
   cd backend
   ls -la uploads/avatars/
   # Should see: {user_id}_avatar.png
   ```

5. **Test Static File Serving**
   ```bash
   # Test if uploads directory is accessible
   curl http://localhost:8000/uploads/avatars/
   # Should return directory listing or 404 (both ok)
   
   # If file exists, test direct access
   curl -I http://localhost:8000/uploads/avatars/1_avatar.png
   # Should return 200 OK with image/png content-type
   ```

6. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
   - Or: Clear browser cache and reload

7. **Check Image URL in Frontend**
   ```javascript
   // In browser console after generation
   console.log(document.querySelector('img[alt="Character avatar"]')?.src)
   // Should show: http://localhost:8000/uploads/avatars/{id}_avatar.png?t=...
   ```

### Issue 2: "No image generation service configured" error

**Solution:**
- Add either `REPLICATE_API_TOKEN` or `SD_API_URL` to `backend/.env`
- Restart backend server after adding environment variable

### Issue 3: Generation takes too long or times out

**Solutions:**
- Replicate API: Usually takes 5-15 seconds
- Local SD: First generation may take 20-30 seconds (model loading)
- Check your API service is responsive
- For local SD: Ensure GPU is available and CUDA is working

### Issue 4: Image quality is poor

**Solutions:**
- Upload a high-quality, well-lit photo (at least 512x512 pixels)
- Face should be clearly visible and centered
- For local SD: Use a better checkpoint model (e.g., Realistic Vision)
- Adjust the generation prompt in `uploads.py` if needed

### Issue 5: CORS errors

**Symptoms:**
- Network errors in browser console
- Failed to fetch avatar config

**Solutions:**
```bash
# In backend/.env, ensure frontend URL is allowed:
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Restart backend after changing
```

## Manual Testing Script

Run the automated test:
```bash
cd /path/to/project/root
python test_avatar_flow.py
```

This will test:
- User authentication
- Avatar config endpoint
- Static file serving
- Avatar generation endpoint (requires photo + API service)

## API Endpoints Reference

### Upload Photo
```bash
POST /api/uploads/photo
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: file (image file)

Response:
{
  "message": "Photo uploaded successfully",
  "file_path": "/uploads/photos/{id}_photo.jpg",
  "user_id": 1
}
```

### Generate Avatar
```bash
POST /api/uploads/avatar/generate-character
Authorization: Bearer {token}

Response:
{
  "message": "Character avatar generated",
  "character_image_url": "/uploads/avatars/{id}_avatar.png"
}
```

### Get Avatar Config
```bash
GET /api/uploads/avatar-config
Authorization: Bearer {token}

Response:
{
  "has_photo": true,
  "has_voice": false,
  "photo_path": "./uploads/photos/{id}_photo.jpg",
  "voice_path": null,
  "character_image_url": "/uploads/avatars/{id}_avatar.png",
  "last_generated_clip_url": null,
  "last_script": null
}
```

### Access Generated Avatar
```bash
GET /uploads/avatars/{id}_avatar.png

Response: Image file (image/png)
```

## Architecture Notes

### Backend Flow
1. User uploads photo → Saved to `./uploads/photos/`
2. User clicks "Generate" → Backend receives request
3. Backend reads uploaded photo
4. Backend calls Replicate or SD WebUI API
5. Backend receives generated image bytes
6. Backend saves to `./uploads/avatars/{user_id}_avatar.png`
7. Backend updates user's `avatar_config.character_image_url`
8. Backend returns response with image URL

### Frontend Flow
1. User clicks "Generate" button
2. Frontend calls `uploadAPI.generateCharacterAvatar()`
3. Frontend waits for response (shows loading state)
4. Frontend calls `uploadAPI.getAvatarConfig()` to refresh
5. Frontend updates `avatarConfig` state with timestamp
6. React re-renders → Image component with new URL + cache-bust
7. Browser requests image from `/uploads/avatars/{id}_avatar.png?t={timestamp}`
8. Backend serves static file
9. Image appears in UI

### Key Files
- **Backend:**
  - `backend/app/routers/uploads.py` - Avatar generation logic
  - `backend/app/main.py` - Static file mounting
  - `backend/app/config.py` - Configuration settings

- **Frontend:**
  - `frontend/app/profile/page.tsx` - Profile UI with avatar display
  - `frontend/lib/api.ts` - API client functions
  - `frontend/next.config.js` - Image optimization config

## Recent Fixes Applied

1. **Added console logging** - Better debugging in both frontend and backend
2. **Cache-busting query parameter** - Ensures fresh image loads: `?t={timestamp}`
3. **Force state update** - Uses `{...config, _timestamp}` to ensure React re-render
4. **Added `unoptimized` prop** - Prevents Next.js from blocking image load
5. **Better error messages** - More specific error feedback to user
6. **Backend logging** - Prints file save location and size

## Performance Considerations

- Generated avatars are cached in browser
- Each regeneration gets a new timestamp for cache-busting
- Static file serving is handled by FastAPI's StaticFiles
- Next.js Image component provides automatic optimization
- Original uploaded photos are kept separate from generated avatars

## Security Notes

- Avatar images are stored with user ID in filename
- Static files are publicly accessible (no auth required)
- File size limits enforced (10MB default)
- File type validation on upload
- Generated avatars overwrite previous ones (one per user)

## Future Enhancements

- [ ] Progress indicator during generation
- [ ] Multiple avatar styles to choose from
- [ ] Avatar animation preview
- [ ] Ability to regenerate with different styles
- [ ] Voice cloning integration
- [ ] Lip-sync animation with avatar
