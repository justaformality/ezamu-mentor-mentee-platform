import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function TeamPage() {
  const location = useLocation();
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [isParentView, setIsParentView] = useState(false);
  const [parentInfo, setParentInfo] = useState(null);
  const [peerInfo, setPeerInfo] = useState(null);
  const [recommendedPeer, setRecommendedPeer] = useState(null);
  const [declinedPeerIds, setDeclinedPeerIds] = useState([]);
  const [showPeerModal, setShowPeerModal] = useState(false);
  const [peerMessage, setPeerMessage] = useState("");
  const [isSearchingPeers, setIsSearchingPeers] = useState(false);
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

  const fetchRecommendation = async (excludedIds = []) => {
    const query = excludedIds.length > 0
      ? `?exclude_ids=${encodeURIComponent(excludedIds.join(","))}`
      : "";

    const response = await fetch(`${API_BASE}/students/${studentId}/peer/recommendation${query}`);
    if (!response.ok) {
      throw new Error("Could not search for peers right now.");
    }

    const data = await response.json();
    return data.peer || null;
  };

  const handleSearchPeers = async () => {
    if (!studentId) return;
    setIsSearchingPeers(true);
    setPeerMessage("");
    setRecommendedPeer(null);
    setDeclinedPeerIds([]);

    try {
      const peer = await fetchRecommendation([]);
      setRecommendedPeer(peer);
      setShowPeerModal(true);

      if (!peer) {
        setPeerMessage("No peer recommendations found right now. Please try again later.");
      }
    } catch (error) {
      setPeerMessage(error.message || "Could not search for peers right now.");
    } finally {
      setIsSearchingPeers(false);
    }
  };

  const handleClosePeerModal = () => {
    setShowPeerModal(false);
    setRecommendedPeer(null);
  };

  const handleDeclinePeer = async () => {
    if (!studentId) return;

    const nextDeclined = recommendedPeer?.id
      ? [...declinedPeerIds, recommendedPeer.id]
      : [...declinedPeerIds];

    setDeclinedPeerIds(nextDeclined);
    setIsSearchingPeers(true);

    try {
      const nextPeer = await fetchRecommendation(nextDeclined);
      if (!nextPeer) {
        setShowPeerModal(false);
        setRecommendedPeer(null);
        setPeerMessage("No more peer recommendations right now.");
        return;
      }

      setRecommendedPeer(nextPeer);
      setPeerMessage("");
      setShowPeerModal(true);
    } catch (error) {
      setShowPeerModal(false);
      setRecommendedPeer(null);
      setPeerMessage(error.message || "Could not search for peers right now.");
    } finally {
      setIsSearchingPeers(false);
    }
  };

  const handleAcceptPeer = async () => {
    if (!studentId || !recommendedPeer?.id) return;
    setIsAssigningPeer(true);
    setPeerMessage("");

    try {
      const response = await fetch(`${API_BASE}/students/${studentId}/assign_peer/${recommendedPeer.id}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Could not assign this peer.");
      }

      setPeerInfo(recommendedPeer);
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
                  }}
                >
                  {isSearchingPeers ? "Searching..." : "Search for Peers"}
                </button>
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

              {recommendedPeer ? (
                <>
                  <p style={{ margin: "0 0 0.35rem", fontWeight: 700, color: "#333" }}>{recommendedPeer.fullName || "Student"}</p>
                  <p style={{ margin: "0 0 0.35rem", color: "#666" }}>Age: {recommendedPeer.age || "Not set"}</p>
                  <p style={{ margin: "0 0 0.4rem", color: "#666", fontWeight: 600 }}>Student goals:</p>
                  {Array.isArray(recommendedPeer.goals) && recommendedPeer.goals.length > 0 ? (
                    <p style={{ margin: "0 0 1rem", color: "#999" }}>{recommendedPeer.goals.join(", ")}</p>
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
                  onClick={handleDeclinePeer}
                  disabled={isSearchingPeers}
                  style={{
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "#f5d2d2",
                    color: "#8a1f1f",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    cursor: isSearchingPeers ? "not-allowed" : "pointer",
                  }}
                >
                  {isSearchingPeers ? "..." : "✕"}
                </button>
                <button
                  type="button"
                  onClick={handleAcceptPeer}
                  disabled={!recommendedPeer || isAssigningPeer}
                  style={{
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: !recommendedPeer || isAssigningPeer ? "#c6e8cf" : "#1fa34a",
                    color: "#fff",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    cursor: !recommendedPeer || isAssigningPeer ? "not-allowed" : "pointer",
                  }}
                >
                  {isAssigningPeer ? "..." : "✓"}
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