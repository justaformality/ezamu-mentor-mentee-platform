from __future__ import annotations

import os
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional, List

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext

from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")


engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key = True, index = True)
    email = Column(String, unique = True, nullable = False, index = True)
    password_hash = Column(String, nullable = False)
    role = Column(String, default = "student")
    fullName = Column(String, default = "")
    createdAt = Column(DateTime, default=datetime.now(timezone.utc))

    coachID = Column(Integer, ForeignKey("users.id"), nullable = True)

    coach = relationship("User", remote_side=[id], backref="students")
    appointments = relationship("Appointment", back_populates="user")
    action_items = relationship("ActionItem", back_populates="user")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable = False)
    scheduledAt = Column(DateTime, nullable = False)

    user = relationship("User", back_populates="appointments")

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String, nullable = False)
    completed = Column(Boolean, default = False)

    user = relationship("User", back_populates="action_items")

Base.metadata.create_all(bind=engine)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _normalize_email(email: str) -> str:
    return email.strip().lower()

def _map_role(payload: Dict[str, Any]) -> str:
    # Accept multiple naming conventions from different frontends
    role = (
        payload.get("role")
        or payload.get("accountType")
        or payload.get("account_type")
        or payload.get("accounttype")
    )
    if role is None:
        return "student"

    role = str(role).strip().lower()

    # Normalize common variants
    # user -> student (matches your existing backend naming)
    if role in {"user", "student"}:
        return "student"
    if role in {"coach"}:
        return "coach"
    if role in {"admin"}:
        return "admin"

    # If unknown, still store it (but this keeps your data consistent)
    return "student"


def _map_full_name(payload: Dict[str, Any]) -> str:
    val = (
        payload.get("fullName")
        or payload.get("full_name")
        or payload.get("fullname")
        or ""
    )
    return str(val).strip()


class RegisterIn(BaseModel):
    # Keep strict for email/pass; other fields are optional
    email: EmailStr
    password: str = Field(min_length=4)

    # Optional fields that your frontend might send
    fullName: Optional[str] = None
    role: Optional[str] = None
    accountType: Optional[str] = None
    account_type: Optional[str] = None
    full_name: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    fullName: Optional[str] = None
    createdAt: str


app = FastAPI(title="EZAMU POC Backend (DB)")

# Adjust these if your frontend runs on a different origin
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health():
    return {"ok": True, "message": "backend up"}


@app.post("/auth/register", response_model=UserOut, status_code=201)
def register(user_in: RegisterIn, db: Session = Depends(get_db)):
    email = _normalize_email(str(user_in.email))
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code = 400, detail="Email is already registered")

    role = _map_role(user_in.model_dump())
    full_name = _map_full_name(user_in.model_dump())

    new_user = User(
        email = email,
        password_hash = pwd_context.hash(user_in.password),
        role = role,
        fullName = full_name,
        createdAt = datetime.now(timezone.utc)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserOut(
        id = new_user.id,
        email = new_user.email,
        role = new_user.role,
        fullName = new_user.fullName,
        createdAt = new_user.createdAt.isoformat()
    )


@app.post("/auth/login", response_model=UserOut)
def login(user_in: LoginIn, db: Session = Depends(get_db)):
    email = _normalize_email(user_in.email)
    user = db.query(User).filter(User.email == email).first()

    if not user or not pwd_context.verify(user_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return UserOut(
        id = user.id,
        email = user.email,
        role = user.role,
        fullName = user.fullName or None,
        createdAt = user.createdAt.isoformat()
    )


# Backwards-compat aliases (so older frontend code that used /api/signup keeps working)
@app.post("/api/signup", response_model=UserOut, status_code=201)
def signup_alias(user_in: RegisterIn, db: Session = Depends(get_db)):
    return register(user_in, db)

@app.post("/api/login", response_model=UserOut)
def login_alias(user_in: LoginIn, db: Session = Depends(get_db)):
    return login(user_in, db)

@app.get("/users/{user_id}/appointments")
def get_appointments(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code = 404, detail = "User not found")
    
    return [
        {"id": a.id, "title": a.title, "scheduledAt": a.scheduledAt.isoformat()}
        for a in user.appointments
    ]

@app.get("/users/{user_id}/action_items")
def get_action_items(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code = 404, detail = "User not found")
    
    return [
        {"id": ai.id, "description": ai.description, "completed": ai.completed}
        for ai in user.action_items
    ]

@app.get("/coaches/{coach_id}/students")
def get_coach_students(coach_id: int, db: Session = Depends(get_db)):
    coach = db.query(User).filter(User.id == coach_id, User.role == "coach").first()
    if not coach:
        raise HTTPException(status_code = 404, detail = "Coach not found")
    
    return [
        {
            "id": student.id,
            "email": student.email,
            "fullName": student.fullName,
            "createdAt": student.createdAt.isoformat()
        }
        for student in coach.students
    ]

@app.post("/students/{student_id}/assign_coach/{coach_id}")
def assign_coach(student_id: int, coach_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    coach = db.query(User).filter(User.id == coach_id, User.role =="coach").first()
    if not student:
        raise HTTPException(status_code = 404, detail = "Student not found")
    if not coach:
        raise HTTPException(status_code = 404, detail = "Coach not found")
    
    student.coachID = coach_id
    db.commit()
    db.refresh(student)

    return {"message": "Coach assigned successfully"}

@app.get("/coaches/{coach_id}/students/{student_id}/action_items")
def get_student_action_items(coach_id: int, student_id: int, db: Session = Depends(get_db)):
    coach = db.query(User).filter(User.id == coach_id, User.role =="coach").first()
    student = db.query(User).filter(User.id == student_id, User.coachID == coach_id).first()
    if not coach:
        raise HTTPException(status_code = 404, detail = "Coach not found")
    if not student:
        raise HTTPException(status_code = 403, detail = "Student is not assigned to this coach")
    
    return [
        {
            "id": ai.id,
            "description": ai.description,
            "completed": ai.completed
        }
        for ai in student.action_items
    ]

    