const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

import { useEffect, useState } from "react";
import fallbackCoachImg from "../assets/imgs/coach-test.jpg";

function AppointmentPage() {
  const [coaches, setCoaches] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStrength, setSelectedStrength] = useState("All");
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  ];

  const mock = [
    {
        id: 1,
        name: "Sarah Johnson",
        strength: "All",
        bio: "Helps students navigate college applications and admissions strategy.",
        image: "/src/assets/imgs/coach-test.jpg",
    },
    {
        id: 2,
        name: "Michael Chen",
        strength: "Career Development",
        bio: "Focuses on career planning, resume building, and internships.",
        image: "/src/assets/imgs/coach-test2.jpg",
    },
    {
        id: 3,
        name: "Nina Perez",
        strength: "Interview Preparation",
        bio: "Specializes in mock interviews and communication.",
        image: "/src/assets/imgs/coach-test.jpg",
    },
    {
        id: 4,
        name: "Amarah James",
        strength: "High School Mentor",
        bio: "Assisting students who need a peer to speak to.",
        image: "/src/assets/imgs/coach-test.jpg",
    },
    {
        id: 5,
        name: "Mark Dunst",
        strength: "College Advisor",
        bio: "Helps students navigate college applications and admissions strategy.",
        image: "/src/assets/imgs/coach-test2.jpg",
    },
    {
        id: 6,
        name: "Arnold Dunst",
        strength: "College Advisor",
        bio: "Assists students who want a clear look into their future colleges.",
        image: "/src/assets/imgs/coach-test2.jpg",
    },
    {
        id: 7,
        name: "Miguel Bris",
        strength: "Career Development",
        bio: "Focuses on career planning, resume building, and internships.",
        image: "/src/assets/imgs/coach-test2.jpg",
    },
    {
        id: 8,
        name: "Nessa Roald",
        strength: "High School Mentor",
        bio: "Assisting students who need a peer to speak to.",
        image: "/src/assets/imgs/coach-test.jpg",
    },
  ];

  // Fetch coaches from API
  useEffect(() => {
    async function fetchCoaches() {
      try {
        const res = await fetch(`${API_BASE}/api/coaches`);
        const data = await res.json();
        // setCoaches(data); commented out for testing
        setCoaches(data.length ? data : mock);
      } catch (err) {
        setCoaches(mock); //changed from [] to mock for testing
      } finally {
        setLoading(false);
      }
    }
    fetchCoaches();
  }, []);

  // Extract unique strengths from API data
  const strengths = [
    "All",
    ...new Set(coaches.map((c) => c.strength).filter(Boolean)),
  ];

  // Filtering logic (search + strength)
  const filteredCoaches = coaches.filter((coach) => {
    const matchesSearch = coach.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStrength =
      selectedStrength === "All" || coach.strength === selectedStrength;

    return matchesSearch && matchesStrength;
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "2.5rem 2rem 4rem",
        background:
          "linear-gradient(180deg, #121c34 0%, #3131d8 40%, #add8e6 100%)",
      }}
    >
      <div style={{ maxWidth: "1100px", width: "100%" }}>
        <h1
          style={{
            marginBottom: "2rem",
            color: "#ffffff",
            textAlign: "center",
          }}
        >
          Book an Appointment
        </h1>

        {/* SEARCH + FILTER */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search coaches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: "250px",
              padding: "0.75rem",
              borderRadius: "6px",
              border: "none",
            }}
          />

          <select
            value={selectedStrength}
            onChange={(e) => setSelectedStrength(e.target.value)}
            style={{
              padding: "0.75rem",
              borderRadius: "6px",
              border: "none",
            }}
          >
            {strengths.map((strength) => (
              <option key={strength} value={strength}>
                {strength}
              </option>
            ))}
          </select>
        </div>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {loading ? (
            <p style={{ color: "#fff" }}>Loading...</p>
          ) : filteredCoaches.length === 0 ? (
            <p style={{ color: "#fff" }}>No coaches found.</p>
          ) : (
            filteredCoaches.map((coach) => (
              <div
                key={coach.id}
                onClick={() => setSelectedCoach(coach)}
                style={{
                  cursor: "pointer",
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={
                    coach.profile_pic_url
                      ? coach.profile_pic_url.startsWith("http")
                        ? coach.profile_pic_url
                        : `${API_BASE}${coach.profile_pic_url}`
                      : fallbackCoachImg
                  }
                  alt={coach.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackCoachImg;
                  }}
                  style={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: "1rem",
                  }}
                />

                <h3>{coach.name}</h3>

                <p style={{ color: "#007bff", fontWeight: "600" }}>
                  {coach.strength || "General Coaching"}
                </p>

                <p style={{ fontSize: "0.9rem", color: "#666" }}>
                  {coach.description}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    
    {selectedCoach && (
        <div
          onClick={() => {
            setSelectedCoach(null);
            setSelectedTime("");
            setSelectedDate("");
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "12px",
              width: "420px",
              textAlign: "center",
            }}
          >
            <h2>{selectedCoach.name}</h2>

            <p style={{ color: "#007bff", fontWeight: "600" }}>
              {selectedCoach.strength || "General Coaching"}
            </p>

            <p style={{ color: "#666", marginBottom: "1rem" }}>
              {selectedCoach.description}
            </p>

            {/* 📅 DATE PICKER */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontWeight: "600" }}>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem",
                  width: "100%",
                }}
              />
            </div>

            {/* ⏰ TIME SLOTS */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontWeight: "600" }}>Select Time:</p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.5rem",
                }}
              >
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "6px",
                      border:
                        selectedTime === time
                          ? "2px solid #4170a2"
                          : "1px solid #7a85eb",
                      background:
                        selectedTime === time ? "#4170a2" : "#9f8be0",
                      cursor: "pointer",
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* book button*/}
            <button
              disabled={!selectedDate || !selectedTime}
              onClick={() => {
                alert(
                  `Booked ${selectedCoach.name} on ${selectedDate} at ${selectedTime}`
                );
              }}
              style={{
                padding: "0.7rem 1.5rem",
                border: "none",
                borderRadius: "6px",
                background:
                  selectedDate && selectedTime ? "#1c2740" : "#ccc",
                color: "#fff",
                cursor: selectedDate && selectedTime ? "pointer" : "not-allowed",
              }}
            >
              Book Appointment
            </button>
          </div>
        </div>
      )} 
    </main>
  );
}

export default AppointmentPage;