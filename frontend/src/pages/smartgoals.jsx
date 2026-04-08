import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "ezamu_smart_goals";

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #121c34 0%, #3131d8 45%, #9ec5e5 100%)",
    padding: "2rem 1rem 4rem",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  backButton: {
    background: "#add8e6",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "0.8rem 1.2rem",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "1.5rem",
  },
  heading: {
    color: "#ffffff",
    fontSize: "3rem",
    fontWeight: 800,
    marginBottom: "0.5rem",
  },
  subheading: {
    color: "#eaf4ff",
    fontSize: "1.05rem",
    lineHeight: 1.7,
    maxWidth: "800px",
    marginBottom: "1.5rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  statCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "1.2rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
  },
  statLabel: {
    fontSize: "0.95rem",
    color: "#5b6474",
    marginBottom: "0.4rem",
    fontWeight: 600,
  },
  statValue: {
    fontSize: "1.8rem",
    color: "#121c34",
    fontWeight: 800,
    margin: 0,
  },
  formCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "1.5rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    color: "#121c34",
    fontWeight: 800,
    marginBottom: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "1rem",
  },
  fullWidth: {
    gridColumn: "1 / -1",
  },
  input: {
    width: "100%",
    padding: "0.9rem 1rem",
    borderRadius: "12px",
    border: "1px solid #cdd7e1",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "0.9rem 1rem",
    borderRadius: "12px",
    border: "1px solid #cdd7e1",
    fontSize: "1rem",
    minHeight: "110px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    marginBottom: "0.45rem",
    color: "#121c34",
    fontWeight: 700,
  },
  milestoneRow: {
    display: "flex",
    gap: "0.7rem",
    marginBottom: "0.7rem",
  },
  addButton: {
    background: "#121c34",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "0.85rem 1.2rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#eef4fa",
    color: "#121c34",
    border: "1px solid #c8d7e6",
    borderRadius: "12px",
    padding: "0.8rem 1rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  goalsGrid: {
    display: "grid",
    gap: "1rem",
  },
  goalCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "1.4rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
  },
  goalTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "0.8rem",
  },
  goalTitle: {
    margin: 0,
    fontSize: "1.45rem",
    color: "#121c34",
    fontWeight: 800,
  },
  badge: {
    display: "inline-block",
    padding: "0.4rem 0.8rem",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "0.9rem",
    background: "#dfefff",
    color: "#121c34",
  },
  goalText: {
    color: "#445064",
    lineHeight: 1.7,
    marginBottom: "0.7rem",
  },
  progressTrack: {
    width: "100%",
    height: "12px",
    borderRadius: "999px",
    background: "#dfe7f0",
    overflow: "hidden",
    marginBottom: "0.5rem",
  },
  progressFill: {
    height: "100%",
    background: "#121c34",
    borderRadius: "999px",
  },
  milestoneItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    marginBottom: "0.5rem",
    color: "#121c34",
  },
  actionRow: {
    display: "flex",
    gap: "0.7rem",
    flexWrap: "wrap",
    marginTop: "1rem",
  },
  emptyCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "1.5rem",
    textAlign: "center",
    color: "#445064",
    boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
  },
};

function createEmptyGoal() {
  return {
    title: "",
    category: "Career Exploration",
    deadline: "",
    why: "",
    specific: "",
    milestones: [
      { id: Date.now() + 1, text: "", completed: false },
      { id: Date.now() + 2, text: "", completed: false },
    ],
  };
}

function calculateProgress(goal) {
  const validMilestones = goal.milestones.filter((m) => m.text.trim() !== "");
  if (validMilestones.length === 0) return 0;
  const completed = validMilestones.filter((m) => m.completed).length;
  return Math.round((completed / validMilestones.length) * 100);
}

function getStatus(goal) {
  const progress = calculateProgress(goal);
  if (progress === 100) return "Completed";
  if (progress > 0) return "In Progress";
  return "Not Started";
}

