import { useMemo, useState } from "react";

const initialAppointments = [
  {
    id: 1,
    student: "Ramona Jones",
    dateISO: "2026-01-20T15:00:00",
    durationMins: 45,
    mode: "Zoom",
    meetingLink: "https://zoom.us/j/1234567890",
    status: "Upcoming",
    focus: "Career exploration + strengths",
    notes: "Review interests assessment, discuss potential majors and early internship plan.",
  },
  {
    id: 2,
    student: "Emily Rodriguez",
    dateISO: "2026-02-12T14:00:00",
    durationMins: 30,
    mode: "In-person",
    meetingLink: "",
    status: "Upcoming",
    focus: "Resume feedback",
    notes: "Bring latest resume draft; focus on bullet impact + quantification.",
  },
  {
    id: 3,
    student: "Mari Lopez",
    dateISO: "2026-04-02T15:00:00",
    durationMins: 45,
    mode: "Zoom",
    meetingLink: "https://zoom.us/j/9988776655",
    status: "Requested",
    focus: "Interview prep",
    notes: "Student requested mock interview for internship role.",
  },
  {
    id: 4,
    student: "Alex Scott",
    dateISO: "2026-01-05T11:30:00",
    durationMins: 45,
    mode: "Zoom",
    meetingLink: "https://zoom.us/j/5555555555",
    status: "Completed",
    focus: "Goal setting",
    notes: "Set 3 goals for spring semester; follow-up needed on networking outreach.",
  },
];

function formatDateTime(dateISO) {
  const d = new Date(dateISO);
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return { date, time };
}

function statusBadgeStyle(status) {
  const base = {
    padding: "0.25rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: 600,
    border: "1px solid #eee",
  };

  if (status === "Upcoming") return { ...base, background: "#E8F0FE", color: "#1a73e8" };
  if (status === "Requested") return { ...base, background: "#FFF4E5", color: "#b45309" };
  if (status === "Completed") return { ...base, background: "#E7F7ED", color: "#15803d" };
  if (status === "Canceled") return { ...base, background: "#FEE2E2", color: "#b91c1c" };

  return base;
}

