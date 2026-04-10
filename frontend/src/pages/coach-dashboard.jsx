import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatAppointmentCard(scheduledAt, studentName = "Student") {
  const d = new Date(scheduledAt);
  return {
    id: `${scheduledAt}-${studentName}`,
    name: studentName,
    date: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    duration: "1 hour",
    day: d.getDate(),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
}

function formatSlotLabel(hour24) {
  const date = new Date();
  date.setHours(hour24, 0, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const slotHours = [9, 10, 11, 12, 13, 14, 15, 16];

function CoachDashboard() {
  const [coachUser, setCoachUser] = useState(null);
  const [coachName, setCoachName] = useState("Coach");

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState("");

  const [selectedAvailabilityDate, setSelectedAvailabilityDate] = useState("");
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskMessage, setTaskMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setStudentsError("No logged-in coach found.");
      setStudentsLoading(false);
      setAppointmentsLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setCoachUser(parsed);
      setCoachName(parsed.fullName || parsed.name || "Coach");
      loadStudents(parsed.id);
      loadAppointments(parsed.id);
      loadAvailability(parsed.id);
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
      setStudentsError("Could not load coach information.");
      setAppointmentsError("Could not load coach information.");
      setStudentsLoading(false);
      setAppointmentsLoading(false);
    }
  }, []);

  async function loadStudents(coachId) {
    setStudentsLoading(true);
    setStudentsError("");

    try {
      const res = await fetch(`${API_BASE}/coaches/${coachId}/students`);
      const data = await res.json();

      if (!res.ok) {
        setStudentsError(data.detail || "Failed to load assigned students.");
        setStudents([]);
        setStudentsLoading(false);
        return;
      }

      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load students:", err);
      setStudentsError("Could not connect to backend for students.");
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }

  async function loadAppointments(coachId) {
    setAppointmentsLoading(true);
    setAppointmentsError("");

    try {
      const [appointmentsRes, studentsRes] = await Promise.all([
        fetch(`${API_BASE}/users/${coachId}/appointments`),
        fetch(`${API_BASE}/coaches/${coachId}/students`),
      ]);

      const appointmentsData = await appointmentsRes.json();
      const studentsData = await studentsRes.json();

      if (!appointmentsRes.ok) {
        setAppointmentsError(appointmentsData.detail || "Failed to load appointments.");
        setAppointments([]);
        setAppointmentsLoading(false);
        return;
      }

      const studentMap = {};
      if (studentsRes.ok && Array.isArray(studentsData)) {
        studentsData.forEach((student) => {
          studentMap[student.id] = student.fullName || student.name || student.email || `Student ${student.id}`;
        });
      }

      const mapped = (Array.isArray(appointmentsData) ? appointmentsData : [])
        .map((appt) =>
          formatAppointmentCard(appt.scheduledAt, studentMap[appt.student_id] || `Student ${appt.student_id}`)
        )
        .sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));

      setAppointments(mapped);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setAppointmentsError("Could not connect to backend for appointments.");
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  }

  async function loadAvailability(coachId) {
    try {
      const res = await fetch(`${API_BASE}/coaches/${coachId}/availability`);
      const data = await res.json();

      if (!res.ok) {
        setAvailabilitySlots([]);
        return;
      }

      setAvailabilitySlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load availability:", err);
      setAvailabilitySlots([]);
    }
  }

  function handleStudentClick(studentId) {
    navigate(`/student-info/${studentId}`);
  }

  async function handleAddAvailability(hour) {
    if (!coachUser?.id) return;
    if (!selectedAvailabilityDate) {
      setAvailabilityMessage("Please select a date first.");
      return;
    }

    setAvailabilityLoading(true);
    setAvailabilityMessage("");

    const startTime = `${String(hour).padStart(2, "0")}:00`;

    try {
      const res = await fetch(`${API_BASE}/coaches/${coachUser.id}/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedAvailabilityDate,
          start_time: startTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAvailabilityMessage(data.detail || "Could not save availability.");
        setAvailabilityLoading(false);
        return;
      }

      setAvailabilityMessage(`Added ${selectedAvailabilityDate} at ${formatSlotLabel(hour)}.`);
      await loadAvailability(coachUser.id);
    } catch (err) {
      console.error("Failed to save availability:", err);
      setAvailabilityMessage("Could not connect to backend to save availability.");
    } finally {
      setAvailabilityLoading(false);
    }
  }

  function toggleStudentSelection(studentId) {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  }

  async function handleAssignTasks() {
    if (!coachUser?.id) return;

    if (selectedStudentIds.length === 0) {
      setTaskMessage("Please select at least one student.");
      return;
    }

    if (!taskTitle.trim() || !taskDescription.trim()) {
      setTaskMessage("Please enter both a title and description.");
      return;
    }

    setTaskSaving(true);
    setTaskMessage("");

    try {
      const results = await Promise.all(
        selectedStudentIds.map((studentId) =>
          fetch(`${API_BASE}/coaches/${coachUser.id}/students/${studentId}/action_items`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: taskTitle.trim(),
              description: taskDescription.trim(),
            }),
          }).then(async (res) => {
            const data = await res.json().catch(() => ({}));
            return { ok: res.ok, data };
          })
        )
      );

      const failed = results.filter((result) => !result.ok);

      if (failed.length > 0) {
        setTaskMessage(
          failed[0]?.data?.detail || "One or more tasks could not be assigned."
        );
      } else {
        setTaskMessage("Task assigned successfully.");
        setTaskTitle("");
        setTaskDescription("");
        setSelectedStudentIds([]);
      }
    } catch (err) {
      console.error("Failed to assign tasks:", err);
      setTaskMessage("Could not connect to backend to assign tasks.");
    } finally {
      setTaskSaving(false);
    }
  }

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedAvailabilityDate) return [];
    return availabilitySlots.filter((slot) => slot.date === selectedAvailabilityDate);
  }, [availabilitySlots, selectedAvailabilityDate]);

  const slotTakenSet = new Set(slotsForSelectedDate.map((slot) => slot.start_time));

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "1.5rem 1rem 2.5rem",
        background: "linear-gradient(180deg, #121c34 0%, #3131d8 40%, #add8e6 100%)",
      }}
    >
      <div style={{ maxWidth: "1200px", width: "100%" }}>
        <h1
          style={{
            marginBottom: "1rem",
            color: "#fff",
            fontSize: "2.25rem",
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}
        >
          Welcome {coachName}!
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Upcoming Appointments */}
            <div
              style={{
                background: "#fff",
                borderRadius: 24,
                padding: "2rem",
                boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
              }}
            >
              <span
                style={{
                  color: "#1c2740",
                  fontWeight: 600,
                  fontSize: 22,
                  marginBottom: 24,
                  display: "block",
                }}
              >
                Upcoming Appointments
              </span>

              {appointmentsLoading ? (
                <p style={{ color: "#666" }}>Loading appointments...</p>
              ) : appointmentsError ? (
                <p style={{ color: "#1c2740" }}>{appointmentsError}</p>
              ) : appointments.length === 0 ? (
                <p style={{ color: "#777" }}>No booked appointments yet.</p>
              ) : (
                <div style={{ width: "100%", marginTop: 8 }}>
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        background: "#f8f8f8",
                        borderRadius: 8,
                        marginBottom: 18,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        padding: "0.7rem 1.2rem 0.7rem 0.7rem",
                        minHeight: 70,
                        border: "1.5px solid #e3e3e3",
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 54,
                          background: "#4f8cff",
                          borderRadius: 8,
                          color: "#fff",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 18,
                          marginRight: 12,
                        }}
                      >
                        <div style={{ fontSize: 18 }}>{appt.day}</div>
                        <div
                          style={{
                            fontSize: 13,
                            textTransform: "uppercase",
                            marginTop: -2,
                          }}
                        >
                          {appt.month}
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 15,
                            color: "#222",
                            marginBottom: 2,
                          }}
                        >
                          {appt.name}
                        </div>
                        <div style={{ color: "#1c2740", fontSize: 13, marginBottom: 1 }}>
                          {appt.date} at {appt.time}
                        </div>
                        <div style={{ color: "#888", fontSize: 13 }}>{appt.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enter Availability */}
            <div
              style={{
                background: "#fff",
                borderRadius: 24,
                padding: "2rem",
                boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#1c2740" }}>Enter Availability</h2>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Select Date
                </label>
                <input
                  type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedAvailabilityDate}
                    onChange={(e) => {
                      setSelectedAvailabilityDate(e.target.value);
                      setAvailabilityMessage("");
                  }}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    width: "100%",
                    maxWidth: "260px",
                  }}
                />
              </div>

              {selectedAvailabilityDate && (
                <>
                  <p style={{ color: "#555", marginBottom: "1rem" }}>
                    Select one-hour time slots for {selectedAvailabilityDate}.
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: "0.75rem",
                    }}
                  >
                    {slotHours.map((hour) => {
                      const timeValue = `${String(hour).padStart(2, "0")}:00`;
                      const taken = slotTakenSet.has(timeValue);

                      return (
                        <button
                          key={timeValue}
                          type="button"
                          disabled={taken || availabilityLoading}
                          onClick={() => handleAddAvailability(hour)}
                          style={{
                            padding: "0.85rem",
                            borderRadius: "10px",
                            border: "1px solid #ddd",
                            background: taken ? "#e9ecef" : "#f8f9fa",
                            color: taken ? "#777" : "#1c2740",
                            cursor: taken ? "not-allowed" : "pointer",
                            fontWeight: 600,
                          }}
                        >
                          {formatSlotLabel(hour)}
                          <div style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                            {taken ? "Added" : "Available"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {availabilityMessage && (
                <p style={{ marginTop: "1rem", color: "#1c2740", fontWeight: 500 }}>
                  {availabilityMessage}
                </p>
              )}
            </div>

            {/* Assign Action Items */}
            <div
              style={{
                background: "#fff",
                borderRadius: 24,
                padding: "2rem",
                boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#1c2740" }}>Assign Action Items</h2>

              {studentsLoading ? (
                <p style={{ color: "#666" }}>Loading students...</p>
              ) : students.length === 0 ? (
                <p style={{ color: "#777" }}>No students available to assign tasks to.</p>
              ) : (
                <>
                  <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: 600 }}>
                    Select Student(s)
                  </label>

                  <div
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "12px",
                      padding: "0.75rem",
                      marginBottom: "1rem",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {students.map((student) => (
                      <label
                        key={student.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.5rem 0.25rem",
                          color: "#1c2740",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                        />
                        <span>{student.fullName || student.name || student.email}</span>
                      </label>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Task title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.85rem",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      marginBottom: "1rem",
                    }}
                  />

                  <textarea
                    placeholder="Task description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "0.85rem",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      marginBottom: "1rem",
                      resize: "vertical",
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleAssignTasks}
                    disabled={taskSaving}
                    style={{
                      padding: "0.85rem 1.2rem",
                      border: "none",
                      borderRadius: "10px",
                      background: "#1c2740",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: taskSaving ? "not-allowed" : "pointer",
                    }}
                  >
                    {taskSaving ? "Assigning..." : "Assign Task"}
                  </button>

                  {taskMessage && (
                    <p style={{ marginTop: "1rem", color: "#1c2740", fontWeight: 500 }}>
                      {taskMessage}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Students Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: "2.2rem 2rem 2rem 2rem",
              boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                color: "#1c2740",
                fontWeight: 600,
                fontSize: 22,
                marginBottom: 24,
                alignSelf: "center",
                width: "100%",
                textAlign: "center",
              }}
            >
              Students
            </span>

            {studentsLoading ? (
              <p style={{ color: "#666", width: "100%", textAlign: "center" }}>
                Loading students...
              </p>
            ) : studentsError ? (
              <p style={{ color: "#1c2740", width: "100%", textAlign: "center" }}>
                {studentsError}
              </p>
            ) : students.length === 0 ? (
              <p style={{ color: "#777", width: "100%", textAlign: "center" }}>
                No students assigned yet.
              </p>
            ) : (
              <div style={{ width: "100%", marginTop: 8 }}>
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentClick(student.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#1c2740",
                      fontWeight: 500,
                      fontSize: 17,
                      borderRadius: 10,
                      padding: "0.85rem 0.75rem",
                      marginBottom: 10,
                      border: "1.5px solid transparent",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <span>{student.fullName || student.name || student.email}</span>
                    <span style={{ fontSize: 22, fontWeight: 400, marginLeft: 12 }}>
                      &#8250;
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default CoachDashboard;