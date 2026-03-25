import React from "react";

export default function ContactUs() {
  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #7b232c 0%, #e9b6b6 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "2.5rem 0 2.5rem 0",
      }}
    >
      <div style={{ maxWidth: 600, marginLeft: 60, marginTop: 24 }}>
        <h2 style={{ color: "#fff", fontSize: 32, marginBottom: 18 }}>Contact Us</h2>
        <div style={{ color: "#fff", fontSize: 16, marginBottom: 24 }}>
          Want to get in touch with Ezamu's team?<br />
          Contact us through one of the methods below.
        </div>
        <div style={{ background: "#fff6f7", borderRadius: 20, padding: 18, marginBottom: 18, fontSize: 16, boxShadow: "0 2px 8px #0001" }}>
          <b>Address:</b><br />
          ScareLQ Corporation<br />
          1968 South Coast Hwy #2504 Laguna Beach,<br />
          CA 92651
        </div>
        <div style={{ background: "#fff6f7", borderRadius: 20, padding: 18, marginBottom: 18, fontSize: 16, boxShadow: "0 2px 8px #0001" }}>
          <b>Phone Number:</b><br />
          (M) +1 (213) 340-4505<br />
          (O) +1 (213) 340-4505
        </div>
        <div style={{ background: "#fff6f7", borderRadius: 20, padding: 18, fontSize: 16, boxShadow: "0 2px 8px #0001" }}>
          <b>Email:</b><br />
          mk@ezamu.com
        </div>
      </div>
    </main>
  );
}
