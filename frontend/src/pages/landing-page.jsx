import { Link } from "react-router-dom";

function LandingPage() {
  return (
    //styling the landing page with a gradient background and centered content, using flexbox for layout and spacing
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #121c34 0%, #3131d8 40%, #add8e6 100%)",
        color: "#2d1520",
        display: "flex",
        justifyContent: "center",
        padding: "1.5rem 1rem 2.5rem",
      }}
    >
      {/*container for the landing page content, with a max width and centered alignment, containing multiple sections that highlight the features and benefits of the Ezamu platform, including testimonials and a call-to-action at the end*/}
      <div style={{ width: "100%", maxWidth: "1180px" }}>
        <section
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            alignItems: "center",
            marginBottom: "3rem",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "1.25rem",
            padding: "2rem",
            border: "1px solid rgba(255, 255, 255, 0.35)",
          }}
        >
          {/*the hook section of the page*/}
          <div style={{ flex: "1 1 420px", minWidth: "300px" }}>
            <h1 style={{ fontSize: "2.4rem", color: "#fff", lineHeight: 1.15, marginBottom: "1rem" }}>
              Ezamu: The All-In-One Mentorship Platform
            </h1>
            <p style={{ fontSize: "1.05rem", color: "#fcf0f0", lineHeight: 1.6, maxWidth: "520px" }}>
              Connect with verified mentors, counselors, and peers to discover majors, explore careers, and build a plan for life after high school — all in one place.
            </p>
            <div style={{ marginTop: "1.75rem", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <Link
                to="/signup"
                style={{
                  padding: "0.85rem 1.8rem",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor: "#1c2740",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Get Evaluated Now
              </Link>
              <Link
                to="/signin"
                style={{
                  padding: "0.85rem 1.8rem",
                  borderRadius: "999px",
                  border: "1px solid #fff",
                  color: "#fff",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.15)",
                  fontWeight: 600,
                }}
              >
                Already Have an Account?
              </Link>
            </div>
          </div>

          <div style={{ flex: "1 1 420px", minWidth: "300px", display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: "100%",
                maxWidth: "440px",
                borderRadius: "1rem",
                border: "1px solid rgba(255,255,255,0.5)",
                overflow: "hidden",
                minHeight: "250px",
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                flexDirection: "column",
                padding: "1.25rem",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "0.5rem", color: "#fff", fontSize: "1.5rem", fontWeight: 700 }}>
                Welcome video
              </h3>
              <p style={{ marginTop: 0, marginBottom: "1rem", color: "#e9f7ff", lineHeight: 1.6, fontSize: "0.98rem" }}>
                Get a quick walkthrough of how Ezamu helps you choose pathways, connect with mentors, and take your next steps.
              </p>
              <div
                style={{
                  width: "100%",
                  flex: 1,
                  minHeight: "170px",
                  borderRadius: "0.8rem",
                  border: "1px dashed #add8e6",
                  background: "rgba(255,255,255,0.92)",
                  overflow: "hidden",
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  style={{ minHeight: "170px", border: "0" }}
                  src="https://www.youtube.com/embed/aJgp3tIzZzA"
                  title="Ezamu welcome video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        {/*the explanation of the page*/}
        <section style={{ marginBottom: "3rem", background: "rgba(255,255,255,0.15)", borderRadius: "1rem", padding: "1.8rem" }}>
          <h2 style={{ fontSize: "1.8rem", color: "#fff", marginBottom: "0.75rem" }}>
            How Can Ezamu Help You?
          </h2>
          <p style={{ fontSize: "1rem", color: "#f4edea", marginBottom: "1rem", maxWidth: "800px" }}>
            If you’re feeling overwhelmed, you’ve found the best platform that has all the tools to help relieve the stress and anxiety. Students can get tailored advice specific for their interests and financial backgrounds.
          </p>
          <p style={{ fontSize: "1rem", color: "#f4edea", maxWidth: "800px" }}>
            Ezamu connects you to coaches who help students create a college and career plan with actionable items to accomplish.
          </p>
        </section>

        {/*how it works, a step by step  path */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.8rem", color: "#fff", marginBottom: "1rem" }}>
            How Ezamu Works
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {[
              {
                step: "STEP 1",
                title: "Share your background",
                description:
                  "Tell us who you are. Share your interests, goals, and current education status so we can personalize your plan. Don't worry, we won't judge your choices, we just want to help.",
              },
              {
                step: "STEP 2",
                title: "Book an appointment",
                description:
                  "Book an appointment with our personal coaches and some of your peers who understand you, and your goals.",
              },
              {
                step: "STEP 3",
                title: "Track progress",
                description:
                  "Work through clear actionable goals, scholarship searches, and application milestones with regular check-ins with your mentors.",
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  flex: "1 1 280px",
                  minWidth: "250px",
                  background: "#fff",
                  borderRadius: "0.9rem",
                  padding: "1.2rem",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                }}
              >
                <small style={{ color: "#121c34", fontWeight: 700 }}>{item.step}</small>
                <h3 style={{ margin: "0.45rem 0", color: "#211251" }}>{item.title}</h3>
                <p style={{ color: "#392d4b", lineHeight: 1.6 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/*reviews section to gain trust*/}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.8rem", color: "#fff", marginBottom: "1rem" }}>
            Trusted By Students, Mentors, and Parents...
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {[
              {
                quote:
                  '“I used to worry about what my career path would look like. But now I have mentors and counselors guiding me.”',
                author: "-Alexis, 11th Grade",
              },
              {
                quote:
                  '“As a mentor, I see what a difference Ezamu makes in students’ lives, and I love being part of it.”',
                author: "-Marcus, STEM Mentor",
              },
              {
                quote:
                  '“I’m so grateful to Ezamu for helping us unlock our child’s potential in a time where we were uncertain.”',
                author: "-Farina, Parent of High Schooler",
              },
            ].map((item) => (
              <div
                key={item.author}
                style={{
                  flex: "1 1 300px",
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: "0.9rem",
                  padding: "1rem",
                  border: "1px solid rgba(255,255,255,0.7)",
                }}
              >
                <p style={{ margin: "0 0 0.75rem", fontStyle: "italic", color: "#2b2151" }}>
                  {item.quote}
                </p>
                <p style={{ margin: 0, fontWeight: 700, color: "#322b4f" }}>{item.author}</p>
              </div>
            ))}
          </div>
        </section>

        {/*call to action section to get users to start*/}
        <section
          style={{
            textAlign: "center",
            padding: "2rem",
            borderRadius: "1rem",
            background: "#1c2740",
            border: "1px solid rgba(255,255,255,0.45)",
          }}
        >
          <h2 style={{ color: "#fff", fontSize: "1.9rem", marginBottom: "0.8rem" }}>
            Ready To Start Planning Your Career Path?
          </h2>
          <h3 style={{ color: "#fff", fontSize: "1.0rem", marginBottom: "0.8rem" }}>
            Join us to find what your future holds. 
          </h3>
          <Link
            to="/signup"
            style={{
              display: "inline-block",
              backgroundColor: "#fff",
              color: "#1c2740",
              padding: "0.85rem 1.8rem",
              borderRadius: "999px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Get Evaluated Now
          </Link>
        </section>
      </div>
    </main>
  );
}

export default LandingPage;
