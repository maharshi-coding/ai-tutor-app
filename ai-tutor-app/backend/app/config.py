from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings
from typing import Optional, List


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
    
    # Optional avatar video generation service (image + text/audio -> video)
    AVATAR_VIDEO_API_URL: Optional[AnyHttpUrl] = None
    AVATAR_VIDEO_API_KEY: Optional[str] = None

    # Ollama (local LLM – free, open-source)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    # Kokoro TTS (local text-to-speech)
    KOKORO_API_URL: str = "http://localhost:8880"

    # SadTalker (local talking-head avatar video)
    SADTALKER_API_URL: str = "http://localhost:8870"
    SADTALKER_REF_IMAGE: Optional[str] = None  # Path to default avatar reference image

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
