// src/pages/SignUpPage.jsx
import { useState } from "react";

function SignUpPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Sign up form submitted:", form);
    setMessage(
      "This would send your data to the backend. (Frontend only for now)"
    );
  }

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "450px",
        margin: "0 auto",
      }}
    >
      <h1>Create an Account</h1>
      <p style={{ marginBottom: "1.5rem" }}>
        Sign up as a student, mentor, or counselor.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <label>
          Full Name
          <input
            type="text"
            name="fullName"
            required
            value={form.fullName}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>

        <label>
          I am a...
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          >
            <option value="student">Student</option>
            <option value="mentor">Career Coach/Counselor</option>
            <option value="counselor">Mentor</option>
          </select>
        </label>

        <button
          type="submit"
          style={{
            marginTop: "0.5rem",
            padding: "0.75rem",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "0.4rem",
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
      </form>

      {message && <p style={{ marginTop: "1rem", color: "gray" }}>{message}</p>}
    </main>
  );
}

export default SignUpPage;
