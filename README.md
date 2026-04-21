# Ezamu Triad Mentorship Platform

## Project Overview

The **Ezamu Triad Mentorship Platform** is a proof-of-concept web application designed to support students as they explore college and career pathways. The platform is built around a **triad mentorship model**, which connects a **student**, **coach**, and **peer** to encourage accountability, guidance, and progress toward personal goals.

The intended use of this platform is to help students:
- learn more about themselves through assessments,
- receive guidance from coaches,
- stay motivated through peer support,
- track appointments and action items,
- and work toward future academic and career goals in a more structured way.

This repository is split into two main parts:
- **Frontend**: React + Vite application
- **Backend**: FastAPI + PostgreSQL API server

---

## Intended Usage

This platform is intended for:
- **Students** who want guidance with college and career planning
- **Coaches/Mentors** who support student growth and assign action items
- **Administrators** managing user accounts and platform activity

At its current stage, this is a **local proof-of-concept prototype** that demonstrates the core workflow of the system.

---

## Tech Stack

### Frontend
- **React**
- **Vite**
- **Node.js**
- **npm**

### Backend
- **Python**
- **FastAPI**
- **Uvicorn**
- **PostgreSQL**
- **SQLAlchemy**
- **psycopg2**
- **bcrypt**

---

## Project Structure

```bash
project-root/
├── frontend/   # React + Vite frontend
└── backend/    # FastAPI backend with PostgreSQL
```

## Prerequisites

Before running the project locally, make sure you have the following installed:

Node.js (LTS recommended)
npm
Python 3
PostgreSQL

## Local Setup Instructions
```bash
1. Clone the Repository
git clone https://github.com/justaformality/ezamu-mentor-mentee-platform/
cd ezamu-mentor-mentee-platform
```
In the frontend and backend folders will be a detailed README.md detailing how to run each one locally.

### User Guide
## Overview

This platform is intended to help users interact with a mentorship and career-planning system.

Depending on the user role, the system supports different actions.

Typical User Flow
1. Register an Account

A new user can create an account through the registration flow.

2. Log In

Existing users can log in using their email and password.

3. Access Role-Specific Features

Once logged in, users can interact with features based on their role.

Examples may include:

viewing appointments,
tracking assigned action items,
participating in mentorship interactions,
and accessing student support tools.

4. Student Usage

Students are the primary intended users of the platform. They use the system to:

receive guidance,
manage mentorship-related tasks,
and keep track of progress toward future college and career goals.

5. Coach/Admin Usage

Coaches and admins use the system to:

support users,
monitor tasks or appointments,
and manage platform-related activities.
