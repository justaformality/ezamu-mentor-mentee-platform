import { useMemo, useState } from "react";

const HEROES = {
  thinker: {
    label: "Thinker",
    color: "#6b46c1",
    accentBg: "#f4efff",
    description:
      "You love ideas, problem-solving, innovation, and figuring out how things work.",
    careers: ["Engineering", "Research", "Data Science", "Policy", "Product Strategy"],
  },
  helper: {
    label: "Helper",
    color: "#c96a1b",
    accentBg: "#fff3e8",
    description:
      "You care about people, connection, support, encouragement, and making a difference.",
    careers: ["Teaching", "Counseling", "Social Work", "Journalism", "Healthcare"],
  },
  planner: {
    label: "Planner",
    color: "#2c7a7b",
    accentBg: "#edf8f7",
    description:
      "You thrive on structure, responsibility, follow-through, and building dependable systems.",
    careers: ["Project Management", "Operations", "Business", "Administration", "Finance"],
  },
  doer: {
    label: "Doer",
    color: "#c23d7d",
    accentBg: "#fff0f7",
    description:
      "You learn by doing, move fast, enjoy action, and like flexible, energetic environments.",
    careers: ["Media", "Entrepreneurship", "Sports", "Marketing", "Tech Support"],
  },
};

const QUESTIONS = [
  {
    id: 1,
    type: "single",
    title: "A school event is coming up. What role sounds most like you?",
    subtitle: "Choose the one that feels most natural.",
    options: [
      { text: "I want to brainstorm new ideas and improve the event.", hero: "thinker" },
      { text: "I want to make everyone feel included and supported.", hero: "helper" },
      { text: "I want to organize the schedule and keep everything on track.", hero: "planner" },
      { text: "I want to jump in, help out, and make things happen.", hero: "doer" },
    ],
  },
  {
    id: 2,
    type: "single",
    title: "When you are learning something new, what helps most?",
    subtitle: "Pick the style that sounds best.",
    options: [
      { text: "Understanding the big idea and why it works", hero: "thinker" },
      { text: "Talking it through with people and hearing real stories", hero: "helper" },
      { text: "A step-by-step structure I can follow", hero: "planner" },
      { text: "Trying it myself and learning hands-on", hero: "doer" },
    ],
  },
  {
    id: 3,
    type: "single",
    title: "What kind of content grabs your attention fastest?",
    subtitle: "Think TikTok, YouTube, Netflix, or class projects.",
    options: [
      { text: "Deep ideas, science, psychology, or strategy", hero: "thinker" },
      { text: "Human stories, relationships, and personal growth", hero: "helper" },
      { text: "Real-life advice, productivity, and practical tips", hero: "planner" },
      { text: "Adventure, action, energy, and exciting experiences", hero: "doer" },
    ],
  },
  {
    id: 4,
    type: "single",
    title: "You have a big decision to make. What do you trust first?",
    subtitle: "Go with your instinct.",
    options: [
      { text: "Logic, facts, and patterns", hero: "thinker" },
      { text: "How it will affect people emotionally", hero: "helper" },
      { text: "What has worked before and what is realistic", hero: "planner" },
      { text: "What feels right in the moment and what gets movement", hero: "doer" },
    ],
  },
  {
    id: 5,
    type: "single",
    title: "In a group project, friends usually see you as...",
    subtitle: "Pick the role you naturally become.",
    options: [
      { text: "The idea person", hero: "thinker" },
      { text: "The encourager", hero: "helper" },
      { text: "The organizer", hero: "planner" },
      { text: "The action person", hero: "doer" },
    ],
  },
  {
    id: 6,
    type: "single",
    title: "What would make a future career feel exciting to you?",
    subtitle: "Choose the best fit.",
    options: [
      { text: "It challenges my mind and lets me solve hard problems", hero: "thinker" },
      { text: "It helps people grow, heal, or succeed", hero: "helper" },
      { text: "It gives me clear goals, stability, and responsibility", hero: "planner" },
      { text: "It has variety, movement, and hands-on work", hero: "doer" },
    ],
  },
  {
    id: 7,
    type: "multi",
    title: "Pick TWO school subjects or spaces you enjoy most",
    subtitle: "This helps us connect your strengths to pathways.",
    maxSelections: 2,
    options: [
      { text: "Science / Math / Coding", hero: "thinker" },
      { text: "Psychology / Language / Community work", hero: "helper" },
      { text: "History / Government / Business", hero: "planner" },
      { text: "Art / Media / Performance / Design", hero: "doer" },
    ],
  },
  {
    id: 8,
    type: "card-select",
    title: "Choose the vibe that feels most like you",
    subtitle: "Pick the description that sounds most natural to you.",
    options: [
      {
        text: "Curious, independent, and always asking why",
        hero: "thinker",
      },
      {
        text: "Warm, supportive, and focused on people",
        hero: "helper",
      },
      {
        text: "Reliable, prepared, and comfortable with structure",
        hero: "planner",
      },
      {
        text: "Bold, energetic, and excited to try things",
        hero: "doer",
      },
    ],
  },
  {
    id: 9,
    type: "ranking",
    title: "Final round: rank your Inner Heroes",
    subtitle:
      "Read the four Inner Heroes below, then rank them from most like you to least like you.",
    options: [
      { text: "Thinker", hero: "thinker" },
      { text: "Helper", hero: "helper" },
      { text: "Planner", hero: "planner" },
      { text: "Doer", hero: "doer" },
    ],
  },
];

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #fff7f5 0%, #fdebe7 100%)",
    padding: "2.5rem 1.25rem 4.5rem",
    display: "flex",
    justifyContent: "center",
  },
  shell: {
    width: "100%",
    maxWidth: "1200px",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1.5rem",
    marginBottom: "1.75rem",
    alignItems: "stretch",
  },
  heroCard: {
    background: "linear-gradient(180deg, #fffdfc 0%, #fff5f2 100%)",
    borderRadius: "28px",
    padding: "2rem",
    boxShadow: "0 20px 48px rgba(91, 29, 41, 0.10)",
    border: "1px solid #efcfc9",
  },
  eyebrow: {
    display: "inline-block",
    background: "#f6d9d1",
    color: "#7c1828",
    borderRadius: "999px",
    padding: "0.45rem 0.95rem",
    fontSize: "0.95rem",
    fontWeight: 700,
    marginBottom: "1rem",
    letterSpacing: "0.01em",
  },
  title: {
    fontSize: "3rem",
    margin: "0 0 1rem 0",
    color: "#5b1d29",
    lineHeight: 1.05,
    fontWeight: 800,
  },
  subtitle: {
    color: "#6d4750",
    lineHeight: 1.8,
    fontSize: "1.15rem",
    marginBottom: "1.4rem",
    maxWidth: "42rem",
  },
  videoTitle: {
    marginTop: 0,
    marginBottom: "0.5rem",
    color: "#5b1d29",
    fontSize: "1.9rem",
    fontWeight: 800,
  },
  videoText: {
    color: "#6d4750",
    lineHeight: 1.75,
    fontSize: "1.05rem",
    marginBottom: "1rem",
  },
  videoWrap: {
    borderRadius: "22px",
    overflow: "hidden",
    border: "1px solid #e9c8c2",
    background: "#f7efed",
    minHeight: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlaceholder: {
    color: "#8c6770",
    fontSize: "1rem",
    fontWeight: 600,
    textAlign: "center",
    padding: "1.25rem",
    lineHeight: 1.7,
  },
  trackerRow: {
    display: "flex",
    gap: "0.9rem",
    flexWrap: "wrap",
    marginBottom: "1.5rem",
  },
  trackerBadge: {
    background: "#fff",
    border: "1px solid #e7cbc6",
    borderRadius: "999px",
    padding: "0.75rem 1rem",
    fontWeight: 700,
    color: "#61202b",
    fontSize: "1rem",
  },
  progressTrack: {
    height: "12px",
    width: "100%",
    background: "#efd6d1",
    borderRadius: "999px",
    overflow: "hidden",
    marginTop: "1.15rem",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #8f2031 0%, #b4334b 100%)",
    transition: "width 0.25s ease",
    borderRadius: "999px",
  },
  progressText: {
    marginTop: "0.95rem",
    color: "#6c4750",
    fontWeight: 700,
    fontSize: "1.05rem",
  },
  questionCard: {
    background: "#ffffff",
    borderRadius: "30px",
    padding: "2rem",
    boxShadow: "0 24px 50px rgba(91, 29, 41, 0.12)",
    border: "1px solid #ebcfc9",
    marginBottom: "1.4rem",
  },
  questionHeader: {
    borderBottom: "1px solid #f0dbd6",
    paddingBottom: "1rem",
    marginBottom: "1.5rem",
  },
  questionLabel: {
    display: "inline-block",
    background: "#f8ece8",
    color: "#8b2234",
    borderRadius: "999px",
    padding: "0.42rem 0.85rem",
    fontSize: "0.95rem",
    fontWeight: 700,
    marginBottom: "0.95rem",
  },
  questionTitle: {
    marginTop: 0,
    marginBottom: "0.7rem",
    color: "#5a1d29",
    fontSize: "2rem",
    lineHeight: 1.2,
    fontWeight: 800,
  },
  questionSubtitle: {
    color: "#6d4750",
    lineHeight: 1.75,
    fontSize: "1.1rem",
    margin: 0,
  },
  optionButton: {
    width: "100%",
    textAlign: "left",
    padding: "1.25rem 1.35rem",
    borderRadius: "18px",
    border: "1px solid #e6d3cf",
    background: "#fffaf8",
    color: "#47222a",
    cursor: "pointer",
    marginBottom: "1rem",
    fontSize: "1.08rem",
    fontWeight: 600,
    lineHeight: 1.65,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 14px rgba(91, 29, 41, 0.04)",
  },
  selectedOption: {
    border: "2px solid #8f2031",
    background: "#fff1ee",
    boxShadow: "0 10px 24px rgba(143, 32, 49, 0.10)",
  },
  helperText: {
    marginTop: "-0.25rem",
    marginBottom: "1rem",
    color: "#7a5560",
    fontSize: "0.98rem",
    fontWeight: 600,
  },
  rankingCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
    marginBottom: "1.6rem",
  },
  rankingCard: {
    borderRadius: "20px",
    padding: "1.15rem",
    background: "#fffaf8",
    minHeight: "170px",
  },
  rankingTitle: {
    margin: "0 0 0.65rem 0",
    fontSize: "1.45rem",
    fontWeight: 800,
    color: "#3f1a22",
  },
  rankingDescription: {
    margin: 0,
    fontSize: "1.02rem",
    lineHeight: 1.7,
    color: "#5f3c45",
  },
  selectLabel: {
    display: "block",
    marginBottom: "0.55rem",
    fontWeight: 800,
    color: "#5b2530",
    fontSize: "1.05rem",
  },
  selectInput: {
    width: "100%",
    padding: "1rem 1.05rem",
    borderRadius: "16px",
    border: "1px solid #dfc9c4",
    fontSize: "1.05rem",
    color: "#442129",
    background: "#fffdfc",
  },
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    marginTop: "1.7rem",
    paddingTop: "1.25rem",
    borderTop: "1px solid #f0dbd6",
  },
  button: {
    border: "none",
    borderRadius: "999px",
    padding: "1rem 1.55rem",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: "1.05rem",
  },
  resultHeroTitle: {
    fontSize: "2.3rem",
    margin: "0 0 0.8rem 0",
    color: "#5b1d29",
    fontWeight: 800,
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginTop: "1.5rem",
  },
  resultCard: {
    background: "#fff7f6",
    borderRadius: "18px",
    padding: "1.1rem",
  },
};

