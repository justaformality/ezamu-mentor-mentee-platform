import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const HEROES = {
	thinker: {
		key: "thinker",
		label: "Thinker",
		color: "#1c2740",
		description:
			"You love ideas, problem-solving, innovation, and figuring out how things work.",
		careers: ["Engineering", "Research", "Data Science", "Policy", "Product Strategy"],
	},
	helper: {
		key: "helper",
		label: "Helper",
		color: "#1c2740",
		description:
			"You care about people, connection, support, encouragement, and making a difference.",
		careers: ["Teaching", "Counseling", "Social Work", "Journalism", "Healthcare"],
	},
	planner: {
		key: "planner",
		label: "Planner",
		color: "#1c2740",
		description:
			"You thrive on structure, responsibility, follow-through, and building dependable systems.",
		careers: ["Project Management", "Operations", "Business", "Administration", "Finance"],
	},
	doer: {
		key: "doer",
		label: "Doer",
		color: "#1c2740",
		description:
			"You learn by doing, move fast, enjoy action, and like flexible, energetic environments.",
		careers: ["Media", "Entrepreneurship", "Sports", "Marketing", "Tech Support"],
	},
};

function getProfileImageUrl(profilePicUrl) {
	if (!profilePicUrl) return `${API_BASE}/static/profile_pics/1.png`;
	if (profilePicUrl.startsWith("http://") || profilePicUrl.startsWith("https://")) {
		return profilePicUrl;
	}
	return `${API_BASE}${profilePicUrl}`;
}

function formatDateBadge(dateStr) {
	const date = new Date(dateStr);
	return {
		day: date.getDate(),
		month: date.toLocaleString("default", { month: "short" }),
	};
}

function parseTopHeroFromArchetype(archetype) {
	if (!archetype) return "";
	const firstSegment = archetype.split("_")[0] || "";
	const match = firstSegment.match(/^[A-Za-z]+/);
	return match ? match[0] : firstSegment;
}

function parseRankingFromArchetype(archetype) {
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
}

function generateAiSummary(topHero, secondHero, ranking) {
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
}

function formatScheduledDate(dateStr) {
	const date = new Date(dateStr);
	return {
		date: date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}),
		time: date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		}),
	};
}

function inferPriority(index) {
	if (index === 0) return "high";
	if (index === 1) return "medium";
	return "low";
}

function getPriorityColor(priority) {
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
}

function getStoredUser() {
	try {
		return JSON.parse(localStorage.getItem("user") || "null");
	} catch {
		return null;
	}
}

