from functools import lru_cache
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()


class Settings(BaseModel):
    database_url: str = os.getenv("DATABASE_URL", "")
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    backend_cors_origins: str = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:5173")


@lru_cache
def get_settings() -> Settings:
    return Settings()
