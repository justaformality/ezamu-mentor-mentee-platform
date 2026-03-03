import { useState } from "react";

function CoachSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStrength, setStrength] = useState("All");
  const [selectedCoach, setSelectedCoach] = useState(null); //new

  const coaches = [
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

  const strengths = ["All", "College Advisor", "Career Development", "Interview Preparation", "High School Mentor"];

  const filteredCoaches = coaches.filter((coach) => {
    const matchesSearch = coach.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStrength = 
        selectedStrength === "All" || coach.strength === selectedStrength;
    return matchesSearch && matchesStrength;
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
            <h1 style={{ marginBottom: "2rem", color: "#333"}}>My Coaches</h1>

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
                    placeholder="Search coaches!"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: "1",
                        minWidth: "250px",
                        padding: "0.75rem",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                    }}
                />
                
                <select
                    value={selectedStrength}
                    onChange={(e) => setStrength(e.target.value)}
                    style={{
                        padding: "0.75rem",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                    }}
                    >
                        {strengths.map((strength) => (
                            <option key={strength} value={strength}>
                                {strength}
                            </option>
                        ))}
                    </select>
                    </div>

                {/*grid for coaches */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "2rem",
                    }}
                >
                 {filteredCoaches.map((coach) => (
                    <div
                        key={coach.id}
                        onClick={() => setSelectedCoach(coach)} //new
                        style={{
                            cursor: "pointer", //new
                            backgroundColor: "#f8f9fa",
                            borderRadius: "8px",
                            padding: "1.5rem",
                            border: "1px solid #e9ecef",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            borderLeft: "4px solid #4170a2", 
                        }}
                    >
                        <div style={{textAlign: "center"}}>
                            <img
                                src={coach.image}
                                alt={coach.name}
                                style={{
                                    width: "80px",
                                    height: "80px", 
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    marginBottom: "1rem",
                                }}
                            />
                            <h3 style={{margin: "0 0 0.5rem 0", color: "#333"}}>
                                {coach.name}
                            </h3>
                            <p
                                style={{
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    color: "#007bff",
                                    marginBottom: "0.75rem",
                                }}
                            >
                               {coach.strength}
                            </p>
                            <p style={{ fontSize: "0.9rem", color: "#666"}}>
                                {coach.bio}
                            </p>
                        </div>
                    </div>
                 ))}

                 {filteredCoaches.length === 0 && (
                    <p style={{ color: "#666" }}>No coaches found.</p>
                 )}
                </div>
            </div> 

        {selectedCoach && (
            <div
                style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                }}
                onClick={() => setSelectedCoach(null)}
            >
                <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: "#fff",
                    padding: "2rem",
                    borderRadius: "12px",
                    width: "400px",
                    maxWidth: "90%",
                    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
                    textAlign: "center",
                }}
                >
                <img
                    src={selectedCoach.image}
                    alt={selectedCoach.name}
                    style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: "1rem",
                    }}
                />

                <h2 style={{ marginBottom: "0.5rem" }}>
                    {selectedCoach.name}
                </h2>

                <p
                    style={{
                    fontWeight: "600",
                    color: "#007bff",
                    marginBottom: "1rem",
                    }}
                >
                    {selectedCoach.strength}
                </p>

                <p style={{ color: "#666", marginBottom: "1.5rem" }}>
                    {selectedCoach.bio}
                </p>

                <button
                    style={{
                    padding: "0.6rem 1.5rem",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#4170a2",
                    color: "#fff",
                    cursor: "pointer",
                    }}
                    onClick={() => setSelectedCoach(null)}
                >
                    Close
                </button>
                </div>
            </div>
            )}
        </main>
  );
}

export default CoachSection;