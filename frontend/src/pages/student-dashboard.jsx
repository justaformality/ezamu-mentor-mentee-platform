import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; //new

const HEROES = {
  thinker: {
    key: "thinker",
    label: "Thinker",
    description:
      "You love ideas, problem-solving, innovation, and figuring out how things work.",
    careers: ["Engineering", "Research", "Data Science", "Policy", "Product Strategy"],
  },
  helper: {
    key: "helper",
    label: "Helper",
    description:
      "You care about people, connection, support, encouragement, and making a difference.",
    careers: ["Teaching", "Counseling", "Social Work", "Journalism", "Healthcare"],
  },
  planner: {
    key: "planner",
    label: "Planner",
    description:
      "You thrive on structure, responsibility, follow-through, and building dependable systems.",
    careers: ["Project Management", "Operations", "Business", "Administration", "Finance"],
  },
  doer: {
    key: "doer",
    label: "Doer",
    description:
      "You learn by doing, move fast, enjoy action, and like flexible, energetic environments.",
    careers: ["Media", "Entrepreneurship", "Sports", "Marketing", "Tech Support"],
  },
};

const formatDateBadge = (dateStr) => {
  const date = new Date(dateStr);
  return {
    day: date.getDate(),
    month: date.toLocaleString("default", {month: "short"}),
  };
};

const parseTopHeroFromArchetype = (archetype) => {
  if (!archetype) return "";
  const firstSegment = archetype.split("_")[0] || "";
  const match = firstSegment.match(/^[A-Za-z]+/);
  return match ? match[0] : firstSegment;
};

