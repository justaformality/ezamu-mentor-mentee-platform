The backend uses:

Python

FastAPI

PostgreSQL

SQLAlchemy ORM

Pydantic

Passlib (bcrypt)

dotenv for environment variables

The README covers the purpose and detailed breakdown of these backend files:

app/config.py

app/database.py

app/models/user.py

app/schemas/user.py

app/services/auth.py

app/routers/auth.py

app/main.py

============================================
4. app/config.py — Configuration & Environment Loader

This file provides centralized configuration for the backend.

Line-by-line explanation:

Imports:

functools.lru_cache — caches the Settings object.

pydantic.BaseModel — used to define typed configuration models.

dotenv.load_dotenv — loads environment variables from a .env file.

os — read environment variables.

load_dotenv():
Loads the .env file into environment variables.

Settings class:
Defines configuration fields:
database_url: pulled from DATABASE_URL
secret_key: pulled from SECRET_KEY
algorithm: defaults to HS256
backend_cors_origins: where API calls are allowed to come from (default: Vite dev server)

get_settings():
Returns a cached Settings object so the config is only created once.

Purpose:
This file loads and stores all configuration values for easy use across the backend.

============================================
5. app/database.py — Database Engine & Sessions

This file sets up the SQLAlchemy connection to PostgreSQL.

Line-by-line explanation:

Imports:

create_engine — creates the PostgreSQL engine.

sessionmaker — factory for DB sessions.

declarative_base — base class for ORM models.

get_settings — loads environment config.

settings = get_settings():
Pulls the configuration values for the database.

engine = create_engine(settings.database_url):
Creates a connection to the PostgreSQL database.

SessionLocal:
A session factory that creates new SQLAlchemy sessions.
autocommit=False: explicit commit required.
autoflush=False: changes aren’t auto-flushed.

Base = declarative_base():
Base class for all ORM models.

get_db():
FastAPI dependency that:

Creates a session

Yields it to the route

Closes it afterwards

Purpose:
Provides a clean, reusable database connection setup.

============================================
7. app/models/user.py — SQLAlchemy User Model

Defines the structure of the "users" table in the database.

Line-by-line:

Imports Column, Integer, String from SQLAlchemy.

Imports Base from database.py.

class User(Base):
tablename = "users"
Means the table will be named "users".

id column:
Integer primary key, indexed.

email column:
Unique email string, indexed, not null.

password_hash column:
Stores hashed password, not plain text.

role column:
User role (student, coach, admin). Default is "student".

Purpose:
Defines what a User looks like inside the database.

============================================
9. app/schemas/user.py — Pydantic Schemas

Defines the structure of data sent into and out of the API.

Line-by-line:

Imports BaseModel and EmailStr.

class UserCreate:
Incoming data for registration or login.
Fields:
email: validated email
password: plain string

class UserOut:
Data returned to frontend.
Fields:
id, email, role
Does NOT include password or hash.

Config.from_attributes = True:
Allows Pydantic to read ORM attributes directly.

Purpose:
Protects API from exposing sensitive fields and enforces input validation.

============================================
11. app/services/auth.py — Authentication Logic

Contains the business logic for authentication.

Line-by-line:

Imports:
Session — SQLAlchemy session
CryptContext — hashing library
User model
UserCreate schema

pwd_context = CryptContext(schemes=["bcrypt"]):
Defines bcrypt as the hashing method.

hash_password():
Hashes plain passwords.

verify_password():
Compares plain password to hashed one.

create_user():
Creates and saves a user to the DB:

Hash password

Build User model

Add to DB and commit

Refresh to get assigned ID

get_user_by_email():
Finds a user record by email address.

Purpose:
Handles hashing, verifying, and creating users.

============================================
13. app/routers/auth.py — /auth API Routes

Defines the API routes for registering and logging in.

Line-by-line:

Imports:
APIRouter, Depends, HTTPException, status
DB session
Schemas: UserCreate, UserOut
Auth service functions

router = APIRouter(prefix="/auth", tags=["auth"]):
All routes here will start with /auth.

POST /auth/register

response_model=UserOut:
Output is shaped using UserOut.

existing = get_user_by_email():
Check if email already exists.

If exists: throw 400 "Email already registered"

Otherwise:
create_user()
Return newly created user.

POST /auth/login

Fetch user by email.

If user doesn't exist or hashed password invalid:
Throw 401 Unauthorized.

Otherwise return user info.

Purpose:
This is the gateway for authentication features.

============================================
14. app/main.py — Application Entry Point

This is the file that runs when you start the backend.

Line-by-line:

Imports FastAPI, CORS middleware.

Imports config, DB engine, and Base.

Imports the auth router.

Base.metadata.create_all(bind=engine):
Creates missing tables automatically.

settings = get_settings():
Loads configuration.

app = FastAPI():
Creates the FastAPI application.

app.add_middleware(CORSMiddleware, ...):
Allows frontend at http://localhost:5173 to call backend.

app.include_router(auth_router.router):
Registers all /auth routes.

GET /health:
Simple "OK" response to test if backend is running.

Purpose:
Creates the server, loads routes, applies middleware, and ensures DB tables exist.

