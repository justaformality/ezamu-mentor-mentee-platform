import threading
import requests

BASE = "http://localhost:5000"

def register(email, password, role, name):
    r = requests.post(f"{BASE}/auth/register", json={
        "email": email, "password": password, "role": role, "fullName": name
    })
    if r.status_code == 201:
        return r.json()["id"]
    r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
    return r.json()["id"]

print("\nSETUP")
student1_id = register("student1@test.com", "pass1", "student", "Student One")
student2_id = register("student2@test.com", "pass1", "student", "Student Two")
student3_id = register("student3@test.com", "pass1", "student", "Student Three")
student4_id = register("student4@test.com", "pass1", "student", "Student Four")
coach_id    = register("coach1@test.com",   "pass1", "coach",   "Coach One")
parent_id   = register("parent1@test.com",  "pass1", "parent",  "Parent One")
print(f"Students: {student1_id}, {student2_id}, {student3_id}, {student4_id}")
print(f"Coach: {coach_id}, Parent: {parent_id}")


print("\nTEST 4: Concurrent availability test")

slot_results = []
def add_slot():
    r = requests.post(f"{BASE}/coaches/{coach_id}/availability", json={
        "date": "2026-06-01", "start_time": "10:00"
    })
    slot_results.append((r.status_code, r.json()))

t1 = threading.Thread(target=add_slot)
t2 = threading.Thread(target=add_slot)
t1.start(); t2.start()
t1.join(); t2.join()

print(f"Slot 1: {slot_results[0]}")
print(f"Slot 2: {slot_results[1]}")
codes = [r[0] for r in slot_results]
assert codes.count(200) == 1, f"Exactly one slot should be created: {codes}"
print("Only one slot was created (Good)")

print("\nTEST 5: Concurrent booking test")

requests.post(f"{BASE}/coaches/{coach_id}/availability", json={
    "date": "2026-05-01", "start_time": "11:00"
})

booking_results = []
def book(student_id):
    r = requests.post(f"{BASE}/appointments/book", json={
        "student_id": student_id,
        "coach_id": coach_id,
        "date": "2026-05-01",
        "time": "11:00"
    })
    booking_results.append((r.status_code, r.json()))

t1 = threading.Thread(target=book, args=(student1_id,))
t2 = threading.Thread(target=book, args=(student2_id,))
t1.start(); t2.start()
t1.join(); t2.join()

print(f"Booking 1: {booking_results[0]}")
print(f"Booking 2: {booking_results[1]}")
codes = [r[0] for r in booking_results]
assert codes.count(200) == 1, f"Exactly one booking should succeed, got: {codes}"
print("Only one booking succeeded (Good)")


print("\nTEST 6: Parent invite")

r = requests.post(f"{BASE}/students/{student4_id}/parent/link_or_invite", json={
    "parent_email": "invitedparent@test.com"
})

invited_parent_id = register("invitedparent@test.com", "pass1", "parent", "Invited Parent")

if "invite_id" in r.json():
    invite_id = r.json()["invite_id"]

    invite_results = []
    def accept_invite():
        r = requests.post(f"{BASE}/parent_invites/{invite_id}/accept/{invited_parent_id}")
        invite_results.append((r.status_code, r.json()))

    t1 = threading.Thread(target=accept_invite)
    t2 = threading.Thread(target=accept_invite)
    t1.start(); t2.start()
    t1.join(); t2.join()

    print(f"Accept 1: {invite_results[0]}")
    print(f"Accept 2: {invite_results[1]}")
    codes = [r[0] for r in invite_results]
    assert codes.count(200) == 1, f"Exactly one acceptance should succeed, got: {codes}"
    print("Invite was only accepted once (Good)")
else:
    print("Second run through, parent already exists, no invite created. This is fine.")
