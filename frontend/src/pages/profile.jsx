import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProfilePage() {
	const [user, setUser] = useState(null);
	const [newEmail, setNewEmail] = useState("");
	const [emailMsg, setEmailMsg] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [pwMsg, setPwMsg] = useState("");
	// For profile picture
	const [profilePic, setProfilePic] = useState(null);
	const [showPicModal, setShowPicModal] = useState(false);
    
	// Helper to get full URL if needed
	function getFullPicUrl(url) {
		if (!url) return null;
		let fullUrl = url;
		if (!(url.startsWith("http://") || url.startsWith("https://"))) {
			// Prepend backend base if running on different port
			fullUrl = `${API_BASE}${url}`;
		}
		// Add cache-busting param (timestamp)
		const sep = fullUrl.includes('?') ? '&' : '?';
		return `${fullUrl}${sep}cb=${Date.now()}`;
	}

	const [picUploadMsg, setPicUploadMsg] = useState("");
	const [selectedPicFile, setSelectedPicFile] = useState(null);
	const [uploadingPic, setUploadingPic] = useState(false);
	const [picPreview, setPicPreview] = useState(null);

	useEffect(() => {
		const stored = localStorage.getItem("user");
		if (stored) {
			const parsed = JSON.parse(stored);
			setUser(parsed);
			if (parsed.profile_pic_url) {
				setProfilePic(getFullPicUrl(parsed.profile_pic_url));
			} else {
				setProfilePic(null);
			}
		}
	}, []);

	function handleProfilePicChange(e) {
		const file = e.target.files[0];
		setPicUploadMsg("");
		setPicPreview(null);
		if (!file) return;
		if (file.type !== "image/png") {
			setPicUploadMsg("Only PNG files are allowed.");
			return;
		}
		setSelectedPicFile(file);
		// Show preview
		const reader = new FileReader();
		reader.onloadend = () => {
			setPicPreview(reader.result);
		};
		reader.readAsDataURL(file);
	}

	async function handleConfirmProfilePicUpload() {
		setPicUploadMsg("");
		if (!selectedPicFile) {
			setPicUploadMsg("Please select a PNG file.");
			return;
		}
		if (!user?.id) {
			setPicUploadMsg("User not loaded.");
			return;
		}
		setUploadingPic(true);
		const formData = new FormData();
		formData.append("file", selectedPicFile);
		try {
			const res = await fetch(`${API_BASE}/users/${user.id}/upload_profile_pic/`, {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			if (!res.ok) {
				setPicUploadMsg(data.detail || "Failed to upload.");
				setUploadingPic(false);
				return;
			}
			setProfilePic(getFullPicUrl(data.profile_pic_url));
			setPicUploadMsg("Profile picture updated!");
			setShowPicModal(false);
			setSelectedPicFile(null);
			setPicPreview(null);
			setUploadingPic(false);
			const updatedUser = { ...user, profile_pic_url: data.profile_pic_url };
			setUser(updatedUser);
			localStorage.setItem("user", JSON.stringify(updatedUser));
			// Refresh the page to ensure new image is loaded everywhere
			setTimeout(() => window.location.reload(), 500);
		} catch {
			setPicUploadMsg("Error uploading file.");
			setUploadingPic(false);
		}
	}

	// Change email handler (uses /users/{user_id}/change_email/)
	async function handleEmailChange(e) {
		e.preventDefault();
		setEmailMsg("");
		if (!newEmail) return setEmailMsg("Please enter a new email.");
		if (!user?.id) return setEmailMsg("User not loaded.");
		try {
			const res = await fetch(`${API_BASE}/users/${user.id}/change_email/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					new_email: newEmail,
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				setEmailMsg(data.detail || "Failed to change email.");
				return;
			}
			setEmailMsg("Email changed! Please sign in again.");
			localStorage.removeItem("user");
			setTimeout(() => (window.location.href = "/signin"), 1200);
		} catch (err) {
			setEmailMsg("Error updating email.");
		}
	}

	// Change password handler
	async function handlePasswordChange(e) {
		e.preventDefault();
		setPwMsg("");
		if (!currentPassword || !newPassword) return setPwMsg("Fill both fields.");
		try {
			// No backend endpoint for password change, so just fake success for demo
			setPwMsg("Password changed! (Demo only)");
			setCurrentPassword("");
			setNewPassword("");
		} catch (err) {
			setPwMsg("Error changing password.");
		}
	}

	return (
		<main
			style={{
				width: "100%",
				minHeight: "100vh",
				background: "linear-gradient(180deg, #6f121f 0%, #991f2f 45%, #f8e1de 100%)",
				color: "#fff",
				display: "flex",
				justifyContent: "center",
				alignItems: "flex-start",
				padding: "2.5rem 1rem 2.5rem 1rem",
			}}
		>
			<div style={{ width: "100%", maxWidth: 1200, display: "flex", gap: 32 }}>
				{/* Left: Profile summary */}
				<div style={{ minWidth: 260, maxWidth: 320, flex: "0 0 300px", paddingRight: 32 }}>
					<div style={{ fontSize: 24, fontWeight: 500, marginBottom: 24 }}>My Profile</div>
					<div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
						<div
							style={{
								width: 80,
								height: 80,
								borderRadius: "50%",
								background: "#fff",
								marginBottom: 8,
								overflow: "hidden",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							{profilePic ? (
								<img src={profilePic} alt="Profile" style={{ width: 80, height: 80, objectFit: "cover" }} />
							) : (
								<div style={{ width: 80, height: 80, borderRadius: "50%", background: "#eee" }} />
							)}
						</div>
						<button
							style={{ color: "#fff", fontSize: 14, textDecoration: "underline", cursor: "pointer", background: "none", border: "none" }}
							onClick={() => setShowPicModal(true)}
						>
							Change Profile Picture
						</button>
						{showPicModal && (
							<div style={{
								position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)",
								display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
							}}>
								<div style={{ background: "#fff", padding: 32, borderRadius: 12, minWidth: 320, boxShadow: "0 8px 32px #0003" }}>
									<h3 style={{ color: "#6b0f1f", marginBottom: 16 }}>Upload Profile Picture</h3>
									<input type="file" accept="image/png" onChange={handleProfilePicChange} />
									{picPreview && (
										<div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center" }}>
											<div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", background: "#eee", marginBottom: 8 }}>
												<img src={picPreview} alt="Preview" style={{ width: 80, height: 80, objectFit: "cover" }} />
											</div>
											<span style={{ fontSize: 12, color: "#888" }}>Preview</span>
										</div>
									)}
									{picUploadMsg && <div style={{ color: "#b00", marginTop: 8 }}>{picUploadMsg}</div>}
									<div style={{ marginTop: 18, display: "flex", gap: 16 }}>
										<button onClick={handleConfirmProfilePicUpload} style={{ padding: "6px 18px", borderRadius: 8, border: "none", background: "#6b0f1f", color: "#fff", cursor: "pointer" }}>Confirm</button>
										<button onClick={() => { setShowPicModal(false); setPicPreview(null); setSelectedPicFile(null); }} style={{ padding: "6px 18px", borderRadius: 8, border: "none", background: "#eee", color: "#6b0f1f", cursor: "pointer" }}>Cancel</button>
									</div>
								</div>
							</div>
						)}
					</div>
					<div style={{ fontSize: 15, marginBottom: 6 }}>Name: <span style={{ color: "#ffe" }}>{user?.fullName || "Name"}</span></div>
					<div style={{ fontSize: 15, marginBottom: 6 }}>Email: <span style={{ color: "#ffe" }}>{user?.email || "Email"}</span></div>
				</div>
				{/* Divider */}
				<div style={{ width: 2, background: "#fff", opacity: 0.5, margin: "0 24px" }} />
				{/* Right: Forms */}
				<div style={{ flex: 1, maxWidth: 520, marginTop: 12 }}>
					{/* Change Email */}
					<form onSubmit={handleEmailChange} style={{ marginBottom: 40 }}>
						<div style={{ fontSize: 18, fontWeight: 500, marginBottom: 10 }}>Change Email</div>
						<div style={{ marginBottom: 8 }}>
							<label htmlFor="new-email" style={{ fontSize: 14, marginRight: 12 }}>New Email</label>
							<input
								id="new-email"
								type="email"
								value={newEmail}
								onChange={e => setNewEmail(e.target.value)}
								style={{ padding: 6, borderRadius: 8, border: "none", width: 180, marginRight: 12 }}
							/>
							<button
								type="submit"
								style={{ background: "#6b0f1f", color: "#fff", border: "none", borderRadius: 16, padding: "6px 22px", fontWeight: 500, cursor: "pointer" }}
							>Change</button>
						</div>
						{emailMsg && <div style={{ color: "#ffe", fontSize: 13, marginTop: 4 }}>{emailMsg}</div>}
					</form>
					{/* Change Password */}
					<form onSubmit={handlePasswordChange}>
						<div style={{ fontSize: 18, fontWeight: 500, marginBottom: 10 }}>Change Password</div>
						<div style={{ marginBottom: 8 }}>
							<label htmlFor="current-pw" style={{ fontSize: 14, marginRight: 12 }}>Current Password</label>
							<input
								id="current-pw"
								type="password"
								value={currentPassword}
								onChange={e => setCurrentPassword(e.target.value)}
								style={{ padding: 6, borderRadius: 8, border: "none", width: 180, marginRight: 12 }}
							/>
						</div>
						<div style={{ marginBottom: 8 }}>
							<label htmlFor="new-pw" style={{ fontSize: 14, marginRight: 12 }}>New Password</label>
							<input
								id="new-pw"
								type="password"
								value={newPassword}
								onChange={e => setNewPassword(e.target.value)}
								style={{ padding: 6, borderRadius: 8, border: "none", width: 180, marginRight: 12 }}
							/>
						</div>
						<button
							type="submit"
							style={{ background: "#6b0f1f", color: "#fff", border: "none", borderRadius: 16, padding: "6px 22px", fontWeight: 500, cursor: "pointer", marginTop: 6 }}
						>Change</button>
						{pwMsg && <div style={{ color: "#ffe", fontSize: 13, marginTop: 4 }}>{pwMsg}</div>}
					</form>
				</div>
			</div>
		</main>
	);
}