export default function CoachAppointments() {
  const [tab, setTab] = useState("Upcoming"); // Upcoming | Completed | Requested | All
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("All"); // All | Zoom | In-person
  const [statusFilter, setStatusFilter] = useState("All"); // All | Upcoming | Requested | Completed | Canceled
  const [appointments, setAppointments] = useState(initialAppointments);

  const [selected, setSelected] = useState(null); // appointment object
  const [notesDraft, setNotesDraft] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return appointments
      .filter((a) => (tab === "All" ? true : a.status === tab))
      .filter((a) => (modeFilter === "All" ? true : a.mode === modeFilter))
      .filter((a) => (statusFilter === "All" ? true : a.status === statusFilter))
      .filter((a) => (q ? a.student.toLowerCase().includes(q) || a.focus.toLowerCase().includes(q) : true))
      .sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO));
  }, [appointments, tab, query, modeFilter, statusFilter]);

  function openDetails(appt) {
    setSelected(appt);
    setNotesDraft(appt.notes || "");
  }

  function closeDetails() {
    setSelected(null);
    setNotesDraft("");
  }

  function updateStatus(id, newStatus) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (selected?.id === id) {
      setSelected((prevSel) => (prevSel ? { ...prevSel, status: newStatus } : prevSel));
    }
  }

  async function copyLink(link) {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      alert("Meeting link copied!");
    } catch {
      alert("Could not copy link (browser permissions).");
    }
  }

  function saveNotes() {
    if (!selected) return;
    setAppointments((prev) =>
      prev.map((a) => (a.id === selected.id ? { ...a, notes: notesDraft } : a))
    );
    setSelected((prevSel) => (prevSel ? { ...prevSel, notes: notesDraft } : prevSel));
    alert("Notes saved (local state).");
  }

  return (
    <main style={{ width: "100%", display: "flex", justifyContent: "center", padding: "2.5rem 2rem 4rem" }}>
      <div style={{ maxWidth: "1200px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h1 style={{ margin: 0, color: "#333" }}>Coach Appointments</h1>
            <p style={{ margin: "0.5rem 0 0", color: "#666" }}>
              Manage your upcoming sessions with students.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {["Upcoming", "Requested", "Completed", "All"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "0.55rem 0.9rem",
                borderRadius: "999px",
                border: t === tab ? "1px solid #f44336" : "1px solid #eaeaea",
                background: t === tab ? "#fff5f5" : "#fff",
                color: t === tab ? "#f44336" : "#333",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "10px",
            padding: "1rem",
            marginBottom: "1.25rem",
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr",
            gap: "0.75rem",
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student or focus…"
            style={{
              padding: "0.7rem",
              borderRadius: "8px",
              border: "1px solid #ddd",
              outline: "none",
            }}
          />

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            style={{
              padding: "0.7rem",
              borderRadius: "8px",
              border: "1px solid #ddd",
              outline: "none",
              background: "#fff",
            }}
          >
            <option value="All">All modes</option>
            <option value="Zoom">Zoom</option>
            <option value="In-person">In-person</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.7rem",
              borderRadius: "8px",
              border: "1px solid #ddd",
              outline: "none",
              background: "#fff",
            }}
          >
            <option value="All">All statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Requested">Requested</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "1.25rem", border: "1px solid #eee", borderRadius: "10px", background: "#fff" }}>
              <p style={{ margin: 0, color: "#666" }}>No appointments match your filters.</p>
            </div>
          ) : (
            filtered.map((appt) => {
              const { date, time } = formatDateTime(appt.dateISO);

              return (
                <div
                  key={appt.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #eee",
                    borderRadius: "10px",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {/* Date pill */}
                    <div
                      style={{
                        minWidth: "90px",
                        textAlign: "center",
                        padding: "0.6rem 0.5rem",
                        borderRadius: "10px",
                        border: "1px solid #eaeaea",
                        background: "#fafafa",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "#333" }}>{date.split(" ")[0]}</div>
                      <div style={{ fontSize: "0.9rem", color: "#555" }}>{date}</div>
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                        <h3 style={{ margin: 0, color: "#333" }}>{appt.student}</h3>
                        <span style={statusBadgeStyle(appt.status)}>{appt.status}</span>
                      </div>

                      <p style={{ margin: "0.35rem 0 0", color: "#555" }}>
                        {time} • {appt.durationMins} min • {appt.mode}
                      </p>

                      <p style={{ margin: "0.35rem 0 0", color: "#777" }}>
                        <b>Focus:</b> {appt.focus}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {appt.meetingLink ? (
                      <button
                        onClick={() => copyLink(appt.meetingLink)}
                        style={{
                          padding: "0.55rem 0.75rem",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          background: "#fff",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Copy Link
                      </button>
                    ) : null}

                    <button
                      onClick={() => openDetails(appt)}
                      style={{
                        padding: "0.55rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #f44336",
                        background: "#fff5f5",
                        color: "#f44336",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      View Details
                    </button>

                    {appt.status === "Requested" ? (
                      <>
                        <button
                          onClick={() => updateStatus(appt.id, "Upcoming")}
                          style={{
                            padding: "0.55rem 0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(appt.id, "Canceled")}
                          style={{
                            padding: "0.55rem 0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Decline
                        </button>
                      </>
                    ) : null}

                    {appt.status === "Upcoming" ? (
                      <>
                        <button
                          onClick={() => updateStatus(appt.id, "Completed")}
                          style={{
                            padding: "0.55rem 0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => updateStatus(appt.id, "Canceled")}
                          style={{
                            padding: "0.55rem 0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Details Modal */}
        {selected ? (
          <div
            onClick={closeDetails}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "1.5rem",
              zIndex: 9999,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(720px, 100%)",
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #eee",
                padding: "1.25rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <h2 style={{ margin: 0, color: "#333" }}>{selected.student}</h2>
                  <p style={{ margin: "0.35rem 0 0", color: "#666" }}>
                    {formatDateTime(selected.dateISO).date} at {formatDateTime(selected.dateISO).time} • {selected.durationMins} min • {selected.mode}
                  </p>
                </div>

                <span style={statusBadgeStyle(selected.status)}>{selected.status}</span>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <p style={{ margin: "0 0 0.5rem", color: "#333" }}>
                  <b>Focus:</b> {selected.focus}
                </p>

                {selected.meetingLink ? (
                  <p style={{ margin: "0 0 0.75rem", color: "#333" }}>
                    <b>Meeting Link:</b>{" "}
                    <a href={selected.meetingLink} target="_blank" rel="noreferrer" style={{ color: "#f44336" }}>
                      Open link
                    </a>
                  </p>
                ) : (
                  <p style={{ margin: "0 0 0.75rem", color: "#666" }}>
                    <b>Meeting Link:</b> (Not required for in-person)
                  </p>
                )}

                <label style={{ display: "block", fontWeight: 700, marginBottom: "0.5rem", color: "#333" }}>
                  Session Notes
                </label>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    outline: "none",
                    resize: "vertical",
                  }}
                />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                  <button
                    onClick={closeDetails}
                    style={{
                      padding: "0.6rem 0.9rem",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      background: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Close
                  </button>

                  <button
                    onClick={saveNotes}
                    style={{
                      padding: "0.6rem 0.9rem",
                      borderRadius: "10px",
                      border: "1px solid #121c34",
                      background: "#fff5f5",
                      color: "#121c34",
                      cursor: "pointer",
                      fontWeight: 800,
                    }}
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}