function getInitialResponses() {
  return QUESTIONS.reduce((acc, q) => {
    if (q.type === "multi") acc[q.id] = [];
    else if (q.type === "ranking") acc[q.id] = ["", "", "", ""];
    else acc[q.id] = "";
    return acc;
  }, {});
}

function calculateResults(responses) {
  const scores = {
    thinker: 0,
    helper: 0,
    planner: 0,
    doer: 0,
  };

  QUESTIONS.forEach((q) => {
    const response = responses[q.id];

    if (q.type === "single" || q.type === "card-select") {
      if (response) scores[response] += 4;
    }

    if (q.type === "multi") {
      response.forEach((hero, index) => {
        scores[hero] += index === 0 ? 4 : 3;
      });
    }

    if (q.type === "ranking") {
      response.forEach((hero, index) => {
        if (!hero) return;
        const points = [4, 3, 2, 1][index];
        scores[hero] += points;
      });
    }
  });

  const ranking = Object.entries(scores)
    .map(([key, value]) => ({
      key,
      score: value,
      ...HEROES[key],
    }))
    .sort((a, b) => b.score - a.score);

  const topHero = ranking[0];
  const secondHero = ranking[1];

  const aiSummary = generateAiSummary(topHero, secondHero, ranking);

  return {
    scores,
    ranking,
    aiSummary,
  };
}

