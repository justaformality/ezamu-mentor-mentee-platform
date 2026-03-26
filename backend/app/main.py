from __future__ import annotations

import os
import json
import shutil

from datetime import datetime, timezone, date, time
from pathlib import Path
from typing import Any, Dict, Optional, List

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Date, Time, ForeignKey, Boolean, Table
from fastapi.staticfiles import StaticFiles
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
    profile_pic_url = Column(String, nullable=True)  # URL or path to profile picture
    archetype = Column(String, nullable=True)

    coachID = Column(Integer, ForeignKey("users.id"), nullable = True)
    parentID = Column(Integer, ForeignKey("users.id"), nullable = True)
    peerID = Column(Integer, ForeignKey("users.id"), nullable = True)

    coach = relationship("User", remote_side=[id], foreign_keys=[coachID], backref="students")
    parent = relationship("User", remote_side=[id], foreign_keys=[parentID], backref="children")
    peer = relationship("User", remote_side=[id], foreign_keys=[peerID], backref="peers")
    action_items = relationship("ActionItem", back_populates="user")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key = True, index = True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable = False)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable = False)
    title = Column(String, nullable = False)
    scheduledAt = Column(DateTime, nullable = False)

    student = relationship("User", foreign_keys =[student_id], backref="student_appointments")
    coach = relationship("User", foreign_keys = [coach_id], backref="coach_appointments")

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String, nullable = False)
    completed = Column(Boolean, default = False)

    user = relationship("User", back_populates="action_items")

class CoachAvailability(Base):
    __tablename__ = "coach_availability"

    id = Column(Integer, primary_key = True, index = True)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable = False)
    date = Column(Date, nullable = False)
    start_time = Column(Time, nullable = False)
    end_time = Column(Time, nullable = False)

    coach = relationship("User", backref="availability_slots")

class ChangeEmailIn(BaseModel):
    new_email: EmailStr

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
    if role in {"user", "student"}:
        return "student"
    if role in {"coach"}:
        return "coach"
    if role in {"admin"}:
        return "admin"
    if role in {"parent"}:
        return "parent"

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
    email: EmailStr
    password: str = Field(min_length=4)
    fullName: Optional[str] = None
    role: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=4)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    fullName: Optional[str] = None
    createdAt: str
    profile_pic_url: Optional[str] = None
    archetype: Optional[str] = None

class ArchetypeIn(BaseModel):
    archetype: str

class AvailabilityIn(BaseModel):
    date: str # YYYY-MM-DD
    start_time: str # HH:MM
    end_time: str # HH:MM

class AvailabilityOut(BaseModel):
    id: int
    date: str
    start_time: str
    end_time: str

class BookAppointmentIn(BaseModel):
    student_id: int
    coach_id: int
    date: str 
    time: str

app = FastAPI(title="EZAMU POC Backend (DB)")

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

