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

  function handleSubmit(e) {
    e.preventDefault();
    
    //for now to test pages just uncomment what u wanna go to after signin
    navigate("/student-dashboard");
    //navigate("/coach-dashboard");

    //to be developed based on db
    // if (!form.role) {
    //   setMessage("Please select a role");
    //   return;
    // }

    // // Store user data with role in localStorage
    // const userData = {
    //   email: form.email,
    //   role: form.role,
    // };
    // localStorage.setItem("user", JSON.stringify(userData));

    // // Redirect based on role
    // if (form.role === "student") {
    //   navigate("/student-dashboard");
    // } else if (form.role === "coach") {
    //   navigate("/coach-dashboard");
    // }
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
