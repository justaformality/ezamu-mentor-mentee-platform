import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <main
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "2.5rem 2rem 4rem",
      }}
    >
      <div style={{ maxWidth: "1100px", width: "100%" }}>
        {/* 1. HERO SECTION ------------------------------------------------------------------------------------------------------------*/}
        <section
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2.5rem",
            alignItems: "center",
            marginBottom: "4rem",
          }}
        >
          <div style={{ flex: "1 1 340px", minWidth: "280px" }}>
            <h1
              style={{
                fontSize: "2.4rem",
                marginBottom: "0.75rem",
                lineHeight: 1.2,
              }}
            >
              The All-In-One Career & College Guidance Platform for Students
            </h1>
            <p
              style={{
                lineHeight: 1.6,
                fontSize: "0.98rem",
                maxWidth: "520px",
              }}
            >
              Connect with verified mentors, counselors, and peers to discover
              majors, explore careers, and build a plan for life after high
              school — all in one place.
            </p>
            <div
              style={{
                marginTop: "1.75rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <Link
                to="/signup"
                style={{
                  padding: "0.75rem 1.8rem",
                  backgroundColor: "#f44336",
                  color: "white",
                  borderRadius: "999px",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                }}
              >
                Get Matched with a Coach
              </Link>

              <Link
                to="/signin"
                style={{
                  padding: "0.75rem 1.8rem",
                  border: "1px solid #f44336",
                  borderRadius: "999px",
                  textDecoration: "none",
                  color: "#f44336",
                  fontSize: "0.95rem",
                }}
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div
            style={{
              flex: "1 1 320px",
              minWidth: "280px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "360px",
                height: "230px",
                borderRadius: "1.25rem",
                padding: "1.2rem",
                background:
                  "linear-gradient(135deg, rgba(244,67,54,0.20), rgba(244,67,54,0.10))",
                boxShadow: "0 18px 35px rgba(244,67,54,0.25)",

                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#f44336",
                    marginBottom: "0.25rem",
                  }}
                >
                  Preview
                </p>
                <h3 style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>
                  Today&apos;s Guidance Snapshot
                </h3>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
                  3 mentor messages waiting, 2 college deadlines this month, and
                  a new career pathway suggestion based on your interests.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8rem",
                  marginTop: "0.75rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>12</div>
                  <div style={{ opacity: 0.8 }}>Mentors matched</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>5</div>
                  <div style={{ opacity: 0.8 }}>Saved colleges</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>3</div>
                  <div style={{ opacity: 0.8 }}>New insights</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PROBLEM / PAIN POINT SECTION ------------------------------------------------------------------------------------------------------------*/}
        <section style={{ marginBottom: "3.5rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "0.75rem",
            }}
          >
            Feeling Overwhelmed by College and Career Decisions?
          </h2>

          <p style={{ marginBottom: "0.75rem", fontSize: "0.98rem" }}>
            We know how confusing it can feel.
          </p>

          <ul
            style={{
              lineHeight: 1.9,
              fontSize: "0.95rem",
              paddingLeft: "1.2rem",
            }}
          >
            <li>
              Tracking deadlines in one place, researching schools in another,
              and messaging mentors over text or email — everything feels
              scattered.
            </li>
            <li>
              Struggling to connect your interests to real careers or college
              majors that actually fit you.
            </li>
            <li>
              Getting lots of generic advice, but not enough specific,
              actionable guidance tailored to your goals and background.
            </li>
          </ul>
        </section>


        {/* 3. SOLUTION / VALUE PROP SECTION ------------------------------------------------------------------------------------------------------------*/}

        {/* 4. SOCIAL PROOF SECTION ------------------------------------------------------------------------------------------------------------*/}

        {/* 5. HOW IT WORKS SECTION ------------------------------------------------------------------------------------------------------------*/}

        {/* 6. CALL TO ACTION SECTION ------------------------------------------------------------------------------------------------------------*/}
      </div>
    </main>
  );
}

export default LandingPage;
