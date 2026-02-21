// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import LandingPage from "./pages/landing-page.jsx";
import SignUpPage from "./pages/signup.jsx";
import SignInPage from "./pages/signin.jsx";
import Dashboard from "./pages/dashboard.jsx";
import StudentDashboard from "./pages/student-dashboard.jsx";
import CoachDashboard from "./pages/coach-dashboard.jsx";
import Assessment from "./pages/assessment.jsx";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/coach-dashboard" element={<CoachDashboard />} />
        <Route path="/assessment" element={<Assessment />} />
      </Routes>
    </Router>
  );
}

export default App;
