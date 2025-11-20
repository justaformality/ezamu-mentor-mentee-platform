import { Link } from "react-router-dom";

function Navbar() {
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

        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.95rem" }}>
          <Link to="/signin">Sign In</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
