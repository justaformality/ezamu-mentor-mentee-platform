import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatAppointmentCard(
  appointmentId,
  scheduledAt,
  studentName = "Student",
  title = ""
) {
  const d = new Date(scheduledAt);

  return {
    id: appointmentId,
    name: studentName,
    title,
    scheduledAt,
    rawDate: scheduledAt.slice(0, 10),
    rawTime: scheduledAt.slice(11, 16),
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
  const [availabilityToRemove, setAvailabilityToRemove] = useState(null);
  const [showRemoveAvailabilityConfirm, setShowRemoveAvailabilityConfirm] = useState(false);
  const [availabilityActionType, setAvailabilityActionType] = useState(null); // "add" | "remove" | null
  const [pendingAvailabilityHour, setPendingAvailabilityHour] = useState(null);

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskMessage, setTaskMessage] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskDueTime, setTaskDueTime] = useState("");
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

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

  useEffect(() => {
    if (!availabilityMessage) return;

    const timer = setTimeout(() => {
      setAvailabilityMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [availabilityMessage]);

  function getPriorityColor(priority) {
    switch ((priority || "").toLowerCase()) {
      case "high":
        return "#121c34";
      case "medium":
        return "#394c7a";
      case "low":
        return "rgb(78, 175, 205)";
      default:
        return "#add8e6";
    }
  }

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
      setStudentsError("Error loading students.");
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
          formatAppointmentCard(
            appt.id,
            appt.scheduledAt,
            studentMap[appt.student_id] || `Student ${appt.student_id}`,
            appt.title || ""
          )
        )
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

      setAppointments(mapped);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setAppointmentsError("Error loading appointments.");
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  }

  function handleAppointmentClick(appointmentId) {
    navigate(`/appointment-details/${appointmentId}`);
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
      setAvailabilityMessage("Error trying to save availability.");
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function handleConfirmAddAvailability() {
    if (pendingAvailabilityHour == null) return;

    await handleAddAvailability(pendingAvailabilityHour);

    setPendingAvailabilityHour(null);
    setAvailabilityToRemove(null);
    setAvailabilityActionType(null);
    setShowRemoveAvailabilityConfirm(false);
  }

  function openAvailabilityConfirm(hour) {
    if (!selectedAvailabilityDate) {
      setAvailabilityMessage("Please select a date first.");
      return;
    }

    const timeValue = `${String(hour).padStart(2, "0")}:00`;
    const existingSlot = slotsForSelectedDate.find((slot) => slot.start_time === timeValue);

    if (existingSlot) {
      setAvailabilityToRemove(existingSlot);
      setAvailabilityActionType("remove");
      setShowRemoveAvailabilityConfirm(true);
      return;
    }

    setPendingAvailabilityHour(hour);
    setAvailabilityActionType("add");
    setShowRemoveAvailabilityConfirm(true);
  }

  async function handleRemoveAvailability() {
    if (!coachUser?.id || !availabilityToRemove?.id) return;

    setAvailabilityLoading(true);
    setAvailabilityMessage("");

    try {
      const res = await fetch(
        `${API_BASE}/coaches/${coachUser.id}/availability/${availabilityToRemove.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setAvailabilityMessage(data.detail || "Could not remove availability.");
        setAvailabilityLoading(false);
        return;
      }

      setAvailabilityMessage(
        `Removed availability for ${availabilityToRemove.date} at ${availabilityToRemove.start_time}.`
      );

      setShowRemoveAvailabilityConfirm(false);
      setAvailabilityToRemove(null);
      setPendingAvailabilityHour(null);
      setAvailabilityActionType(null);

      await loadAvailability(coachUser.id);
    } catch (err) {
      console.error("Failed to remove availability:", err);
      setAvailabilityMessage("Error trying to remove availability.");
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

  const filteredStudents = students.filter((student) => {
    const label = (student.fullName || student.name || student.email || "").toLowerCase();
    return label.includes(studentSearch.toLowerCase());
  });

  const allStudentsSelected =
    students.length > 0 && selectedStudentIds.length === students.length;

  function toggleSelectAllStudents() {
    if (allStudentsSelected) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((student) => student.id));
    }
  }

  function getStudentSelectionLabel() {
    if (selectedStudentIds.length === 0) return "Choose students";
    if (students.length > 0 && selectedStudentIds.length === students.length) {
      return "All students selected";
    }
    if (selectedStudentIds.length === 1) return "1 student selected";
    return `${selectedStudentIds.length} students selected`;
  }

  function isPastDueDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return false;

    const selected = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();

    return selected < now;
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

    if (!taskDueDate || !taskDueTime) {
      setTaskMessage("Please enter a due date and time.");
      return;
    }

    if (isPastDueDateTime(taskDueDate, taskDueTime)) {
      setTaskMessage("Due date and time cannot be in the past.");
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
              priority: taskPriority,
              due_date: taskDueDate,
              due_time: taskDueTime,
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
        setTaskPriority("medium");
        setTaskDueDate("");
        setTaskDueTime("");
        setSelectedStudentIds([]);
        setShowStudentPicker(false);
        setStudentSearch("");
      }
    } catch (err) {
      console.error("Failed to assign tasks:", err);
      setTaskMessage("Error trying to assign tasks.");
    } finally {
      setTaskSaving(false);
    }
  }

  function getLocalDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const todayStr = getLocalDateString();

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedAvailabilityDate) return [];
    return availabilitySlots.filter((slot) => slot.date === selectedAvailabilityDate);
  }, [availabilitySlots, selectedAvailabilityDate]);

  const slotTakenSet = new Set(slotsForSelectedDate.map((slot) => slot.start_time));

  const bookedHourSet = new Set(
    appointments
      .filter((appt) => appt.rawDate === selectedAvailabilityDate)
      .map((appt) => appt.rawTime)
  );

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
            gridTemplateColumns: "0.8fr 0.8fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
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
                    <button
                      key={appt.id}
                      type="button"
                      onClick={() => handleAppointmentClick(appt.id)}
                      style={{
                        width: "100%",
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
                        {appt.title && appt.title !== "Coaching Session" && (
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 16,
                              color: "#1c2740",
                              marginBottom: 4,
                            }}
                          >
                            {appt.title}
                          </div>
                        )}
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
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                  min={todayStr}
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
                    Click a time slot to add availability. Click an added slot to remove it.
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: "0.75rem",
                    }}
                  >
                    {slotHours
                      .filter((hour) => {
                        const timeValue = `${String(hour).padStart(2, "0")}:00`;
                        return !bookedHourSet.has(timeValue);
                      })
                      .map((hour) => {
                        const timeValue = `${String(hour).padStart(2, "0")}:00`;
                        const taken = slotTakenSet.has(timeValue);
                        const disabled = availabilityLoading;

                        return (
                          <button
                            key={timeValue}
                            type="button"
                            disabled={disabled}
                            onClick={() => openAvailabilityConfirm(hour)}
                            style={{
                              padding: "0.85rem",
                              borderRadius: "10px",
                              border: taken ? "1px solid #1c2740" : "1px solid #ddd",
                              background: taken ? "#e9ecef" : "#f8f9fa",
                              color: "#1c2740",
                              cursor: disabled ? "not-allowed" : "pointer",
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
                <p style={{
                  marginTop: "1rem",
                  color: "#1c2740",
                  fontWeight: 500,
                  opacity: availabilityMessage ? 1 : 0,
                  transition: "opacity 0.5s ease",
                  minHeight: "1.25rem",
                }}>
                  {availabilityMessage}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
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
                        borderRadius: 12,
                        padding: "0.85rem 0.75rem",
                        marginBottom: 10,
                        border: "1.5px solid #e2e6f0",   // 👈 adds box outline
                        background: "#fff",
                        cursor: "pointer",
                        transition: "all 0.15s ease",     // 👈 smooth hover
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)", // 👈 subtle depth
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f5f7ff";
                        e.currentTarget.style.borderColor = "#c9d2ff";
                      }}

                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#fff";
                        e.currentTarget.style.borderColor = "#e2e6f0";
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

                  <button
                    type="button"
                    onClick={() => setShowStudentPicker((prev) => !prev)}
                    style={{
                      width: "100%",
                      padding: "0.9rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid #ddd",
                      background: "#fff",
                      color: "#1c2740",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      marginBottom: "1rem",
                    }}
                  >
                    <span>{getStudentSelectionLabel()}</span>
                    <span style={{ fontSize: "1rem" }}>{showStudentPicker ? "▲" : "▼"}</span>
                  </button>

                  {showStudentPicker && (
                    <div
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "0.75rem",
                        marginBottom: "1rem",
                        background: "#fff",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.8rem",
                          borderRadius: "10px",
                          border: "1px solid #ddd",
                          marginBottom: "0.75rem",
                        }}
                      />

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.5rem 0.25rem",
                          color: "#1c2740",
                          fontWeight: 600,
                          borderBottom: "1px solid #eee",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={allStudentsSelected}
                          onChange={toggleSelectAllStudents}
                        />
                        <span>Select all students</span>
                      </label>

                      <div
                        style={{
                          maxHeight: "180px",
                          overflowY: "auto",
                        }}
                      >
                        {filteredStudents.length === 0 ? (
                          <p style={{ margin: "0.5rem 0", color: "#777" }}>No students found.</p>
                        ) : (
                          filteredStudents.map((student) => (
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
                          ))
                        )}
                      </div>
                    </div>
                  )}

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
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Task Priority
                  </label>

                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.85rem",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      marginBottom: "1rem",
                      background: "#fff",
                      color: "#1c2740",
                    }}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Due Date
                  </label>

                  <input
                    type="date"
                    min={todayStr}
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.85rem",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      marginBottom: "1rem",
                    }}
                  />

                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Due Time
                  </label>

                  <input
                    type="time"
                    value={taskDueTime}
                    onChange={(e) => setTaskDueTime(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.85rem",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      marginBottom: "1rem",
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
        </div>
      </div>

      {showRemoveAvailabilityConfirm && (
        <div
          onClick={() => {
            setShowRemoveAvailabilityConfirm(false);
            setAvailabilityToRemove(null);
            setPendingAvailabilityHour(null);
            setAvailabilityActionType(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "1.5rem",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#121c34" }}>
              {availabilityActionType === "remove"
                ? "Remove Availability"
                : "Add Availability"}
            </h3>

            <p style={{ color: "#555", lineHeight: 1.6 }}>
              {availabilityActionType === "remove"
                ? "Are you sure you want to remove this availability?"
                : "Are you sure you want to add this availability?"}
            </p>

            <p style={{ color: "#121c34", fontWeight: 600 }}>
              {selectedAvailabilityDate} at{" "}
              {availabilityActionType === "remove"
                ? availabilityToRemove?.start_time
                : `${String(pendingAvailabilityHour).padStart(2, "0")}:00`}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                marginTop: "1.25rem",
              }}
            >
              <button
                type="button"
                onClick={
                  availabilityActionType === "remove"
                    ? handleRemoveAvailability
                    : handleConfirmAddAvailability
                }
                disabled={availabilityLoading}
                style={{
                  padding: "0.75rem 1.1rem",
                  border: "none",
                  borderRadius: 10,
                  background: "#121c34",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: availabilityLoading ? "not-allowed" : "pointer",
                }}
              >
                {availabilityLoading ? "Working..." : "Confirm"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRemoveAvailabilityConfirm(false);
                  setAvailabilityToRemove(null);
                  setPendingAvailabilityHour(null);
                  setAvailabilityActionType(null);
                }}
                style={{
                  padding: "0.75rem 1.1rem",
                  border: "none",
                  borderRadius: 10,
                  background: "#ddd",
                  color: "#121c34",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default CoachDashboard;