const parseRankingFromArchetype = (archetype) => {
  if (!archetype) return [];

  return archetype
    .split("_")
    .map((segment) => {
      const match = segment.match(/^([A-Za-z]+)(\d+)$/);
      if (!match) return null;
      const [, rawLabel, rawScore] = match;
      const key = rawLabel.toLowerCase();
      const hero = HEROES[key];
      if (!hero) return null;
      return {
        ...hero,
        score: Number(rawScore),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
};

const generateAiSummary = (topHero, secondHero, ranking) => {
  if (!topHero || !secondHero) return null;

  const pathwayMap = {
    thinker: "innovation, engineering, research, strategy, or data-driven careers",
    helper: "coaching, teaching, counseling, communication, or service-driven careers",
    planner: "operations, project planning, leadership support, business, or structured career paths",
    doer: "hands-on, creative, entrepreneurial, fast-moving, or action-based careers",
  };

  const learningStyleMap = {
    thinker: "You learn best when you understand the why behind something.",
    helper: "You learn best through people, discussion, and meaningful connection.",
    planner: "You learn best with structure, checklists, and clear next steps.",
    doer: "You learn best by trying things and building confidence through action.",
  };

  return {
    headline: `${topHero.label} first, ${secondHero.label} second`,
    summary: `Your results suggest you lead most strongly with ${topHero.label} energy, with ${secondHero.label} as a strong secondary strength. That means you may feel most motivated in environments that align with ${pathwayMap[topHero.key]}.`,
    strengths: [
      `Top strength: ${topHero.description}`,
      `Secondary strength: ${secondHero.description}`,
      learningStyleMap[topHero.key],
    ],
    nextSteps: [
      `Explore majors and careers connected to ${topHero.careers.slice(0, 3).join(", ")}.`,
      "Book time with a mentor who matches your top strength profile.",
      "Use your results to build a college and career roadmap inside Ezamu.",
    ],
    marketingBlurb:
      "Ezamu can use this profile to recommend mentors, pathway content, and action steps that fit how you naturally think, work, and grow.",
    rankingText: ranking
      .map((item, index) => `${index + 1}. ${item.label} (${item.score})`)
      .join(" • "),
  };
};

function StudentDashboard() {
  const [completedItems, setCompletedItems] = useState({});
  const [studentName, setStudentName] = useState("");
  const [topInnerHero, setTopInnerHero] = useState("");
  const [assessmentSummary, setAssessmentSummary] = useState("");
  const [assessmentInsights, setAssessmentInsights] = useState(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setStudentName(parsed.fullName || parsed.name || "Student");
      const archetype = parsed.archetype || "";
      const ranking = parseRankingFromArchetype(archetype);
      const derivedTopHero = ranking[0]?.label || parseTopHeroFromArchetype(archetype);
      const derivedSummary = ranking.length > 1 ? generateAiSummary(ranking[0], ranking[1], ranking) : null;

      setTopInnerHero(derivedTopHero);
      setAssessmentInsights(derivedSummary);
      setAssessmentSummary(derivedSummary?.summary || "");
    }
  }, []);

  const coachImages = {
    "Sarah Johnson": "/src/assets/imgs/coach-test.jpg",
    "Michael Chen": "/src/assets/imgs/coach-test2.jpg",
    "Nina Perez": "/src/assets/imgs/coach-test.jpg",
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
      coachName: "Nina Perez",
      date: "Feb 1, 2026",
      time: "1:00 PM",
      duration: "30 min",
    },
  ];

  const assignedPeer = { //dummy data!!
    name: "Alex Rivera",
    email: "alex.rivera@email.com",
    major: "Computer Science",
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
        return "#121c34";
      case "medium":
        return "#394c7a";
      case "low":
        return "rgb(78, 175, 205)";
      default:
        return "#add8e6";
    }
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / actionableItems.length) * 100);
  
  const priorityOrder = {
    high: 1, 
    medium: 2, 
    low: 3,
  };
  
  const sortedItems = [...actionableItems].sort((a, b) => {
    const aComp = completedItems[a.id];
    const bComp = completedItems[b.id];

    if(aComp !== bComp){
      return aComp ? 1 : -1;
    }
    if(!aComp && !bComp) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    return 0;
  });

  const incompleteItems = sortedItems.filter((item) => !completedItems[item.id]);
  const completedListItems = sortedItems.filter((item) => completedItems[item.id]);

  const sortedAppointments = [...upcomingAppointments].sort((a, b) => { 
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA - dateB;
  });

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "1.5rem 1rem 2.5rem",
        background: "linear-gradient(180deg, #121c34 0%, #3131d8 40%, #add8e6 100%)",
      }}
    >
      <div style={{ maxWidth: "1200px", width: "100%" }}>
        <h1 style={{ marginBottom: "1rem", color: "#fff", fontSize: "2.25rem", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
          Welcome, {studentName}!
        </h1>

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
                Upcoming Appointments
              </h2>

               <p style={{ marginTop: "0", marginBottom: "1rem", color: "#666", fontSize: "0.9rem" }}>
               {upcomingAppointments.length > 0
                  ? `You have ${upcomingAppointments.length} upcoming appointment(s). The next one is ${sortedAppointments[0].date} at ${sortedAppointments[0].time}.` //changed upcoming to sorted bc time
                  : "No upcoming appointments scheduled."}
             </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {sortedAppointments.map((appointment) => {
                  const { day, month } = formatDateBadge(appointment.date); //added this line!
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
                      borderLeft: "4px solid #4170a2",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  > 
                  {/*adding this badge, adding below this */}
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
                      <div style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>{month}</div>
                    </div>
                    {/*adding above this */}
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

            {/* Quick Access Tiles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
              <Link
                to="/smartgoals"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    padding: "1rem",
                    border: "2px solid #e9ecef",
                    boxShadow: "0 5px 10px rgba(0,0,0,0.06)",
                    minHeight: "120px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "stretch",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <h3 style={{ margin: "0", fontSize: "1rem", color: "#333" }}>S.M.A.R.T. Goals</h3>
                    <span style={{ color: "#1c2740", fontSize: "1.1rem", fontWeight: 700 }}>→</span>
                  </div>
                  <p style={{ margin: "0.5rem 0 0", color: "#666" }}>View your goal strategy and progress</p>
                </div>
            </Link>
              <Link
                to="/team"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    padding: "1rem",
                    border: "2px solid #e9ecef",
                    boxShadow: "0 5px 10px rgba(0,0,0,0.06)",
                    minHeight: "120px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "stretch",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <h3 style={{ margin: "0", fontSize: "1rem", color: "#333" }}>
                      Your Team
                    </h3>
                    <span style={{ color: "#1c2740", fontSize: "1.1rem", fontWeight: 700 }}>→</span>
                  </div>
                  <p style={{ margin: "0.5rem 0 0", color: "#666" }}>
                    Meet your mentors and collaborators
                  </p>
                </div>
            </Link>
            </div>

            {/* Assessment Results */}
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
             Assessment Results
             </h2>


             <p style={{ marginTop: "0", marginBottom: "1.25rem", color: "#666", fontSize: "0.9rem" }}>
             {topInnerHero
              ? `Your top Inner Hero is ${topInnerHero}.`
              : "No assessment results yet."}
             </p>


             {topInnerHero && (
              <button
                type="button"
                onClick={() => setShowAssessmentModal(true)}
                style={{
                  width: "100%",
                  backgroundColor: "#fff",
                  padding: "1rem",
                  borderRadius: "6px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  borderLeft: "4px solid #add8e6",
                  borderTop: "none",
                  borderRight: "none",
                  borderBottom: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontWeight: "600", color: "#333", fontSize: "1rem" }}>
                  {topInnerHero}
                </span>
                <span style={{ color: "#1c2740", fontSize: "1.1rem", fontWeight: 700 }}>→</span>
              </button>
             )}
         </div>
         </div>

         {showAssessmentModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              zIndex: 1000,
            }}
            onClick={() => setShowAssessmentModal(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "560px",
                backgroundColor: "#fff",
                borderRadius: "14px",
                padding: "1.5rem",
                boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, color: "#1c2740", fontSize: "1.3rem" }}>{topInnerHero || "Inner Hero"}</h3>
                <button
                  type="button"
                  onClick={() => setShowAssessmentModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#1c2740",
                    fontSize: "1.2rem",
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{ margin: 0, color: "#555", lineHeight: 1.7 }}>
                {assessmentSummary || "No detailed summary is available yet."}
              </p>

              {assessmentInsights?.strengths?.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem", color: "#1c2740", fontSize: "1rem" }}>AI Insight Summary</h4>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#1c2740", lineHeight: 1.7 }}>
                    {assessmentInsights.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {assessmentInsights?.nextSteps?.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem", color: "#1c2740", fontSize: "1rem" }}>Suggested Next Steps</h4>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#1c2740", lineHeight: 1.7 }}>
                    {assessmentInsights.nextSteps.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {assessmentInsights?.marketingBlurb && (
                <p style={{ marginTop: "1rem", marginBottom: 0, color: "#1c2740", lineHeight: 1.7 }}>
                  <strong>How Ezamu uses this:</strong> {assessmentInsights.marketingBlurb}
                </p>
              )}
            </div>
          </div>
         )}

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
              To Do Items
            </h2>
            {/*adding below this for progress bar! */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div
                style={{
                  height: "8px",
                  backgroundColor: "#e9ecef",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progressPercent}%`,
                    backgroundColor: "#4ecdc4",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>
                {progressPercent}% completed
              </p>
            </div>
            {/*adding above this for progress bar! */}

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {incompleteItems.map((item) => { //changing actionableitems to incompleteItems
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
                    //textDecoration: isCompleted ? "line-through" : "none",
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
              {/*adding completed divider*/}
              {completedListItems.length > 0 && (
                <div
                  style={{
                    margin: "1rem 0 0.5rem",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#999",
                    textTransform: "uppercase",
                    letterSpacing: "0.05rem",
                  }}
                >
                  Completed
                  </div>
              )}
              {completedListItems.map((item) => {
                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: "#fff",
                      padding: "1.25rem",
                      borderRadius: "6px",
                      borderLeft: `4px solid ${getPriorityColor(item.priority)}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      opacity: 0.6,
                      textDecoration: "line-through",
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
                        checked={true}
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
                      <p style={{margin: "0", fontWeight: "600", flex:1}}>
                        {item.title}
                      </p>
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