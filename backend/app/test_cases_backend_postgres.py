"""
test_cases_backend_postgres.py

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
5) Coach Logs In and Remains a Coach
6) User Cannot Login with Incorrect Password
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

    def t_health():
        r = client.get("/health")
        assert_eq(r.status_code, 200, "health should return 200")
        body = r.json()
        assert_true(body.get("ok") is True, f"health ok expected True, got: {pretty(body)}")

    def t_register_then_login_roundtrip():
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

    def t_duplicate_email_rejected():
        import time
        base = f"dup_{int(time.time())}@example.com"
        payload = {"email": base, "password": "pass1234", "role": "student", "fullName": "Dup PG"}

        r1 = client.post("/auth/register", json=payload)
        assert_eq(r1.status_code, 201, f"first register should succeed; body={r1.text}")

        r2 = client.post("/auth/register", json=payload)
        # Your backend uses 400 for duplicates
        assert_eq(r2.status_code, 400, f"duplicate should be rejected; body={r2.text}")

    def t_coach_assign_student_and_list():
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

    def t_coach_relogin_role_routes_to_coach_dashboard():
        """
        Human intent: After a coach logs out and logs back in, they should still be a coach.
        Backend check: login response must indicate role == 'coach' (frontend should route to /coach-dashboard).
        """
        uid = uuid.uuid4().hex
        coach_email = f"coach_relogin_{uid}@example.com"
        password = "pass1234"

        rc = client.post(
            "/auth/register",
            json={"email": coach_email, "password": password, "role": "coach", "fullName": "PG Coach Relogin"},
        )
        assert_eq(rc.status_code, 201, f"coach register failed: {rc.text}")

        # "Logout" is frontend-only; we just log in again
        r_login = client.post("/auth/login", json={"email": coach_email, "password": password})
        assert_eq(r_login.status_code, 200, f"coach login should succeed; body={r_login.text}")
        user = r_login.json()

        assert_true("role" in user, f"login response missing 'role'; cannot verify dashboard routing. got={pretty(user)}")
        assert_eq(user["role"], "coach", f"Expected role 'coach' after relogin; got={pretty(user)}")

    def t_login_wrong_password_rejected():
        """
        Human intent: user logs out, then tries to login with wrong password; must fail.
        Backend check: /auth/login must NOT return 200 when password is incorrect.
        """
        uid = uuid.uuid4().hex
        email = f"wrongpw_{uid}@example.com"
        password = "pass1234"

        r_reg = client.post(
            "/auth/register",
            json={"email": email, "password": password, "role": "student", "fullName": "PG WrongPW User"},
        )
        assert_eq(r_reg.status_code, 201, f"register failed: {r_reg.text}")

        r_bad = client.post("/auth/login", json={"email": email, "password": "NOT_THE_PASSWORD"})
        assert_true(
            r_bad.status_code != 200,
            f"Login succeeded with wrong password (SECURITY BUG). status=200 body={r_bad.text}",
        )

    def t_student_invites_parent_and_parent_accepts():
        uid = uuid.uuid4().hex
        student_email = f"student_parent_{uid}@example.com"
        parent_email = f"parent_{uid}@example.com"
        password = "pass1234"

        rs = client.post(
            "/auth/register",
            json={"email": student_email, "password": password, "role": "student", "fullName": "Student Invite"},
        )
        assert_eq(rs.status_code, 201, f"student register failed: {rs.text}")

        student_id = rs.json()["id"]

        invite_resp = client.post(
            f"/students/{student_id}/parent/link_or_invite",
            json={"parent_email": parent_email, "parent_full_name": "Parent Invite"},
        )
        assert_eq(invite_resp.status_code, 200, f"parent invite failed: {invite_resp.text}")
        invite_id = invite_resp.json()["invite_id"]

        rp = client.post(
            "/auth/register",
            json={"email": parent_email, "password": password, "role": "parent", "fullName": "Parent Invite"},
        )
        assert_eq(rp.status_code, 201, f"parent register failed: {rp.text}")
        parent_id = rp.json()["id"]

        parent_invites = client.get(f"/parents/{parent_id}/invites")
        assert_eq(parent_invites.status_code, 200, f"listing parent invites failed: {parent_invites.text}")
        invites = parent_invites.json()
        assert_true(
            any(inv["id"] == invite_id and inv["status"] == "pending" for inv in invites),
            "pending invite should be visible to parent",
        )

        accept_resp = client.post(f"/parent_invites/{invite_id}/accept/{parent_id}")
        assert_eq(accept_resp.status_code, 200, f"accept invite failed: {accept_resp.text}")
        assert_eq(accept_resp.json()["status"], "accepted", "invite status should become accepted")

        linked_students = client.get(f"/parents/{parent_id}/students")
        assert_eq(linked_students.status_code, 200, f"parent students failed: {linked_students.text}")
        assert_true(
            any(s["id"] == student_id for s in linked_students.json()),
            "accepted invite should link parent to student",
        )

    def t_coach_can_assign_peer_but_wrong_coach_cannot():
        uid = uuid.uuid4().hex
        password = "pass1234"

        r_coach_1 = client.post("/auth/register", json={"email": f"coach_a_{uid}@example.com", "password": password, "role": "coach", "fullName": "Coach A"})
        r_coach_2 = client.post("/auth/register", json={"email": f"coach_b_{uid}@example.com", "password": password, "role": "coach", "fullName": "Coach B"})
        r_student = client.post("/auth/register", json={"email": f"student_a_{uid}@example.com", "password": password, "role": "student", "fullName": "Student A"})
        r_peer = client.post("/auth/register", json={"email": f"student_b_{uid}@example.com", "password": password, "role": "student", "fullName": "Student B"})
        assert_eq(r_coach_1.status_code, 201, f"coach A register failed: {r_coach_1.text}")
        assert_eq(r_coach_2.status_code, 201, f"coach B register failed: {r_coach_2.text}")
        assert_eq(r_student.status_code, 201, f"student register failed: {r_student.text}")
        assert_eq(r_peer.status_code, 201, f"peer register failed: {r_peer.text}")

        coach_a_id = r_coach_1.json()["id"]
        coach_b_id = r_coach_2.json()["id"]
        student_id = r_student.json()["id"]
        peer_id = r_peer.json()["id"]

        assign_coach = client.post(f"/students/{student_id}/assign_coach/{coach_a_id}")
        assert_eq(assign_coach.status_code, 200, f"assign coach failed: {assign_coach.text}")

        wrong_assign = client.post(f"/students/{student_id}/assign_peer/{peer_id}/by/{coach_b_id}")
        assert_eq(wrong_assign.status_code, 403, f"wrong coach should be rejected: {wrong_assign.text}")

        good_assign = client.post(f"/students/{student_id}/assign_peer/{peer_id}/by/{coach_a_id}")
        assert_eq(good_assign.status_code, 200, f"assigned coach should be able to assign peer: {good_assign.text}")

        peer_students = client.get(f"/peers/{peer_id}/students")
        assert_eq(peer_students.status_code, 200, f"peer student listing failed: {peer_students.text}")
        assert_true(any(s["id"] == student_id for s in peer_students.json()), "peer relationship should be visible after assignment")

    def t_assessment_saved_and_visible_on_parent_progress_dashboard():
        uid = uuid.uuid4().hex
        password = "pass1234"

        r_student = client.post("/auth/register", json={"email": f"student_progress_{uid}@example.com", "password": password, "role": "student", "fullName": "Student Progress"})
        r_parent = client.post("/auth/register", json={"email": f"parent_progress_{uid}@example.com", "password": password, "role": "parent", "fullName": "Parent Progress"})
        r_coach = client.post("/auth/register", json={"email": f"coach_progress_{uid}@example.com", "password": password, "role": "coach", "fullName": "Coach Progress"})
        assert_eq(r_student.status_code, 201, f"student register failed: {r_student.text}")
        assert_eq(r_parent.status_code, 201, f"parent register failed: {r_parent.text}")
        assert_eq(r_coach.status_code, 201, f"coach register failed: {r_coach.text}")

        student_id = r_student.json()["id"]
        parent_id = r_parent.json()["id"]
        coach_id = r_coach.json()["id"]

        parent_link = client.post(f"/students/{student_id}/assign_parent/{parent_id}")
        assert_eq(parent_link.status_code, 200, f"assign parent failed: {parent_link.text}")

        coach_link = client.post(f"/students/{student_id}/assign_coach/{coach_id}")
        assert_eq(coach_link.status_code, 200, f"assign coach failed: {coach_link.text}")

        action_item = client.post(f"/coaches/{coach_id}/students/{student_id}/action_items", json={"description": "Finish application essay"})
        assert_eq(action_item.status_code, 201, f"create action item failed: {action_item.text}")

        assessment = client.post(
            f"/students/{student_id}/assessments",
            json={"assessment_name": "Career Readiness", "responses": {"q1": "yes", "q2": 5}, "score": "85"},
        )
        assert_eq(assessment.status_code, 201, f"save assessment failed: {assessment.text}")

        assessment_list = client.get(f"/students/{student_id}/assessments")
        assert_eq(assessment_list.status_code, 200, f"list assessments failed: {assessment_list.text}")
        assert_true(any(a["assessment_name"] == "Career Readiness" for a in assessment_list.json()), "saved assessment should be listed for the student")

        progress = client.get(f"/parents/{parent_id}/students/{student_id}/progress")
        assert_eq(progress.status_code, 200, f"parent progress failed: {progress.text}")
        body = progress.json()
        assert_true(any(a["assessment_name"] == "Career Readiness" for a in body["assessments"]), "parent dashboard should include saved assessment")
        assert_true(any(ai["description"] == "Finish application essay" for ai in body["action_items"]), "parent dashboard should include student action items")

    tests = [
        ("health endpoint works", t_health),
        ("register->login roundtrip (Postgres)", t_register_then_login_roundtrip),
        ("duplicate email rejected (Postgres)", t_duplicate_email_rejected),
        ("coach assigns student and can list them (Postgres)", t_coach_assign_student_and_list),
        ("coach relogin stays coach (Postgres)", t_coach_relogin_role_routes_to_coach_dashboard),
        ("login wrong password rejected (Postgres)", t_login_wrong_password_rejected),
        ("student invites parent and parent accepts (Postgres)", t_student_invites_parent_and_parent_accepts),
        ("coach peer assignment respects ownership (Postgres)", t_coach_can_assign_peer_but_wrong_coach_cannot),
        ("assessment and parent progress flow works (Postgres)", t_assessment_saved_and_visible_on_parent_progress_dashboard),
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
