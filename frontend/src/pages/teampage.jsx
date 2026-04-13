import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const interestOptions = [
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

function TeamPage() {
  const location = useLocation();
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [isParentView, setIsParentView] = useState(false);
  const [parentInfo, setParentInfo] = useState(null);
  const [peerInfo, setPeerInfo] = useState(null);
  const [peerSearch, setPeerSearch] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("");
  const [peerResults, setPeerResults] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [showPeerModal, setShowPeerModal] = useState(false);
  const [isSearchingPeers, setIsSearchingPeers] = useState(false);
  const [peerMessage, setPeerMessage] = useState("");
  const [isAssigningPeer, setIsAssigningPeer] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryStudentId = params.get("studentId");

    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      const role = String(parsed.role || "").trim().toLowerCase();

      if (role === "parent") {
        setIsParentView(true);

        let selectedChild = null;
        try {
          selectedChild = JSON.parse(localStorage.getItem("parentSelectedChild") || "null");
        } catch {
          selectedChild = null;
        }

        const resolvedStudentId = Number(queryStudentId) || selectedChild?.id || null;
        const resolvedStudentName = selectedChild?.fullName || selectedChild?.name || "Student";

        setStudentId(resolvedStudentId);
        setStudentName(resolvedStudentName);
        return;
      }

      setIsParentView(false);
      setStudentName(parsed.fullName || parsed.name || "Student");
      setStudentId(parsed.id || null);
    }
  }, [location.search]);

  useEffect(() => {
    if (!studentId) return;

    const fetchParentInfo = async () => {
      try {
        const response = await fetch(`${API_BASE}/students/${studentId}/parent`);
        if (!response.ok) return;
        const data = await response.json();
        setParentInfo(data.parent || null);
      } catch {
        setParentInfo(null);
      }
    };

    fetchParentInfo();
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;

    const fetchPeerInfo = async () => {
      try {
        const response = await fetch(`${API_BASE}/students/${studentId}/peer`);
        if (!response.ok) return;
        const data = await response.json();
        setPeerInfo(data.peer || null);
      } catch {
        setPeerInfo(null);
      }
    };

    fetchPeerInfo();
  }, [studentId]);

  const handleSearchPeers = async () => {
    if (!studentId) return;

    setIsSearchingPeers(true);
    setPeerMessage("");
    setPeerResults([]);

    try {
      const params = new URLSearchParams({
        student_id: String(studentId),
      });

      if (peerSearch.trim()) {
        params.set("search", peerSearch.trim());
      }

      if (selectedInterest) {
        params.set("goal", selectedInterest);
      }

      const response = await fetch(`${API_BASE}/peers/filter?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Could not search for peers right now.");
      }

      const data = await response.json();
      const results = Array.isArray(data) ? data : [];

      setPeerResults(results);

      if (results.length === 0) {
        setPeerMessage("No peers matched your search right now.");
      }
    } catch (error) {
      setPeerMessage(error.message || "Could not search for peers right now.");
    } finally {
      setIsSearchingPeers(false);
    }
  };

  const handleClosePeerModal = () => {
    setShowPeerModal(false);
    setselectedPeer(null);
  };

  const handleAcceptPeer = async () => {
    if (!studentId || !selectedPeer?.id) return;
    setIsAssigningPeer(true);
    setPeerMessage("");

    try {
      const response = await fetch(`${API_BASE}/students/${studentId}/assign_peer/${selectedPeer.id}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Could not assign this peer.");
      }

      setPeerInfo(selectedPeer);
      setShowPeerModal(false);
      setPeerMessage("Peer assigned successfully.");
    } catch (error) {
      setPeerMessage(error.message || "Could not assign this peer.");
    } finally {
      setIsAssigningPeer(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "2rem",
        background:
          "linear-gradient(180deg, #121c34 0%, #3131d8 40%, #add8e6 100%)",
      }}
    >
      <div style={{ maxWidth: "900px", width: "100%" }}>
        <Link
          to={isParentView ? "/parent-dashboard" : "/student-dashboard"}
          style={{
            display: "inline-block",
            marginBottom: "1rem",
            textDecoration: "none",
          }}
        >
          <button
            style={{
              backgroundColor: "#add8e6",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              fontWeight: "500",
            }}
          >
            ← Back to Dashboard
          </button>
        </Link>

        <h1 style={{ color: "#fff", marginBottom: "2rem" }}>
          {studentName}'s Team
        </h1>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          {/* Parent Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "1.5rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}> Parent</h2>

            {parentInfo ? (
              <>
                <p style={{ fontWeight: "600" }}>{parentInfo.fullName || "Parent"}</p>
                <p style={{ color: "#666" }}>Email: {parentInfo.email}</p>
              </>
            ) : (
              <p style={{ color: "#999" }}>No parent linked yet.</p>
            )}

          </div>

          {/* Peer Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "1.5rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}> Peer</h2>

            {peerInfo ? (
              <>
                <p style={{ fontWeight: "600" }}>{peerInfo.fullName || "Peer"}</p>
                <p style={{ color: "#666" }}>Email: {peerInfo.email}</p>
                {peerInfo.age && <p style={{ color: "#999" }}>Age: {peerInfo.age}</p>}
              </>
            ) : isParentView ? (
              <p style={{ color: "#999", marginBottom: "1rem" }}>No peer linked yet.</p>
            ) : (
              <>
                <p style={{ color: "#999", marginBottom: "1rem" }}>No peer linked yet.</p>

                <input
                  type="text"
                  placeholder="Search peers..."
                  value={peerSearch}
                  onChange={(e) => setPeerSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    fontSize: "1rem",
                    marginBottom: "1rem",
                    outline: "none",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "0.6rem",
                    marginBottom: "1rem",
                  }}
                >
                  {interestOptions.map((field) => {
                    const isSelected = selectedInterest === field;

                    return (
                      <button
                        key={field}
                        type="button"
                        onClick={() =>
                          setSelectedInterest((prev) => (prev === field ? "" : field))
                        }
                        style={{
                          border: isSelected ? "2px solid #121c34" : "1px solid #e6b6bb",
                          borderRadius: "1rem",
                          padding: "0.65rem 0.95rem",
                          minWidth: "110px",
                          textAlign: "center",
                          background: isSelected ? "#f7c5c8" : "#fff",
                          color: "#121c34",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          cursor: "pointer",
                        }}
                      >
                        {field}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleSearchPeers}
                  disabled={isSearchingPeers}
                  style={{
                    backgroundColor: "#121c34",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.65rem 1rem",
                    cursor: isSearchingPeers ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    marginBottom: "1rem",
                  }}
                >
                  {isSearchingPeers ? "Searching..." : "Search for Peers"}
                </button>

                {peerResults.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      marginTop: "0.5rem",
                      textAlign: "left",
                    }}
                  >
                    {peerResults.map((peer) => (
                      <button
                        key={peer.id}
                        type="button"
                        onClick={() => {
                          setSelectedPeer(peer);
                          setShowPeerModal(true);
                        }}
                        style={{
                          width: "100%",
                          background: "#f8f9fa",
                          border: "1px solid #e9ecef",
                          borderRadius: "10px",
                          padding: "0.85rem 1rem",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ fontWeight: 700, color: "#1c2740", marginBottom: 4 }}>
                          {peer.fullName || "Student"}
                        </div>
                        <div style={{ color: "#666", fontSize: "0.9rem", marginBottom: 4 }}>
                          {peer.email}
                        </div>
                        {Array.isArray(peer.goals) && peer.goals.length > 0 && (
                          <div style={{ color: "#999", fontSize: "0.85rem" }}>
                            {peer.goals.join(", ")}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {peerMessage && (
          <p style={{ marginTop: "1rem", color: "#fff", fontWeight: 500 }}>{peerMessage}</p>
        )}

        {showPeerModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
            onClick={handleClosePeerModal}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "460px",
                backgroundColor: "#fff",
                borderRadius: "14px",
                padding: "1.4rem",
                boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
                textAlign: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0, marginBottom: "0.75rem", color: "#1c2740" }}>Recommended Peer</h3>

              {selectedPeer ? (
                <>
                  <p style={{ margin: "0 0 0.35rem", fontWeight: 700, color: "#333" }}>{selectedPeer.fullName || "Student"}</p>
                  <p style={{ margin: "0 0 0.35rem", color: "#666" }}>Age: {selectedPeer.age || "Not set"}</p>
                  <p style={{ margin: "0 0 0.4rem", color: "#666", fontWeight: 600 }}>Student goals:</p>
                  {Array.isArray(selectedPeer.goals) && selectedPeer.goals.length > 0 ? (
                    <p style={{ margin: "0 0 1rem", color: "#999" }}>{selectedPeer.goals.join(", ")}</p>
                  ) : (
                    <p style={{ margin: "0 0 1rem", color: "#999" }}>No goals listed yet.</p>
                  )}
                  <p style={{ margin: "0 0 1.1rem", color: "#555" }}>Would you like to connect with this student as your peer?</p>
                </>
              ) : (
                <p style={{ margin: "0 0 1.1rem", color: "#666" }}>No recommendation found right now.</p>
              )}

              <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={handleAcceptPeer}
                  disabled={!selectedPeer || isAssigningPeer}
                  style={{
                    padding: "0.7rem 1.1rem",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: !selectedPeer || isAssigningPeer ? "#c6e8cf" : "#1c2740",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: !selectedPeer || isAssigningPeer ? "not-allowed" : "pointer",
                  }}
                >
                  {isAssigningPeer ? "Assigning..." : "Assign Peer"}
                </button>

                <button
                  type="button"
                  onClick={handleClosePeerModal}
                  style={{
                    padding: "0.7rem 1.1rem",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#a52a2a",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default TeamPage;