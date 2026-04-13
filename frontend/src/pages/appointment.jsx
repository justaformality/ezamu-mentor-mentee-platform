const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

import { useEffect, useMemo, useState } from "react";
import fallbackCoachImg from "../assets/imgs/coach-test.jpg";

const expertiseOptions = [
  "Engineering",
  "Medicine",
  "Business",
  "Arts",
  "Science",
  "Technology",
  "Education",
  "Law",
  "Other",
];

function AppointmentPage() {
  const [coaches, setCoaches] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [coachAvailability, setCoachAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookingMode, setBookingMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [meetingDescription, setMeetingDescription] = useState("");
  

  useEffect(() => {
    async function fetchCoaches() {
      try {
        const res = await fetch(`${API_BASE}/api/coaches`);
        const data = await res.json();

        const normalized = Array.isArray(data)
          ? data.map((coach) => ({
            id: coach.id,
            name: coach.name || coach.fullName || coach.email || "Coach",
            profile_pic_url: coach.profile_pic_url || "",
            bio: coach.bio || coach.description || "Coach at EZAMU platform",
            expertise: Array.isArray(coach.expertise)
              ? coach.expertise
              : Array.isArray(coach.expertise_json)
                ? coach.expertise_json
                : Array.isArray(coach.fields)
                  ? coach.fields
                  : [],
          }))
          : [];

        setCoaches(normalized);
      } catch (err) {
        console.error("Failed to fetch coaches:", err);
        setCoaches([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCoaches();
  }, []);

  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) => {
      const coachName = (coach.name || "").toLowerCase();
      const matchesSearch = coachName.includes(search.toLowerCase());

      const matchesExpertise =
        !selectedExpertise ||
        (Array.isArray(coach.expertise) &&
          coach.expertise.some(
            (item) =>
              String(item).toLowerCase() === selectedExpertise.toLowerCase()
          ));

      return matchesSearch && matchesExpertise;
    });
  }, [coaches, search, selectedExpertise]);

  const COACHES_PER_PAGE = 9;
  const totalPages = Math.ceil(filteredCoaches.length / COACHES_PER_PAGE);

  const paginatedCoaches = filteredCoaches.slice(
    (currentPage - 1) * COACHES_PER_PAGE,
    currentPage * COACHES_PER_PAGE
  );

  async function loadCoachAvailability(coachId) {
    setAvailabilityLoading(true);
    setBookingMessage("");
    setSelectedDate("");
    setSelectedTime("");

    try {
      const res = await fetch(`${API_BASE}/coaches/${coachId}/availability`);
      const data = await res.json();

      if (!res.ok) {
        setCoachAvailability([]);
        return;
      }

      setCoachAvailability(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load coach availability:", err);
      setCoachAvailability([]);
    } finally {
      setAvailabilityLoading(false);
    }
  }

  function openCoachModal(coach) {
    setSelectedCoach(coach);
    setBookingMode(false);
    setSelectedDate("");
    setSelectedTime("");
    setShowConfirmModal(false);
    setBookingMessage("");
    setCoachAvailability([]);
    setMeetingDescription("");
  }

  function startBooking() {
    if (!selectedCoach?.id) return;
    setBookingMode(true);
    loadCoachAvailability(selectedCoach.id);
  }

  function closeCoachModal() {
    setSelectedCoach(null);
    setBookingMode(false);
    setSelectedDate("");
    setSelectedTime("");
    setShowConfirmModal(false);
    setBookingMessage("");
    setCoachAvailability([]);
    setMeetingDescription("");
  }

  function formatTimeLabel(time24) {
    const [hour, minute] = String(time24).split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute), 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const availableSlotsForSelectedDate = selectedDate
    ? coachAvailability.filter((slot) => slot.date === selectedDate)
    : [];

  async function confirmBooking() {
    const stored = JSON.parse(localStorage.getItem("user") || "null");

    if (!stored?.id || !selectedCoach?.id || !selectedDate || !selectedTime) {
      setBookingMessage("Missing booking information.");
      return;
    }

    setBookingLoading(true);
    setBookingMessage("");

    try {
      const res = await fetch(`${API_BASE}/appointments/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: stored.id,
          coach_id: selectedCoach.id,
          date: selectedDate,
          time: selectedTime,
          description: meetingDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBookingMessage(data.detail || "Could not book appointment.");
        setBookingLoading(false);
        setShowConfirmModal(false);
        return;
      }

      setBookingMessage("Appointment booked successfully.");
      setShowConfirmModal(false);

      // remove the booked slot from current availability UI
      setCoachAvailability((prev) =>
        prev.filter(
          (slot) =>
            !(slot.date === selectedDate && slot.start_time === selectedTime)
        )
      );

      // close after short delay so dashboards can reflect backend data when revisited
      setTimeout(() => {
        closeCoachModal();
      }, 900);
    } catch (err) {
      console.error("Failed to book appointment:", err);
      setBookingMessage("Could not connect to backend to book appointment.");
      setShowConfirmModal(false);
    } finally {
      setBookingLoading(false);
    }
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedExpertise]);

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
            marginBottom: "1rem",
            color: "#ffffff",
            textAlign: "center",
          }}
        >
          Book an Appointment
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#ffffff",
            marginBottom: "2rem",
            fontSize: "1rem",
          }}
        >
          Search for a Coach or Select an Area of Expertise.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <input
            type="text"
            placeholder="Search coaches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "650px",
              padding: "0.9rem 1rem",
              borderRadius: "10px",
              border: "none",
              fontSize: "1rem",
              outline: "none",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.9rem",
            marginBottom: "2rem",
          }}
        >
          {expertiseOptions.map((field) => {
            const isSelected = selectedExpertise === field;

            return (
              <button
                key={field}
                type="button"
                onClick={() =>
                  setSelectedExpertise((prev) => (prev === field ? "" : field))
                }
                style={{
                  border: isSelected ? "2px solid #121c34" : "1px solid #e6b6bb",
                  borderRadius: "1rem",
                  padding: "0.9rem 1.2rem",
                  minWidth: "120px",
                  textAlign: "center",
                  background: isSelected ? "#f7c5c8" : "#fff",
                  color: "#121c34",
                  fontWeight: 600,
                  fontSize: "0.98rem",
                  cursor: "pointer",
                  boxShadow: isSelected
                    ? "0 2px 8px rgba(126,15,31,0.10)"
                    : "0 2px 8px rgba(126,15,31,0.06)",
                  transition: "all 0.18s",
                }}
              >
                {field}
              </button>
            );
          })}
        </div>

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
            paginatedCoaches.map((coach) => (
              <div
                key={coach.id}
                onClick={() => openCoachModal(coach)}
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

                <h3 style={{ marginBottom: "0.6rem" }}>{coach.name}</h3>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "0.5rem",
                    marginBottom: "0.8rem",
                  }}
                >
                  {(coach.expertise || []).map((item) => (
                    <span
                      key={item}
                      style={{
                        background: "#f7c5c8",
                        border: "1px solid #121c34",
                        borderRadius: "999px",
                        padding: "0.3rem 0.75rem",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#121c34",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <p style={{ fontSize: "0.9rem", color: "#666" }}>
                  {coach.bio}
                </p>
              </div>
            ))
          )}
        </div>

        {!loading && filteredCoaches.length > COACHES_PER_PAGE && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.6rem",
              marginTop: "2rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: "0.65rem 1rem",
                border: "none",
                borderRadius: "8px",
                background: currentPage === 1 ? "#cfcfcf" : "#1c2740",
                color: "#fff",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: "0.65rem 0.95rem",
                  minWidth: "42px",
                  border: "none",
                  borderRadius: "8px",
                  background: currentPage === page ? "#f7c5c8" : "#ffffff",
                  color: "#121c34",
                  cursor: "pointer",
                  fontWeight: 700,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={{
                padding: "0.65rem 1rem",
                border: "none",
                borderRadius: "8px",
                background: currentPage === totalPages ? "#cfcfcf" : "#1c2740",
                color: "#fff",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedCoach && (
        <div
          onClick={closeCoachModal}
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
            padding: "1rem",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              textAlign: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
            }}
          >
            <img
              src={
                selectedCoach.profile_pic_url
                  ? selectedCoach.profile_pic_url.startsWith("http")
                    ? selectedCoach.profile_pic_url
                    : `${API_BASE}${selectedCoach.profile_pic_url}`
                  : fallbackCoachImg
              }
              alt={selectedCoach.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackCoachImg;
              }}
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "1rem",
              }}
            />

            <h2 style={{ marginBottom: "0.75rem" }}>{selectedCoach.name}</h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {(selectedCoach.expertise || []).map((item) => (
                <span
                  key={item}
                  style={{
                    background: "#f7c5c8",
                    border: "1px solid #121c34",
                    borderRadius: "999px",
                    padding: "0.35rem 0.8rem",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "#121c34",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>

            <p style={{ color: "#666", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              {selectedCoach.bio || "No bio available yet."}
            </p>

            {!bookingMode ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={startBooking}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    borderRadius: "8px",
                    background: "#1c2740",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Book
                </button>

                <button
                  type="button"
                  onClick={closeCoachModal}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    borderRadius: "8px",
                    background: "#a52a2a",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div style={{ marginTop: "1rem", textAlign: "left" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    color: "#1c2740",
                    marginBottom: "0.5rem",
                  }}
                >
                  Select Date
                </label>

                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime("");
                    setBookingMessage("");
                  }}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    marginBottom: "1rem",
                  }}
                />
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    color: "#1c2740",
                    marginBottom: "0.5rem",
                  }}
                >
                  Meeting Description
                </label>

                <textarea
                  value={meetingDescription}
                  onChange={(e) => setMeetingDescription(e.target.value)}
                  placeholder="What is this appointment about?"
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
                {availabilityLoading ? (
                  <p style={{ color: "#666", textAlign: "center" }}>Loading availability...</p>
                ) : selectedDate ? (
                  availableSlotsForSelectedDate.length > 0 ? (
                    <>
                      <p
                        style={{
                          color: "#1c2740",
                          fontWeight: 600,
                          marginBottom: "0.75rem",
                          textAlign: "center",
                        }}
                      >
                        Available Times
                      </p>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "0.75rem",
                        }}
                      >
                        {availableSlotsForSelectedDate.map((slot) => (
                          <button
                            key={`${slot.date}-${slot.start_time}`}
                            type="button"
                            onClick={() => {
                              setSelectedTime(slot.start_time);
                              setShowConfirmModal(true);
                            }}
                            style={{
                              padding: "0.8rem",
                              borderRadius: "10px",
                              border: "1px solid #ddd",
                              background: "#f8f9fa",
                              color: "#1c2740",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                          >
                            {formatTimeLabel(slot.start_time)}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "#777", textAlign: "center" }}>
                      No availability for that date.
                    </p>
                  )
                ) : null}

                {bookingMessage && (
                  <p
                    style={{
                      marginTop: "1rem",
                      color: "#1c2740",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {bookingMessage}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.75rem",
                    marginTop: "1.25rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setBookingMode(false);
                      setSelectedDate("");
                      setSelectedTime("");
                      setShowConfirmModal(false);
                      setBookingMessage("");
                      setMeetingDescription("");
                    }}
                    style={{
                      padding: "0.75rem 1.5rem",
                      border: "none",
                      borderRadius: "8px",
                      background: "#1c2740",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={closeCoachModal}
                    style={{
                      padding: "0.75rem 1.5rem",
                      border: "none",
                      borderRadius: "8px",
                      background: "#a52a2a",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {showConfirmModal && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1100,
                  padding: "1rem",
                }}
                onClick={() => setShowConfirmModal(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    padding: "1.5rem",
                    width: "100%",
                    maxWidth: "420px",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
                    textAlign: "center",
                  }}
                >
                  <h3 style={{ marginTop: 0, color: "#1c2740" }}>Confirm Appointment</h3>
                  <p style={{ color: "#555", lineHeight: 1.6 }}>
                    Book <strong>{selectedCoach.name}</strong> on <strong>{selectedDate}</strong> at{" "}
                    <strong>{formatTimeLabel(selectedTime)}</strong>?
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "0.75rem",
                      marginTop: "1rem",
                    }}
                  >
                    <button
                      type="button"
                      onClick={confirmBooking}
                      disabled={bookingLoading}
                      style={{
                        padding: "0.75rem 1.3rem",
                        border: "none",
                        borderRadius: "8px",
                        background: "#1c2740",
                        color: "#fff",
                        cursor: bookingLoading ? "not-allowed" : "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {bookingLoading ? "Booking..." : "Confirm"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowConfirmModal(false)}
                      style={{
                        padding: "0.75rem 1.3rem",
                        border: "none",
                        borderRadius: "8px",
                        background: "#a52a2a",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default AppointmentPage;