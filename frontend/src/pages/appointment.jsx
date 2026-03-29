const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

import { useEffect, useState } from "react";
import fallbackCoachImg from "../assets/imgs/coach-test.jpg";

function AppointmentPage() {
  const [coaches, setCoaches] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoaches() {
      try {
        const res = await fetch("http://localhost:5000/api/coaches");
        const data = await res.json();
        setCoaches(data);
      } catch (err) {
        setCoaches([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCoaches();
  }, []);

  const filteredCoaches = coaches.filter((coach) =>
    coach.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "2.5rem 2rem 4rem",
        background: "linear-gradient(180deg, #7e0f1f 0%, #b53f4f 52%, #f7c5c8 100%)",
      }}
    >
      <div style={{ maxWidth: "900px", width: "100%" }}>
        <h1 style={{ marginBottom: "2rem", color: "#ffffff", textAlign: "center", fontWeight: 700, letterSpacing: 1 }}>
          Available Coaches
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "2rem",
            background: "#fff",
            borderRadius: "2rem",
            boxShadow: "0 2px 8px rgba(123,17,31,0.07)",
            padding: "0.5rem 1.2rem",
            border: "1px solid #e6b6bb",
          }}
        >
          <input
            type="text"
            placeholder="Search coaches by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "0.7rem 1.1rem",
              border: "none",
              outline: "none",
              borderRadius: "2rem",
              fontSize: "1rem",
              background: "#ffffff",
              color: "#66111b",
            }}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#b53f4f"
            style={{ marginLeft: "-2.2rem" }}
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {loading ? (
            <div style={{ color: "#ffffff", textAlign: "center", fontWeight: 500 }}>Loading coaches...</div>
          ) : filteredCoaches.length === 0 ? (
            <div style={{ color: "#ffffff", textAlign: "center", fontWeight: 500 }}>No coaches found.</div>
          ) : (
            filteredCoaches.map((coach) => (
              <div
                key={coach.id}
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  padding: "1.2rem 1.5rem",
                  border: "1px solid #e6b6bb",
                  borderRadius: "1.5rem",
                  alignItems: "center",
                  background: "#fff",
                  boxShadow: "0 4px 12px rgba(123,17,31,0.06)",
                }}
              >
                <img
                  src={coach.profile_pic_url ? (coach.profile_pic_url.startsWith("http") ? coach.profile_pic_url : `${API_BASE}${coach.profile_pic_url}`) : fallbackCoachImg}
                  alt={coach.name}
                  onError={e => { e.target.onerror = null; e.target.src = fallbackCoachImg; }}
                  style={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    background: "#f7c5c8",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, color: "#6b0f1f", fontWeight: 700, fontSize: "1.25rem" }}>{coach.name}</h3>
                  <p style={{ margin: "0.3rem 0 0.5rem 0", fontSize: "1rem", color: "#4f2b34" }}>{coach.description}</p>
                </div>
                {/* Add more actions/buttons here if needed */}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default AppointmentPage;