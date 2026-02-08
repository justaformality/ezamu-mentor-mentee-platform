import { useState } from "react";

function StudentDashboard() {
  const [completedItems, setCompletedItems] = useState({});

  const coachImages = {
    "Sarah Johnson": "/src/assets/imgs/coach-test.jpg",
    "Michael Chen": "/src/assets/imgs/coach-test2.jpg",
  };

  //dummy data for now - will be replaced with API calls to fetch real data for the logged in student
  const upcomingAppointments = [
    {
      id: 1,
      coachName: "Sarah Johnson",
      date: "Feb 12, 2026",
      time: "2:00 PM",
      duration: "30 min",
    },
    {
      id: 2,
      coachName: "Michael Chen",
      date: "Feb 14, 2026",
      time: "4:30 PM",
      duration: "45 min",
    },
    {
      id: 3,
      coachName: "Sarah Johnson",
      date: "Feb 19, 2026",
      time: "1:00 PM",
      duration: "30 min",
    },
  ];

  const recentResults = {
    test: "Myers-Briggs Type Indicator",
    type: "ENFP",
    date: "Jan 28, 2026",
    description: "The Campaigner - Enthusiastic and creative people-person",
  };

  const toggleComplete = (itemId) => {
    setCompletedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const actionableItems = [
    {
      id: 1,
      title: "Complete Strengths Assessment",
      dueDate: "Feb 10, 2026",
      coach: "Sarah Johnson",
      description: "Assessment to identify your key strengths",
      priority: "high",
    },
    {
      id: 2,
      title: "Review Career Path Plan",
      dueDate: "Feb 15, 2026",
      coach: "Michael Chen",
      description: "Review and provide feedback on your 5-year career plan",
      priority: "medium",
    },
    {
      id: 3,
      title: "Practice Public Speaking",
      dueDate: "Feb 28, 2026",
      coach: "Sarah Johnson",
      description: "Work on presentation skills - 15 minutes daily",
      priority: "medium",
    },
    {
      id: 4,
      title: "Network with 3 Professionals",
      dueDate: "Mar 10, 2026",
      coach: "Michael Chen",
      description: "Connect with professionals in your target field",
      priority: "low",
    },
  ];

  //color of to do list priority indicators
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ff6b6b";
      case "medium":
        return "#ffa500";
      case "low":
        return "#4ecdc4";
      default:
        return "#999";
    }
  };

  //the dashboard 
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
        <h1 style={{ marginBottom: "2rem", color: "#333" }}>Student Dashboard</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          
          {/* LEFT COLUMN */}
          <div>
            {/* Upcoming Appointments */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                padding: "1.5rem",
                marginBottom: "2rem",
                border: "1px solid #e9ecef",
              }}
            >
              <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "#333" }}>
                Upcoming Appointments
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {upcomingAppointments.map((appointment) => {
                  const isCoachImage = coachImages[appointment.coachName];
                  return (
                  <div
                    key={appointment.id}
                    style={{
                      backgroundColor: "#fff",
                      display: "flex",
                      gap: "1rem",
                      alignItems: "flex-start",
                      padding: "1rem",
                      borderRadius: "6px",
                      borderLeft: "4px solid #007bff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    {isCoachImage && (
                      <img
                        src={isCoachImage}
                        alt={appointment.coachName}
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 0.5rem 0", fontWeight: "600", color: "#333" }}>
                      {appointment.coachName}
                    </p>
                    <p
                      style={{
                        margin: "0.25rem 0",
                        fontSize: "0.9rem",
                        color: "#666",
                      }}
                    >
                      📍 {appointment.date} at {appointment.time}
                    </p>
                    <p
                      style={{
                        margin: "0.25rem 0",
                        fontSize: "0.85rem",
                        color: "#999",
                      }}
                    >
                      {appointment.duration}
                    </p>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Personality Results */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                padding: "1.5rem",
                border: "1px solid #e9ecef",
              }}
            >
              <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "#333" }}>
                Recent Personality Results
              </h2>
              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "1.5rem",
                  borderRadius: "6px",
                  textAlign: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <p style={{ margin: "0", fontSize: "0.85rem", color: "#999" }}>
                  {recentResults.test}
                </p>
                <p
                  style={{
                    margin: "0.5rem 0",
                    fontSize: "2rem",
                    fontWeight: "700",
                    color: "#007bff",
                  }}
                >
                  {recentResults.type}
                </p>
                <p style={{ margin: "1rem 0 0.5rem 0", color: "#666" }}>
                  {recentResults.description}
                </p>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem", color: "#999" }}>
                  Completed: {recentResults.date}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              padding: "1.5rem",
              border: "1px solid #e9ecef",
              height: "fit-content",
            }}
          >
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "#333" }}>
              ✅ Actionable Items
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {actionableItems.map((item) => {
                  const isCompleted = completedItems[item.id];
                  return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: "#fff",
                    padding: "1.25rem",
                    borderRadius: "6px",
                    borderLeft: `4px solid ${getPriorityColor(item.priority)}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    opacity: isCompleted ? 0.6 : 1,
                    textDecoration: isCompleted ? "line-through" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleComplete(item.id)}
                      style={{
                        width: "20px",
                        height: "20px",
                        cursor: "pointer",
                        marginRight: "0.75rem",
                        marginTop: "0.125rem",
                        flexShrink: 0,
                      }}
                    />
                    <p style={{ margin: "0", fontWeight: "600", color: "#333", flex: 1 }}>
                      {item.title}
                    </p>
                    <span
                      style={{
                        backgroundColor: getPriorityColor(item.priority),
                        color: "#fff",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        marginLeft: "0.5rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "0.5rem 0",
                      fontSize: "0.9rem",
                      color: "#666",
                    }}
                  >
                    {item.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      color: "#999",
                      marginTop: "0.75rem",
                    }}
                  >
                    <span>👤 {item.coach}</span>
                    <span>📅 Due: {item.dueDate}</span>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default StudentDashboard;
