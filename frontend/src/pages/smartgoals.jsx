import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function SmartGoals() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("smartGoals");
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("smartGoals", JSON.stringify(goals));
  }, [goals]);

  const addGoal = () => {
    if (!title.trim()) return;

    const newGoal = {
    id: Date.now(),
    title,
    progress: Number(progress),
    notes: "",
    expanded: false,
    };

    setGoals([...goals, newGoal]);
    setTitle("");
    setProgress(0);
  };

  const updateProgress = (id, value) => {
    const updated = goals.map((goal) => {
        if (goal.id === id) {
        const newProgress = Number(value);

        // milestone checks
        if (goal.progress < 50 && newProgress >= 50) {
            goal.celebrate = "half";
        }

        if (goal.progress < 100 && newProgress >= 100) {
            goal.celebrate = "complete";
        }

        return { ...goal, progress: newProgress };
        }

        return goal;
    });

    setGoals(updated);
    };

  const deleteGoal = (id) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const toggleExpand = (id) => {
  const updated = goals.map((goal) =>
        goal.id === id ? { ...goal, expanded: !goal.expanded } : goal
    );
    setGoals(updated);
    };

    const updateNotes = (id, value) => {
    const updated = goals.map((goal) =>
        goal.id === id ? { ...goal, notes: value } : goal
    );
    setGoals(updated);
    };

    const updateTitle = (id, value) => {
    const updated = goals.map((goal) =>
        goal.id === id ? { ...goal, title: value } : goal
    );
    setGoals(updated);
    };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background:
          "linear-gradient(180deg, #121c34 0%, #3131d8 40%, #add8e6 100%)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: "900px", width: "100%" }}>
        
        {/* Back Button */}
        <Link to="/student-dashboard">
          <button
            style={{
              marginBottom: "1.25rem",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#add8e6",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ← Back to Dashboard
          </button>
        </Link>

        <h1
          style={{
            color: "#fff",
            marginBottom: "1.5rem",
            fontSize: "2rem",
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          S.M.A.R.T. Goals
        </h1>

        {/* CREATE GOAL */}
        <div
          style={{
            background: "#f8f9fa",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "2rem",
            border: "1px solid #e9ecef",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              marginBottom: "0.75rem",
              color: "#333",
            }}
          >
            Create New Goal
          </h2>

          <input
            placeholder="Goal title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginBottom: "0.75rem",
              fontSize: "0.95rem",
            }}
          />

          <label
            style={{
              fontSize: "0.85rem",
              color: "#666",
            }}
          >
            Progress: {progress}%
          </label>

          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            style={{
              width: "100%",
              marginTop: "0.35rem",
            }}
          />

          <button
            onClick={addGoal}
            style={{
              marginTop: "0.85rem",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#121c34",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Add Goal
          </button>
        </div>

        {/* GOALS LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {goals.map((goal) => (
            <div
                key={goal.id}
                style={{
                    background: "#fff",
                    padding: "1.25rem",
                    borderRadius: "6px",
                    borderLeft: "4px solid #121c34",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                >

                {/* Goal Title */}
                <input
                    value={goal.title}
                    onChange={(e) => updateTitle(goal.id, e.target.value)}
                    style={{
                    border: "none",
                    fontWeight: "600",
                    fontSize: "1rem",
                    width: "100%",
                    marginBottom: "0.5rem"
                    }}
                />

                {/* Progress Bar */}
                <div
                    style={{
                    height: "8px",
                    background: "#e9ecef",
                    borderRadius: "4px",
                    overflow: "hidden",
                    }}
                >
                    <div
                    style={{
                        width: `${goal.progress}%`,
                        height: "100%",
                        background: "#121c34",
                        transition: "width 0.3s ease",
                    }}
                    />
                </div>

                <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>
                {goal.progress}% completed
                </p>

                {/* CELEBRATIONS */}
                {goal.celebrate === "half" && (
                <div className="goalCelebrate">
                    🎉 Halfway there! Keep going!
                </div>
                )}

                {goal.progress === 100 && (
                <div className="goalCelebrateComplete">
                    🏆 Goal Complete! Amazing work!
                </div>
                )}

                <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => updateProgress(goal.id, e.target.value)}
                />

                {/* Expand Button */}
                <button
                    onClick={() => toggleExpand(goal.id)}
                    style={{
                    marginTop: "0.5rem",
                    background: "transparent",
                    border: "none",
                    color: "#394c7a",
                    cursor: "pointer",
                    fontSize: "0.85rem"
                    }}
                >
                    {goal.expanded ? "Hide Details ▲" : "Add Notes ▼"}
                </button>

                {/* Notes Section */}
                {goal.expanded && (
                    <textarea
                    placeholder="Add notes, steps, deadlines, or reflections..."
                    value={goal.notes}
                    onChange={(e) => updateNotes(goal.id, e.target.value)}
                    style={{
                        width: "100%",
                        marginTop: "0.5rem",
                        padding: "0.5rem",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        minHeight: "70px",
                        fontSize: "0.85rem"
                    }}
                    />
                )}

                <button
                    onClick={() => deleteGoal(goal.id)}
                    style={{
                    marginTop: "0.6rem",
                    background: "#f5d2d2",
                    border: "none",
                    padding: "0.4rem 0.7rem",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    }}
                >
                    Delete Goal
                </button>
                </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default SmartGoals;