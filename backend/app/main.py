from __future__ import annotations

import os
import json
import shutil

from datetime import datetime, timezone, date, time, timedelta
from pathlib import Path
from typing import Any, Dict, Optional, List

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Date, Time, ForeignKey, Boolean, Table
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session

from pydantic import Field

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")


engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

DEMO_ALL_STUDENTS_FOR_COACH = True

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

    student_bio = Column(String, nullable=True)
    student_goals_json = Column(String, nullable=True)   # store list as JSON string
    student_age = Column(String, nullable=True)

    coach_bio = Column(String, nullable=True)
    coach_expertise_json = Column(String, nullable=True)
    coach_age = Column(String, nullable=True)

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
    title = Column(String, nullable = False, default = "Untitled Task")
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

class AssessmentResponse(Base):
    __tablename__ = "assessment_responses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assessment_name = Column(String, nullable=False)
    responses_json = Column(String, nullable=False)   # store JSON as string
    score = Column(String, nullable=True)
    submitted_at = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)

    student = relationship("User", backref="assessment_responses")

class ParentInvite(Base):
    __tablename__ = "parent_invites"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_email = Column(String, nullable=False)
    parent_full_name = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending / accepted
    created_at = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)

    student = relationship("User", foreign_keys=[student_id], backref="parent_invites")

class ParentInviteIn(BaseModel):
    parent_email: EmailStr
    parent_full_name: Optional[str] = None

class ParentInviteOut(BaseModel):
    id: int
    student_id: int
    parent_email: EmailStr
    parent_full_name: Optional[str] = None
    status: str
    created_at: str

class PeerAssignRequest(BaseModel):
    actor_id: int

class StudentProfileIn(BaseModel):
    age: Optional[str] = None
    bio: Optional[str] = None
    goals: List[str] = Field(default_factory=list)

class StudentProfileOut(BaseModel):
    user_id: int
    fullName: Optional[str] = None
    age: Optional[str] = None
    bio: Optional[str] = None
    goals: List[str] = Field(default_factory=list)

class CoachProfileIn(BaseModel):
    age: Optional[str] = None
    bio: Optional[str] = None
    expertise: List[str] = Field(default_factory=list)

class CoachProfileOut(BaseModel):
    user_id: int
    fullName: Optional[str] = None
    age: Optional[str] = None
    bio: Optional[str] = None
    expertise: List[str] = Field(default_factory=list)

class CoachStudentDetailOut(BaseModel):
    id: int
    fullName: Optional[str] = None
    email: EmailStr
    age: Optional[str] = None
    bio: Optional[str] = None
    goals: List[str] = Field(default_factory=list)
    action_items: List[Dict[str, Any]]

class PeerStudentDetailOut(BaseModel):
    id: int
    fullName: Optional[str] = None
    email: EmailStr
    age: Optional[str] = None
    bio: Optional[str] = None
    goals: List[str] = Field(default_factory=list)
    action_items: List[Dict[str, Any]]

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


def _safe_int(value: Optional[str]) -> Optional[int]:
    if value is None:
        return None
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


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

class AssessmentResponseIn(BaseModel):
    assessment_name: str
    responses: Dict[str, Any]
    score: Optional[str] = None

class AssessmentResponseOut(BaseModel):
    id: int
    student_id: int
    assessment_name: str
    responses: Dict[str, Any]
    score: Optional[str] = None
    submitted_at: str

class ActionItemCreate(BaseModel):
    title: str
    description: str

class ActionItemOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    completed: bool

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
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
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
    email = _normalize_email(str(user_in.email))
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
        {"id": ai.id, "title": ai.title, "description": ai.description, "completed": ai.completed}
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
    new_email = _normalize_email(str(data.new_email))

    # Only block if the normalized new email matches another user's email
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

