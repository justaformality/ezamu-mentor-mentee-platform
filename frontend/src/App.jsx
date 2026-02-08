// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import LandingPage from "./pages/landing-page.jsx";
import SignUpPage from "./pages/signup.jsx";
import SignInPage from "./pages/signin.jsx";
import Dashboard from "./pages/dashboard.jsx";
import StudentDashboard from "./pages/student-dashboard.jsx";


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

      </Routes>
    </Router>
  );
}

export default App;
