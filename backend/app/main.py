from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
USERS_FILE = DATA_DIR / "users.txt"

DATA_DIR.mkdir(parents=True, exist_ok=True)
USERS_FILE.touch(exist_ok=True)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _read_users() -> list[dict]:
    users: list[dict] = []
    with USERS_FILE.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                users.append(json.loads(line))
            except json.JSONDecodeError:
                # POC behavior: ignore corrupted lines
                continue
    return users


def _write_user(user: dict) -> None:
    with USERS_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(user, ensure_ascii=False) + "\n")


def _next_id(users: list[dict]) -> int:
    max_id = 0
    for u in users:
        try:
            max_id = max(max_id, int(u.get("id", 0)))
        except Exception:
            pass
    return max_id + 1


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


app = FastAPI(title="EZAMU POC Backend (TXT)")

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


@app.get("/health")
def health():
    return {"ok": True, "message": "backend up"}


@app.post("/auth/register", response_model=UserOut, status_code=201)
def register(user_in: RegisterIn):
    users = _read_users()
    email = _normalize_email(str(user_in.email))

    if any(_normalize_email(u.get("email", "")) == email for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")

    role = _map_role(user_in.model_dump())
    full_name = _map_full_name(user_in.model_dump())

    new_user = {
        "id": _next_id(users),
        "email": email,
        "password_hash": pwd_context.hash(user_in.password),
        "role": role,
        "fullName": full_name,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    _write_user(new_user)

    return {
        "id": new_user["id"],
        "email": new_user["email"],
        "role": new_user["role"],
        "fullName": new_user["fullName"] or None,
        "createdAt": new_user["createdAt"],
    }


@app.post("/auth/login", response_model=UserOut)
def login(user_in: LoginIn):
    users = _read_users()
    email = _normalize_email(str(user_in.email))

    user = next((u for u in users if _normalize_email(u.get("email", "")) == email), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    stored_hash = user.get("password_hash", "")
    if not stored_hash or not pwd_context.verify(user_in.password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "id": int(user.get("id", 0)),
        "email": user.get("email", email),
        "role": user.get("role", "student"),
        "fullName": user.get("fullName") or None,
        "createdAt": user.get("createdAt", ""),
    }


# Backwards-compat aliases (so older frontend code that used /api/signup keeps working)
@app.post("/api/signup", response_model=UserOut, status_code=201)
def signup_alias(user_in: RegisterIn):
    return register(user_in)

@app.post("/api/login", response_model=UserOut)
def login_alias(user_in: LoginIn):
    return login(user_in)
