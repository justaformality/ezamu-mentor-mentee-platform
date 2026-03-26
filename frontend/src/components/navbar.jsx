
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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
  const isDashboard = ["/student-dashboard", "/coach-dashboard"].includes(pathname) || pathname.startsWith("/dashboard");

  // Always show navbar for signed-in users on any route (except landing logic below)
  if (user && !isLanding) {
    // Debug output for user
    // console.log('Navbar user:', user);
    return (
      <nav
        style={{
          width: "100%",
          borderBottom: "4px solid #6b0f1f",
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
            <Link to="/" style={{ fontWeight: 700, fontSize: "1.3rem", color: "#6b0f1f", textDecoration: "none" }}>Ezamu</Link>
            <Link
              to={user && (user.role === "coach" || user.role === "mentor") ? "/coach-dashboard" : "/student-dashboard"}
              style={{ color: isDashboard ? "#e48b8b" : "#6b0f1f", textDecoration: "none", fontSize: "0.97rem" }}
            >
              Dashboard
            </Link>
            <Link to="/appointments" style={{ color: pathname === "/appointments" ? "#e48b8b" : "#6b0f1f", textDecoration: "none", fontSize: "0.97rem" }}>Appointments</Link>
            <Link to="/contactus" style={{ color: isContact ? "#e48b8b" : "#6b0f1f", textDecoration: "none", fontSize: "0.97rem" }}>Contact Us</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link
              to="/profile"
              style={{
                color: pathname === "/profile" ? "#e48b8b" : "#6b0f1f",
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
                color: "#6b0f1f",
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
          borderBottom: "4px solid #6b0f1f",
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
            <Link to="/" style={{ fontWeight: 700, fontSize: "1.3rem", color: "#6b0f1f", textDecoration: "none" }}>Ezamu</Link>
            {user ? (
              <>
                <Link to={user && (user.role === "coach" || user.role === "mentor") ? "/coach-dashboard" : "/student-dashboard"} style={{ color: "#6b0f1f", textDecoration: "none", fontSize: "0.97rem" }}>Dashboard</Link>
                <Link to="/appointments" style={{ color: pathname === "/appointments" ? "#e48b8b" : "#6b0f1f", textDecoration: "none", fontSize: "0.97rem" }}>Appointments</Link>
              </>
            ) : (
              <>
                <Link to="/assessment" style={{ color: "#6b0f1f", textDecoration: "none", fontSize: "0.97rem" }}>Assessment</Link>
                <Link to="/contactus" style={{ color: isContact ? "#e48b8b" : "#6b0f1f", textDecoration: "none", fontSize: "0.97rem" }}>Contact Us</Link>
              </>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {user ? (
              <>
                <Link
                  to="/profile"
                  style={{
                    color: pathname === "/profile" ? "#e48b8b" : "#6b0f1f",
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
                    color: "#6b0f1f",
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
                <Link to="/signin" style={{ color: pathname === "/signin" ? "#e48b8b" : "#6b0f1f", textDecoration: "none", fontSize: "0.97rem" }}>Sign In</Link>
                <Link to="/signup" style={{ color: pathname === "/signup" ? "#e48b8b" : "#6b0f1f", textDecoration: "none", fontSize: "0.97rem" }}>Sign Up</Link>
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
        borderBottom: "4px solid #6b0f1f",
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
          <Link to="/" style={{ fontWeight: 700, fontSize: "1.3rem", color: "#6b0f1f", marginRight: "1.5rem", textDecoration: "none" }}>Ezamu</Link>
          {user ? (
            <>
              <Link
                to={user && (user.role === "coach" || user.role === "mentor") ? "/coach-dashboard" : "/student-dashboard"}
                style={{ color: ["/student-dashboard","/coach-dashboard"].includes(pathname) ? "#e48b8b" : "#6b0f1f", textDecoration: "none", fontSize: "0.97rem", marginRight: "1.5rem" }}
              >
                Dashboard
              </Link>
              <Link to="/appointments" style={{ color: pathname === "/appointments" ? "#e48b8b" : "#6b0f1f", textDecoration: "none", fontSize: "0.97rem" }}>Appointments</Link>
            </>
          ) : (
            <>
              <Link to="/assessment" style={{ color: "#6b0f1f", textDecoration: "none", fontSize: "0.97rem", marginRight: "1.5rem" }}>Assessment</Link>
              <Link to="/contactus" style={{ color: isContact ? "#e48b8b" : "#6b0f1f", textDecoration: "none", fontSize: "0.97rem" }}>Contact Us</Link>
            </>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {user ? (
            <>
              <Link
                to="/profile"
                style={{
                  color: pathname === "/profile" ? "#e48b8b" : "#6b0f1f",
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
                  color: "#6b0f1f",
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
              <Link to="/signin" style={{ color: pathname === "/signin" ? "#e48b8b" : "#6b0f1f", textDecoration: "none", fontSize: "0.97rem" }}>Sign In</Link>
              <Link to="/signup" style={{ color: pathname === "/signup" ? "#e48b8b" : "#6b0f1f", textDecoration: "none", fontSize: "0.97rem" }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
