import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getPriorityColor(priority) {
  switch ((priority || "").toLowerCase()) {
    case "high":
      return "#121c34";
    case "medium":
      return "#394c7a";
    case "low":
      return "rgb(78, 175, 205)";
    default:
      return "#add8e6";
  }
}

function formatDueDateTime(dueDate, dueTime) {
  if (!dueDate) return "Assigned by coach";

  try {
    if (dueTime) {
      const dt = new Date(`${dueDate}T${dueTime}`);
      return dt.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }

    const d = new Date(`${dueDate}T00:00:00`);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Assigned by coach";
  }
}

function isTaskOverdue(dueDate, dueTime) {
  if (!dueDate) return false;

  try {
    const due = new Date(`${dueDate}T${dueTime || "23:59:59"}`);
    return due < new Date();
  } catch {
    return false;
  }
}

function StudentInfo() {
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [coachUser, setCoachUser] = useState(null);
  const [coachName, setCoachName] = useState("Coach");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState("medium");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskActionLoading, setTaskActionLoading] = useState(false);
  const [taskActionMessage, setTaskActionMessage] = useState("");
  const [showAllTasks, setShowAllTasks] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      setError("No logged-in coach found.");
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setCoachUser(parsed);
      setCoachName(parsed.fullName || parsed.name || "Coach");

      if (parsed.id && studentId) {
        loadStudentDetails(parsed.id, studentId);
      } else {
        setError("Missing coach or student information.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
      setError("Could not load coach information.");
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (!taskActionMessage) return;

    const timer = setTimeout(() => {
      setTaskActionMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [taskActionMessage]);

  async function loadStudentDetails(coachId, selectedStudentId) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/coaches/${coachId}/students/${selectedStudentId}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Failed to load student details.");
        setStudent(null);
        setLoading(false);
        return;
      }

      setStudent(data);
      setShowAllTasks(false);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load student details:", err);
      setError("Could not connect to backend for student details.");
      setStudent(null);
      setLoading(false);
    }
  }

  function openTaskModal(task) {
    setSelectedTask(task);
    setIsEditingTask(false);
    setEditTaskTitle(task.title || "");
    setEditTaskDescription(task.description || "");
    setEditTaskPriority((task.priority || "medium").toLowerCase());
    setShowDeleteConfirm(false);
    setTaskActionMessage("");
  }

  function closeTaskModal() {
    setSelectedTask(null);
    setIsEditingTask(false);
    setEditTaskTitle("");
    setEditTaskDescription("");
    setEditTaskPriority("medium");
    setShowDeleteConfirm(false);
    setTaskActionMessage("");
    setTaskActionLoading(false);
  }

  async function handleSaveTask() {
    if (!coachUser?.id || !studentId || !selectedTask?.id) return;

    if (!editTaskTitle.trim() || !editTaskDescription.trim()) {
      setTaskActionMessage("Title and description cannot be empty.");
      return;
    }

    setTaskActionLoading(true);
    setTaskActionMessage("");

    try {
      const res = await fetch(
        `${API_BASE}/coaches/${coachUser.id}/students/${studentId}/action_items/${selectedTask.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTaskTitle.trim(),
            description: editTaskDescription.trim(),
            priority: editTaskPriority,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setTaskActionMessage(data.detail || "Could not update task.");
        setTaskActionLoading(false);
        return;
      }

      setStudent((prev) => ({
        ...prev,
        action_items: prev.action_items.map((item) =>
          item.id === selectedTask.id ? data : item
        ),
      }));

      setSelectedTask(data);
      setEditTaskPriority((data.priority || "medium").toLowerCase());
      setIsEditingTask(false);
      setTaskActionMessage("Task updated successfully.");
    } catch (err) {
      console.error("Failed to update task:", err);
      setTaskActionMessage("Could not connect to backend.");
    } finally {
      setTaskActionLoading(false);
    }
  }

  async function handleDeleteTask() {
    if (!coachUser?.id || !studentId || !selectedTask?.id) return;

    setTaskActionLoading(true);
    setTaskActionMessage("");

    try {
      const res = await fetch(
        `${API_BASE}/coaches/${coachUser.id}/students/${studentId}/action_items/${selectedTask.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setTaskActionMessage(data.detail || "Could not delete task.");
        setTaskActionLoading(false);
        return;
      }

      setStudent((prev) => ({
        ...prev,
        action_items: prev.action_items.filter((item) => item.id !== selectedTask.id),
      }));

      closeTaskModal();
    } catch (err) {
      console.error("Failed to delete task:", err);
      setTaskActionMessage("Could not connect to backend.");
      setTaskActionLoading(false);
    }
  }
  const sortedStudentTasks = student?.action_items
    ? [...student.action_items].sort((a, b) => {
      const aOverdue = isTaskOverdue(a.due_date, a.due_time);
      const bOverdue = isTaskOverdue(b.due_date, b.due_time);

      // 1. Overdue first
      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1;
      }

      // 2. Tasks with due dates first
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;

      // 3. Sort by closest due date
      const dateA = new Date(`${a.due_date}T${a.due_time || "00:00:00"}`);
      const dateB = new Date(`${b.due_date}T${b.due_time || "00:00:00"}`);

      return dateA - dateB;
    })
    : [];

  const visibleStudentTasks = showAllTasks
    ? sortedStudentTasks
    : sortedStudentTasks.slice(0, 5);

  const hasMoreStudentTasks = sortedStudentTasks.length > 5;
  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "1.5rem 1rem 2.5rem",
        background: "linear-gradient(180deg, #121c34 0%, #e9b6b6 100%)",
      }}
    >
      <div style={{ maxWidth: "1000px", width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              color: "#fff",
              fontSize: "2.1rem",
              margin: 0,
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            {student?.fullName
              ? `${student.fullName}'s Information`
              : "Student Information"}
          </h1>

          <button
            onClick={() => navigate("/coach-dashboard")}
            style={{
              background: "#fff",
              color: "#121c34",
              border: "none",
              borderRadius: 10,
              padding: "0.75rem 1.1rem",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        <p
          style={{
            color: "#fff",
            marginTop: 0,
            marginBottom: "1.5rem",
            fontSize: "1rem",
          }}
        >
          Logged in as {coachName}
        </p>

        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "2rem",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          }}
        >
          {loading ? (
            <p style={{ color: "#666", margin: 0 }}>Loading student details...</p>
          ) : error ? (
            <p style={{ color: "#121c34", margin: 0 }}>{error}</p>
          ) : student ? (
            <div>
              <div
                style={{
                  color: "#121c34",
                  fontWeight: 700,
                  fontSize: 28,
                  marginBottom: 18,
                }}
              >
                {student.fullName || "Student"}
              </div>

              <div style={{ marginBottom: 14, color: "#444" }}>
                <strong>Email:</strong> {student.email || "N/A"}
              </div>

              <div style={{ marginBottom: 14, color: "#444" }}>
                <strong>Age:</strong> {student.age || "Not provided"}
              </div>

              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    color: "#121c34",
                    fontWeight: 600,
                    fontSize: 17,
                    marginBottom: 8,
                  }}
                >
                  Bio
                </div>
                <p style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>
                  {student.bio || "No bio provided yet."}
                </p>
              </div>

              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    color: "#121c34",
                    fontWeight: 600,
                    fontSize: 17,
                    marginBottom: 8,
                  }}
                >
                  Interested Fields
                </div>

                {student.goals && student.goals.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {student.goals.map((goal, index) => (
                      <span
                        key={`${student.id}-goal-${index}`}
                        style={{
                          background: "#f6e2e4",
                          color: "#121c34",
                          padding: "0.45rem 0.8rem",
                          borderRadius: 999,
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: "#777" }}>No goals listed.</p>
                )}
              </div>

              <div>
                <div
                  style={{
                    color: "#121c34",
                    fontWeight: 600,
                    fontSize: 17,
                    marginBottom: 8,
                  }}
                >
                  Tasks
                </div>

                {sortedStudentTasks.length > 0 ? (
                  <>
                    {visibleStudentTasks.map((task) => {
                      const isOverdue = isTaskOverdue(task.due_date, task.due_time);

                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => openTaskModal(task)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            borderRadius: 10,
                            padding: "0.9rem 1rem",
                            marginBottom: 10,
                            border: isOverdue ? "1px solid #f1b0b0" : "1px solid #eee",
                            background: isOverdue ? "#fff5f5" : "#fafafa",
                            borderLeft: isOverdue ? "4px solid #c0392b" : "4px solid transparent",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: "1rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  color: "#121c34",
                                  fontWeight: 600,
                                  marginBottom: 4,
                                }}
                              >
                                {task.title || "Untitled Task"}
                              </div>

                              <div
                                style={{
                                  color: isOverdue ? "#c0392b" : "#777",
                                  fontSize: "0.9rem",
                                  fontWeight: isOverdue ? 600 : 400,
                                }}
                              >
                                📅 {isOverdue ? "Overdue:" : "Due:"}{" "}
                                {formatDueDateTime(task.due_date, task.due_time)}
                              </div>
                            </div>

                            <div
                              style={{
                                display: "inline-block",
                                padding: "0.25rem 0.6rem",
                                borderRadius: 999,
                                background: getPriorityColor(task.priority),
                                color: "#fff",
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              Priority: {(task.priority || "medium").charAt(0).toUpperCase() + (task.priority || "medium").slice(1)}
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {hasMoreStudentTasks && !showAllTasks && (
                      <button
                        type="button"
                        onClick={() => setShowAllTasks(true)}
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.8rem 1rem",
                          border: "none",
                          borderRadius: "10px",
                          background: "#394c7a",
                          color: "#fff",
                          fontWeight: 600,
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        Show More Tasks
                      </button>
                    )}

                    {hasMoreStudentTasks && showAllTasks && (
                      <button
                        type="button"
                        onClick={() => setShowAllTasks(false)}
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.8rem 1rem",
                          border: "none",
                          borderRadius: "10px",
                          background: "#ddd",
                          color: "#121c34",
                          fontWeight: 600,
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        Show Less Tasks
                      </button>
                    )}
                  </>
                ) : (
                  <p style={{ margin: 0, color: "#777" }}>No tasks assigned.</p>
                )}
              </div>
            </div>
          ) : (
            <p style={{ color: "#666", margin: 0 }}>Student not found.</p>
          )}
        </div>
      </div>

      {selectedTask && (
        <div
          onClick={closeTaskModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "1.5rem",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            {!isEditingTask ? (
              <>
                <h2 style={{ marginTop: 0, color: "#121c34" }}>
                  {selectedTask.title || "Untitled Task"}
                </h2>

                <p style={{ color: "#555", marginBottom: "0.5rem" }}>
                  <strong>Priority:</strong>{" "}
                  {(selectedTask.priority || "medium").charAt(0).toUpperCase() +
                    (selectedTask.priority || "medium").slice(1)}
                </p>

                <p style={{ color: "#555", marginBottom: "0.5rem" }}>
                  <strong>Due Date:</strong> {formatDueDateTime(selectedTask.due_date, selectedTask.due_time)}
                </p>

                <p style={{ color: "#555", lineHeight: 1.6 }}>
                  <strong>Description:</strong> {selectedTask.description}
                </p>

                <p style={{ color: "#888", fontSize: "0.95rem" }}>
                  <strong>Status:</strong> {selectedTask.completed ? "Completed" : "Incomplete"}
                </p>

                {taskActionMessage && (
                  <p
                    style={{
                      color: "#121c34",
                      fontWeight: 600,
                      opacity: taskActionMessage ? 1 : 0,
                      transition: "opacity 0.5s ease",
                    }}
                  >
                    {taskActionMessage}
                  </p>
                )}

                {!showDeleteConfirm ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "0.75rem",
                      marginTop: "1.25rem",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setIsEditingTask(true)}
                      style={{
                        padding: "0.75rem 1.1rem",
                        border: "none",
                        borderRadius: 10,
                        background: "#121c34",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{
                        padding: "0.75rem 1.1rem",
                        border: "none",
                        borderRadius: 10,
                        background: "#a52a2a",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      onClick={closeTaskModal}
                      style={{
                        padding: "0.75rem 1.1rem",
                        border: "none",
                        borderRadius: 10,
                        background: "#ddd",
                        color: "#121c34",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: "1.25rem" }}>
                    <p style={{ color: "#121c34", fontWeight: 600 }}>
                      Are you sure you want to delete this task?
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "0.75rem",
                        marginTop: "1rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleDeleteTask}
                        disabled={taskActionLoading}
                        style={{
                          padding: "0.75rem 1.1rem",
                          border: "none",
                          borderRadius: 10,
                          background: "#a52a2a",
                          color: "#fff",
                          fontWeight: 600,
                          cursor: taskActionLoading ? "not-allowed" : "pointer",
                        }}
                      >
                        {taskActionLoading ? "Deleting..." : "Confirm"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        style={{
                          padding: "0.75rem 1.1rem",
                          border: "none",
                          borderRadius: 10,
                          background: "#ddd",
                          color: "#121c34",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 style={{ marginTop: 0, color: "#121c34" }}>Edit Task</h2>

                <input
                  type="text"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  placeholder="Task title"
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    marginBottom: "1rem",
                  }}
                />

                <textarea
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  placeholder="Task description"
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    resize: "vertical",
                  }}
                />

                <div
                  style={{
                    display: "inline-block",
                    marginTop: 10,
                    marginBottom: 10,
                    padding: "0.3rem 0.7rem",
                    borderRadius: 999,
                    background: getPriorityColor(selectedTask.priority),
                    color: "#fff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  Current Priority: {(selectedTask.priority || "medium").charAt(0).toUpperCase() + (selectedTask.priority || "medium").slice(1)}
                </div>

                <div style={{ color: "#777", marginBottom: 10, fontSize: "0.92rem" }}>
                  Current Due Date: {formatDueDateTime(selectedTask.due_date, selectedTask.due_time)}
                </div>

                <label
                  style={{
                    display: "block",
                    marginTop: "1rem",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    color: "#121c34",
                  }}
                >
                  Task Priority
                </label>

                <select
                  value={editTaskPriority}
                  onChange={(e) => setEditTaskPriority(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    background: "#fff",
                    color: "#1c2740",
                  }}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {taskActionMessage && (
                  <p style={{ color: "#121c34", fontWeight: 600, marginTop: "1rem" }}>
                    {taskActionMessage}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.75rem",
                    marginTop: "1.25rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleSaveTask}
                    disabled={taskActionLoading}
                    style={{
                      padding: "0.75rem 1.1rem",
                      border: "none",
                      borderRadius: 10,
                      background: "#121c34",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: taskActionLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {taskActionLoading ? "Saving..." : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTask(false);
                      setEditTaskTitle(selectedTask.title || "");
                      setEditTaskDescription(selectedTask.description || "");
                      setEditTaskPriority((selectedTask.priority || "medium").toLowerCase());
                      setTaskActionMessage("");
                    }}
                    style={{
                      padding: "0.75rem 1.1rem",
                      border: "none",
                      borderRadius: 10,
                      background: "#ddd",
                      color: "#121c34",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default StudentInfo;