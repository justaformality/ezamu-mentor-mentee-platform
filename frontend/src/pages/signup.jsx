// src/pages/SignUpPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match. Please check and try again.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    //attempting to insert new user into db through backend endpoint... still in progress
    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          role: form.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the full user object returned from the backend
        // If your backend returns { user: {...} }, use data.user; otherwise, use data directly
        const userObj = data.user || data;
        localStorage.setItem("user", JSON.stringify(userObj));
        window.user = userObj;
        setMessage("Sign up successful! Redirecting...");

        // Force reload to update navbar state
        setTimeout(() => {
          if (userObj.role === "student") {
            window.location.href = "/student-registration";
          } else if (userObj.role === "coach") {
            window.location.href = "/coach-registration";
          } else if (userObj.role === "parent") {
            window.location.href = "/coach-dashboard";
          }
        }, 500);
      } else {
        setMessage(data.detail || "Sign up failed. Please try again.");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setMessage("Error connecting to the server. Is the backend running on port 5000?");
    } finally {
      setIsLoading(false);
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
          maxWidth: "450px",
          marginTop: "1rem",
          padding: "1.8rem",
          borderRadius: "1.2rem",
          background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.83) 100%)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.22)",
          border: "1px solid rgba(255,255,255,0.62)",
        }}
      >
        <h1 style={{ textAlign: "center", margin: "0 0 1rem", color: "#1c2740 " }}>
          Create an Account
        </h1>
        <p style={{ marginBottom: "1.25rem", textAlign: "center", color: "#5f1f2c" }}>
          Sign up as a student, parent, or coach.
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

        <label>
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

        <label>
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

        <label>
          Confirm Password
          <input
            type="password"
            name="confirmPassword"
            required
            value={form.confirmPassword}
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

        <label>
          I am a...
          <select
            name="role"
            value={form.role}
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
          >
            <option value="student">Student</option>
            <option value="parent">Parent</option>
            <option value="coach">Coach</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            marginTop: "0.5rem",
            padding: "0.75rem",
            backgroundColor: isLoading ? "#ccc" : "#1c2740 ",
            color: "white",
            border: "none",
            borderRadius: "0.4rem",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            borderRadius: "0.4rem",
            backgroundColor:
              message.includes("successful") || message.includes("Redirecting")
                ? "#d4edda"
                : "#f8d7da",
            color:
              message.includes("successful") || message.includes("Redirecting")
                ? "#155724"
                : "#721c24",
            border:
              message.includes("successful") || message.includes("Redirecting")
                ? "1px solid #c3e6cb"
                : "1px solid #f5c6cb",
          }}
        >
          {message}
        </p>
      )}
    </article>
  </main>
  );
}

export default SignUpPage;
