// import React, { useEffect, useState } from "react";

// const appointments = [
//   {
//     id: 1,
//     name: "Nina Perez",
//     date: "Feb 1, 2026",
//     time: "1:00 PM",
//     duration: "30 min",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//     day: 1,
//     month: "FEB",
//   },
//   {
//     id: 2,
//     name: "Sarah Johnson",
//     date: "Feb 12, 2026",
//     time: "2:00 PM",
//     duration: "30 min",
//     avatar: "https://randomuser.me/api/portraits/women/65.jpg",
//     day: 12,
//     month: "FEB",
//   },
//   {
//     id: 3,
//     name: "Michael Chen",
//     date: "Feb 14, 2026",
//     time: "4:30 PM",
//     duration: "45 min",
//     avatar: "https://randomuser.me/api/portraits/men/32.jpg",
//     day: 14,
//     month: "FEB",
//   },
// ];



// const students = [
//   { id: 1, name: "Nina Perez" },
//   { id: 2, name: "Sarah Johnson" },
//   { id: 3, name: "Michael Chen" },
//   { id: 4, name: "Ava Patel" },
// ];

// export default function CoachDashboard() {
//   const [coachName, setCoachName] = useState("");
//   useEffect(() => {
//     const stored = localStorage.getItem("user");
//     if (stored) {
//       const parsed = JSON.parse(stored);
//       setCoachName(parsed.fullName || parsed.name || "Coach");
//     }
//   }, []);
//   return (
//     <main
//       style={{
//         width: "100%",
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         padding: "1.5rem 1rem 2.5rem",
//         background: "linear-gradient(180deg, #7b232c 0%, #e9b6b6 100%)",
//       }}
//     >
//       <div style={{ maxWidth: "1200px", width: "100%" }}>
//         <h1 style={{ marginBottom: "1rem", color: "#fff", fontSize: "2.25rem", textShadow: "0 2px 10px rgba(0,0,0,0.3)", textAlign: "center" }}>
//           Welcome {coachName ? coachName : "Coach"}!
//         </h1>

//         {/* Main Content */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             gap: 48,
//             maxWidth: 1200,
//             margin: "0 auto",
//           }}
//         >
//         {/* Appointments Card */}
//         <div
//           style={{
//             background: "#fff",
//             borderRadius: 24,
//             padding: "2.2rem 2rem 2rem 2rem",
//             minWidth: 420,
//             maxWidth: 520,
//             flex: 1,
//             boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "flex-start",
//           }}
//         >
//           <span style={{ color: "#7b232c", fontWeight: 600, fontSize: 22, marginBottom: 24 }}>
//             Upcoming Appointments
//           </span>
//           <div style={{ width: "100%", marginTop: 8 }}>
//             {appointments.map((appt) => (
//               <div
//                 key={appt.id}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   background: "#f8f8f8",
//                   borderRadius: 8,
//                   marginBottom: 18,
//                   boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
//                   padding: "0.7rem 1.2rem 0.7rem 0.7rem",
//                   minHeight: 70,
//                   border: "1.5px solid #e3e3e3",
//                   gap: 16,
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 44,
//                     height: 54,
//                     background: "#4f8cff",
//                     borderRadius: 8,
//                     color: "#fff",
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontWeight: 700,
//                     fontSize: 18,
//                     marginRight: 12,
//                   }}
//                 >
//                   <div style={{ fontSize: 18 }}>{appt.day}</div>
//                   <div style={{ fontSize: 13, textTransform: "uppercase", marginTop: -2 }}>{appt.month}</div>
//                 </div>
//                 <img
//                   src={appt.avatar}
//                   alt={appt.name}
//                   style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", marginRight: 14, border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
//                 />
//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontWeight: 600, fontSize: 15, color: "#222", marginBottom: 2 }}>{appt.name}</div>
//                   <div style={{ color: "#7b232c", fontSize: 13, marginBottom: 1 }}>{appt.date} at {appt.time}</div>
//                   <div style={{ color: "#888", fontSize: 13 }}>{appt.duration}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Students Card */}
//         <div
//           style={{
//             background: "#fff",
//             borderRadius: 24,
//             padding: "2.2rem 2rem 2rem 2rem",
//             minWidth: 320,
//             maxWidth: 340,
//             flex: 1,
//             boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "flex-start",
//           }}
//         >
//           <span style={{ color: "#7b232c", fontWeight: 600, fontSize: 22, marginBottom: 24, alignSelf: "center", width: "100%", textAlign: "center" }}>
//             Students
//           </span>
//           <div style={{ width: "100%", marginTop: 8 }}>
//             {students.map((student) => (
//               <a
//                 key={student.id}
//                 href="#"
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   color: "#7b232c",
//                   fontWeight: 500,
//                   fontSize: 17,
//                   textDecoration: "none",
//                   borderRadius: 6,
//                   padding: "0.7rem 0.5rem 0.7rem 0.7rem",
//                   marginBottom: 10,
//                   border: "1.5px solid #fff",
//                   transition: "background 0.15s, border 0.15s",
//                   pointerEvents: "none",
//                   cursor: "not-allowed",
//                 }}
//               >
//                 <span>{student.name}</span>
//                 <span style={{ fontSize: 22, fontWeight: 400, marginLeft: 12 }}>&#8250;</span>
//               </a>
//             ))}
//           </div>
//           {/* 
//           Was causing dashboard to go blank:
//           <p style={{ margin: "0.35rem 0 0", color: "#666" }}>{task.description}</p>
//           <p style={{ margin: "0.35rem 0 0", color: "#999", fontSize: "0.85rem" }}>
//             Priority: {task.priority}
//           </p>

