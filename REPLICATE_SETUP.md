# Using Replicate API for Avatar Generation (Recommended)

Replicate API provides cloud-based image generation that's **much easier to set up** and produces **better quality results** than running Stable Diffusion locally.

## Quick Setup (5 minutes)

### Step 1: Get Replicate API Token

1. Go to: https://replicate.com/account/api-tokens
2. Sign up or log in (free account works!)
3. Copy your API token (starts with `r8_...`)

### Step 2: Add Token to Backend

Edit `backend/.env` and add:
```env
REPLICATE_API_TOKEN=r8_your_token_here
```

### Step 3: Install Replicate Package

```bash
cd backend
source .venv/bin/activate  # or: venv\Scripts\activate on Windows
pip install replicate
```

### Step 4: Restart Backend

- **Local:** Stop backend (Ctrl+C) and restart: `uvicorn app.main:app --reload`
- **Docker:** `docker compose restart backend` (or rebuild: `docker compose up -d --build backend`)

### Step 5: Test!

1. Go to your app: http://localhost:3000
2. Upload a photo in Profile page
3. Click "Generate my character"
4. Wait 20-40 seconds (cloud processing)
5. See your realistic avatar! 🎉

---

## Why Replicate?

✅ **No local GPU needed** - runs in the cloud  
✅ **Better quality** - uses FLUX model (state-of-the-art)  
✅ **Face preservation** - keeps your likeness  
✅ **Easy setup** - just add API token  
✅ **Free tier** - includes some free credits  

## Cost

- **Free tier:** ~100-200 images/month (varies)
- **Paid:** ~$0.003-0.01 per image (very affordable)
- Check pricing: https://replicate.com/pricing

## Troubleshooting

**"REPLICATE_API_ERROR: Invalid token"**
- Make sure you copied the full token (starts with `r8_`)
- Check there are no extra spaces in `.env`

**"No image generation service configured"**
- Make sure `REPLICATE_API_TOKEN` is set in `.env`
- Restart backend after changing `.env`

**Slow generation?**
- Normal: 20-60 seconds per image (cloud processing)
- First request may be slower (cold start)

**Want to use local SD WebUI instead?**
- Set `SD_API_URL=http://127.0.0.1:7860` in `.env`
- Remove or comment out `REPLICATE_API_TOKEN`
- The app will automatically use local SD WebUI

---

## Advanced: Using Your Own API Key

If you have an API key from another service (like the one in your screenshot), you can:

1. Check if that service supports img2img/image-to-image
2. Add support in `backend/app/routers/uploads.py` following the same pattern
3. Or use Replicate (it's the easiest and works great!)
