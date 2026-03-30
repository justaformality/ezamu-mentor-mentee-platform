import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function StudentInfo() {
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [coachUser, setCoachUser] = useState(null);
  const [coachName, setCoachName] = useState("Coach");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      setError("No logged-in coach found.");
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setCoachUser(parsed);
      setCoachName(parsed.fullName || parsed.name || "Coach");

      if (parsed.id && studentId) {
        loadStudentDetails(parsed.id, studentId);
      } else {
        setError("Missing coach or student information.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
      setError("Could not load coach information.");
      setLoading(false);
    }
  }, [studentId]);

  async function loadStudentDetails(coachId, selectedStudentId) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/coaches/${coachId}/students/${selectedStudentId}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Failed to load student details.");
        setStudent(null);
        setLoading(false);
        return;
      }

      setStudent(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load student details:", err);
      setError("Could not connect to backend for student details.");
      setStudent(null);
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "1.5rem 1rem 2.5rem",
        background: "linear-gradient(180deg, #7b232c 0%, #e9b6b6 100%)",
      }}
    >
      <div style={{ maxWidth: "1000px", width: "100%" }}>
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
              {student?.fullName
                ? `${student.fullName}'s Information`
                : "Student Information"}
          </h1>

          <button
            onClick={() => navigate("/coach-dashboard")}
            style={{
              background: "#fff",
              color: "#7b232c",
              border: "none",
              borderRadius: 10,
              padding: "0.75rem 1.1rem",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        <p
          style={{
            color: "#fff",
            marginTop: 0,
            marginBottom: "1.5rem",
            fontSize: "1rem",
          }}
        >
          Logged in as {coachName}
        </p>

        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "2rem",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          }}
        >
          {loading ? (
            <p style={{ color: "#666", margin: 0 }}>Loading student details...</p>
          ) : error ? (
            <p style={{ color: "#b00020", margin: 0 }}>{error}</p>
          ) : student ? (
            <div>
              <div
                style={{
                  color: "#7b232c",
                  fontWeight: 700,
                  fontSize: 28,
                  marginBottom: 18,
                }}
              >
                {student.fullName || "Student"}
              </div>

              <div style={{ marginBottom: 14, color: "#444" }}>
                <strong>Email:</strong> {student.email || "N/A"}
              </div>

              <div style={{ marginBottom: 14, color: "#444" }}>
                <strong>Age:</strong> {student.age || "Not provided"}
              </div>

              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    color: "#7b232c",
                    fontWeight: 600,
                    fontSize: 17,
                    marginBottom: 8,
                  }}
                >
                  Bio
                </div>
                <p style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>
                  {student.bio || "No bio provided yet."}
                </p>
              </div>

              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    color: "#7b232c",
                    fontWeight: 600,
                    fontSize: 17,
                    marginBottom: 8,
                  }}
                >
                  Interested Fields
                </div>

                {student.goals && student.goals.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {student.goals.map((goal, index) => (
                      <span
                        key={`${student.id}-goal-${index}`}
                        style={{
                          background: "#f6e2e4",
                          color: "#7b232c",
                          padding: "0.45rem 0.8rem",
                          borderRadius: 999,
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: "#777" }}>No goals listed.</p>
                )}
              </div>

              <div>
                <div
                  style={{
                    color: "#7b232c",
                    fontWeight: 600,
                    fontSize: 17,
                    marginBottom: 8,
                  }}
                >
                  Tasks
                </div>

                {student.action_items && student.action_items.length > 0 ? (
                  student.action_items.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        borderRadius: 10,
                        padding: "0.8rem 0.9rem",
                        marginBottom: 10,
                        border: "1px solid #eee",
                        background: "#fafafa",
                      }}
                    >
                      <div style={{ color: "#555", marginBottom: 4 }}>
                        {task.description}
                      </div>
                      <div style={{ color: "#999", fontSize: "0.9rem" }}>
                        Status: {task.completed ? "Completed" : "Incomplete"}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: 0, color: "#777" }}>No tasks assigned.</p>
                )}
              </div>
            </div>
          ) : (
            <p style={{ color: "#666", margin: 0 }}>Student not found.</p>
          )}
        </div>
      </div>
    </main>
  );
}

export default StudentInfo;