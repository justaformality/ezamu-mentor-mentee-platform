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
   - psql -U postgres 
   - Enter the password you created during PostgreSQL installation
6) Create a database 
   - CREATE DATABASE ezamu_db; 
7) Choose one of the following options
   Option A - Use default postgres User
      -If you plan to use the postgres user
         Run \q to exit psql 
         Skip to step 9
   Option B - Create a new Database User (Only needed when we switch to an actual server)
      - CREATE USER ezamu_user WITH PASSWORD 'password';
      - GRANT ALL PRIVILEGES ON DATABASE ezamu_db TO ezamu_user;
8) (ONLY IF USING OPTION B) Connect to the database and grant your user schema permissions
   - \c ezamu_db
   - GRANT ALL ON SCHEMA public TO ezamu_user;
   - ALTER SCHEMA public OWNER TO ezamu_user;
   - \q 
9) Set DATABASE_URL environment variable:
   - On Windows run: $env:DATABASE_URL="postgresql+psycopg2://<username>:<password>@localhost:5432/ezamu_db"
   - On Mac run: export DATABASE_URL="postgresql+psycopg2://<username>:<password>@localhost:5432/ezamu_db"
   - Be sure to replace username with the username of a user you created or using postgres superuser, and replace password with the password of the respective user you are using
10) uvicorn app.main:app --reload --port 5000

CORS
- By default, allows http://localhost:5173 and http://127.0.0.1:5173 (Vite default).
- You can change this in app/main.py.

Where data is stored
- PostgreSQL database defined by DATABASE_URL
- Tables are created automatically on startup using SQLAlchemy

Notes
- Passwords are stored as bcrypt hashes in PostgreSQL.
- Duplicate email returns HTTP 400.