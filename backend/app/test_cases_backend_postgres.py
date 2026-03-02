"""
test_cases_backend_postgres.py


Update log:
Last updated        | Version of main.py tested      | Test cases passed      | OS
------------------------------------------------------------------------------------------
Feb 25 @ 940pm      | Feb 21, Commit d1b9cf0         | 1/4                    | Windows
Feb 25 @ 1040pm     | Feb 21, Commit d1b9cf0         | 1/4                    | Windows
Feb 27 @ 826pm      | Feb 21, Commit d1b9cf0         | 1/4                    | Windows
Mar 1 @ 940pm       | Mar 1, Commit 77a0a66          | 4/4                    | Windows
                                                     | 3/4                    | Mac
Mar 1 @ 1125pm      | Mar 1, Commit 77a0a66          | 4/4                    | Mac
                                                     | 4/4                    | Windows

Update list:
Last updated        | Description of update
--------------------------------------------
Feb 25 @ 940pm      | Creation of file
Feb 25 @ 1040pm     | Minor tweak to main
Feb 27 @ 826pm      | Minor tweak to main
Mar 1 @ 940pm       | Major tweak to all test cases
Mar 1 @ 1124pm      | Tweak to Test Case 4 to ensure previous test case entries are cleared

To Run:
      - Follow instructions as listed in README.txt
      - Stop after Step 9
      - Run: 
          - Windows: python app\test_cases_backend_postgres.py
          - Mac: python3 app/test_cases_backend_postgres.py

Test Cases Descriptions:
1) Health Endpoint Test
      Verifies that the backend server is running and reachable.
      This test sends a request to /health and confirms the API responds successfully.
      It ensures the application starts correctly and the routing layer is functioning before testing any database logic.
2) Register -> Login Roundtrip (Postgres)
      Verifies that a new user can be registered and then successfully logged in using the same credentials.
      This test confirms that:
        A new user is saved into the Postgres database.
        The password is properly hashed.
        The same user can log in afterward.
        The returned user data matches what was stored.
        This validates both database persistence and authentication logic working together.
3) Duplicate Email Rejection
      Ensures the system prevents two accounts from being created with the same email.
      This test registers a user once successfully, then attempts to register the same email again. It confirms that:
        The backend enforces uniqueness.
        The database constraint is working.
        The API correctly returns an error response (400).
        This protects against duplicate accounts and maintains data integrity.
4) Coach Assigns Student and Can List Them
      Verifies relational behavior between coach and student accounts.
      This test:
        Creates a coach account.
        Creates a student account.
        Assigns the student to the coach.
        Confirms that the coach can retrieve the student in their list.
      It validates:
        Foreign key relationships.
        Proper database updates.
        Correct filtering logic when querying related users.

"""

from __future__ import annotations

import os
import json
import importlib.util
from pathlib import Path
from typing import Any, Callable, Tuple
import uuid

from fastapi.testclient import TestClient


def load_backend_module(module_path: Path):
    import sys
    spec = importlib.util.spec_from_file_location("backend_main", str(module_path))
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load module spec from {module_path}")
    mod = importlib.util.module_from_spec(spec)

    # IMPORTANT: register module so Pydantic can resolve EmailStr, etc.
    sys.modules[spec.name] = mod

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


