
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function getDashboardPath(user) {
  if (!user) return "/dashboard";
  const role = normalizeRole(user.role);
  if (role === "coach" || role === "mentor") return "/coach-dashboard";
  if (role === "parent") return "/parent-dashboard";
  return "/student-dashboard";
}

function Navbar() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  // Always show Ezamu as a link to landing. If user is signed in, always show dashboard links (Dashboard, Appointments, Profile), even on landing page.
  const isLanding = pathname === "/" || pathname === "/landing" || pathname === "/landing-page";
  const isContact = pathname === "/contactus";
  const isDashboard = ["/student-dashboard", "/coach-dashboard", "/parent-dashboard"].includes(pathname) || pathname.startsWith("/dashboard");

  // Always show navbar for signed-in users on any route (except landing logic below)
  if (user && !isLanding) {
    // Debug output for user
    // console.log('Navbar user:', user);
    return (
      <nav
        style={{
          width: "100%",
          borderBottom: "4px solid #1c2740",
          background: "#fff",
          minHeight: "4.5rem",
          padding: "1.25rem 0 1rem 0",
          display: "flex",
          alignItems: "center"
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            <Link to="/" style={{ fontWeight: 700, fontSize: "1.3rem", color: "#1c2740", textDecoration: "none" }}>Ezamu</Link>
            <Link
              to={getDashboardPath(user)}
              style={{ color: isDashboard ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}
            >
              Dashboard
            </Link>
            <Link to="/appointments" style={{ color: pathname === "/appointments" ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Appointments</Link>
            <Link to="/assessment" style={{ color: pathname === "/assessment" ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Assessment</Link>
            <Link to="/contactus" style={{ color: isContact ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Contact Us</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link
              to="/profile"
              style={{
                color: pathname === "/profile" ? "#add8e6" : "#1c2740",
                textDecoration: "none",
                fontSize: "0.97rem"
              }}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#1c2740",
                fontSize: "0.97rem",
                cursor: "pointer",
                marginLeft: "0.5rem"
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Landing page navbar
  if (isLanding) {
    return (
      <nav
        style={{
          width: "100%",
          borderBottom: "4px solid #1c2740",
          background: "#fff",
          minHeight: "4.5rem",
          padding: "1.25rem 0 1rem 0",
          display: "flex",
          alignItems: "center"
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            <Link to="/" style={{ fontWeight: 700, fontSize: "1.3rem", color: "#1c2740", textDecoration: "none" }}>Ezamu</Link>
            {user ? (
              <>
                <Link to={getDashboardPath(user)} style={{ color: "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Dashboard</Link>
                <Link to="/appointments" style={{ color: pathname === "/appointments" ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Appointments</Link>
                <Link to="/assessment" style={{ color: pathname === "/assessment" ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Assessment</Link>
              </>
            ) : (
              <>
                <Link to="/contactus" style={{ color: isContact ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Contact Us</Link>
              </>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {user ? (
              <>
                <Link
                  to="/profile"
                  style={{
                    color: pathname === "/profile" ? "#add8e6" : "#1c2740",
                    textDecoration: "none",
                    fontSize: "0.97rem"
                  }}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#1c2740",
                    fontSize: "0.97rem",
                    cursor: "pointer",
                    marginLeft: "0.5rem"
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" style={{ color: pathname === "/signin" ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Sign In</Link>
                <Link to="/signup" style={{ color: pathname === "/signup" ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Always show navbar, even on /signin and /signup
  return (
    <nav
      style={{
        width: "100%",
        borderBottom: "4px solid #1c2740",
        background: "#fff",
        minHeight: "4.5rem",
        padding: "1.25rem 0 1rem 0",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
          <Link to="/" style={{ fontWeight: 700, fontSize: "1.3rem", color: "#1c2740", marginRight: "1.5rem", textDecoration: "none" }}>Ezamu</Link>
          {user ? (
            <>
              <Link
                to={getDashboardPath(user)}
                style={{ color: ["/student-dashboard", "/coach-dashboard", "/parent-dashboard"].includes(pathname) ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem", marginRight: "1.5rem" }}
              >
                Dashboard
              </Link>
              <Link to="/appointments" style={{ color: pathname === "/appointments" ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Appointments</Link>
              <Link to="/assessment" style={{ color: pathname === "/assessment" ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Assessment</Link>
            </>
          ) : (
            <>
              <Link to="/contactus" style={{ color: isContact ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Contact Us</Link>
            </>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {user ? (
            <>
              <Link
                to="/profile"
                style={{
                  color: pathname === "/profile" ? "#add8e6" : "#1c2740",
                  textDecoration: "none",
                  fontSize: "0.97rem"
                }}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "#1c2740",
                  fontSize: "0.97rem",
                  cursor: "pointer",
                  marginLeft: "0.5rem"
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" style={{ color: pathname === "/signin" ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Sign In</Link>
              <Link to="/signup" style={{ color: pathname === "/signup" ? "#add8e6" : "#1c2740", textDecoration: "none", fontSize: "0.97rem" }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
