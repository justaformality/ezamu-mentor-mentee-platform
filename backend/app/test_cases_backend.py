"""
test_cases_backend.py

Runs proof-style test cases against the FastAPI app defined in main.py (your backend).
- Does NOT modify main.py
- Uses a SQLite test DB file so SQLAlchemy works with your current engine/session setup
- Exercises core endpoints + role/coach relationships

How to run (in the same folder as main.py):
  python test_cases_backend.py

Expected:
  - Console output shows PASS/FAIL per test
  - A sqlite db file is created temporarily and removed at the end
"""

from __future__ import annotations

import os
import json
import tempfile
import importlib.util
from pathlib import Path
from typing import Any, Dict, Callable, Tuple

# FastAPI TestClient (comes from starlette). FastAPI typically installs this dependency.
from fastapi.testclient import TestClient


# -----------------------------
# Helpers
# -----------------------------
def load_backend_module(module_path: Path):
    """
    Loads main.py dynamically AFTER setting DATABASE_URL.
    This avoids import-time failure in main.py when DATABASE_URL is missing.
    """
    spec = importlib.util.spec_from_file_location("backend_main", str(module_path))
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load module spec from {module_path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore[attr-defined]
    return mod


def pretty(obj: Any) -> str:
    try:
        return json.dumps(obj, indent=2, ensure_ascii=False)
    except Exception:
        return str(obj)


def assert_true(cond: bool, msg: str):
    if not cond:
        raise AssertionError(msg)


def assert_eq(a: Any, b: Any, msg: str):
    if a != b:
        raise AssertionError(f"{msg}\n  got: {a}\n  exp: {b}")


def run_test(name: str, fn: Callable[[], None]) -> Tuple[str, bool, str]:
    try:
        fn()
        return name, True, ""
    except Exception as e:
        return name, False, str(e)


# -----------------------------
# Main test runner
# -----------------------------
def main():
    here = Path(__file__).resolve().parent
    backend_path = here / "main.py"
    if not backend_path.exists():
        raise RuntimeError(f"Could not find main.py next to this test file at: {backend_path}")

    # Create an isolated SQLite DB file for testing.
    # NOTE: In-memory sqlite doesn't work well with your current create_engine/sessionmaker
    # because each session may open a new connection. A file DB keeps it consistent.
    tmpdir = Path(tempfile.mkdtemp(prefix="ezamu_test_"))
    db_file = tmpdir / "test.db"

    # Set DATABASE_URL for your backend before importing it.
    os.environ["DATABASE_URL"] = f"sqlite:///{db_file}"

    backend = load_backend_module(backend_path)

    # Create an in-process client
    client = TestClient(backend.app)

    # -----------------------------
    # Test cases
    # -----------------------------
    def t_health():
        r = client.get("/health")
        assert_eq(r.status_code, 200, "health should return 200")
        body = r.json()
        assert_true(body.get("ok") is True, f"health ok expected True, got: {pretty(body)}")

    def t_register_success_student():
        payload = {
            "email": "student1@example.com",
            "password": "pass1234",
            "role": "student",
            "fullName": "Student One",
        }
        r = client.post("/auth/register", json=payload)
        assert_eq(r.status_code, 201, f"register student should return 201; body={r.text}")
        body = r.json()
        assert_eq(body["email"], payload["email"].lower(), "email should be normalized to lowercase")
        assert_eq(body["role"], "student", "role should be student")
        assert_eq(body["fullName"], "Student One", "fullName should persist")

    def t_register_duplicate_email_fails():
        payload = {"email": "dup@example.com", "password": "pass1234", "role": "student", "fullName": "Dup"}
        r1 = client.post("/auth/register", json=payload)
        assert_eq(r1.status_code, 201, "first register should succeed")

        r2 = client.post("/auth/register", json=payload)
        assert_eq(r2.status_code, 400, f"duplicate register should return 400; body={r2.text}")

    def t_login_success():
        # register
        reg = {"email": "loginme@example.com", "password": "pass1234", "role": "student", "fullName": "Login Me"}
        rr = client.post("/auth/register", json=reg)
        assert_eq(rr.status_code, 201, "register for login should succeed")

        # login
        r = client.post("/auth/login", json={"email": "loginme@example.com", "password": "pass1234"})
        assert_eq(r.status_code, 200, f"login should return 200; body={r.text}")
        body = r.json()
        assert_eq(body["email"], "loginme@example.com", "login returns correct user email")

    def t_login_wrong_password_fails():
        reg = {"email": "badpass@example.com", "password": "pass1234", "role": "student", "fullName": "Bad Pass"}
        rr = client.post("/auth/register", json=reg)
        assert_eq(rr.status_code, 201, "register should succeed")

        r = client.post("/auth/login", json={"email": "badpass@example.com", "password": "WRONG"})
        assert_eq(r.status_code, 401, f"wrong password should return 401; body={r.text}")

    def t_alias_endpoints_work():
        # /api/signup should behave like register
        reg = {"email": "alias@example.com", "password": "pass1234", "role": "student", "fullName": "Alias User"}
        r = client.post("/api/signup", json=reg)
        assert_eq(r.status_code, 201, f"/api/signup should return 201; body={r.text}")

        # /api/login should behave like login
        r2 = client.post("/api/login", json={"email": "alias@example.com", "password": "pass1234"})
        assert_eq(r2.status_code, 200, f"/api/login should return 200; body={r2.text}")

    def t_appointments_empty_list_for_new_user():
        reg = {"email": "appt0@example.com", "password": "pass1234", "role": "student", "fullName": "Appt Zero"}
        rr = client.post("/auth/register", json=reg)
        assert_eq(rr.status_code, 201, "register should succeed")
        user_id = rr.json()["id"]

        r = client.get(f"/users/{user_id}/appointments")
        assert_eq(r.status_code, 200, f"appointments should return 200; body={r.text}")
        assert_true(isinstance(r.json(), list), "appointments response should be a list")
        assert_eq(len(r.json()), 0, "new user should have 0 appointments")

    def t_action_items_empty_list_for_new_user():
        reg = {"email": "ai0@example.com", "password": "pass1234", "role": "student", "fullName": "AI Zero"}
        rr = client.post("/auth/register", json=reg)
        assert_eq(rr.status_code, 201, "register should succeed")
        user_id = rr.json()["id"]

        r = client.get(f"/users/{user_id}/action_items")
        assert_eq(r.status_code, 200, f"action_items should return 200; body={r.text}")
        assert_true(isinstance(r.json(), list), "action_items response should be a list")
        assert_eq(len(r.json()), 0, "new user should have 0 action items")

    def t_coach_student_assignment_and_list():
        # Create coach
        coach = {"email": "coach1@example.com", "password": "pass1234", "role": "coach", "fullName": "Coach One"}
        rc = client.post("/auth/register", json=coach)
        assert_eq(rc.status_code, 201, f"coach register should succeed; body={rc.text}")
        coach_id = rc.json()["id"]

        # Create student
        student = {"email": "student2@example.com", "password": "pass1234", "role": "student", "fullName": "Student Two"}
        rs = client.post("/auth/register", json=student)
        assert_eq(rs.status_code, 201, f"student register should succeed; body={rs.text}")
        student_id = rs.json()["id"]

        # Assign coach to student
        r_assign = client.post(f"/students/{student_id}/assign_coach/{coach_id}")
        assert_eq(r_assign.status_code, 200, f"assign_coach should return 200; body={r_assign.text}")

        # Coach lists students
        r_list = client.get(f"/coaches/{coach_id}/students")
        assert_eq(r_list.status_code, 200, f"coach students should return 200; body={r_list.text}")
        students = r_list.json()
        assert_true(any(s["id"] == student_id for s in students), "student should appear in coach students list")

    def t_coach_get_student_action_items_authorization():
        # Create coach A and coach B
        rcA = client.post("/auth/register", json={"email": "coachA@example.com", "password": "pass1234", "role": "coach", "fullName": "Coach A"})
        rcB = client.post("/auth/register", json={"email": "coachB@example.com", "password": "pass1234", "role": "coach", "fullName": "Coach B"})
        assert_eq(rcA.status_code, 201, "coach A register should succeed")
        assert_eq(rcB.status_code, 201, "coach B register should succeed")
        coachA_id = rcA.json()["id"]
        coachB_id = rcB.json()["id"]

        # Create student and assign to coach A
        rs = client.post("/auth/register", json={"email": "student3@example.com", "password": "pass1234", "role": "student", "fullName": "Student Three"})
        assert_eq(rs.status_code, 201, "student register should succeed")
        student_id = rs.json()["id"]

        r_assign = client.post(f"/students/{student_id}/assign_coach/{coachA_id}")
        assert_eq(r_assign.status_code, 200, "assign to coach A should succeed")

        # Coach A should be allowed (returns list, currently empty)
        r_ok = client.get(f"/coaches/{coachA_id}/students/{student_id}/action_items")
        assert_eq(r_ok.status_code, 200, f"coach A should access student's action items; body={r_ok.text}")
        assert_true(isinstance(r_ok.json(), list), "should be a list")

        # Coach B should be blocked (403)
        r_no = client.get(f"/coaches/{coachB_id}/students/{student_id}/action_items")
        assert_eq(r_no.status_code, 403, f"coach B should be forbidden; body={r_no.text}")

    tests = [
        ("health endpoint works", t_health),
        ("register student success", t_register_success_student),
        ("register duplicate email fails", t_register_duplicate_email_fails),
        ("login success", t_login_success),
        ("login wrong password fails", t_login_wrong_password_fails),
        ("alias endpoints /api/signup and /api/login work", t_alias_endpoints_work),
        ("appointments returns empty list for new user", t_appointments_empty_list_for_new_user),
        ("action_items returns empty list for new user", t_action_items_empty_list_for_new_user),
        ("assign coach + list coach students", t_coach_student_assignment_and_list),
        ("coach authorization for student action items", t_coach_get_student_action_items_authorization),
    ]

    results = [run_test(name, fn) for name, fn in tests]

    print("\n=== TEST RESULTS ===")
    passed = 0
    for name, ok, err in results:
        if ok:
            print(f"PASS - {name}")
            passed += 1
        else:
            print(f"FAIL - {name}\n  {err}\n")

    print(f"\nPassed {passed}/{len(results)} tests")
    print(f"Test DB file was: {db_file}")
    print(f"Temp dir: {tmpdir}")

    # If you want to keep the DB for inspection, comment these out:
    # db_file.unlink(missing_ok=True)
    # tmpdir.rmdir()


if __name__ == "__main__":
    main()
