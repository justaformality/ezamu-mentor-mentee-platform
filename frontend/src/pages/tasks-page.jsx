import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

function isTaskOverdue(dueDate, dueTime) {
    if (!dueDate) return false;

    try {
        const due = new Date(`${dueDate}T${dueTime || "23:59:59"}`);
        return due < new Date();
    } catch {
        return false;
    }
}

export default function TasksPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [viewer, setViewer] = useState(null);
    const [studentId, setStudentId] = useState(null);
    const [studentName, setStudentName] = useState("Student");
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [priorityFilter, setPriorityFilter] = useState("");
    const [dueDateFilter, setDueDateFilter] = useState("");


    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const studentIdFromUrl = params.get("studentId");

        try {
            const storedUser = JSON.parse(localStorage.getItem("user") || "null");
            const storedSelectedChild = JSON.parse(
                localStorage.getItem("parentSelectedChild") || "null"
            );

            setViewer(storedUser);

            if (storedUser?.role === "parent") {
                const resolvedStudentId = studentIdFromUrl || storedSelectedChild?.id;
                setStudentId(resolvedStudentId || null);
                setStudentName(storedSelectedChild?.fullName || "Student");
            } else {
                setStudentId(storedUser?.id || null);
                setStudentName(storedUser?.fullName || storedUser?.name || "Student");
            }
        } catch {
            setStudentId(studentIdFromUrl || null);
        }
    }, [location.search]);

    useEffect(() => {
        if (!studentId) {
            setLoading(false);
            return;
        }

        async function loadTasks() {
            setLoading(true);

            try {
                const [tasksRes, profileRes] = await Promise.all([
                    fetch(`${API_BASE}/users/${studentId}/action_items`),
                    fetch(`${API_BASE}/students/${studentId}/profile`),
                ]);

                const tasksData = tasksRes.ok ? await tasksRes.json() : [];
                const profileData = profileRes.ok ? await profileRes.json() : null;

                if (profileData?.fullName) {
                    setStudentName(profileData.fullName);
                }

                const normalizedTasks = (Array.isArray(tasksData) ? tasksData : []).map((item) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    completed: item.completed,
                    coach: item.assigned_by_name || "Coach",
                    due_date: item.due_date || "",
                    due_time: item.due_time || "",
                    dueDateLabel: formatDueDateTime(item.due_date, item.due_time),
                    priority: (item.priority || "medium").toLowerCase(),
                }));

                setTasks(normalizedTasks);
            } catch (err) {
                console.error("Failed to load tasks:", err);
                setTasks([]);
            } finally {
                setLoading(false);
            }
        }

        loadTasks();
    }, [studentId]);

    const filteredTasks = useMemo(() => {
        const filtered = tasks.filter((task) => {
            const matchesPriority =
                !priorityFilter || task.priority === priorityFilter.toLowerCase();

            const matchesDueDate =
                !dueDateFilter || (task.due_date && task.due_date === dueDateFilter);

            return matchesPriority && matchesDueDate;
        });

        return filtered.sort((a, b) => {
            const aOverdue = isTaskOverdue(a.due_date, a.due_time);
            const bOverdue = isTaskOverdue(b.due_date, b.due_time);

            // Overdue first
            if (aOverdue !== bOverdue) {
                return aOverdue ? -1 : 1;
            }

            // Then tasks with due dates
            if (!a.due_date && !b.due_date) return 0;
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;

            const dateA = new Date(`${a.due_date}T${a.due_time || "00:00:00"}`);
            const dateB = new Date(`${b.due_date}T${b.due_time || "00:00:00"}`);

            return dateA - dateB;
        });
    }, [tasks, priorityFilter, dueDateFilter]);

    function handleBack() {
        if (viewer?.role === "parent") {
            navigate("/parent-dashboard");
            return;
        }
        navigate("/student-dashboard");
    }

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
                        {studentName}'s Tasks
                    </h1>

                    <button
                        onClick={handleBack}
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

                <div
                    style={{
                        background: "#fff",
                        borderRadius: 24,
                        padding: "1.5rem",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1rem",
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    fontWeight: 600,
                                    color: "#121c34",
                                }}
                            >
                                Filter by Priority
                            </label>
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.85rem",
                                    borderRadius: "10px",
                                    border: "1px solid #ddd",
                                    background: "#fff",
                                    color: "#1c2740",
                                }}
                            >
                                <option value="">All Priorities</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    fontWeight: 600,
                                    color: "#121c34",
                                }}
                            >
                                Filter by Due Date
                            </label>
                            <input
                                type="date"
                                value={dueDateFilter}
                                onChange={(e) => setDueDateFilter(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.85rem",
                                    borderRadius: "10px",
                                    border: "1px solid #ddd",
                                    background: "#fff",
                                    color: "#1c2740",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        background: "#fff",
                        borderRadius: 24,
                        padding: "1.5rem",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
                    }}
                >
                    {loading ? (
                        <p style={{ color: "#666", margin: 0 }}>Loading tasks...</p>
                    ) : filteredTasks.length === 0 ? (
                        <p style={{ color: "#777", margin: 0 }}>No tasks found.</p>
                    ) : (
                        filteredTasks.map((task) => {
                            const isOverdue = isTaskOverdue(task.due_date, task.due_time);

                            return (
                                <div
                                    key={task.id}
                                    style={{
                                        backgroundColor: isOverdue ? "#fff5f5" : "#fafafa",
                                        padding: "1.1rem 1.2rem",
                                        borderRadius: "10px",
                                        borderLeft: `4px solid ${isOverdue ? "#c0392b" : getPriorityColor(task.priority)}`,
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: "1rem",
                                            alignItems: "flex-start",
                                            flexWrap: "wrap",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    color: "#121c34",
                                                    fontWeight: 700,
                                                    fontSize: "1rem",
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {task.title || "Untitled Task"}
                                            </div>

                                            <div style={{ color: "#555", marginBottom: 6 }}>
                                                {task.description}
                                            </div>
                                        </div>

                                        <span
                                            style={{
                                                backgroundColor: getPriorityColor(task.priority),
                                                color: "#fff",
                                                padding: "0.3rem 0.8rem",
                                                borderRadius: "999px",
                                                fontSize: "0.8rem",
                                                fontWeight: 600,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: "1rem",
                                            flexWrap: "wrap",
                                            color: "#888",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        <span>👤 {task.coach}</span>
                                        <span style={{ color: isOverdue ? "#c0392b" : "#888", fontWeight: isOverdue ? 700 : 400 }}>
                                            📅 {isOverdue ? "Overdue:" : "Due:"} {task.dueDateLabel}
                                        </span>
                                        <span>Status: {task.completed ? "Completed" : "Incomplete"}</span>
                                    </div>
                                </div>
                            );
                        })

                    )}
                </div>
            </div>
        </main>
    );
}