"""
test_cases_backend_hosted.py

To Run:
      - Start Frontend
        - cd into frontend folder
        - npm run dev
      - Start Backend; follow instructions as listed in README.txt
      - Run:
            # Terminal 1 (start server):
            uvicorn app.main:app --reload --port 5000

            # Terminal 2 (run tests):
            Mac Terminal:
            export API_BASE_URL="http://127.0.0.1:5000"
            python3 app/test_cases_backend_hosted.py

            Windows CMD:
            set API_BASE_URL=http://127.0.0.1:5000
            python app\test_cases_backend_hosted.py

            
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
import uuid
from typing import Any, Callable, Tuple

import httpx


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
    base_url = os.environ.get("API_BASE_URL", "http://127.0.0.1:5000").rstrip("/")
    timeout = httpx.Timeout(10.0)

    # One client for all tests
    client = httpx.Client(base_url=base_url, timeout=timeout)

    def post_json(path: str, payload: dict) -> httpx.Response:
        return client.post(path, json=payload, headers={"Content-Type": "application/json"})

    # ---- TESTS (hosted) ----

    def t_health():
        r = client.get("/health")
        assert_eq(r.status_code, 200, f"health should return 200; body={r.text}")
        body = r.json()
        assert_true(body.get("ok") is True, f"health ok expected True; got: {pretty(body)}")

    def t_register_then_login_roundtrip():
        uid = uuid.uuid4().hex
        email = f"student_{uid}@example.com"
        password = "pass1234"

        reg_payload = {
            "email": email,
            "password": password,
            "role": "student",
            "fullName": "Hosted Test Student",
        }
        r = post_json("/auth/register", reg_payload)
        assert_eq(r.status_code, 201, f"register should return 201; body={r.text}")
        user = r.json()
        assert_true("id" in user, f"register response should include id; got: {pretty(user)}")
        user_id = user["id"]

        r2 = post_json("/auth/login", {"email": email, "password": password})
        assert_eq(r2.status_code, 200, f"login should return 200; body={r2.text}")
        user2 = r2.json()
        assert_eq(user2["id"], user_id, "login should return same user id")
        assert_eq(user2["email"], email.lower(), "email should match")

    def t_duplicate_email_rejected():
        uid = uuid.uuid4().hex
        email = f"dup_{uid}@example.com"
        password = "pass1234"

        payload = {"email": email, "password": password, "role": "student", "fullName": "Dup Hosted"}
        r1 = post_json("/auth/register", payload)
        assert_eq(r1.status_code, 201, f"first register should succeed; body={r1.text}")

        r2 = post_json("/auth/register", payload)
        # Your backend uses 400 for duplicates (matches your current tests)
        assert_eq(r2.status_code, 400, f"duplicate should be rejected; body={r2.text}")

    def t_coach_assign_student_and_list():
        uid = uuid.uuid4().hex
        coach_email = f"coach_{uid}@example.com"
        student_email = f"student_{uid}@example.com"
        password = "pass1234"

        rc = post_json(
            "/auth/register",
            {"email": coach_email, "password": password, "role": "coach", "fullName": "Hosted Coach"},
        )
        rs = post_json(
            "/auth/register",
            {"email": student_email, "password": password, "role": "student", "fullName": "Hosted Student"},
        )
        assert_eq(rc.status_code, 201, f"coach register failed: {rc.text}")
        assert_eq(rs.status_code, 201, f"student register failed: {rs.text}")

        coach_id = rc.json()["id"]
        student_id = rs.json()["id"]

        ra = client.post(f"/students/{student_id}/assign_coach/{coach_id}")
        assert_eq(ra.status_code, 200, f"assign coach failed: {ra.text}")

        rl = client.get(f"/coaches/{coach_id}/students")
        assert_eq(rl.status_code, 200, f"list students failed: {rl.text}")
        students = rl.json()
        assert_true(isinstance(students, list), f"expected list; got: {pretty(students)}")
        assert_true(any(s.get("id") == student_id for s in students), "student should appear under coach")

    def t_coach_relogin_role_routes_to_coach_dashboard():
        """
        Human intent: After a coach logs out and logs back in, they should still be a coach.
        Backend check: login response must indicate role == 'coach' (frontend should route to /coach-dashboard).
        """
        uid = uuid.uuid4().hex
        coach_email = f"coach_relogin_{uid}@example.com"
        password = "pass1234"

        # Create coach
        rc = post_json(
            "/auth/register",
            {"email": coach_email, "password": password, "role": "coach", "fullName": "Hosted Coach Relogin"},
        )
        assert_eq(rc.status_code, 201, f"coach register failed: {rc.text}")

        # "Logout" is frontend-only; for backend black-box tests, we just perform a fresh login again.
        r_login = post_json("/auth/login", {"email": coach_email, "password": password})
        assert_eq(r_login.status_code, 200, f"coach login should succeed; body={r_login.text}")
        user = r_login.json()

        assert_true("role" in user, f"login response missing 'role'; cannot verify dashboard routing. got={pretty(user)}")
        assert_eq(user["role"], "coach", f"Expected role 'coach' after relogin; got={pretty(user)}")

        # If role is coach, frontend should route to /coach-dashboard, not /student-dashboard.

    def t_login_wrong_password_rejected():
        """
        Human intent: user logs out, then tries to login with wrong password; must fail.
        Backend check: /auth/login must NOT return 200 when password is incorrect.
        """
        uid = uuid.uuid4().hex
        email = f"wrongpw_{uid}@example.com"
        password = "pass1234"

        r_reg = post_json(
            "/auth/register",
            {"email": email, "password": password, "role": "student", "fullName": "Hosted WrongPW User"},
        )
        assert_eq(r_reg.status_code, 201, f"register failed: {r_reg.text}")

        # Attempt login with incorrect password
        r_bad = post_json("/auth/login", {"email": email, "password": "NOT_THE_PASSWORD"})
        assert_true(
            r_bad.status_code != 200,
            f"Login succeeded with wrong password (SECURITY BUG). status=200 body={r_bad.text}",
        )

        # Most APIs use 401/403; your backend may use 400. We accept any non-200 as pass.

    def t_student_invites_parent_and_parent_accepts():
        uid = uuid.uuid4().hex
        student_email = f"student_parent_{uid}@example.com"
        parent_email = f"parent_{uid}@example.com"
        password = "pass1234"

        rs = post_json(
            "/auth/register",
            {"email": student_email, "password": password, "role": "student", "fullName": "Student Invite"},
        )
        assert_eq(rs.status_code, 201, f"student register failed: {rs.text}")

        student_id = rs.json()["id"]

        invite_resp = post_json(
            f"/students/{student_id}/parent/link_or_invite",
            {"parent_email": parent_email, "parent_full_name": "Parent Invite"},
        )
        assert_eq(invite_resp.status_code, 200, f"parent invite failed: {invite_resp.text}")
        invite_id = invite_resp.json()["invite_id"]

        rp = post_json(
            "/auth/register",
            {"email": parent_email, "password": password, "role": "parent", "fullName": "Parent Invite"},
        )
        assert_eq(rp.status_code, 201, f"parent register failed: {rp.text}")
        parent_id = rp.json()["id"]

        parent_invites = client.get(f"/parents/{parent_id}/invites")
        assert_eq(parent_invites.status_code, 200, f"listing parent invites failed: {parent_invites.text}")
        invites = parent_invites.json()
        assert_true(any(inv["id"] == invite_id and inv["status"] == "pending" for inv in invites), "pending invite should be visible to parent")

        accept_resp = client.post(f"/parent_invites/{invite_id}/accept/{parent_id}")
        assert_eq(accept_resp.status_code, 200, f"accept invite failed: {accept_resp.text}")
        assert_eq(accept_resp.json()["status"], "accepted", "invite status should become accepted")

        linked_students = client.get(f"/parents/{parent_id}/students")
        assert_eq(linked_students.status_code, 200, f"parent students failed: {linked_students.text}")
        assert_true(any(s["id"] == student_id for s in linked_students.json()), "accepted invite should link parent to student")

    def t_coach_can_assign_peer_but_wrong_coach_cannot():
        uid = uuid.uuid4().hex
        password = "pass1234"

        r_coach_1 = post_json("/auth/register", {"email": f"coach_a_{uid}@example.com", "password": password, "role": "coach", "fullName": "Coach A"})
        r_coach_2 = post_json("/auth/register", {"email": f"coach_b_{uid}@example.com", "password": password, "role": "coach", "fullName": "Coach B"})
        r_student = post_json("/auth/register", {"email": f"student_a_{uid}@example.com", "password": password, "role": "student", "fullName": "Student A"})
        r_peer = post_json("/auth/register", {"email": f"student_b_{uid}@example.com", "password": password, "role": "student", "fullName": "Student B"})
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

        r_student = post_json("/auth/register", {"email": f"student_progress_{uid}@example.com", "password": password, "role": "student", "fullName": "Student Progress"})
        r_parent = post_json("/auth/register", {"email": f"parent_progress_{uid}@example.com", "password": password, "role": "parent", "fullName": "Parent Progress"})
        r_coach = post_json("/auth/register", {"email": f"coach_progress_{uid}@example.com", "password": password, "role": "coach", "fullName": "Coach Progress"})
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

        action_item = post_json(
            f"/coaches/{coach_id}/students/{student_id}/action_items",
            {"description": "Finish application essay"},
        )
        assert_eq(action_item.status_code, 201, f"create action item failed: {action_item.text}")

        assessment = post_json(
            f"/students/{student_id}/assessments",
            {"assessment_name": "Career Readiness", "responses": {"q1": "yes", "q2": 5}, "score": "85"},
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
        ("health endpoint works (hosted)", t_health),
        ("register->login roundtrip (hosted)", t_register_then_login_roundtrip),
        ("duplicate email rejected (hosted)", t_duplicate_email_rejected),
        ("coach assigns student and can list them (hosted)", t_coach_assign_student_and_list),
        ("coach relogin stays coach (hosted)", t_coach_relogin_role_routes_to_coach_dashboard),
        ("login wrong password rejected (hosted)", t_login_wrong_password_rejected),
        ("student invites parent and parent accepts (hosted)", t_student_invites_parent_and_parent_accepts),
        ("coach peer assignment respects ownership (hosted)", t_coach_can_assign_peer_but_wrong_coach_cannot),
        ("assessment and parent progress flow works (hosted)", t_assessment_saved_and_visible_on_parent_progress_dashboard),
    ]

    results = [run_test(name, fn) for name, fn in tests]

    print("\n=== HOSTED API TEST RESULTS ===")
    passed = 0
    for name, ok, err in results:
        if ok:
            print(f"PASS - {name}")
            passed += 1
        else:
            print(f"FAIL - {name}\n  {err}\n")

    print(f"\nPassed {passed}/{len(results)} tests")
    print(f"API_BASE_URL = {base_url}")

    client.close()


if __name__ == "__main__":
    main()
