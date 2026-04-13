import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [viewer, setViewer] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCoachNote, setEditCoachNote] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    async function loadAppointment() {
      const stored = localStorage.getItem("user");
      if (!stored) {
        setError("No logged-in user found.");
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        setViewer(parsed);

        const res = await fetch(
          `${API_BASE}/appointments/${appointmentId}?viewer_id=${parsed.id}`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || "Failed to load appointment.");
          setAppointment(null);
          setLoading(false);
          return;
        }

        setAppointment(data);
        setEditTitle(data.title && data.title !== "Coaching Session" ? data.title : "");
        setEditCoachNote(data.coach_note || "");
      } catch (err) {
        console.error("Failed to load appointment details:", err);
        setError("Could not connect to backend.");
      } finally {
        setLoading(false);
      }
    }

    loadAppointment();
  }, [appointmentId]);

  async function handleCancelAppointment() {
    if (!viewer?.id || !appointment?.id) return;

    setCancelLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/appointments/${appointment.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actor_id: viewer.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || "Could not cancel appointment.");
        setCancelLoading(false);
        return;
      }

      setAppointment((prev) => ({ ...prev, status: "canceled" }));
      setMessage("Appointment canceled successfully.");
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      setMessage("Could not connect to backend.");
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleSaveAppointment() {
    if (!viewer?.id || !appointment?.id) return;

    setSaveLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actor_id: viewer.id,
          title: editTitle,
          coach_note: editCoachNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || "Could not update appointment.");
        setSaveLoading(false);
        return;
      }

      setAppointment((prev) => ({
        ...prev,
        title: data.title,
        coach_note: data.coach_note,
      }));
      setIsEditing(false);
      setMessage("Appointment updated successfully.");
    } catch (err) {
      console.error("Failed to update appointment:", err);
      setMessage("Could not connect to backend.");
    } finally {
      setSaveLoading(false);
    }
  }

  function goBack() {
    if (viewer?.role === "coach") {
      navigate("/coach-dashboard");
      return;
    }
    if (viewer?.role === "parent") {
      navigate("/parent-dashboard");
      return;
    }
    navigate("/student-dashboard");
  }

  const formattedDateTime = appointment?.scheduledAt
    ? new Date(appointment.scheduledAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    : "";

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
      <div style={{ maxWidth: "900px", width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              color: "#fff",
              fontSize: "2.1rem",
              margin: 0,
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            Appointment Details
          </h1>

          <button
            onClick={goBack}
            style={{
              background: "#fff",
              color: "#121c34",
              border: "none",
              borderRadius: 10,
              padding: "0.75rem 1.1rem",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            ← Back
          </button>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "2rem",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          }}
        >
          {loading ? (
            <p style={{ color: "#666", margin: 0 }}>Loading appointment...</p>
          ) : error ? (
            <p style={{ color: "#121c34", margin: 0 }}>{error}</p>
          ) : appointment ? (
            <div>
              {appointment.can_edit && isEditing ? (
                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      color: "#121c34",
                    }}
                  >
                    Appointment Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Enter a custom appointment title"
                    style={{
                      width: "100%",
                      padding: "0.85rem",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      marginBottom: "1rem",
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      color: "#121c34",
                    }}
                  >
                    Coach’s Note
                  </label>
                  <textarea
                    value={editCoachNote}
                    onChange={(e) => setEditCoachNote(e.target.value)}
                    placeholder="Add a note for this appointment"
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "0.85rem",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      resize: "vertical",
                    }}
                  />
                </div>
              ) : (
                <>
                  {appointment.title && appointment.title !== "Coaching Session" && (
                    <div
                      style={{
                        color: "#121c34",
                        fontWeight: 700,
                        fontSize: 28,
                        marginBottom: 18,
                      }}
                    >
                      {appointment.title}
                    </div>
                  )}

                  {appointment.description && (
                    <div style={{ marginBottom: 18, color: "#444" }}>
                      <strong>Meeting Description:</strong> {appointment.description}
                    </div>
                  )}

                  {appointment.coach_note && (
                    <div style={{ marginBottom: 18, color: "#444" }}>
                      <strong>Coach’s Note:</strong> {appointment.coach_note}
                    </div>
                  )}
                </>
              )}

              <div style={{ marginBottom: 14, color: "#444" }}>
                <strong>Day & Time:</strong> {formattedDateTime}
              </div>

              <div style={{ marginBottom: 14, color: "#444" }}>
                <strong>Coach:</strong> {appointment.coach_name}
              </div>

              <div style={{ marginBottom: 14, color: "#444" }}>
                <strong>Student:</strong> {appointment.student_name}
              </div>

              <div style={{ marginBottom: 22, color: "#444" }}>
                <strong>Parent:</strong> {appointment.parent_name || "No parent linked"}
              </div>

              <div style={{ marginBottom: 22, color: "#444" }}>
                <strong>Status:</strong> {appointment.status}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  marginTop: "1.5rem",
                }}
              >
                {!isEditing && (
                  <a
                    href={
                      appointment.meeting_link && !appointment.meeting_link.includes("zoom.us")
                        ? appointment.meeting_link
                        : `https://meet.jit.si/ezamu-appointment-${appointment.id}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "0.85rem 1.2rem",
                      border: "none",
                      borderRadius: "10px",
                      background: "#1c2740",
                      color: "#fff",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    Join Meeting
                  </a>
                )}

                {appointment.can_edit && !isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: "0.85rem 1.2rem",
                      border: "none",
                      borderRadius: "10px",
                      background: "#394c7a",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Edit Meeting
                  </button>
                )}

                {appointment.can_edit && isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveAppointment}
                      disabled={saveLoading}
                      style={{
                        padding: "0.85rem 1.2rem",
                        border: "none",
                        borderRadius: "10px",
                        background: "#1c2740",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: saveLoading ? "not-allowed" : "pointer",
                      }}
                    >
                      {saveLoading ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditTitle(
                          appointment.title && appointment.title !== "Coaching Session"
                            ? appointment.title
                            : ""
                        );
                        setEditCoachNote(appointment.coach_note || "");
                      }}
                      style={{
                        padding: "0.85rem 1.2rem",
                        border: "none",
                        borderRadius: "10px",
                        background: "#a52a2a",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Cancel Edit
                    </button>
                  </>
                )}

                {!isEditing && appointment.can_cancel && appointment.status !== "canceled" && (
                  <button
                    type="button"
                    onClick={handleCancelAppointment}
                    disabled={cancelLoading}
                    style={{
                      padding: "0.85rem 1.2rem",
                      border: "none",
                      borderRadius: "10px",
                      background: "#a52a2a",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: cancelLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {cancelLoading ? "Canceling..." : "Cancel Appointment"}
                  </button>
                )}
              </div>

              {message && (
                <p style={{ marginTop: "1rem", color: "#121c34", fontWeight: 600 }}>
                  {message}
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: "#666", margin: 0 }}>Appointment not found.</p>
          )}
        </div>
      </div>
    </main>
  );
}

export default AppointmentDetails;