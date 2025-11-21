from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import auth as auth_router

# Create DB tables on startup (simple dev approach)
Base.metadata.create_all(bind=engine)

settings = get_settings()

app = FastAPI(title="Career Counseling Platform Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.backend_cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}