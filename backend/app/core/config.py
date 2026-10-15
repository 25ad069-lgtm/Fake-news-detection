import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings:
    APP_NAME = os.getenv("APP_NAME", "TruthLens AI")
    APP_ENV = os.getenv("APP_ENV", "development")
    DEBUG = os.getenv("DEBUG", "true").lower() == "true"
    BACKEND_CORS_ORIGINS = [
        origin.strip() for origin in os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()
    ]
    MODEL_PATH = os.getenv("MODEL_PATH", str(BASE_DIR / "app" / "ml" / "models" / "news_classifier.joblib"))
    MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "20000"))
    MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "5"))
    MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
    RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()
