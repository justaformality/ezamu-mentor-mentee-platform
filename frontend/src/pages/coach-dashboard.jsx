import { useState } from "react";

const formatDateBadge = (dateStr) => {
  const date = new Date(dateStr);
  return {
    day: date.getDate(),
    month: date.toLocaleString("default", { month: "short" }),
  };
};

function CoachDashboard() {
  const [newItem, setNewItem] = useState({
    studentName: "",
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
  });

  const [assignedItems, setAssignedItems] = useState([]);

  // Dummy data for upcoming appointments (SAI - create a couple more of these?)
  const upcomingAppointments = [
    {
      id: 1,
      studentName: "Emily Rodriguez",
      date: "Feb 12, 2026",
      time: "2:00 PM",
      duration: "30 min",
    },
    { //added more students and modified the existing structure so no matter which order the students are added in they are sorted by date. 
      id: 2, 
      studentName: "Mari Lopez",
      date: "April 2, 2026",
      time: "3:00 PM",
      duration: "45 min"
    },
    {
      id: 3, 
      studentName: "Alex Scott",
      date: "May 13, 2026",
      time: "3:00 PM",
      duration: "45 min"
    }, 
    {
      id: 4, 
      studentName: "Sara Michaels",
      date: "June 21, 2026",
      time: "4:15 PM",
      duration: "45 min"
    },
    {
      id: 5, 
      studentName: "Ramona Jones",
      date: "September 20, 2026",
      time: "3:00 PM",
      duration: "45 min"
    },
    {
      id: 6, 
      studentName: "Ramona Jones",
      date: "Jan 20, 2026",
      time: "3:00 PM",
      duration: "45 min"
    }
  ];

  // Dummy data for students being coached (ARSHIA - create a couple more of these?) (i did this - sai)
  const studentsList = [
    {
      id: 1,
      name: "Emily Rodriguez",
      focusArea: "Career Development",
      joinDate: "Jan 15, 2026",
      progress: "On Track",
    },
    { //added more students
      id: 2, 
      name: "Mari Lopez",
      focusArea: "Counseling",
      joinDate: "Jan 12, 2026",
      progress: "Just Started",
    },
    {
      id: 3, 
      name: "Alex Scott",
      focusArea: "Counseling",
      joinDate: "February 2, 2025",
      progress: "Exceeding Goals",
    }, 
    {
      id: 4, 
      name: "Sara Michaels",
      focusArea: "Career Development",
      joinDate: "March 2, 2025",
      progress: "On Track",
    },
    {
      id: 5, 
      name: "Ramona Jones",
      focusArea: "Counseling",
      joinDate: "March 12, 2026",
      progress: "Behind Schedule",
    },
    {
      id: 6, 
      name: "Prisha Rohan",
      focusArea: "Counseling",
      joinDate: "March 12, 2024",
      progress: "On Track",
    }
  ];

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

  const getProgressColor = (progress) => {
    switch (progress) {
      case "Exceeding Goals":
        return "#28a745";
      case "On Track":
        return "#007bff";
      case "Just Started":
        return "#ffc107";
      case "Behind Schedule": //new case for students that are behind
        return "#ff7707"; 
      default:
        return "#999";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (
      newItem.studentName &&
      newItem.title &&
      newItem.description &&
      newItem.dueDate
    ) {
      const item = {
        id: Date.now(),
        ...newItem,
      };
      setAssignedItems((prev) => [item, ...prev]);
      setNewItem({
        studentName: "",
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
      });
    }
  };

  const handleDeleteItem = (id) => {
    setAssignedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const sortedAppointments = [...upcomingAppointments].sort((a, b) => { //created this so appointments are sorted by data
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA - dateB;
  });

  const sortedStudents = [...studentsList].sort((a, b) => { //created this so students are sorted by time, can remove if needed
    return new Date(a.joinDate) - new Date(b.joinDate);
  });

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
        <h1 style={{ marginBottom: "2rem", color: "#333" }}>Coach Dashboard</h1>

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
              <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem", color: "#333" }}>
                📅 Upcoming Appointments
              </h2>

              <p
                style={{
                  marginTop: "0",
                  marginBottom: "1rem",
                  color: "#666",
                  fontSize: "0.9rem",
                }}
              >
                {upcomingAppointments.length > 0
                  ? `You have ${upcomingAppointments.length} upcoming appointment(s). Next one is ${sortedAppointments[0].date} at ${sortedAppointments[0].time}.` //changed upcoming to sorted bc time
                  : "No upcoming appointments scheduled."}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {sortedAppointments.map((appointment) => {
                  const { day, month } = formatDateBadge(appointment.date);
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
                        borderLeft: "4px solid #4170a2",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div
                        style={{
                          minWidth: "50px",
                          textAlign: "center",
                          backgroundColor: "#70baf3",
                          color: "#fff",
                          borderRadius: "8px",
                          padding: "0.5rem 0",
                          fontWeight: "600",
                        }}
                      >
                        <div style={{ fontSize: "1.2rem" }}>{day}</div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                          }}
                        >
                          {month}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: "0 0 0.5rem 0",
                            fontWeight: "600",
                            color: "#333",
                          }}
                        >
                          {appointment.studentName}
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

            {/* Students Being Coached */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                padding: "1.5rem",
                border: "1px solid #e9ecef",
              }}
            >
              <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem", color: "#333" }}>
                👥 Students Being Coached
              </h2>

              <p
                style={{
                  marginTop: "0",
                  marginBottom: "1.25rem",
                  color: "#666",
                  fontSize: "0.9rem",
                }}
              >
                {studentsList.length > 0
                  ? `You are currently coaching ${studentsList.length} student(s).`
                  : "No students currently being coached."}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {sortedStudents.map((student) => ( //changed studentslist to sortedstudents for time order
                  <div
                    key={student.id}
                    style={{
                      backgroundColor: "#fff",
                      padding: "1rem",
                      borderRadius: "6px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      borderLeft: "4px solid #007bff",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 0.25rem 0",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      {student.name}
                    </p>
                    <p
                      style={{
                        margin: "0.25rem 0",
                        color: "#666",
                        fontSize: "0.9rem",
                      }}
                    >
                      Focus Area: {student.focusArea}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "0.5rem",
                      }}
                    >
                      <p
                        style={{
                          margin: "0",
                          color: "#999",
                          fontSize: "0.85rem",
                        }}
                      >
                        Joined: {student.joinDate}
                      </p>
                      <span
                        style={{
                          backgroundColor: getProgressColor(student.progress),
                          color: "#fff",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}
                      >
                        {student.progress}
                      </span>
                    </div>
                  </div>
                ))}
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
              ✏️ Assign Actionable Items
            </h2>

            {/* Assignment Form */}
            <form
              onSubmit={handleAddItem}
              style={{
                backgroundColor: "#fff",
                padding: "1.5rem",
                borderRadius: "6px",
                marginBottom: "2rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#333",
                    fontSize: "0.9rem",
                  }}
                >
                  Select Student
                </label>
                <select
                  name="studentName"
                  value={newItem.studentName}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                  }}
                >
                  <option value="">-- Select a student --</option>
                  {studentsList.map((student) => (
                    <option key={student.id} value={student.name}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#333",
                    fontSize: "0.9rem",
                  }}
                >
                  Task Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={newItem.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Complete Career Assessment"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#333",
                    fontSize: "0.9rem",
                  }}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  value={newItem.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Complete the Myers-Briggs assessment to identify your personality type"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    minHeight: "80px",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#333",
                      fontSize: "0.9rem",
                    }}
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={newItem.dueDate}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#333",
                      fontSize: "0.9rem",
                    }}
                  >
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={newItem.priority}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      fontSize: "0.9rem",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#0056b3")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "#007bff")
                }
              >
                Assign Item
              </button>
            </form>

            {/* Assigned Items List */}
            {assignedItems.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "1rem",
                    marginBottom: "1rem",
                    color: "#333",
                  }}
                >
                  Recently Assigned ({assignedItems.length})
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {assignedItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: "#fff",
                        padding: "1rem",
                        borderRadius: "6px",
                        borderLeft: `4px solid ${getPriorityColor(item.priority)}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: "0 0 0.25rem 0",
                              fontWeight: "600",
                              color: "#333",
                            }}
                          >
                            {item.title}
                          </p>
                          <p
                            style={{
                              margin: "0",
                              fontSize: "0.85rem",
                              color: "#666",
                            }}
                          >
                            👤 {item.studentName}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          style={{
                            backgroundColor: "#ff6b6b",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "0.5rem 0.75rem",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            marginLeft: "0.5rem",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                      <p
                        style={{
                          margin: "0.5rem 0",
                          fontSize: "0.9rem",
                          color: "#666666",
                        }}
                      >
                        {item.description}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "0.75rem",
                          fontSize: "0.85rem",
                          color: "#999",
                        }}
                      >
                        <span>📅 Due: {item.dueDate}</span>
                        <span
                          style={{
                            backgroundColor: getPriorityColor(item.priority),
                            color: "#fff",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          {item.priority.charAt(0).toUpperCase() +
                            item.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {assignedItems.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem 1rem",
                  color: "#999",
                }}
              >
                <p>To Be Filled</p>
                <p style={{ fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>
                  Assign items to students to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default CoachDashboard;
