// src/pages/SignInPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    console.log("SIGNIN FILE - 3/16 455");
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

      // Save logged-in user info for navbar/dashboard use
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email);

      // Redirect based on backend role
      if (data.role === "coach") {
        navigate("/coach-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Could not connect to the backend. Make sure the server is running.");
    }
  }

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <h1>Sign In</h1>
      <p style={{ marginBottom: "1.5rem" }}>
        Enter your email and password to login to your existing account.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
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
          Sign In
        </button>
      </form>

      {message && <p style={{ marginTop: "1rem", color: "gray" }}>{message}</p>}
    </main>
  );
}

export default SignInPage;
