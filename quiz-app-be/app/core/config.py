"""
Application Configuration
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings from environment variables"""

    # Application
    APP_NAME: str = Field(default="Quiz App", env="APP_NAME")
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    API_V1_PREFIX: str = Field(default="/api/v1", env="API_V1_PREFIX")

    # Server
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")

    # Database
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/quiz_app",
        env="DATABASE_URL"
    )

    # Redis
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        env="REDIS_URL"
    )

    # JWT Authentication
    SECRET_KEY: str = Field(
        default="your-super-secret-key-change-this-in-production",
        env="SECRET_KEY"
    )
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        env="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(
        default=7,
        env="REFRESH_TOKEN_EXPIRE_DAYS"
    )

    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        env="CORS_ORIGINS"
    )
    CORS_ALLOW_CREDENTIALS: bool = Field(default=True, env="CORS_ALLOW_CREDENTIALS")
    CORS_ALLOW_METHODS: List[str] = Field(default=["*"], env="CORS_ALLOW_METHODS")
    CORS_ALLOW_HEADERS: List[str] = Field(default=["*"], env="CORS_ALLOW_HEADERS")

    # MinIO / S3
    MINIO_URL: str = Field(default="localhost:9000", env="MINIO_URL")
    MINIO_ACCESS_KEY: str = Field(default="minioadmin", env="MINIO_ACCESS_KEY")
    MINIO_SECRET_KEY: str = Field(default="minioadmin", env="MINIO_SECRET_KEY")
    MINIO_BUCKET_NAME: str = Field(default="flashcards", env="MINIO_BUCKET_NAME")
    MINIO_PUBLIC_URL: str = Field(default="http://localhost:9000", env="MINIO_PUBLIC_URL")
    MINIO_SECURE: bool = Field(default=False, env="MINIO_SECURE")

    # OpenAI
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    OPENAI_MODEL: str = Field(default="gpt-4", env="OPENAI_MODEL")
    OPENAI_MAX_TOKENS: int = Field(default=500, env="OPENAI_MAX_TOKENS")

    # Google Cloud TTS
    GOOGLE_APPLICATION_CREDENTIALS: str = Field(default="", env="GOOGLE_APPLICATION_CREDENTIALS")
    TTS_LANGUAGE_CODE: str = Field(default="en-US", env="TTS_LANGUAGE_CODE")
    TTS_VOICE_NAME: str = Field(default="en-US-Neural2-F", env="TTS_VOICE_NAME")

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = Field(default=10, env="MAX_UPLOAD_SIZE_MB")
    ALLOWED_IMAGE_TYPES: List[str] = Field(
        default=["image/jpeg", "image/png", "image/gif", "image/webp"],
        env="ALLOWED_IMAGE_TYPES"
    )
    ALLOWED_AUDIO_TYPES: List[str] = Field(
        default=["audio/mpeg", "audio/wav", "audio/ogg"],
        env="ALLOWED_AUDIO_TYPES"
    )

    # Celery
    CELERY_BROKER_URL: str = Field(
        default="redis://localhost:6379/0",
        env="CELERY_BROKER_URL"
    )
    CELERY_RESULT_BACKEND: str = Field(
        default="redis://localhost:6379/0",
        env="CELERY_RESULT_BACKEND"
    )

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")

    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FILE: str = Field(default="app.log", env="LOG_FILE")

    # Spaced Repetition
    DEFAULT_EASE_FACTOR: float = Field(default=2.5, env="DEFAULT_EASE_FACTOR")
    MIN_EASE_FACTOR: float = Field(default=1.3, env="MIN_EASE_FACTOR")
    MAX_EASE_FACTOR: float = Field(default=2.5, env="MAX_EASE_FACTOR")

    # Achievements
    ENABLE_ACHIEVEMENTS: bool = Field(default=True, env="ENABLE_ACHIEVEMENTS")
    CHECK_ACHIEVEMENTS_INTERVAL_SECONDS: int = Field(
        default=300,
        env="CHECK_ACHIEVEMENTS_INTERVAL_SECONDS"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Convert string lists to actual lists if needed
        if isinstance(self.CORS_ORIGINS, str):
            self.CORS_ORIGINS = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        if isinstance(self.CORS_ALLOW_METHODS, str):
            self.CORS_ALLOW_METHODS = [method.strip() for method in self.CORS_ALLOW_METHODS.split(",")]
        if isinstance(self.CORS_ALLOW_HEADERS, str):
            self.CORS_ALLOW_HEADERS = [header.strip() for header in self.CORS_ALLOW_HEADERS.split(",")]
        if isinstance(self.ALLOWED_IMAGE_TYPES, str):
            self.ALLOWED_IMAGE_TYPES = [type_.strip() for type_ in self.ALLOWED_IMAGE_TYPES.split(",")]
        if isinstance(self.ALLOWED_AUDIO_TYPES, str):
            self.ALLOWED_AUDIO_TYPES = [type_.strip() for type_ in self.ALLOWED_AUDIO_TYPES.split(",")]


# Create settings instance
settings = Settings()
