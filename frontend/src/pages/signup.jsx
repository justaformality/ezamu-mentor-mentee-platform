// src/pages/SignUpPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
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
        // Store user data in localStorage
        const userData = {
          email: form.email,
          role: form.role,
        };
        localStorage.setItem("user", JSON.stringify(userData));

        setMessage("Sign up successful! Redirecting...");
        
        // Redirect based on role
        setTimeout(() => {
          if (form.role === "student") {
            navigate("/student-dashboard");
          } else if (form.role === "coach" || form.role === "mentor") {
            navigate("/coach-dashboard");
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
          disabled={isLoading}
          style={{
            marginTop: "0.5rem",
            padding: "0.75rem",
            backgroundColor: isLoading ? "#ccc" : "#f44336",
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
    </main>
  );
}

export default SignUpPage;
