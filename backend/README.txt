EZAMU Proof-of-Concept Backend (PostgreSQL)

What this is
- A FastAPI backend for the Ezamu mentor-mentee platform
- Handles user registration, login, appointments, and action items.
- Uses PostgreSQL with SQLAlchemy ORM for storage.

Endpoints
- GET  /health
- POST /auth/register
- POST /auth/login
- GET /users/{user_id}/appointments
- GET /users/{user_id}/action_items

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
5) Install and run PostgreSQL locally
6) Create a PostgreSQL database (example: ezamu_db)
7) Create a database user and grant access
8) Set DATABASE_URL environment variable:
   - $env:DATABASE_URL="postgresql+psycopg2://<username>:<password>@localhost:5432/ezamu_db"
   - Be sure to replace username with the username of a user you created or using postgres superuser, and replace password with the respective user you would like to use
9) uvicorn app.main:app --reload --port 5000

CORS
- By default, allows http://localhost:5173 and http://127.0.0.1:5173 (Vite default).
- You can change this in app/main.py.

Where data is stored
- PostgreSQL database defined by DATABASE_URL
- Tables are created automatically on startup using SQLAlchemy

Notes
- Passwords are stored as bcrypt hashes in PostgreSQL.
- Duplicate email returns HTTP 400.