def main():
    # IMPORTANT: We REQUIRE DATABASE_URL so we definitely hit Postgres
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise RuntimeError(
            "DATABASE_URL is not set. Set it in your terminal to your Postgres URL, then rerun.\n"
            "Example (PowerShell):\n"
            '  $env:DATABASE_URL="postgresql+psycopg2://postgres:password@localhost:5432/ezamu_db"\n'
        )
    if "postgres" not in db_url.lower():
        raise RuntimeError(f"DATABASE_URL does not look like Postgres:\n{db_url}")

    here = Path(__file__).resolve().parent
    backend_path = here / "main.py"
    backend = load_backend_module(backend_path)

    client = TestClient(backend.app)

    # ---- TESTS ----

    def t_health(): # Verifies that the backend server is running and reachable
        r = client.get("/health")
        assert_eq(r.status_code, 200, "health should return 200")
        body = r.json()
        assert_true(body.get("ok") is True, f"health ok expected True, got: {pretty(body)}")

    def t_register_then_login_roundtrip(): # Verifies that a new user can be registered and then successfully logged in using the same credentials
        # Use a semi-unique email so you can run multiple times without manual cleanup
        import time
        email = f"student_{int(time.time())}@example.com"

        reg_payload = {
            "email": email,
            "password": "pass1234",
            "role": "student",
            "fullName": "Postgres Test Student",
        }
        r = client.post("/auth/register", json=reg_payload)
        assert_eq(r.status_code, 201, f"register should return 201; body={r.text}")
        user = r.json()
        assert_true("id" in user, "register response should include id")
        user_id = user["id"]

        # Login should succeed
        r2 = client.post("/auth/login", json={"email": email, "password": "pass1234"})
        assert_eq(r2.status_code, 200, f"login should return 200; body={r2.text}")
        user2 = r2.json()
        assert_eq(user2["id"], user_id, "login should return same user id")
        assert_eq(user2["email"], email.lower(), "email should match")

    def t_duplicate_email_rejected(): # Ensures the system prevents two accounts from being created with the same email
        import time
        base = f"dup_{int(time.time())}@example.com"
        payload = {"email": base, "password": "pass1234", "role": "student", "fullName": "Dup PG"}

        r1 = client.post("/auth/register", json=payload)
        assert_eq(r1.status_code, 201, f"first register should succeed; body={r1.text}")

        r2 = client.post("/auth/register", json=payload)
        # Your backend uses 400 for duplicates
        assert_eq(r2.status_code, 400, f"duplicate should be rejected; body={r2.text}")

    def t_coach_assign_student_and_list(): # Verifies relational behavior between coach and student accounts
        import time
        ts = int(time.time())
        uid = uuid.uuid4().hex
        coach_email = f"coach_{uid}@example.com"
        student_email = f"student_{uid}@example.com"

        rc = client.post("/auth/register", json={"email": coach_email, "password": "pass1234", "role": "coach", "fullName": "PG Coach"})
        rs = client.post("/auth/register", json={"email": student_email, "password": "pass1234", "role": "student", "fullName": "PG Student"})
        assert_eq(rc.status_code, 201, f"coach register failed: {rc.text}")
        assert_eq(rs.status_code, 201, f"student register failed: {rs.text}")

        coach_id = rc.json()["id"]
        student_id = rs.json()["id"]

        ra = client.post(f"/students/{student_id}/assign_coach/{coach_id}")
        assert_eq(ra.status_code, 200, f"assign coach failed: {ra.text}")

        rl = client.get(f"/coaches/{coach_id}/students")
        assert_eq(rl.status_code, 200, f"list students failed: {rl.text}")
        students = rl.json()
        assert_true(any(s["id"] == student_id for s in students), "student should appear under coach")

    tests = [
        ("health endpoint works", t_health),
        ("register->login roundtrip (Postgres)", t_register_then_login_roundtrip),
        ("duplicate email rejected (Postgres)", t_duplicate_email_rejected),
        ("coach assigns student and can list them (Postgres)", t_coach_assign_student_and_list),
    ]

    results = [run_test(name, fn) for name, fn in tests]

    print("\n=== POSTGRES TEST RESULTS ===")
    passed = 0
    for name, ok, err in results:
        if ok:
            print(f"PASS - {name}")
            passed += 1
        else:
            print(f"FAIL - {name}\n  {err}\n")
    print(f"\nPassed {passed}/{len(results)} tests")
    print(f"Using DATABASE_URL = {db_url}")


if __name__ == "__main__":
    main()
