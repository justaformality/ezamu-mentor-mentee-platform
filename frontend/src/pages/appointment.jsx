import coachImg from "../assets/imgs/coach-test.jpg";

// dummy list of coaches
const coaches = [
  {
    id: 1,
    name: "Sarah Johnson",
    description: "I became a coach to help students discover their passions and navigate career choices.",
  },
  {
    id: 2,
    name: "Michael Chen",
    description: "My strength is helping students build confidence and a roadmap for college and beyond.",
  },
  {
    id: 3,
    name: "Aisha Patel",
    description: "I specialize in resume building and interview prep so students can stand out.",
  },
];

function AppointmentPage() {
  return (
    <main
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "2.5rem 2rem 4rem",
      }}
    >
      <div style={{ maxWidth: "1200px", width: "100%" }}>
        <h1 style={{ marginBottom: "2rem", color: "#333" }}>Available Coaches</h1>

        {/* search + filter row (dummy) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <input
            type="text"
            placeholder="Search Coaches..."
            style={{
              flex: 1,
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <button
            style={{
              background: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#333",
            }}
          >
            {/* simple filter icon svg */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="3 4 21 4 14 12 14 19 10 21 10 12 3 4" />
            </svg>
          </button>
        </div>

        {/* coaches list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {coaches.map((coach) => (
            <div
              key={coach.id}
              style={{
                display: "flex",
                gap: "1rem",
                padding: "1rem",
                border: "1px solid #eee",
                borderRadius: "8px",
                alignItems: "center",
              }}
            >
              <img
                src={coachImg}
                alt="coach"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div style={{ flex: 1 }}>
                <h3
                  style={{ margin: "0 0 0.25rem 0", color: "#333" }}
                >
                  {coach.name}
                </h3>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: "#555" }}>
                  {coach.description}
                </p>
                <a
                  href="#"
                  style={{ color: "#f44336", fontSize: "0.9rem" }}
                >
                  ...Show More
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default AppointmentPage;
