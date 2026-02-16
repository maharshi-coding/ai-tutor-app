import base64
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import httpx
from PIL import Image

from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.config import settings

router = APIRouter()

# Ensure upload directory exists
UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "photos").mkdir(exist_ok=True)
(UPLOAD_DIR / "voices").mkdir(exist_ok=True)
(UPLOAD_DIR / "avatars").mkdir(exist_ok=True)


def _image_size_sd_friendly(image_path: Path, max_side: int = 768) -> Tuple[int, int]:
    """Return (width, height) for SD img2img: preserve aspect ratio, max side = max_side, multiples of 8."""
    with Image.open(image_path) as img:
        w, h = img.size
    if w <= 0 or h <= 0:
        return (512, 768)
    scale = min(max_side / w, max_side / h, 1.0)
    w_out = max(64, int(w * scale) // 8 * 8)
    h_out = max(64, int(h * scale) // 8 * 8)
    return (w_out, h_out)


@router.post("/photo")
async def upload_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user photo for avatar generation"""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Save file with streaming to avoid loading entire file into memory
    file_extension = Path(file.filename).suffix
    filename = f"{current_user.id}_photo{file_extension}"
    file_path = UPLOAD_DIR / "photos" / filename
    
    # Stream file to disk in chunks
    current_size = 0
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            current_size += len(chunk)
            if current_size > settings.MAX_FILE_SIZE:
                # Remove partial file if size limit exceeded
                buffer.close()
                file_path.unlink(missing_ok=True)
                raise HTTPException(status_code=400, detail="File too large")
            buffer.write(chunk)
    
    # Update user record
    current_user.avatar_photo_path = str(file_path)
    db.commit()
    
    return {
        "message": "Photo uploaded successfully",
        "file_path": f"/uploads/photos/{filename}",
        "user_id": current_user.id
    }


@router.post("/voice")
async def upload_voice(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload voice sample for TTS"""
    # Validate file type
    allowed_types = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/webm"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File must be an audio file (wav, mp3, webm)")
    
    # Save file with streaming to avoid loading entire file into memory
    file_extension = Path(file.filename).suffix
    filename = f"{current_user.id}_voice{file_extension}"
    file_path = UPLOAD_DIR / "voices" / filename
    
    # Stream file to disk in chunks
    current_size = 0
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            current_size += len(chunk)
            if current_size > settings.MAX_FILE_SIZE:
                # Remove partial file if size limit exceeded
                buffer.close()
                file_path.unlink(missing_ok=True)
                raise HTTPException(status_code=400, detail="File too large")
            buffer.write(chunk)
    
    # Update user record
    current_user.voice_sample_path = str(file_path)
    db.commit()
    
    return {
        "message": "Voice sample uploaded successfully",
        "file_path": f"/uploads/voices/{filename}",
        "user_id": current_user.id
    }


@router.get("/avatar-config")
async def get_avatar_config(current_user: User = Depends(get_current_user)):
    """Get avatar configuration for the current user"""
    config: Dict[str, Any] = current_user.avatar_config or {}
    return {
        "has_photo": current_user.avatar_photo_path is not None,
        "has_voice": current_user.voice_sample_path is not None,
        "photo_path": current_user.avatar_photo_path,
        "voice_path": current_user.voice_sample_path,
        "character_image_url": config.get("character_image_url"),
        "last_generated_clip_url": config.get("last_generated_clip_url"),
        "last_script": config.get("last_script"),
    }


async def _generate_with_replicate(
    photo_path: Path, prompt: str, negative_prompt: str, out_width: int, out_height: int
) -> Optional[bytes]:
    """Generate avatar using Replicate API (cloud, high quality)."""
    if not settings.REPLICATE_API_TOKEN:
        return None
    
    try:
        import replicate
        import os
        
        # Set API token
        os.environ["REPLICATE_API_TOKEN"] = settings.REPLICATE_API_TOKEN
        
        # Open image file (Replicate accepts file objects)
        with open(photo_path, "rb") as image_file:
            model = settings.REPLICATE_MODEL
            
            # Run the img2img model
            output = replicate.run(
                model,
                input={
                    "image": image_file,
                    "prompt": prompt,
                    "negative_prompt": negative_prompt,
                    "num_outputs": 1,
                    "guidance_scale": 6.0,
                    "num_inference_steps": 30,
                    "strength": 0.48,  # Denoising strength (lower = more like original)
                    "seed": -1,  # Random seed
                }
            )
            
            # Replicate returns a list of URLs (or file-like objects)
            if isinstance(output, list) and len(output) > 0:
                result_url = output[0]
                # Download the image from URL
                async with httpx.AsyncClient(timeout=120) as client:
                    resp = await client.get(result_url)
                    resp.raise_for_status()
                    return resp.content
            elif isinstance(output, str):
                # Sometimes it returns a single URL string
                async with httpx.AsyncClient(timeout=120) as client:
                    resp = await client.get(output)
                    resp.raise_for_status()
                    return resp.content
        return None
    except Exception as e:
        print(f"REPLICATE_API_ERROR: {repr(e)}")
        import traceback
        traceback.print_exc()
        return None


async def _generate_with_sd_webui(
    b64_image: str, prompt: str, negative_prompt: str, out_width: int, out_height: int
) -> Optional[bytes]:
    """Generate avatar using local Stable Diffusion WebUI."""
    if not settings.SD_API_URL:
        return None
    
    payload: Dict[str, Any] = {
        "init_images": [b64_image],
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "sampler_name": "DPM++ 2M Karras",
        "steps": 30,
        "cfg_scale": 6,
        "denoising_strength": 0.48,
        "width": out_width,
        "height": out_height,
        "restore_faces": True,
        "seed": -1,
    }
    if getattr(settings, "SD_MODEL_CHECKPOINT", None):
        payload["override_settings"] = {"sd_model_checkpoint": settings.SD_MODEL_CHECKPOINT}

    headers: Dict[str, str] = {}
    if settings.SD_API_AUTH_HEADER:
        headers["Authorization"] = settings.SD_API_AUTH_HEADER

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                str(settings.SD_API_URL).rstrip("/") + "/sdapi/v1/img2img",
                json=payload,
                headers=headers,
            )
        resp.raise_for_status()
        data = resp.json()
        images = data.get("images") or []
        if not images:
            return None

        image_b64 = images[0]
        image_bytes = base64.b64decode(image_b64.split(",", 1)[-1])
        return image_bytes
    except Exception as e:
        print(f"SD_WEBUI_API_ERROR: {repr(e)}")
        return None


