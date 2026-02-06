EZAMU Proof-of-Concept Backend (TXT storage)

What this is
- A tiny FastAPI backend that accepts register/login requests and saves users into a text file.
- It stores one JSON object per line (JSONL) in: app/data/users.txt

Endpoints
- GET  /health
- POST /auth/register
- POST /auth/login

Request bodies supported (so it works with multiple frontend shapes):
REGISTER supports ANY of:
1) { "email": "...", "password": "...", "role": "student|coach|admin" }
2) { "email": "...", "password": "...", "accountType": "user|coach|admin", "fullName": "..." }
3) { "email": "...", "password": "...", "account_type": "...", "full_name": "..." }

LOGIN supports:
- { "email": "...", "password": "..." }

How to run (local)
1) cd into this folder
2) python -m venv .venv
3) Activate venv:
   - Windows: .venv\Scripts\activate
   - macOS/Linux: source .venv/bin/activate
4) pip install -r requirements.txt
5) uvicorn app.main:app --reload --port 5000

CORS
- By default, allows http://localhost:5173 and http://127.0.0.1:5173 (Vite default).
- You can change this in app/main.py.

Where data is written
- app/data/users.txt

Notes
- Passwords are stored as bcrypt hashes (still a TXT file; just safer than plaintext).
- Duplicate email returns HTTP 400.
