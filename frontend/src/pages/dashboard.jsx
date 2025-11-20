function Dashboard() {
  return (
    <main
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "3rem 2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1100px" }}>
        {/* Title */}
        <h1 style={{ marginBottom: "1rem", fontSize: "2rem" }}>
          Welcome to Your Dashboard
        </h1>

        <p
          style={{
            marginBottom: "2rem",
            color: "#555",
            fontSize: "1rem",
            lineHeight: 1.5,
          }}
        >
          This is a temporary dashboard page. After authentication is built,
          students, mentors, and coaches will see their personalized dashboard
          here.
        </p>

        {/* Example Sections */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "0.75rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
            }}
          >
            <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
              Upcoming Sessions
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#555" }}>
              No upcoming sessions scheduled.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "0.75rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
            }}
          >
            <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
              Recent Activity
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#555" }}>
              Nothing to show yet. Start exploring the platform!
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "0.75rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
            }}
          >
            <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
              Your Profile
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#555" }}>
              View or edit your profile information.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