@router.post("/avatar/generate-character")
async def generate_character_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Generate a realistic avatar from the user's uploaded photo.
    
    Tries multiple backends in order:
    1. Replicate API (cloud, recommended - set REPLICATE_API_TOKEN)
    2. Local SD WebUI (set SD_API_URL)
    
    Returns a realistic, face-preserving portrait.
    """
    if not current_user.avatar_photo_path:
        raise HTTPException(status_code=400, detail="Please upload a profile photo first.")

    photo_path = Path(current_user.avatar_photo_path)
    if not photo_path.exists():
        raise HTTPException(status_code=400, detail="Stored photo file not found on server.")

    # Read and prepare image
    with open(photo_path, "rb") as f:
        img_bytes = f.read()
    b64_image = base64.b64encode(img_bytes).decode("utf-8")

    # Preserve aspect ratio and use SD-friendly dimensions
    out_width, out_height = _image_size_sd_friendly(photo_path, max_side=768)

    # Realistic, likeness-preserving prompt
    prompt = (
        "professional portrait of this person, same face, same identity, realistic photo, "
        "soft studio lighting, clean neutral background, high quality, sharp focus, "
        "friendly expression, natural skin, detailed eyes"
    )
    negative_prompt = (
        "anime, cartoon, illustration, painting, deformed, ugly, bad anatomy, "
        "extra limbs, disfigured, blurry, low quality, oversaturated, cartoon face"
    )

    # Try Replicate first (best quality), then fall back to local SD WebUI
    image_bytes = None
    
    if settings.REPLICATE_API_TOKEN:
        image_bytes = await _generate_with_replicate(
            photo_path, prompt, negative_prompt, out_width, out_height
        )
    
    if not image_bytes and settings.SD_API_URL:
        image_bytes = await _generate_with_sd_webui(
            b64_image, prompt, negative_prompt, out_width, out_height
        )
    
    if not image_bytes:
        raise HTTPException(
            status_code=500,
            detail=(
                "No image generation service configured. "
                "Set REPLICATE_API_TOKEN (recommended) or SD_API_URL in .env"
            ),
        )

    # Save the generated avatar
    avatar_filename = f"{current_user.id}_avatar.png"
    avatar_path = UPLOAD_DIR / "avatars" / avatar_filename
    with open(avatar_path, "wb") as out:
        out.write(image_bytes)

    # Store in user's avatar_config JSON
    config: Dict[str, Any] = current_user.avatar_config or {}
    config["character_image_url"] = f"/uploads/avatars/{avatar_filename}"
    current_user.avatar_config = config
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Character avatar generated",
        "character_image_url": current_user.avatar_config.get("character_image_url"),
    }
