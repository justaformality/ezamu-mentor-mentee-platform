import { useState } from "react";

function Assessment() {
  const [formData, setFormData] = useState({
    innerHero: "",
    mbti: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const innerHeroOptions = ["Planner", "Doer", "Thinker", "Helper"];

  const mbtiOptions = [
    "ISTJ",
    "ISFJ",
    "INFJ",
    "INTJ",
    "ISTP",
    "ISFP",
    "INFP",
    "INTP",
    "ESTP",
    "ESFP",
    "ENFP",
    "ENTP",
    "ESTJ",
    "ESFJ",
    "ENFJ",
    "ENTJ",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.innerHero && formData.mbti) {
      console.log("Assessment submitted:", formData);
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ innerHero: "", mbti: "" });
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <main
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "2.5rem 2rem 4rem",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "600px", width: "100%" }}>
        <h1 style={{ marginBottom: "1rem", color: "#333" }}>Assessment</h1>
        <p
          style={{
            marginBottom: "2rem",
            color: "#666",
            fontSize: "1rem",
            lineHeight: "1.5",
          }}
        >
          Complete this assessment to help your coach better understand your personality and strengths.
        </p>

        <div
          style={{
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            padding: "2rem",
            border: "1px solid #e9ecef",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Inner Hero Type */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.75rem",
                  fontWeight: "600",
                  color: "#333",
                  fontSize: "1rem",
                }}
              >
                Inner Hero Type
              </label>
              <p
                style={{
                  marginTop: "0",
                  marginBottom: "1rem",
                  color: "#666",
                  fontSize: "0.9rem",
                }}
              >
                Select the Inner Hero type that best describes you.
              </p>
              <select
                name="innerHero"
                value={formData.innerHero}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  backgroundColor: "#fff",
                  color: "#333",
                  cursor: "pointer",
                }}
              >
                <option value="">-- Select an option --</option>
                {innerHeroOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* MBTI Personality Type */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.75rem",
                  fontWeight: "600",
                  color: "#333",
                  fontSize: "1rem",
                }}
              >
                MBTI Personality Type
              </label>
              <p
                style={{
                  marginTop: "0",
                  marginBottom: "1rem",
                  color: "#666",
                  fontSize: "0.9rem",
                }}
              >
                Select your Myers-Briggs Type Indicator (MBTI) result.
              </p>
              <select
                name="mbti"
                value={formData.mbti}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  backgroundColor: "#fff",
                  color: "#333",
                  cursor: "pointer",
                }}
              >
                <option value="">-- Select an option --</option>
                {mbtiOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.target.style.backgroundColor = "#0056b3")
              }
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = "#007bff")
              }
            >
              Submit Assessment
            </button>
          </form>

          {/* Success Message */}
          {submitted && (
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                backgroundColor: "#d4edda",
                border: "1px solid #c3e6cb",
                borderRadius: "6px",
                color: "#155724",
                textAlign: "center",
                fontSize: "0.95rem",
              }}
            >
              ✓ Assessment submitted successfully!
            </div>
          )}
        </div>

        {/* Info Section */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            backgroundColor: "#e7f3ff",
            borderRadius: "8px",
            border: "1px solid #b3d9ff",
          }}
        >
          <h3 style={{ marginTop: "0", color: "#004085", fontSize: "1rem" }}>
            About These Assessments
          </h3>
          <p
            style={{
              margin: "0.5rem 0 0 0",
              color: "#004085",
              fontSize: "0.9rem",
              lineHeight: "1.5",
            }}
          >
            <strong>Inner Hero:</strong> Identifies your core strengths - Planners are organized, Doers are action-oriented, Thinkers are analytical, and Helpers are empathetic.
          </p>
          <p
            style={{
              margin: "1rem 0 0 0",
              color: "#004085",
              fontSize: "0.9rem",
              lineHeight: "1.5",
            }}
          >
            <strong>MBTI:</strong> The Myers-Briggs Type Indicator reveals your personality preferences across four dimensions, helping you understand your communication style and work preferences.
          </p>
        </div>
      </div>
    </main>
  );
}

export default Assessment;
