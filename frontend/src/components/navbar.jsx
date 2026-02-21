import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in by checking localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const location = useLocation();
  const pathname = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav
      style={{
        width: "100%",
        borderBottom: "1px solid #eee",
        padding: "0.75rem 0",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "1.3rem",
            color: "#f44336",
          }}
        >
          Ezamu
        </Link>

        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.95rem", alignItems: "center" }}>
            {/* If we're on the student dashboard, show temporary student links even if user isn't set yet */}
            {pathname === "/student-dashboard" ? (
              <>
                <Link to="/book-appointments">Book an Appointment</Link>
                <Link to="/assessment">Assessments Form</Link>
                <Link to="/profile">My Profile</Link>
                {user && (
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#f44336",
                      fontSize: "0.95rem",
                    }}
                  >
                    Logout
                  </button>
                )}
              </>
            ) : user ? (
              <>
                <Link to="/book-appointments">Book Appointments</Link>
                <Link to="/assessment">Assessments Form</Link>
                <Link to="/profile">Profile</Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#f44336",
                    fontSize: "0.95rem",
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signin">Sign In</Link>
                <Link to="/signup">Sign Up</Link>
              </>
            )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
