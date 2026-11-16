from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    PROJECT_NAME: str = "ScamShield"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default="development")
    
    # Database Configuration (psycopg2 dialect)
    DATABASE_URL: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/scamshield",
        description="PostgreSQL connection string with psycopg2 driver"
    )
    
    # Supported Languages for Senior Citizens
    SUPPORTED_LANGUAGES: List[str] = ["en", "hi", "mr"]
    DEFAULT_LANGUAGE: str = "en"
    
    # CORS Configuration for React Native development
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Threat Database Sync Settings (for Android Room local sync)
    THREAT_DB_SYNC_BATCH_SIZE: int = 500

    # Scam Detection Engine Configurable Thresholds & Limits
    MAX_MESSAGE_LENGTH: int = 2000
    SCORE_THRESHOLD_HIGH: int = 70
    SCORE_THRESHOLD_CAUTION: int = 30


settings = Settings()
