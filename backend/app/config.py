from pathlib import Path
from typing import Optional, List

from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings


def _default_ollama_base_url() -> str:
    """
    When the API runs inside Docker, localhost points at the container itself.
    Use Docker's host gateway name so a host-run Ollama instance is reachable.
    """
    if Path("/.dockerenv").exists():
        return "http://host.docker.internal:11434"
    return "http://localhost:11434"


class Settings(BaseSettings):
    # Database
    # Default to SQLite for easy local dev; override in .env for Postgres/Docker.
    DATABASE_URL: str = "sqlite:///./ai_tutor.db"

    # Auth / JWT
    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI APIs (all optional – you provide keys in .env)
    OPENAI_API_KEY: Optional[str] = None
    HUGGINGFACE_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-pro"
    # OpenRouter / DeepSeek
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_MODEL: str = "deepseek/deepseek-r1-0528:free"
    # OpenRouter often requires these for non-localhost keys (avoids 401 / empty content)
    OPENROUTER_REFERER: Optional[str] = None   # e.g. https://yourapp.com or http://localhost:3000
    OPENROUTER_APP_TITLE: Optional[str] = None  # e.g. "AI Tutor App"

    # External generation services (optional)
    # Option 1: Local Stable Diffusion WebUI (Automatic1111)
    SD_API_URL: Optional[AnyHttpUrl] = None
    SD_API_AUTH_HEADER: Optional[str] = None  # e.g. "Bearer XXX" if needed
    SD_MODEL_CHECKPOINT: Optional[str] = None  # e.g. "Realistic_Vision_V5.1_fp16.safetensors"
    
    # Option 2: Cloud API - Replicate (recommended for better quality)
    REPLICATE_API_TOKEN: Optional[str] = None  # Get from https://replicate.com/account/api-tokens
    REPLICATE_MODEL: str = "bxclib2/flux_img2img"  # img2img model for realistic face-preserving generation
    
    # Option 3: Other cloud services (Civitai, etc.) - can be added later
    CIVITAI_API_KEY: Optional[str] = None  # If Civitai adds img2img support
    
    # Ollama (local LLM – free, open-source)
    OLLAMA_BASE_URL: str = _default_ollama_base_url()
    OLLAMA_MODEL: str = "llama3"

    # TTS provider selection: auto | piper | coqui | kokoro
    TTS_PROVIDER: str = "coqui"
    TTS_REQUEST_TIMEOUT_SECONDS: int = 120
    PIPER_MODEL_PATH: str = "./models/en_US-lessac-medium.onnx"
    PIPER_TTS_URL: Optional[str] = None  # e.g. http://localhost:5001/synthesize
    PIPER_DEFAULT_VOICE: str = "en_US-lessac-medium"
    COQUI_TTS_URL: Optional[str] = None  # e.g. http://localhost:5002/api/tts
    COQUI_DEFAULT_VOICE: str = "tts_models/en/ljspeech/tacotron2-DDC"

    # Kokoro TTS (legacy fallback)
    KOKORO_API_URL: str = "http://localhost:8880"
    KOKORO_DEFAULT_VOICE: str = "af_heart"

    # Hedra avatar video generation
    HEDRA_API_KEY: Optional[str] = None
    HEDRA_API_BASE_URL: str = "https://api.hedra.com/web-app/public"
    HEDRA_VIDEO_MODEL_ID: str = "d1dd37a3-e39a-4854-a298-6510289f9cf2"
    HEDRA_VIDEO_RESOLUTION: str = "540p"
    HEDRA_VIDEO_ASPECT_RATIO: str = "9:16"
    HEDRA_VIDEO_PROMPT: str = (
        "A friendly tech presenter speaking clearly to camera with natural head "
        "movement, clean eye contact, and subtle expressive motion."
    )
    HEDRA_REQUEST_TIMEOUT_SECONDS: int = 120
    VIDEO_STORAGE_PATH: str = "./uploads/generated_videos"
    MAX_AVATAR_VIDEO_DURATION_SECONDS: int = 60
    AVATAR_TTS_SPEED: float = 1.08

    # Daily tech briefing automation
    ENABLE_DAILY_VIDEO_SCHEDULER: bool = True
    DAILY_VIDEO_RUN_ON_STARTUP: bool = False
    DAILY_VIDEO_HOUR: int = 8
    DAILY_VIDEO_MINUTE: int = 0
    DAILY_VIDEO_TIMEZONE: str = "America/Chicago"
    TECH_UPDATES_LOOKBACK_DAYS: int = 2
    TECH_UPDATES_MAX_ITEMS: int = 4
    TECH_UPDATES_FEEDS: str = (
        "https://techcrunch.com/feed/,"
        "https://www.theverge.com/rss/index.xml,"
        "https://feeds.arstechnica.com/arstechnica/index"
    )

    # File Upload Settings
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10485760  # 10MB
    MAX_COURSE_FILE_SIZE: int = 52428800  # 50MB for course documents
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS (comma-separated). Example:
    # CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    class Config:
        env_file = ".env"


settings = Settings()
