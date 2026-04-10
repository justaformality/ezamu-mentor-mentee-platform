import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const careerFields = [
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

function NumberInput({ value, onChange }) {
	return (
		<div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
			<input
				type="number"
				min="0"
				value={value}
				onChange={e => {
					const val = e.target.value.replace(/[^0-9]/g, "");
					onChange(val);
				}}
				style={{
					border: "1px solid #e6b6bb",
					borderRadius: "999px",
					padding: "0.75rem 1.2rem",
					width: "70%",
					fontSize: "1.1rem",
					textAlign: "center",
					background: "#fff",
					boxShadow: "0 2px 8px rgba(126,15,31,0.06)",
					outline: "none"
				}}
				placeholder="Enter your age"
			/>
		</div>
	);
}

function CareerCards({ selected, onSelect }) {
	return (
		<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", width: "100%" }}>
			{careerFields.map(field => (
				<div
					key={field}
					style={{
						border: selected.includes(field) ? "2px solid #121c34" : "1px solid #e6b6bb",
						borderRadius: "1.1rem",
						padding: "1rem 1.2rem",
						minWidth: "110px",
						textAlign: "center",
						background: selected.includes(field) ? "#f7c5c8" : "#fff",
						color: selected.includes(field) ? "#121c34" : "#1c2740",
						fontWeight: 600,
						fontSize: "1rem",
						cursor: "pointer",
						boxShadow: selected.includes(field)
							? "0 2px 8px rgba(126,15,31,0.10)"
							: "0 2px 8px rgba(126,15,31,0.06)",
						transition: "all 0.18s"
					}}
					onClick={() => {
						if (selected.includes(field)) {
							onSelect(selected.filter(f => f !== field));
						} else {
							onSelect([...selected, field]);
						}
					}}
				>
					{field}
				</div>
			))}
		</div>
	);
}

function BioInput({ value, onChange }) {
	const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
	return (
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
			<textarea
				value={value}
				onChange={e => {
					if (e.target.value.trim().split(/\s+/).length <= 300) {
						onChange(e.target.value);
					}
				}}
				rows={5}
				style={{
					border: "1px solid #e6b6bb",
					borderRadius: "1.1rem",
					padding: "1rem 1.2rem",
					width: "80%",
					fontSize: "1.08rem",
					textAlign: "center",
					background: "#fff",
					boxShadow: "0 2px 8px rgba(126,15,31,0.06)",
					outline: "none",
					resize: "none"
				}}
				placeholder="Write a short bio for students (max 300 words)"
			/>
			<div style={{ fontSize: "0.98rem", color: "#1c2740", marginTop: "0.5rem" }}>
				{wordCount} / 300 words
			</div>
		</div>
	);
}

const steps = [
	{
		question: "How old are you?",
		render: (value, onChange) => <NumberInput value={value} onChange={onChange} />,
		validate: value => value && Number(value) > 0,
		error: "Please enter a valid age.",
		key: "age",
	},
	{
		question: "Select your area(s) of expertise",
		render: (value, onChange) => <CareerCards selected={value} onSelect={onChange} />,
		validate: value => Array.isArray(value) && value.length > 0,
		error: "Please select at least one area of expertise.",
		key: "fields",
	},
	{
		question: "Give us a short bio that tells students who you are.",
		render: (value, onChange) => <BioInput value={value} onChange={onChange} />,
		validate: value => value && value.trim().split(/\s+/).length > 0 && value.trim().split(/\s+/).length <= 300,
		error: "Please enter a bio (max 300 words).",
		key: "bio",
	},
];

export default function CoachRegistration() {
	const navigate = useNavigate();
	const [step, setStep] = useState(0);
	const [form, setForm] = useState({ age: "", fields: [], bio: "" });
	const [touched, setTouched] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	const current = steps[step];
	const value = form[current.key];
	const isValid = current.validate(value);

	const handleChange = v => {
		setForm(f => ({ ...f, [current.key]: v }));
		setTouched(false);
	};

	const handleNext = () => {
		if (!isValid) {
			setTouched(true);
			return;
		}
		setStep(s => s + 1);
		setTouched(false);
	};

	const handleSave = async () => {
		if (!isValid) {
			setTouched(true);
			return;
		}

		setSaving(true);

		try {
			const storedUser = localStorage.getItem("user");
			const parsedUser = storedUser ? JSON.parse(storedUser) : null;

			if (!parsedUser?.id) {
				setSaving(false);
				return;
			}

			const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

			const res = await fetch(`${API_BASE}/coaches/${parsedUser.id}/profile`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					age: form.age,
					bio: form.bio,
					expertise: form.fields,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				console.error(data);
				setSaving(false);
				return;
			}

			setSaving(false);
			setSaved(true);
			navigate("/coach-dashboard");
		} catch (err) {
			console.error("Failed to save coach profile:", err);
			setSaving(false);
		}
	};

	return (
		<main
			style={{
				minHeight: "100vh",
				width: "100vw",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				background: "linear-gradient(180deg, #121c34 0%, #3131d8 40%, #add8e6 100%)",
				padding: "2.5rem 1rem 1rem",
			}}
		>
			<section
				style={{
					width: "100%",
					maxWidth: "480px",
					margin: "2.5rem auto 0 auto",
					padding: "2.2rem 2rem 2rem",
					borderRadius: "1.2rem",
					background: "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.89) 100%)",
					boxShadow: "0 20px 40px rgba(0, 0, 0, 0.18)",
					border: "1px solid rgba(255,255,255,0.62)",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<h2
					style={{
						textAlign: "center",
						margin: "0 0 1.5rem",
						color: "#66111b",
						fontWeight: 700,
						fontSize: "2rem"
					}}
				>
					Basic Information
				</h2>

				<div style={{ width: "100%", marginBottom: "1.5rem" }}>
					<div
						style={{
							textAlign: "center",
							fontWeight: 600,
							fontSize: "1.15rem",
							marginBottom: "0.7rem",
							color: "#7e0f1f"
						}}
					>
						{current.question}
					</div>

					<div style={{ width: "100%" }}>{current.render(value, handleChange)}</div>

					{touched && !isValid && (
						<div
							style={{
								color: "#121c34",
								fontSize: "0.98rem",
								marginTop: "0.7rem",
								textAlign: "center"
							}}
						>
							{current.error}
						</div>
					)}
				</div>

				<div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: "1.5rem" }}>
					{step > 0 ? (
						<button
							style={{
								padding: "0.7rem 1.5rem",
								background: "#e6b6bb",
								color: "#121c34",
								border: "none",
								borderRadius: "999px",
								fontWeight: 600,
								fontSize: "1rem",
								cursor: "pointer",
								boxShadow: "0 2px 8px rgba(126,15,31,0.08)",
								transition: "background 0.2s"
							}}
							onClick={() => {
								setStep(s => s - 1);
								setTouched(false);
							}}
						>
							&#8592; Back
						</button>
					) : (
						<div />
					)}

					{step < steps.length - 1 ? (
						<button
							style={{
								padding: "0.7rem 1.5rem",
								background: "#121c34",
								color: "#fff",
								border: "none",
								borderRadius: "999px",
								fontWeight: 600,
								fontSize: "1rem",
								cursor: "pointer",
								boxShadow: "0 2px 8px rgba(126,15,31,0.08)",
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
								transition: "background 0.2s"
							}}
							onClick={handleNext}
						>
							Next <span>&#8594;</span>
						</button>
					) : (
						<button
							style={{
								padding: "0.7rem 1.5rem",
								background: saving ? "#add8e6" : saved ? "#4caf50" : "#7e0f1f",
								color: "#fff",
								border: "none",
								borderRadius: "999px",
								fontWeight: 600,
								fontSize: "1rem",
								cursor: saving ? "not-allowed" : "pointer",
								opacity: saving ? 0.7 : 1,
								boxShadow: "0 2px 8px rgba(126,15,31,0.08)",
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
								transition: "background 0.2s"
							}}
							onClick={handleSave}
							disabled={saving}
						>
							{saving ? "Saving..." : saved ? "Saved!" : "Save"}
						</button>
					)}
				</div>
			</section>
		</main>
	);
}