from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "politicaid"
    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "change-me"
    DEBUG: bool = True
    ALLOWED_ORIGINS: List[str] = ["http://localhost:4200"]

    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "politicaid_db"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/politicaid_db"

    OPENAI_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""
    NLP_MODEL_PATH: str = "./models/politicaid_nlp"
    SENTIMENT_MODEL: str = "distilbert-base-uncased-finetuned-sst-2-english"
    SUMMARIZATION_MODEL: str = "facebook/bart-large-cnn"

    CONGRESS_API_KEY: str = ""
    PROPUBLICA_API_KEY: str = ""

    JWT_SECRET: str = "change-me-jwt"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    REDIS_URL: str = "redis://localhost:6379/0"
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()