export default function SmartGoals() {
  const [goalForm, setGoalForm] = useState(createEmptyGoal());
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setGoals(JSON.parse(saved));
      } catch (error) {
        console.error("Could not load smart goals:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const stats = useMemo(() => {
    const completed = goals.filter((goal) => calculateProgress(goal) === 100).length;
    const inProgress = goals.filter((goal) => {
      const progress = calculateProgress(goal);
      return progress > 0 && progress < 100;
    }).length;

    let upcoming = 0;
    const today = new Date();

    goals.forEach((goal) => {
      if (!goal.deadline) return;
      const due = new Date(goal.deadline);
      const diff = (due - today) / (1000 * 60 * 60 * 24);
      if (diff >= 0 && diff <= 7) upcoming += 1;
    });

    return {
      total: goals.length,
      completed,
      inProgress,
      upcoming,
    };
  }, [goals]);

  const handleFieldChange = (field, value) => {
    setGoalForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMilestoneChange = (id, value) => {
    setGoalForm((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === id ? { ...m, text: value } : m
      ),
    }));
  };

  const addMilestoneField = () => {
    setGoalForm((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { id: Date.now(), text: "", completed: false },
      ],
    }));
  };

  const removeMilestoneField = (id) => {
    setGoalForm((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== id),
    }));
  };

  const addGoal = () => {
    if (!goalForm.title.trim()) return;

    const cleanedMilestones = goalForm.milestones.filter(
      (m) => m.text.trim() !== ""
    );

    const newGoal = {
      id: Date.now(),
      title: goalForm.title.trim(),
      category: goalForm.category,
      deadline: goalForm.deadline,
      why: goalForm.why.trim(),
      specific: goalForm.specific.trim(),
      milestones: cleanedMilestones,
      createdAt: new Date().toISOString(),
    };

    setGoals((prev) => [newGoal, ...prev]);
    setGoalForm(createEmptyGoal());
  };

  const toggleMilestone = (goalId, milestoneId) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              milestones: goal.milestones.map((m) =>
                m.id === milestoneId ? { ...m, completed: !m.completed } : m
              ),
            }
          : goal
      )
    );
  };

  const deleteGoal = (goalId) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <button
          style={styles.backButton}
          onClick={() => (window.location.href = "/student-dashboard")}
        >
          ← Back to Dashboard
        </button>

        <h1 style={styles.heading}>S.M.A.R.T. Goals</h1>
        <p style={styles.subheading}>
          Turn a big dream into clear next steps. Build goals that are specific,
          measurable, and realistic, then track each milestone as you move forward.
        </p>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Goals</div>
            <p style={styles.statValue}>{stats.total}</p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>In Progress</div>
            <p style={styles.statValue}>{stats.inProgress}</p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Completed</div>
            <p style={styles.statValue}>{stats.completed}</p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Due in 7 Days</div>
            <p style={styles.statValue}>{stats.upcoming}</p>
          </div>
        </div>

        <section style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Create New Goal</h2>

          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Goal Title</label>
              <input
                style={styles.input}
                placeholder="Example: Explore nursing programs"
                value={goalForm.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>Category</label>
              <select
                style={styles.input}
                value={goalForm.category}
                onChange={(e) => handleFieldChange("category", e.target.value)}
              >
                <option>Career Exploration</option>
                <option>College Preparation</option>
                <option>Academic Improvement</option>
                <option>Skill Building</option>
                <option>Leadership</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>Deadline</label>
              <input
                type="date"
                style={styles.input}
                value={goalForm.deadline}
                onChange={(e) => handleFieldChange("deadline", e.target.value)}
              />
            </div>

            <div style={styles.fullWidth}>
              <label style={styles.label}>Why This Goal Matters</label>
              <textarea
                style={styles.textarea}
                placeholder="Why is this important to you?"
                value={goalForm.why}
                onChange={(e) => handleFieldChange("why", e.target.value)}
              />
            </div>

            <div style={styles.fullWidth}>
              <label style={styles.label}>Specific Goal Statement</label>
              <textarea
                style={styles.textarea}
                placeholder="Write your SMART goal in one clear sentence."
                value={goalForm.specific}
                onChange={(e) => handleFieldChange("specific", e.target.value)}
              />
            </div>

            <div style={styles.fullWidth}>
              <label style={styles.label}>Milestones</label>
              {goalForm.milestones.map((milestone, index) => (
                <div key={milestone.id} style={styles.milestoneRow}>
                  <input
                    style={styles.input}
                    placeholder={`Milestone ${index + 1}`}
                    value={milestone.text}
                    onChange={(e) =>
                      handleMilestoneChange(milestone.id, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => removeMilestoneField(milestone.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div style={styles.actionRow}>
                <button type="button" style={styles.secondaryButton} onClick={addMilestoneField}>
                  + Add Milestone
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button type="button" style={styles.addButton} onClick={addGoal}>
              Add Goal
            </button>
          </div>
        </section>

        <section>
          <h2 style={{ ...styles.sectionTitle, color: "#ffffff" }}>Your Goals</h2>

          {goals.length === 0 ? (
            <div style={styles.emptyCard}>
              No goals yet. Start by creating one clear goal and breaking it into small milestones.
            </div>
          ) : (
            <div style={styles.goalsGrid}>
              {goals.map((goal) => {
                const progress = calculateProgress(goal);
                const status = getStatus(goal);

                return (
                  <div key={goal.id} style={styles.goalCard}>
                    <div style={styles.goalTop}>
                      <div>
                        <h3 style={styles.goalTitle}>{goal.title}</h3>
                        <div style={styles.badge}>{goal.category}</div>
                      </div>
                      <div style={styles.badge}>{status}</div>
                    </div>

                    {goal.deadline ? (
                      <p style={styles.goalText}>
                        <strong>Deadline:</strong> {goal.deadline}
                      </p>
                    ) : null}

                    {goal.why ? (
                      <p style={styles.goalText}>
                        <strong>Why this matters:</strong> {goal.why}
                      </p>
                    ) : null}

                    {goal.specific ? (
                      <p style={styles.goalText}>
                        <strong>SMART statement:</strong> {goal.specific}
                      </p>
                    ) : null}

                    <p style={{ ...styles.goalText, marginBottom: "0.35rem" }}>
                      <strong>Progress:</strong> {progress}%
                    </p>

                    <div style={styles.progressTrack}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                      <strong style={{ color: "#121c34" }}>Milestones</strong>
                      <div style={{ marginTop: "0.7rem" }}>
                        {goal.milestones.length === 0 ? (
                          <p style={styles.goalText}>No milestones added yet.</p>
                        ) : (
                          goal.milestones.map((milestone) => (
                            <label key={milestone.id} style={styles.milestoneItem}>
                              <input
                                type="checkbox"
                                checked={milestone.completed}
                                onChange={() => toggleMilestone(goal.id, milestone.id)}
                              />
                              <span>{milestone.text}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    <div style={styles.actionRow}>
                      <button
                        type="button"
                        style={styles.secondaryButton}
                        onClick={() => deleteGoal(goal.id)}
                      >
                        Delete Goal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}