//           Could be a possible solution:
//           {students.map((student) => (
//             <div key={student.id}>
//               <h4>{student.name}</h4>

//               {student.tasks?.map((task) => (
//                 <div key={task.id}>
//                   <p style={{ margin: "0.35rem 0 0", color: "#666" }}>
//                     {task.description}
//                   </p>
//                   <p style={{ margin: "0.35rem 0 0", color: "#999", fontSize: "0.85rem" }}>
//                     Priority: {task.priority}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           ))}
//           */}
//         </div>
//     </div>
// </div>

//     </main>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const initAppointments = [
  {
    id: 1,
    name: "Nina Perez",
    date: "Feb 1, 2026",
    time: "1:00 PM",
    duration: "30 min",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    day: 1,
    month: "FEB",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    date: "Feb 12, 2026",
    time: "2:00 PM",
    duration: "30 min",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    day: 12,
    month: "FEB",
  },
  {
    id: 3,
    name: "Michael Chen",
    date: "Feb 14, 2026",
    time: "4:30 PM",
    duration: "45 min",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    day: 14,
    month: "FEB",
  },
];

function CoachDashboard() {
  const [coachUser, setCoachUser] = useState(null);
  const [coachName, setCoachName] = useState("Coach");
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");

  const [appointments] = useState(initAppointments);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setStudentsError("No logged-in coach found.");
      setStudentsLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setCoachUser(parsed);
      setCoachName(parsed.fullName || parsed.name || "Coach");
      loadStudents(parsed.id);
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
      setStudentsError("Could not load coach information.");
      setStudentsLoading(false);
    }
  }, []);

  async function loadStudents(coachId) {
    setStudentsLoading(true);
    setStudentsError("");

    try {
      const res = await fetch(`${API_BASE}/coaches/${coachId}/students`);
      const data = await res.json();

      if (!res.ok) {
        setStudentsError(data.detail || "Failed to load assigned students.");
        setStudentsLoading(false);
        return;
      }

      setStudents(data || []);
      setStudentsLoading(false);

    } catch (err) {
      console.error("Failed to load students:", err);
      setStudentsError("Could not connect to backend for students.");
      setStudentsLoading(false);
    }
  }

  function handleStudentClick(studentId) {
    navigate(`/student-info/${studentId}`);
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
      <div style={{ maxWidth: "1200px", width: "100%" }}>
        <h1
          style={{
            marginBottom: "1rem",
            color: "#fff",
            fontSize: "2.25rem",
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}
        >
          Welcome {coachName}!
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 48,
            maxWidth: 1200,
            margin: "0 auto",
            alignItems: "flex-start",
          }}
        >
          {/* Appointments Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: "2.2rem 2rem 2rem 2rem",
              minWidth: 420,
              maxWidth: 520,
              flex: 1,
              boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                color: "#7b232c",
                fontWeight: 600,
                fontSize: 22,
                marginBottom: 24,
              }}
            >
              Upcoming Appointments
            </span>

            <div style={{ width: "100%", marginTop: 8 }}>
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#f8f8f8",
                    borderRadius: 8,
                    marginBottom: 18,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    padding: "0.7rem 1.2rem 0.7rem 0.7rem",
                    minHeight: 70,
                    border: "1.5px solid #e3e3e3",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 54,
                      background: "#4f8cff",
                      borderRadius: 8,
                      color: "#fff",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 18,
                      marginRight: 12,
                    }}
                  >
                    <div style={{ fontSize: 18 }}>{appt.day}</div>
                    <div
                      style={{
                        fontSize: 13,
                        textTransform: "uppercase",
                        marginTop: -2,
                      }}
                    >
                      {appt.month}
                    </div>
                  </div>

                  <img
                    src={appt.avatar}
                    alt={appt.name}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginRight: 14,
                      border: "2px solid #fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        color: "#222",
                        marginBottom: 2,
                      }}
                    >
                      {appt.name}
                    </div>
                    <div style={{ color: "#7b232c", fontSize: 13, marginBottom: 1 }}>
                      {appt.date} at {appt.time}
                    </div>
                    <div style={{ color: "#888", fontSize: 13 }}>{appt.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Students Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: "2.2rem 2rem 2rem 2rem",
              minWidth: 320,
              maxWidth: 340,
              flex: 1,
              boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                color: "#7b232c",
                fontWeight: 600,
                fontSize: 22,
                marginBottom: 24,
                alignSelf: "center",
                width: "100%",
                textAlign: "center",
              }}
            >
              Students
            </span>

            {studentsLoading ? (
              <p style={{ color: "#666", width: "100%", textAlign: "center" }}>
                Loading students...
              </p>
            ) : studentsError ? (
              <p style={{ color: "#b00020", width: "100%", textAlign: "center" }}>
                {studentsError}
              </p>
            ) : students.length === 0 ? (
              <p style={{ color: "#777", width: "100%", textAlign: "center" }}>
                No students assigned yet.
              </p>
            ) : (
              <div style={{ width: "100%", marginTop: 8 }}>
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentClick(student.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#7b232c",
                      fontWeight: 500,
                      fontSize: 17,
                      borderRadius: 10,
                      padding: "0.85rem 0.75rem",
                      marginBottom: 10,
                      border: "1.5px solid transparent",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <span>{student.fullName || student.name || student.email}</span>
                    <span style={{ fontSize: 22, fontWeight: 400, marginLeft: 12 }}>
                      &#8250;
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default CoachDashboard;