#for parents to search their kids
@app.get("/students/by_email")
def get_student_by_email(email: str = Query(...), db: Session = Depends(get_db)):
    normalized_email = _normalize_email(email)
    student = db.query(User).filter(User.email == normalized_email, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if student.profile_pic_url and student.profile_pic_url.startswith("/static/"):
        profile_pic_url = student.profile_pic_url
    else:
        profile_pic_url = None

    return {
        "id": student.id,
        "email": student.email,
        "role": student.role,
        "fullName": student.fullName,
        "createdAt": student.createdAt.isoformat(),
        "profile_pic_url": profile_pic_url,
        "archetype": student.archetype,
    }

@app.get("/coaches/{coach_id}/students")
def get_coach_students(coach_id: int, db: Session = Depends(get_db)):
    coach = db.query(User).filter(User.id == coach_id, User.role == "coach").first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")

    if DEMO_ALL_STUDENTS_FOR_COACH:
        students = db.query(User).filter(User.role == "student").all()
    else:
        students = coach.students

    return [
        {
            "id": student.id,
            "email": student.email,
            "fullName": student.fullName,
            "createdAt": student.createdAt.isoformat()
        }
        for student in students
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

@app.get("/parents/{parent_id}/students/{student_id}/progress")
def get_parent_student_progress(parent_id: int, student_id: int, db: Session = Depends(get_db)):
    parent = db.query(User).filter(User.id == parent_id, User.role == "parent").first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")

    student = db.query(User).filter(
        User.id == student_id,
        User.role == "student",
        User.parentID == parent_id
    ).first()
    if not student:
        raise HTTPException(status_code=403, detail="Student is not linked to this parent")

    appointments = db.query(Appointment).filter(Appointment.student_id == student_id).all()
    assessments = db.query(AssessmentResponse).filter(
        AssessmentResponse.student_id == student_id
    ).order_by(AssessmentResponse.submitted_at.desc()).all()

    return {
        "student": {
            "id": student.id,
            "fullName": student.fullName,
            "email": student.email,
            "archetype": student.archetype,
        },
        "action_items": [
            {
                "id": ai.id,
                "title": ai.title,
                "description": ai.description,
                "completed": ai.completed
            }
            for ai in student.action_items
        ],
        "appointments": [
            {
                "id": appt.id,
                "title": appt.title,
                "scheduledAt": appt.scheduledAt.isoformat(),
                "coach_id": appt.coach_id
            }
            for appt in appointments
        ],
        "assessments": [
            {
                "id": a.id,
                "assessment_name": a.assessment_name,
                "responses": json.loads(a.responses_json),
                "score": a.score,
                "submitted_at": a.submitted_at.isoformat(),
            }
            for a in assessments
        ]
    }

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
    if student.parentID and student.parentID != parent_id:
        raise HTTPException(status_code=400, detail="Student is already linked to a different parent")
    
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

@app.post("/students/{student_id}/assign_peer/{peer_id}/by/{actor_id}")
def assign_peer_by_staff(student_id: int, peer_id: int, actor_id: int, db: Session = Depends(get_db)):
    actor = db.query(User).filter(User.id == actor_id).first()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor not found")

    if actor.role not in {"coach", "admin"}:
        raise HTTPException(status_code=403, detail="Only coaches or admins can assign peers")

    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    peer = db.query(User).filter(User.id == peer_id, User.role == "student").first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not peer:
        raise HTTPException(status_code=404, detail="Peer not found")
    if student_id == peer_id:
        raise HTTPException(status_code=400, detail="Cannot assign a user to be their own peer")

    if actor.role == "coach" and student.coachID != actor.id:
        raise HTTPException(status_code=403, detail="Coach can only assign peers for their own students")

    # reuse your existing peer linking logic
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

    return {"message": "Peer assigned successfully by coach/admin"}

@app.post("/students/{student_id}/assessments", response_model=AssessmentResponseOut, status_code=201)
def save_assessment_response(student_id: int, data: AssessmentResponseIn, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    row = AssessmentResponse(
        student_id=student_id,
        assessment_name=data.assessment_name,
        responses_json=json.dumps(data.responses),
        score=data.score,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return AssessmentResponseOut(
        id=row.id,
        student_id=row.student_id,
        assessment_name=row.assessment_name,
        responses=json.loads(row.responses_json),
        score=row.score,
        submitted_at=row.submitted_at.isoformat(),
    )

@app.post("/students/{student_id}/parent/link_or_invite")
def link_or_invite_parent(student_id: int, data: ParentInviteIn, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    parent_email = _normalize_email(str(data.parent_email))

    if student.parentID:
        existing_linked_parent = db.query(User).filter(User.id == student.parentID, User.role == "parent").first()
        if existing_linked_parent and existing_linked_parent.email != parent_email:
            raise HTTPException(status_code=400, detail="Student is already linked to a different parent")

    existing_parent = db.query(User).filter(User.email == parent_email).first()

    if existing_parent:
        if existing_parent.role != "parent":
            raise HTTPException(status_code=400, detail="Existing user with this email is not a parent")

        student.parentID = existing_parent.id
        db.commit()
        db.refresh(student)

        return {
            "message": "Existing parent linked successfully",
            "student_id": student.id,
            "parent_id": existing_parent.id
        }

    invite = ParentInvite(
        student_id=student_id,
        parent_email=parent_email,
        parent_full_name=data.parent_full_name,
        status="pending"
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)

    return {
        "message": "Parent invite created",
        "invite_id": invite.id,
        "parent_email": invite.parent_email,
        "status": invite.status
    }

@app.get("/students/{student_id}/parent_invites", response_model=List[ParentInviteOut])
def get_student_parent_invites(student_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    invites = (
        db.query(ParentInvite)
        .filter(ParentInvite.student_id == student_id)
        .order_by(ParentInvite.created_at.desc())
        .all()
    )

    return [
        ParentInviteOut(
            id=invite.id,
            student_id=invite.student_id,
            parent_email=invite.parent_email,
            parent_full_name=invite.parent_full_name,
            status=invite.status,
            created_at=invite.created_at.isoformat(),
        )
        for invite in invites
    ]

@app.get("/parents/{parent_id}/invites", response_model=List[ParentInviteOut])
def get_parent_invites(parent_id: int, db: Session = Depends(get_db)):
    parent = db.query(User).filter(User.id == parent_id, User.role == "parent").first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")

    invites = (
        db.query(ParentInvite)
        .filter(ParentInvite.parent_email == parent.email)
        .order_by(ParentInvite.created_at.desc())
        .all()
    )

    return [
        ParentInviteOut(
            id=invite.id,
            student_id=invite.student_id,
            parent_email=invite.parent_email,
            parent_full_name=invite.parent_full_name,
            status=invite.status,
            created_at=invite.created_at.isoformat(),
        )
        for invite in invites
    ]

@app.post("/parent_invites/{invite_id}/accept/{parent_id}")
def accept_parent_invite(invite_id: int, parent_id: int, db: Session = Depends(get_db)):
    parent = db.query(User).filter(User.id == parent_id, User.role == "parent").first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")

    invite = db.query(ParentInvite).filter(ParentInvite.id == invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    if invite.status != "pending":
        raise HTTPException(status_code=400, detail="Invite has already been processed")

    if invite.parent_email != parent.email:
        raise HTTPException(status_code=403, detail="This invite does not belong to this parent")

    student = db.query(User).filter(User.id == invite.student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if student.parentID and student.parentID != parent.id:
        raise HTTPException(status_code=400, detail="Student is already linked to a different parent")

    student.parentID = parent.id
    invite.status = "accepted"

    other_pending_invites = (
        db.query(ParentInvite)
        .filter(ParentInvite.student_id == student.id, ParentInvite.status == "pending")
        .all()
    )
    for other_invite in other_pending_invites:
        if other_invite.id != invite.id:
            other_invite.status = "superseded"

    db.commit()
    db.refresh(student)
    db.refresh(invite)

    return {
        "message": "Parent invite accepted and parent linked successfully",
        "invite_id": invite.id,
        "student_id": student.id,
        "parent_id": parent.id,
        "status": invite.status,
    }

@app.post("/parent_invites/{invite_id}/decline/{parent_id}")
def decline_parent_invite(invite_id: int, parent_id: int, db: Session = Depends(get_db)):
    parent = db.query(User).filter(User.id == parent_id, User.role == "parent").first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")

    invite = db.query(ParentInvite).filter(ParentInvite.id == invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    if invite.parent_email != parent.email:
        raise HTTPException(status_code=403, detail="This invite does not belong to this parent")

    if invite.status != "pending":
        raise HTTPException(status_code=400, detail="Invite has already been processed")

    invite.status = "declined"
    db.commit()
    db.refresh(invite)

    return {
        "message": "Parent invite declined",
        "invite_id": invite.id,
        "status": invite.status,
    }

@app.get("/students/{student_id}/assessments", response_model=List[AssessmentResponseOut])
def list_assessment_responses(student_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    responses = (
        db.query(AssessmentResponse)
        .filter(AssessmentResponse.student_id == student_id)
        .order_by(AssessmentResponse.submitted_at.desc())
        .all()
    )

    return [
        AssessmentResponseOut(
            id=row.id,
            student_id=row.student_id,
            assessment_name=row.assessment_name,
            responses=json.loads(row.responses_json),
            score=row.score,
            submitted_at=row.submitted_at.isoformat(),
        )
        for row in responses
    ]

@app.post("/students/{student_id}/profile", response_model=StudentProfileOut)
def save_student_profile(student_id: int, data: StudentProfileIn, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.student_age = data.age
    student.student_bio = data.bio
    student.student_goals_json = json.dumps(data.goals)

    db.commit()
    db.refresh(student)

    return StudentProfileOut(
        user_id=student.id,
        fullName=student.fullName,
        age=student.student_age,
        bio=student.student_bio,
        goals=json.loads(student.student_goals_json) if student.student_goals_json else [],
    )

@app.post("/coaches/{coach_id}/profile", response_model=CoachProfileOut)
def save_coach_profile(coach_id: int, data: CoachProfileIn, db: Session = Depends(get_db)):
    coach = db.query(User).filter(User.id == coach_id, User.role == "coach").first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")

    coach.coach_age = data.age
    coach.coach_bio = data.bio
    coach.coach_expertise_json = json.dumps(data.expertise)

    db.commit()
    db.refresh(coach)

    return CoachProfileOut(
        user_id=coach.id,
        fullName=coach.fullName,
        age=coach.coach_age,
        bio=coach.coach_bio,
        expertise=json.loads(coach.coach_expertise_json) if coach.coach_expertise_json else [],
    )

@app.get("/students/{student_id}/profile", response_model=StudentProfileOut)
def get_student_profile(student_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return StudentProfileOut(
        user_id=student.id,
        fullName=student.fullName,
        age=student.student_age,
        bio=student.student_bio,
        goals=json.loads(student.student_goals_json) if student.student_goals_json else [],
    )

@app.get("/coaches/{coach_id}/profile", response_model=CoachProfileOut)
def get_coach_profile(coach_id: int, db: Session = Depends(get_db)):
    coach = db.query(User).filter(User.id == coach_id, User.role == "coach").first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")

    return CoachProfileOut(
        user_id=coach.id,
        fullName=coach.fullName,
        age=coach.coach_age,
        bio=coach.coach_bio,
        expertise=json.loads(coach.coach_expertise_json) if coach.coach_expertise_json else [],
    )

@app.get("/students/{student_id}/parent")
def get_student_parent(student_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if not student.parentID:
        return {"parent": None}

    parent = db.query(User).filter(User.id == student.parentID, User.role == "parent").first()
    if not parent:
        return {"parent": None}

    return {
        "parent": {
            "id": parent.id,
            "fullName": parent.fullName,
            "email": parent.email,
        }
    }


@app.get("/students/{student_id}/peer")
def get_student_peer(student_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if not student.peerID:
        return {"peer": None}

    peer = db.query(User).filter(User.id == student.peerID, User.role == "student").first()
    if not peer:
        return {"peer": None}

    return {
        "peer": {
            "id": peer.id,
            "fullName": peer.fullName,
            "email": peer.email,
            "age": peer.student_age,
        }
    }


@app.get("/students/{student_id}/peer/recommendation")
def recommend_peer(student_id: int, exclude_ids: Optional[str] = Query(None), db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_age = _safe_int(student.student_age)

    excluded_set = set()
    if exclude_ids:
        excluded_set = {
            int(part.strip())
            for part in exclude_ids.split(",")
            if part.strip().isdigit()
        }

    candidates = db.query(User).filter(
        User.role == "student",
        User.id != student_id,
        User.peerID.is_(None),
    ).all()

    if excluded_set:
        candidates = [candidate for candidate in candidates if candidate.id not in excluded_set]

    # If the student has no parseable age, return the first available candidate.
    if student_age is None:
        candidate = candidates[0] if candidates else None
    else:
        filtered = []
        for candidate in candidates:
            candidate_age = _safe_int(candidate.student_age)
            if candidate_age is None:
                continue
            if abs(candidate_age - student_age) <= 4:
                filtered.append(candidate)

        candidate = filtered[0] if filtered else None

    if not candidate:
        return {"peer": None}

    goals = []
    if candidate.student_goals_json:
        try:
            parsed_goals = json.loads(candidate.student_goals_json)
            if isinstance(parsed_goals, list):
                goals = [str(item) for item in parsed_goals if str(item).strip()]
        except (TypeError, ValueError):
            goals = []

    return {
        "peer": {
            "id": candidate.id,
            "fullName": candidate.fullName,
            "email": candidate.email,
            "age": candidate.student_age,
            "goals": goals,
        }
    }

@app.get("/coaches/{coach_id}/students/{student_id}/action_items")
def get_student_action_items(coach_id: int, student_id: int, db: Session = Depends(get_db)):
    coach = db.query(User).filter(User.id == coach_id, User.role =="coach").first()
    if not coach:
        raise HTTPException(status_code = 404, detail = "Coach not found")

    if DEMO_ALL_STUDENTS_FOR_COACH:
        student = db.query(User).filter(User.id == student_id, User.role == "student").first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
    else:
        student = db.query(User).filter(User.id == student_id, User.coachID == coach_id).first()
        if not student:
            raise HTTPException(status_code = 403, detail = "Student is not assigned to this coach")

    return [
        {
            "id": ai.id,
            "title": ai.title,
            "description": ai.description,
            "completed": ai.completed
        }
        for ai in student.action_items
    ]

@app.get("/coaches/{coach_id}/students/{student_id}", response_model=CoachStudentDetailOut)
def get_coach_student_detail(coach_id: int, student_id: int, db: Session = Depends(get_db)):
    coach = db.query(User).filter(User.id == coach_id, User.role == "coach").first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")

    if DEMO_ALL_STUDENTS_FOR_COACH:
        student = db.query(User).filter(
            User.id == student_id,
            User.role == "student"
        ).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
    else:
        student = db.query(User).filter(
            User.id == student_id,
            User.role == "student",
            User.coachID == coach_id
        ).first()
        if not student:
            raise HTTPException(status_code=403, detail="Student is not assigned to this coach")

    return CoachStudentDetailOut(
        id=student.id,
        fullName=student.fullName,
        email=student.email,
        age=student.student_age,
        bio=student.student_bio,
        goals=json.loads(student.student_goals_json) if student.student_goals_json else [],
        action_items=[
            {
                "id": ai.id,
                "title": ai.title,
                "description": ai.description,
                "completed": ai.completed,
            }
            for ai in student.action_items
        ],
    )

@app.get("/peers/{peer_id}/students/{student_id}", response_model=PeerStudentDetailOut)
def get_peer_student_detail(peer_id: int, student_id: int, db: Session = Depends(get_db)):
    peer = db.query(User).filter(User.id == peer_id, User.role == "student").first()
    if not peer:
        raise HTTPException(status_code=404, detail="Peer not found")

    if peer.peerID != student_id:
        raise HTTPException(status_code=403, detail="Student is not assigned to this peer")
    
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return PeerStudentDetailOut(
        id=student.id,
        fullName=student.fullName,
        email=student.email,
        age=student.student_age,
        bio=student.student_bio,
        goals=json.loads(student.student_goals_json) if student.student_goals_json else [],
        action_items=[
            {
                "id": ai.id,
                "title": ai.title,
                "description": ai.description,
                "completed": ai.completed,
            }
             for ai in student.action_items
        ],
    )

@app.post("/coaches/{coach_id}/availability", response_model = AvailabilityOut)
def add_availability(coach_id: int, slot: AvailabilityIn, db: Session = Depends(get_db)):
    coach = db.query(User).filter(User.id == coach_id, User.role == "coach").first()
    if not coach:
        raise HTTPException(status_code = 404, detail = "Coach not found")
    try:  
        parsed_date = datetime.strptime(slot.date, "%Y-%m-%d").date()
        parsed_start = datetime.strptime(slot.start_time, "%H:%M").time()
    except ValueError:
        raise HTTPException(status_code=400, detail = "Invalid date or time format") 
    
    if parsed_start.minute != 0:
        raise HTTPException(status_code = 400, detail = "Availability must start on the hour (e.g. 14:00)")
    
    parsed_end = (datetime.combine(parsed_date, parsed_start) + timedelta(hours=1)).time()

    exists = db.query(CoachAvailability).filter(
        CoachAvailability.coach_id == coach_id,
        CoachAvailability.date == parsed_date,
        CoachAvailability.start_time == parsed_start
    ).first()

    if exists:
        raise HTTPException(status_code=400, detail="Availability already exists")

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

@app.post("/coaches/{coach_id}/students/{student_id}/action_items", response_model=ActionItemOut, status_code=201)
def create_student_action_item(coach_id: int, student_id: int, data: ActionItemCreate, db: Session = Depends(get_db)):
    coach = db.query(User).filter(User.id == coach_id, User.role == "coach").first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")

    student = db.query(User).filter(
        User.id == student_id,
        User.role == "student",
        User.coachID == coach_id
    ).first()
    if not student:
        raise HTTPException(status_code=403, detail="Student is not assigned to this coach")

    item = ActionItem(
        user_id=student_id,
        title=data.title,
        description=data.description,
        completed=False
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return ActionItemOut(
        id=item.id,
        user_id=item.user_id,
        title=item.title,
        description=item.description,
        completed=item.completed
    )

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