function generateAiSummary(topHero, secondHero, ranking) {
  const pathwayMap = {
    thinker: "innovation, engineering, research, strategy, or data-driven careers",
    helper: "coaching, teaching, counseling, communication, or service-driven careers",
    planner: "operations, project planning, leadership support, business, or structured career paths",
    doer: "hands-on, creative, entrepreneurial, fast-moving, or action-based careers",
  };

  const learningStyleMap = {
    thinker: "You learn best when you understand the why behind something.",
    helper: "You learn best through people, discussion, and meaningful connection.",
    planner: "You learn best with structure, checklists, and clear next steps.",
    doer: "You learn best by trying things and building confidence through action.",
  };

  return {
    headline: `${topHero.label} first, ${secondHero.label} second`,
    summary: `Your results suggest you lead most strongly with ${topHero.label} energy, with ${secondHero.label} as a strong secondary strength. That means you may feel most motivated in environments that align with ${pathwayMap[topHero.key]}.`,
    strengths: [
      `Top strength: ${topHero.description}`,
      `Secondary strength: ${secondHero.description}`,
      learningStyleMap[topHero.key],
    ],
    nextSteps: [
      `Explore majors and careers connected to ${topHero.careers.slice(0, 3).join(", ")}.`,
      "Book time with a mentor who matches your top strength profile.",
      "Use your results to build a college and career roadmap inside Ezamu.",
    ],
    marketingBlurb:
      "Ezamu can use this profile to recommend mentors, pathway content, and action steps that fit how you naturally think, work, and grow.",
    rankingText: ranking
      .map((item, index) => `${index + 1}. ${item.label} (${item.score})`)
      .join(" • "),
  };
}

function Assessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState(getInitialResponses());
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const results = useMemo(() => {
    if (!submitted) return null;
    return calculateResults(responses);
  }, [submitted, responses]);

  const canGoNext = useMemo(() => {
    const response = responses[currentQuestion.id];

    if (currentQuestion.type === "single" || currentQuestion.type === "card-select") {
      return !!response;
    }

    if (currentQuestion.type === "multi") {
      return response.length === currentQuestion.maxSelections;
    }

    if (currentQuestion.type === "ranking") {
      return response.every(Boolean) && new Set(response).size === 4;
    }

    return false;
  }, [currentQuestion, responses]);

  const handleSingleSelect = (questionId, hero) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: hero,
    }));
  };

  const handleMultiSelect = (questionId, hero, maxSelections) => {
    setResponses((prev) => {
      const current = prev[questionId];
      const exists = current.includes(hero);

      if (exists) {
        return {
          ...prev,
          [questionId]: current.filter((item) => item !== hero),
        };
      }

      if (current.length >= maxSelections) return prev;

      return {
        ...prev,
        [questionId]: [...current, hero],
      };
    });
  };

  const handleRankChange = (position, value) => {
    const updated = [...responses[9]];
    updated[position] = value;

    setResponses((prev) => ({
      ...prev,
      9: updated,
    }));
  };

  const handleNext = () => {
    if (!canGoNext) return;

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const finalResults = calculateResults(responses);

    localStorage.setItem("assessmentResults", JSON.stringify(finalResults));

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        await fetch(`http://127.0.0.1:8000/users/${user.id}/set_archetype`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            archetype: finalResults.ranking[0].label,
          }),
        });
      } catch (error) {
        console.error("Could not save archetype to backend:", error);
      }
    }

    setSubmitted(true);
  };

  const renderQuestion = () => {
    if (currentQuestion.type === "single" || currentQuestion.type === "card-select") {
      return currentQuestion.options.map((option) => {
        const selected = responses[currentQuestion.id] === option.hero;

        return (
          <button
            key={option.text}
            type="button"
            onClick={() => handleSingleSelect(currentQuestion.id, option.hero)}
            style={{
              ...styles.optionButton,
              ...(selected ? styles.selectedOption : {}),
            }}
          >
            {option.text}
          </button>
        );
      });
    }

    if (currentQuestion.type === "multi") {
      return (
        <div>
          <p style={styles.helperText}>Select exactly two options.</p>

          {currentQuestion.options.map((option) => {
            const selected = responses[currentQuestion.id].includes(option.hero);

            return (
              <button
                key={option.text}
                type="button"
                onClick={() =>
                  handleMultiSelect(
                    currentQuestion.id,
                    option.hero,
                    currentQuestion.maxSelections
                  )
                }
                style={{
                  ...styles.optionButton,
                  ...(selected ? styles.selectedOption : {}),
                }}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      );
    }

    if (currentQuestion.type === "ranking") {
      const usedValues = responses[9];

      return (
        <div>
          <p style={styles.helperText}>
            Read each Inner Hero below, then rank them from most like you to least like you.
          </p>

          <div style={styles.rankingCards}>
            {Object.values(HEROES).map((hero) => (
              <div
                key={hero.label}
                style={{
                  ...styles.rankingCard,
                  border: `2px solid ${hero.color}`,
                  background: hero.accentBg,
                }}
              >
                <h4 style={styles.rankingTitle}>{hero.label}</h4>
                <p style={styles.rankingDescription}>{hero.description}</p>
              </div>
            ))}
          </div>

          {["1st", "2nd", "3rd", "4th"].map((label, index) => (
            <div key={label} style={{ marginBottom: "1rem" }}>
              <label style={styles.selectLabel}>{label} match</label>

              <select
                value={responses[9][index]}
                onChange={(e) => handleRankChange(index, e.target.value)}
                style={styles.selectInput}
              >
                <option value="">Select one</option>
                {currentQuestion.options.map((option) => {
                  const alreadyUsedElsewhere =
                    usedValues.includes(option.hero) && usedValues[index] !== option.hero;

                  return (
                    <option
                      key={option.hero}
                      value={option.hero}
                      disabled={alreadyUsedElsewhere}
                    >
                      {option.text}
                    </option>
                  );
                })}
              </select>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  if (submitted && results) {
    const top = results.ranking[0];

    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <section style={styles.questionCard}>
            <div style={styles.eyebrow}>Assessment Complete</div>
            <h1 style={styles.resultHeroTitle}>Your top Inner Hero is {top.label}</h1>
            <p style={styles.subtitle}>{results.aiSummary.summary}</p>

            <div style={styles.resultGrid}>
              {results.ranking.map((item, index) => (
                <div
                  key={item.key}
                  style={{
                    ...styles.resultCard,
                    border: `1px solid ${item.color}`,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 800,
                      color: item.color,
                      fontSize: "1.05rem",
                    }}
                  >
                    #{index + 1} {item.label}
                  </p>
                  <p style={{ margin: "0.5rem 0 0 0", color: "#5b3540", fontSize: "1rem" }}>
                    Score: {item.score}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                background: "#fff",
                borderRadius: "18px",
                padding: "1.2rem",
                border: "1px solid #efd6d1",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#5b1e2a", fontSize: "1.3rem" }}>
                AI Insight Summary
              </h3>
              <ul style={{ color: "#65424a", lineHeight: 1.8, paddingLeft: "1.2rem", fontSize: "1rem" }}>
                {results.aiSummary.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <h3 style={{ color: "#5b1e2a", fontSize: "1.3rem" }}>Suggested Next Steps</h3>
              <ul style={{ color: "#65424a", lineHeight: 1.8, paddingLeft: "1.2rem", fontSize: "1rem" }}>
                {results.aiSummary.nextSteps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <p style={{ marginTop: "1rem", color: "#6c4a52", fontSize: "1rem", lineHeight: 1.7 }}>
                <strong>How Ezamu uses this:</strong> {results.aiSummary.marketingBlurb}
              </p>
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                gap: "0.8rem",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => {
                  setResponses(getInitialResponses());
                  setCurrentStep(0);
                  setSubmitted(false);
                }}
                style={{
                  ...styles.button,
                  background: "#fff",
                  border: "1px solid #d7b7b1",
                  color: "#5d1f2a",
                }}
              >
                Retake Assessment
              </button>

              <button
                onClick={() => (window.location.href = "/signup")}
                style={{
                  ...styles.button,
                  background: "#8f2031",
                  color: "#fff",
                }}
              >
                Continue to Sign Up
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.heroCard}>
            <div style={styles.eyebrow}>Inner Heroes Discovery</div>
            <h1 style={styles.title}>Find the strengths behind your future</h1>
            <p style={styles.subtitle}>
              This quick interactive assessment helps Ezamu understand how you think,
              work, and grow so we can suggest better mentors, pathways, and next steps.
            </p>

            <div style={styles.trackerRow}>
              <div style={styles.trackerBadge}>3–4 minute experience</div>
              <div style={styles.trackerBadge}>Personalized results</div>
              <div style={styles.trackerBadge}>Career pathway match</div>
            </div>

            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`,
                }}
              />
            </div>

            <p style={styles.progressText}>
              Question {currentStep + 1} of {QUESTIONS.length}
            </p>
          </div>

          <div style={styles.heroCard}>
            <h3 style={styles.videoTitle}>Welcome video</h3>
            <p style={styles.videoText}>
              
            </p>

            <div style={styles.videoWrap}>
              <div style={styles.videoPlaceholder}>
                Add your embedded video here when it is ready.
              </div>
            </div>
          </div>
        </section>

        <section style={styles.questionCard}>
          <div style={styles.questionHeader}>
            <div style={styles.questionLabel}>
              Question {currentStep + 1} of {QUESTIONS.length}
            </div>
            <h2 style={styles.questionTitle}>{currentQuestion.title}</h2>
            <p style={styles.questionSubtitle}>{currentQuestion.subtitle}</p>
          </div>

          {renderQuestion()}

          <div style={styles.navRow}>
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              style={{
                ...styles.button,
                background: currentStep === 0 ? "#eee" : "#fff",
                color: currentStep === 0 ? "#999" : "#5a1d29",
                border: "1px solid #dec4bf",
              }}
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              style={{
                ...styles.button,
                background: canGoNext ? "#8f2031" : "#d4b7bc",
                color: "#fff",
              }}
            >
              {currentStep === QUESTIONS.length - 1 ? "See My Results" : "Next"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Assessment;