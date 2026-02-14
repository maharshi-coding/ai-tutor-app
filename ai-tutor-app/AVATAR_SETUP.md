# Avatar Generation Setup - Step by Step Guide

## Step 1: Download Realistic Vision Model

**Option A: Using wget/curl (recommended)**

1. Open a terminal and navigate to your stable-diffusion-webui models folder:
   ```bash
   cd /home/maharshi/projects/stable-diffusion-webui/models/Stable-diffusion/
   ```

2. Download Realistic Vision V5.1 (this is a large file ~2GB, will take a few minutes):
   ```bash
   wget https://civitai.com/api/download/models/130072 -O Realistic_Vision_V5.1_fp16.safetensors
   ```
   
   **OR** if wget doesn't work, use curl:
   ```bash
   curl -L https://civitai.com/api/download/models/130072 -o Realistic_Vision_V5.1_fp16.safetensors
   ```

**Option B: Manual download via browser**

1. Go to: https://civitai.com/models/4201/realistic-vision-v51
2. Click the "Download" button (usually under "Model Versions" → "V5.1" → "Download")
3. Save the file to: `/home/maharshi/projects/stable-diffusion-webui/models/Stable-diffusion/Realistic_Vision_V5.1_fp16.safetensors`

**Verify the download:**
```bash
ls -lh /home/maharshi/projects/stable-diffusion-webui/models/Stable-diffusion/Realistic_Vision_V5.1_fp16.safetensors
```
You should see a file around 2GB in size.

---

## Step 2: Update Backend .env File

1. Open the backend `.env` file:
   ```bash
   cd /home/maharshi/projects/ai-tutor-app/backend
   nano .env
   ```
   (Or use `vim .env` or any text editor)

2. Add these two lines (or update if they already exist):
   ```env
   SD_API_URL=http://127.0.0.1:7860
   SD_MODEL_CHECKPOINT=Realistic_Vision_V5.1_fp16.safetensors
   ```

3. Save and exit:
   - In nano: Press `Ctrl+X`, then `Y`, then `Enter`
   - In vim: Press `Esc`, type `:wq`, press `Enter`

**Note:** If your backend runs in Docker, use:
```env
SD_API_URL=http://host.docker.internal:7860
SD_MODEL_CHECKPOINT=Realistic_Vision_V5.1_fp16.safetensors
```

---

## Step 3: Restart Stable Diffusion WebUI (if running)

If your WebUI is already running, you need to restart it so it loads the new model:

1. Stop the current WebUI (press `Ctrl+C` in its terminal)

2. Start it again with the API flag:
   ```bash
   cd /home/maharshi/projects/stable-diffusion-webui
   ./webui.sh --api
   ```

3. Wait for it to fully load (you'll see "Model loaded" message)

---

## Step 4: Restart Backend

**If backend runs locally (not Docker):**

1. Stop the backend (press `Ctrl+C` in its terminal)

2. Start it again:
   ```bash
   cd /home/maharshi/projects/ai-tutor-app/backend
   source .venv/bin/activate  # if using venv
   uvicorn app.main:app --reload
   ```

**If backend runs in Docker:**

1. Restart the backend container:
   ```bash
   cd /home/maharshi/projects/ai-tutor-app
   docker compose restart backend
   ```

---

## Step 5: Test Avatar Generation

1. Go to your AI Tutor app: http://localhost:3000
2. Log in and go to Profile page
3. Upload a photo (if you haven't already)
4. Click "Generate my character"
5. Wait for generation (may take 30-60 seconds)
6. You should see a much more realistic, face-preserving avatar!

---

## Troubleshooting

**"Model not found" error:**
- Check the exact filename in WebUI: Go to http://127.0.0.1:7860 → Settings → Checkpoint → see what models are listed
- Use that exact filename (case-sensitive) in `.env`

**WebUI doesn't see the model:**
- Make sure the file is in: `stable-diffusion-webui/models/Stable-diffusion/`
- Restart WebUI completely
- Check file permissions: `chmod 644 Realistic_Vision_V5.1_fp16.safetensors`

**Backend can't connect to WebUI:**
- Make sure WebUI is running: `curl http://127.0.0.1:7860/docs` should return HTML
- If backend is in Docker, use `http://host.docker.internal:7860` instead of `127.0.0.1`

**Still getting ugly results:**
- Try lowering denoising_strength in `backend/app/routers/uploads.py` (line ~160): change `0.48` to `0.35` for even more face preservation
- Make sure you're using a clear, front-facing photo (not a side profile or group photo)
