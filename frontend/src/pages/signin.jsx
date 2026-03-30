// src/pages/SignInPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function SignInPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const API_BASE =
        import.meta.env.VITE_API_URL ||
        "http://127.0.0.1:5000";

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Invalid email or password");
        return;
      }

      // Save full user object (including profile_pic_url) for navbar/dashboard/profile use
      localStorage.setItem("user", JSON.stringify(data));

      // Redirect based on backend role
      const role = normalizeRole(data.role);
      if (role === "coach" || role === "mentor") {
        navigate("/coach-dashboard");
      } else if (role === "parent") {
        navigate("/parent-dashboard");
      } else {
        navigate("/student-dashboard");
      }
      setTimeout(() => window.location.reload(), 100); // force reload to update navbar state
    } catch (err) {
      console.error("Login error:", err);
      alert("Could not connect to the backend. Make sure the server is running.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "2.5rem 2rem 1rem",
        background: "linear-gradient(180deg, #121c34 0%, #3131d8 40%, #add8e6 100%)",
      }}
    >
      <article
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2rem",
          borderRadius: "1.2rem",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.85) 100%)",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        <h1 style={{ textAlign: "center", margin: "0 0 1.2rem", color: "#1c2740" }}>
          Login To Your Account
        </h1>

        {/* form for signing in */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <label style={{ color: "#1c2740 ", fontSize: "0.95rem" }}>
            Email
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem 0.9rem",
                marginTop: "0.35rem",
                borderRadius: "999px",
                border: "1px solid #e6b6bb",
                background: "#fff",
                boxShadow: "0 4px 6px rgba(0,0,0,0.08)",
                outline: "none",
              }}
            />
          </label>

          <label style={{ color: "#1c2740", fontSize: "0.95rem" }}>
            Password
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem 0.9rem",
                marginTop: "0.35rem",
                borderRadius: "999px",
                border: "1px solid #e6b6bb",
                background: "#fff",
                boxShadow: "0 4px 6px rgba(0,0,0,0.08)",
                outline: "none",
              }}
            />
          </label>

          <button
            type="submit"
            style={{
              marginTop: "0.4rem",
              padding: "0.8rem",
              borderRadius: "999px",
              backgroundColor: "#121c34",
              color: "#fff",
              border: "1px solid #121c34",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "1rem", textAlign: "center", color: "#1c2740 " }}>{message}</p>
        )}
      </article>
    </main>
  );
}

export default SignInPage;
