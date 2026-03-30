import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function TeamPage() {
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setStudentName(parsed.fullName || parsed.name || "Student");
    }
  }, []);

  //  dummy data (replace with API)
  const assignedParent = {
    name: "Jane Smith",
    email: "jane.smith@email.com",
    relationship: "Mother",
  };

  const assignedPeer = {
    name: "Alex Rivera",
    email: "alex.rivera@email.com",
    major: "Computer Science",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "2rem",
        background:
          "linear-gradient(180deg, #121c34 0%, #3131d8 40%, #add8e6 100%)",
      }}
    >
      <div style={{ maxWidth: "900px", width: "100%" }}>
        <Link
          to="/student-dashboard"
          style={{
            display: "inline-block",
            marginBottom: "1rem",
            textDecoration: "none",
          }}
        >
          <button
            style={{
              backgroundColor: "#add8e6",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              fontWeight: "500",
            }}
          >
            ← Back to Dashboard
          </button>
        </Link>

        <h1 style={{ color: "#fff", marginBottom: "2rem" }}>
          {studentName}'s Team
        </h1>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          {/* Parent Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "1.5rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}> Parent</h2>

            <p style={{ fontWeight: "600" }}>{assignedParent.name}</p>
            <p style={{ color: "#666" }}>Email: {assignedParent.email}</p>
            <p style={{ color: "#999" }}>Relationship: {assignedParent.relationship}</p>
            
          </div>

          {/* Peer Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "1.5rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}> Peer</h2>

            <p style={{ fontWeight: "600" }}>{assignedPeer.name}</p>
            <p style={{ color: "#666" }}>Email: {assignedPeer.email}</p>
            <p style={{ color: "#999" }}>Major: {assignedPeer.major}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default TeamPage;