static_path = os.path.join(os.path.dirname(__file__), "..", "static")
app.mount("/static", StaticFiles(directory=static_path), name="static")

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
    email = str(user_in.email)
    user = db.query(User).filter(User.email == email).first()

    if not user or not pwd_context.verify(user_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return UserOut(
        id = user.id,
        email = user.email,
        role = user.role,
        fullName = user.fullName or None,
        createdAt = user.createdAt.isoformat(),
        profile_pic_url = user.profile_pic_url if hasattr(user, 'profile_pic_url') else None,
        archetype = user.archetype if hasattr(user, 'archetype') else None
    )


# Backwards-compat aliases (so older frontend code that used /api/signup keeps working)
@app.post("/api/signup", response_model=UserOut, status_code=201)
def signup_alias(user_in: RegisterIn, db: Session = Depends(get_db)):
    return register(user_in, db)

@app.post("/api/login", response_model=UserOut)
def login_alias(user_in: LoginIn, db: Session = Depends(get_db)):
    return login(user_in, db)

# list of coaches
@app.get("/api/coaches")
def get_coaches(db: Session = Depends(get_db)):
    coaches = db.query(User).filter(User.role == "coach").all()
    result = []
    for coach in coaches:
        # If the path is already absolute (starts with /static/), use as is; otherwise, prepend
        if coach.profile_pic_url and coach.profile_pic_url.startswith("/static/"):
            profile_pic_url = coach.profile_pic_url
        else:
            profile_pic_url = None
        result.append({
            "id": coach.id,
            "name": coach.fullName or coach.email,
            "description": coach.archetype or "Coach at EZAMU platform",
            "profile_pic_url": profile_pic_url
        })
    return result

@app.get("/users/{user_id}/appointments")
def get_appointments(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code = 404, detail = "User not found")
    
    if user.role == "student":
        appointments = db.query(Appointment).filter(Appointment.student_id == user_id).all()
    elif user.role == "coach":
        appointments = db.query(Appointment).filter(Appointment.coach_id == user_id).all()
    else:
        appointments = []

    return [
        {
            "id": a.id, 
            "student_id": a.student_id,
            "coach_id": a.coach_id,
            "title": a.title, 
            "scheduledAt": a.scheduledAt.isoformat()
        }
        for a in appointments
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

@app.post("/users/{user_id}/change_password")
def change_password(user_id: int, data: ChangePasswordIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not pwd_context.verify(data.current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    user.password_hash = pwd_context.hash(data.new_password)
    db.commit()
    db.refresh(user)
    return {"message": "Password updated successfully"}


@app.post("/users/{user_id}/change_email/")
def change_email(user_id: int, data: ChangeEmailIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_email = str(data.new_email)

    # Only block if the new email (case-sensitive) matches another user's email
    existing = db.query(User).filter(
        User.id != user.id,
        User.email == new_email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user.email = new_email
    db.commit()
    db.refresh(user)
    return {"message": "Email updated successfully", "user_id": user.id, "new_email": user.email}

# Profile picture upload endpoint
@app.post("/users/{user_id}/upload_profile_pic/")
def upload_profile_pic(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if file.content_type != "image/png":
        raise HTTPException(status_code=400, detail="Only PNG files are allowed")
    # Save file to static/profile_pics/{user_id}.png
    static_dir = os.path.join(os.path.dirname(__file__), "..", "static", "profile_pics")
    os.makedirs(static_dir, exist_ok=True)
    file_path = os.path.join(static_dir, f"{user_id}.png")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Store relative URL (frontend can use /static/profile_pics/{user_id}.png)
    rel_url = f"/static/profile_pics/{user_id}.png"
    user.profile_pic_url = rel_url
    db.commit()
    db.refresh(user)
    return {"message": "Profile picture updated", "profile_pic_url": rel_url}

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

@app.get("/parents/{parent_id}/students")
def get_parent_students(parent_id: int, db: Session = Depends(get_db)):
    parent = db.query(User).filter(User.id == parent_id, User.role == "parent").first()
    if not parent:
        raise HTTPException(status_code = 404, detail = "Parent not found")
    
    return [
        {
            "id": student.id,
            "email": student.email,
            "fullName": student.fullName,
            "createdAt": student.createdAt.isoformat()
        }
        for student in parent.children
    ]

@app.get("/peers/{peer_id}/students")
def get_peer_students(peer_id: int, db: Session = Depends(get_db)):
    peer = db.query(User).filter(User.id == peer_id, User.role == "student").first()
    if not peer:
        raise HTTPException(status_code = 404, detail = "Peer not found")
    
    return [
        {
            "id": student.id,
            "email": student.email,
            "fullName": student.fullName,
            "createdAt": student.createdAt.isoformat()
        }
        for student in peer.peers
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

@app.post("/students/{student_id}/assign_parent/{parent_id}")
def assign_parent(student_id: int, parent_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    parent = db.query(User).filter(User.id == parent_id, User.role == "parent").first()
    if not student:
        raise HTTPException(status_code = 404, detail = "Student not found")
    if not parent:
        raise HTTPException(status_code = 404, detail = "Parent not found")
    
    student.parentID = parent_id
    db.commit()
    db.refresh(student)

    return {"message": "Parent assigned successfully"}

@app.post("/students/{student_id}/assign_peer/{peer_id}")
def assign_peer(student_id: int, peer_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    peer = db.query(User).filter(User.id == peer_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code = 404, detail = "Student not found")
    if not peer:
        raise HTTPException(status_code = 404, detail = "Peer not found")
    if student_id == peer_id:
        raise HTTPException(status_code = 400, detail = "Cannot assign a user to be their own peer")
    
    if student.peerID and student.peerID != peer_id:
        old_peer = db.query(User).filter(User.id == student.peerID).first()
        if old_peer:
            old_peer.peerID = None
        student.peerID = None
        db.flush()
    
    if peer.peerID and peer.peerID != student_id:
        other_peer = db.query(User).filter(User.id == peer.peerID).first()
        if other_peer:
            other_peer.peerID = None
        peer.peerID = None
        db.flush()
    
    student.peerID = peer_id
    peer.peerID = student_id
    db.commit()
    db.refresh(student)
    db.refresh(peer)

    return {"message": "Peer assigned successfully"}

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

@app.post("/coaches/{coach_id}/availability", response_model = AvailabilityOut)
def add_availability(coach_id: int, slot: AvailabilityIn, db: Session = Depends(get_db)):
    coach = db.query(User).filter(User.id == coach_id, User.role == "coach").first()
    if not coach:
        raise HTTPException(status_code = 404, detail = "Coach not found")
    try:  
        parsed_date = datetime.strptime(slot.date, "%Y-%m-%d").date()
        parsed_start = datetime.strptime(slot.start_time, "%H:%M").time()
        parsed_end = datetime.strptime(slot.end_time, "%H:%M").time()
    except ValueError:
        raise HTTPException(status_code=400, detail = "Invalid date or time format") 
    
    if parsed_start >= parsed_end:
        raise HTTPException(status_code = 400, detail = "Start time must be before end time")
    
    appointment_slot = CoachAvailability(
        coach_id = coach_id,
        date = parsed_date,
        start_time = parsed_start,
        end_time = parsed_end,
    )

    db.add(appointment_slot)
    db.commit()
    db.refresh(appointment_slot)

    return AvailabilityOut(
        id = appointment_slot.id,
        date = appointment_slot.date.isoformat(),
        start_time = appointment_slot.start_time.strftime("%H:%M"),
        end_time = appointment_slot.end_time.strftime("%H:%M")
    )

@app.get("/coaches/{coach_id}/availability", response_model=List[AvailabilityOut])
def get_availability(coach_id: int, db: Session = Depends(get_db)):
    coach = db.query(User).filter(User.id == coach_id, User.role == "coach").first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")

    return [
        AvailabilityOut(
            id=slot.id,
            date=slot.date.isoformat(),
            start_time=slot.start_time.strftime("%H:%M"),
            end_time=slot.end_time.strftime("%H:%M")
        )
        for slot in coach.availability_slots
    ]

@app.get("/coaches/filter")
def filter_coaches(date: str, time: str, db: Session = Depends(get_db)):
    try:
        parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
        parsed_time = datetime.strptime(time, "%H:%M").time()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date or time format")

    available_coaches = (
        db.query(User)
        .join(CoachAvailability)
        .filter(
            User.role == "coach",
            CoachAvailability.date == parsed_date,
            CoachAvailability.start_time <= parsed_time,
            CoachAvailability.end_time >= parsed_time
        )
        .all()
    )

    return [
        {
            "id": coach.id,
            "email": coach.email,
            "fullName": coach.fullName
        }
        for coach in available_coaches
    ]

@app.post("/appointments/book")
def book_appointment(booking: BookAppointmentIn, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == booking.student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    coach = db.query(User).filter(User.id == booking.coach_id, User.role == "coach").first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")

    try:
        requested_date = datetime.strptime(booking.date, "%Y-%m-%d").date()
        requested_time = datetime.strptime(booking.time, "%H:%M").time()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date or time format")

    slot = (
        db.query(CoachAvailability)
        .filter(
            CoachAvailability.coach_id == booking.coach_id,
            CoachAvailability.date == requested_date,
            CoachAvailability.start_time <= requested_time,
            CoachAvailability.end_time > requested_time
        )
        .first()
    )

    if not slot:
        raise HTTPException(status_code=400, detail="Coach not available at this time")
    
    appointment_datetime = datetime.combine(requested_date, requested_time)
    new_appointment = Appointment(
        student_id = booking.student_id,
        coach_id = booking.coach_id,
        title = "Coaching Session",
        scheduledAt = appointment_datetime
    )

    db.add(new_appointment)
    db.commit()
    db.delete(slot)
    db.commit()
    db.refresh(new_appointment)

    return {
        "id": new_appointment.id,
        "student_id": new_appointment.student_id,
        "coach_id": new_appointment.coach_id,
        "title": new_appointment.title,
        "scheduledAt": new_appointment.scheduledAt.isoformat()
    }

@app.post("/users/{user_id}/set_archetype")
def set_archetype(user_id: int, data: ArchetypeIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code = 404, detail = "User not found")
    
    user.archetype = data.archetype
    db.commit()
    db.refresh(user)
    
    return {"message": "Archetype updated successfully"}

@app.get("/users/{user_id}/archetype")
def get_archetype(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"user_id": user.id, "archetype": user.archetype}