function ParentDashboard() {
	const [showModal, setShowModal] = useState(false);
	const [searchEmail, setSearchEmail] = useState("");
	const [children, setChildren] = useState([]);
	const [selectedChild, setSelectedChild] = useState(null);
	const [childProfile, setChildProfile] = useState(null);
	const [parentUser, setParentUser] = useState(null);
	const [parentProgress, setParentProgress] = useState(null);
	const [coaches, setCoaches] = useState([]);
	const [searchError, setSearchError] = useState("");
	const [dashboardError, setDashboardError] = useState("");
	const [isDashboardLoading, setIsDashboardLoading] = useState(false);
	const [showAssessmentModal, setShowAssessmentModal] = useState(false);

	// On mount, check if parent has already selected a child before
	useEffect(() => {
		setParentUser(getStoredUser());

		const stored = localStorage.getItem("parentSelectedChild");
		if (!stored) {
			setShowModal(true);
		} else {
			const parsed = JSON.parse(stored);
			setSelectedChild(parsed);
			setShowModal(false);
			fetchChildProfile(parsed.id);
		}
	}, []);

	useEffect(() => {
		const fetchCoaches = async () => {
			try {
				const response = await fetch(`${API_BASE}/api/coaches`);
				if (!response.ok) return;
				const data = await response.json();
				setCoaches(Array.isArray(data) ? data : []);
			} catch {
				setCoaches([]);
			}
		};

		fetchCoaches();
	}, []);

	// Fetch student by email using new GET route
	const handleSearch = async () => {
		const normalizedEmail = searchEmail.trim().toLowerCase();
		if (!normalizedEmail) {
			setSearchError("Enter your child's email to search.");
			setChildren([]);
			return;
		}

		try {
			setSearchError("");
			setChildren([]);
			const res = await fetch(`${API_BASE}/students/by_email?email=${encodeURIComponent(normalizedEmail)}`);
			if (!res.ok) throw new Error("Student not found");
			const student = await res.json();
			if (!student.id || student.role !== "student") throw new Error("Student not found");
			setChildren([student]);
		} catch (e) {
			setChildren([]);
			setSearchError("No student was found for that email.");
		}
	};

	// Select a child and fetch their profile
	const handleSelectChild = async (child) => {
		const currentParent = parentUser || getStoredUser();
		if (!currentParent?.id || currentParent.role !== "parent") {
			setDashboardError("You must be signed in as a parent to link a student.");
			setShowModal(true);
			return;
		}

		try {
			await ensureParentStudentLink(child.id, currentParent.id);
			setSearchError("");
			setDashboardError("");
		} catch (error) {
			setDashboardError(error.message || "Could not link this student to the parent account.");
			setShowModal(true);
			return;
		}

		setSelectedChild(child);
		setShowModal(false);
		setDashboardError("");
		localStorage.setItem("parentSelectedChild", JSON.stringify(child));
		fetchChildDashboard(child);
	};

	const ensureParentStudentLink = async (studentId, parentId) => {
		const response = await fetch(`${API_BASE}/students/${studentId}/assign_parent/${parentId}`, {
			method: "POST",
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.detail || "Could not link this student to the parent account.");
		}

		// Verify the relationship exists in DB by checking the parent's student list.
		const verifyResponse = await fetch(`${API_BASE}/parents/${parentId}/students`);
		if (!verifyResponse.ok) {
			throw new Error("Student link could not be verified in the database.");
		}

		const linkedStudents = await verifyResponse.json();
		const isLinked = Array.isArray(linkedStudents) && linkedStudents.some((student) => Number(student.id) === Number(studentId));
		if (!isLinked) {
			throw new Error("Student link was not saved correctly. Please try again.");
		}
	};

	const fetchChildDashboard = async (child) => {
		if (!child?.id) return;

		setIsDashboardLoading(true);
		setDashboardError("");

		try {
			const currentParent = parentUser || getStoredUser();
			if (currentParent?.id && currentParent.role === "parent") {
				await ensureParentStudentLink(child.id, currentParent.id);
			}

			const [profileResponse, appointmentsResponse, actionItemsResponse, assessmentsResponse] = await Promise.all([
				fetch(`${API_BASE}/students/${child.id}/profile`),
				fetch(`${API_BASE}/users/${child.id}/appointments`),
				fetch(`${API_BASE}/users/${child.id}/action_items`),
				fetch(`${API_BASE}/students/${child.id}/assessments`),
			]);

			if (!profileResponse.ok) {
				throw new Error("Could not load student profile.");
			}
			if (!appointmentsResponse.ok || !actionItemsResponse.ok || !assessmentsResponse.ok) {
				throw new Error("Could not load the student's dashboard.");
			}

			const [profileData, appointmentsData, actionItemsData, assessmentsData] = await Promise.all([
				profileResponse.json(),
				appointmentsResponse.json(),
				actionItemsResponse.json(),
				assessmentsResponse.json(),
			]);

			const progressData = {
				student: {
					id: child.id,
					fullName: child.fullName || profileData.fullName,
					email: child.email,
					archetype: child.archetype || null,
				},
				action_items: Array.isArray(actionItemsData) ? actionItemsData : [],
				appointments: Array.isArray(appointmentsData) ? appointmentsData : [],
				assessments: Array.isArray(assessmentsData) ? assessmentsData : [],
			};

			setChildProfile(profileData);
			setParentProgress(progressData);
		} catch (error) {
			setChildProfile(null);
			setParentProgress(null);
			setDashboardError(error.message || "Could not load the student's dashboard.");
			setShowModal(true);
		} finally {
			setIsDashboardLoading(false);
		}
	};

	// Fetch child profile for persisted child selection when page loads
	const fetchChildProfile = async (studentId) => {
		try {
			await fetchChildDashboard({ id: studentId });
		} catch (e) {
			setChildProfile(null);
		}
	};

	// Reset child selection
	const handleReset = () => {
		setSelectedChild(null);
		setChildProfile(null);
		setShowModal(true);
		setSearchEmail("");
		setSearchError("");
		setDashboardError("");
		setChildren([]);
		setParentProgress(null);
		setShowAssessmentModal(false);
		localStorage.removeItem("parentSelectedChild");
	};

	const coachNameById = coaches.reduce((accumulator, coach) => {
		accumulator[coach.id] = coach.name;
		return accumulator;
	}, {});

	const appointments = (parentProgress?.appointments || []).map((appointment) => {
		const scheduled = formatScheduledDate(appointment.scheduledAt);
		return {
			...appointment,
			coachName: coachNameById[appointment.coach_id] || `Coach ${appointment.coach_id}`,
			date: scheduled.date,
			time: scheduled.time,
		};
	});

	const sortedAppointments = [...appointments].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
	const actionItems = (parentProgress?.action_items || []).map((item, index) => ({
		id: item.id,
		title: item.title,
		description: item.description,
		completed: item.completed,
		priority: inferPriority(index),
	}));
	const incompleteItems = actionItems.filter((item) => !item.completed);
	const completedItems = actionItems.filter((item) => item.completed);
	const completedCount = completedItems.length;
	const progressPercent = actionItems.length ? Math.round((completedCount / actionItems.length) * 100) : 0;
	const ranking = parseRankingFromArchetype(parentProgress?.student?.archetype || selectedChild?.archetype || "");
	const topInnerHero = parseTopHeroFromArchetype(parentProgress?.student?.archetype || selectedChild?.archetype || "");
	const aiSummary = ranking.length > 1 ? generateAiSummary(ranking[0], ranking[1], ranking) : null;
	const latestAssessment = parentProgress?.assessments?.[0] || null;
	const assessmentSummary = aiSummary?.summary || (latestAssessment
		? `Latest result recorded for ${latestAssessment.assessment_name} on ${new Date(latestAssessment.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`
		: "No detailed summary is available yet.");

	// Themed modal for first visit
	const renderModal = () => (
		<div style={{
			position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
		}}>
			<div style={{ background: "#fff", borderRadius: 14, padding: "2rem 2.5rem", maxWidth: 420, width: "100%", boxShadow: "0 12px 30px rgba(0,0,0,0.2)" }}>
				<h2 style={{ color: "#1c2740", marginBottom: 12 }}>Find Your Student</h2>
				<p style={{ color: "#555", marginBottom: 18, fontSize: 15 }}>Enter your student's email to view their dashboard.</p>
				<input
					type="email"
					placeholder="Student email"
					value={searchEmail}
					onChange={e => setSearchEmail(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleSearch();
						}
					}}
					style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginBottom: 12 }}
				/>
				{searchError && (
					<p style={{ margin: "-2px 0 12px", color: "#b42318", fontSize: 14 }}>{searchError}</p>
				)}
				{dashboardError && (
					<p style={{ margin: "-2px 0 12px", color: "#b42318", fontSize: 14 }}>{dashboardError}</p>
				)}
				<button
					onClick={handleSearch}
					style={{ width: "100%", background: "#121c34", color: "#fff", border: "none", borderRadius: 6, padding: 10, fontWeight: 600, fontSize: 16, marginBottom: 10, cursor: "pointer" }}
				>
					Search
				</button>
				{children.length > 0 && (
					<div style={{ marginTop: 18 }}>
						<div style={{ fontWeight: 600, color: "#394c7a", marginBottom: 8 }}>Select your student:</div>
						{children.map(child => (
							<div key={child.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, background: "#f8f9fa", borderRadius: 8, padding: 10, cursor: "pointer", border: "1px solid #e9ecef" }} onClick={() => handleSelectChild(child)}>
								<img src={getProfileImageUrl(child.profile_pic_url)} alt={child.fullName} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid #add8e6" }} />
								<span style={{ fontWeight: 500, color: "#1c2740" }}>{child.fullName}</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);

	const renderAssessmentModal = () => (
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
				<p style={{ margin: "0 0 0.75rem", color: "#555", lineHeight: 1.7 }}>
					{assessmentSummary}
				</p>
				{ranking.length > 0 && (
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
						{ranking.map((item, index) => (
							<div key={item.key} style={{ border: `1px solid ${item.color}`, borderRadius: "14px", padding: "0.9rem", background: "#f8fbff" }}>
								<p style={{ margin: 0, fontWeight: 800, color: item.color, fontSize: "1rem" }}>#{index + 1} {item.label}</p>
								<p style={{ margin: "0.4rem 0 0", color: "#121c34", fontSize: "0.95rem" }}>Score: {item.score}</p>
							</div>
						))}
					</div>
				)}
				{aiSummary && (
					<div style={{ marginTop: "1rem", background: "#fff", borderRadius: "18px", padding: "1.2rem", border: "1px solid #add8e6" }}>
						<h3 style={{ marginTop: 0, color: "#1c2740", fontSize: "1.2rem" }}>AI Insight Summary</h3>
						<ul style={{ color: "#121c34", lineHeight: 1.8, paddingLeft: "1.2rem", fontSize: "1rem" }}>
							{aiSummary.strengths.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>

						<h3 style={{ color: "#1c2740", fontSize: "1.2rem" }}>Suggested Next Steps</h3>
						<ul style={{ color: "#1c2740", lineHeight: 1.8, paddingLeft: "1.2rem", fontSize: "1rem" }}>
							{aiSummary.nextSteps.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>

						<p style={{ marginTop: "1rem", color: "#1c2740", fontSize: "1rem", lineHeight: 1.7 }}>
							<strong>How Ezamu uses this:</strong> {aiSummary.marketingBlurb}
						</p>
					</div>
				)}
				{parentProgress?.student?.archetype && (
					<p style={{ margin: 0, color: "#394c7a", fontWeight: 600 }}>
						Archetype: {parentProgress.student.archetype}
					</p>
				)}
			</div>
		</div>
	);

	// Render child's dashboard in a read-only parent view
	const renderChildDashboard = () => (
		<main style={{ width: "100%", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "1.5rem 1rem 2.5rem", background: "linear-gradient(180deg, #121c34 0%, #3131d8 40%, #add8e6 100%)" }}>
			<div style={{ maxWidth: 1200, width: "100%" }}>
				<h1 style={{ marginBottom: "1rem", color: "#fff", fontSize: "2.25rem", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
					Welcome! You are viewing: {childProfile?.fullName ? `${childProfile.fullName}'s` : "Child's"} dashboard
				</h1>
				{isDashboardLoading ? (
					<div style={{ backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "12px", padding: "2rem", color: "#1c2740", textAlign: "center" }}>
						Loading student dashboard...
					</div>
				) : (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "2rem",
							alignItems: "start",
						}}
					>
						<div>
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
								<p style={{ marginTop: 0, marginBottom: "1rem", color: "#666", fontSize: "0.9rem" }}>
									{sortedAppointments.length > 0
										? `${childProfile?.fullName || "This student"} has ${sortedAppointments.length} upcoming appointment(s). The next one is ${sortedAppointments[0].date} at ${sortedAppointments[0].time}.`
										: "No upcoming appointments scheduled."}
								</p>
								<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
									{sortedAppointments.length > 0 ? (
										sortedAppointments.map((appointment) => {
											const { day, month } = formatDateBadge(appointment.scheduledAt);
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
														<div style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>{month}</div>
													</div>
													<div style={{ flex: 1 }}>
														<p style={{ margin: "0 0 0.5rem 0", fontWeight: "600", color: "#333" }}>
															{appointment.coachName}
														</p>
														<p style={{ margin: "0.25rem 0", fontSize: "0.9rem", color: "#666" }}>
															📍 {appointment.date} at {appointment.time}
														</p>
														<p style={{ margin: "0.25rem 0", fontSize: "0.85rem", color: "#999" }}>
															Coaching session
														</p>
													</div>
												</div>
											);
										})
									) : (
										<div style={{ backgroundColor: "#fff", padding: "1rem", borderRadius: "6px", color: "#666" }}>
											No appointments to display.
										</div>
									)}
								</div>
							</div>

							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
								<a
									href="/broken-link"
									style={{ textDecoration: "none", color: "inherit" }}
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
											<h3 style={{ margin: 0, fontSize: "1rem", color: "#333" }}>S.M.A.R.T. Goals</h3>
											<span style={{ color: "#1c2740", fontSize: "1.1rem", fontWeight: 700 }}>→</span>
										</div>
										<p style={{ margin: "0.5rem 0 0", color: "#666" }}>View their goal strategy and progress</p>
									</div>
								</a>

								<Link
									to={selectedChild?.id ? `/team?studentId=${selectedChild.id}` : "/team"}
									style={{ textDecoration: "none", color: "inherit" }}
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
											<h3 style={{ margin: 0, fontSize: "1rem", color: "#333" }}>Their Team</h3>
											<span style={{ color: "#1c2740", fontSize: "1.1rem", fontWeight: 700 }}>→</span>
										</div>
										<p style={{ margin: "0.5rem 0 0", color: "#666" }}>See the people supporting your student</p>
									</div>
								</Link>
							</div>

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
								<p style={{ marginTop: 0, marginBottom: "1.25rem", color: "#666", fontSize: "0.9rem" }}>
									{topInnerHero
										? `${childProfile?.fullName || "This student"}'s top Inner Hero is ${topInnerHero}.`
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
										<span style={{ fontWeight: 600, color: "#333", fontSize: "1rem" }}>{topInnerHero}</span>
										<span style={{ color: "#1c2740", fontSize: "1.1rem", fontWeight: 700 }}>→</span>
									</button>
								)}
							</div>
						</div>

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
								To Do Items <span style={{ fontSize: 13, color: "#999", fontWeight: 400 }}>(Read Only)</span>
							</h2>
							<div style={{ marginBottom: "1.25rem" }}>
								<div style={{ height: "8px", backgroundColor: "#e9ecef", borderRadius: "4px", overflow: "hidden" }}>
									<div style={{ height: "100%", width: `${progressPercent}%`, backgroundColor: "#4ecdc4", transition: "width 0.3s ease" }} />
								</div>
								<p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>{progressPercent}% completed</p>
							</div>

							<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
								{incompleteItems.length > 0 ? incompleteItems.map((item) => (
									<div
										key={item.id}
										style={{
											backgroundColor: "#fff",
											padding: "1.25rem",
											borderRadius: "6px",
											borderLeft: `4px solid ${getPriorityColor(item.priority)}`,
											boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
										}}
									>
										<div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
											<input type="checkbox" checked={false} readOnly style={{ width: "20px", height: "20px", marginRight: "0.75rem", marginTop: "0.125rem", flexShrink: 0 }} />
											<p style={{ margin: 0, fontWeight: 600, color: "#333", flex: 1 }}>{item.title}</p>
											<span style={{ backgroundColor: getPriorityColor(item.priority), color: "#fff", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600, marginLeft: "0.5rem", whiteSpace: "nowrap" }}>
												{item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
											</span>
										</div>
										<p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#666" }}>{item.description}</p>
									</div>
								)) : (
									<div style={{ backgroundColor: "#fff", padding: "1rem", borderRadius: "6px", color: "#666" }}>
										No open to-do items.
									</div>
								)}

								{completedItems.length > 0 && (
									<div style={{ margin: "1rem 0 0.5rem", fontSize: "0.75rem", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.05rem" }}>
										Completed
									</div>
								)}
								{completedItems.map((item) => (
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
										<div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
											<input type="checkbox" checked readOnly style={{ width: "20px", height: "20px", marginRight: "0.75rem", marginTop: "0.125rem", flexShrink: 0 }} />
											<p style={{ margin: 0, fontWeight: 600, flex: 1 }}>{item.title}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}
				<button onClick={handleReset} style={{ marginTop: 32, background: "#394c7a", color: "#fff", border: "none", borderRadius: 6, padding: "10px 22px", fontWeight: 600, fontSize: 16, cursor: "pointer", display: "block", marginLeft: "auto", marginRight: "auto" }}>Pick Another Child</button>
			</div>
		</main>
	);

	return (
		<>
			{showModal && renderModal()}
			{selectedChild && (childProfile || isDashboardLoading) && renderChildDashboard()}
			{showAssessmentModal && renderAssessmentModal()}
		</>
	);
}

export default ParentDashboard;
