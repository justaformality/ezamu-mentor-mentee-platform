// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.jsx";

import LandingPage from "./pages/landing-page.jsx";
import SignUpPage from "./pages/signup.jsx";
import StudentRegistration from "./pages/student-registration.jsx";
import CoachRegistration from "./pages/coach-registration.jsx";
import SignInPage from "./pages/signin.jsx";
import Dashboard from "./pages/dashboard.jsx";
import StudentDashboard from "./pages/student-dashboard.jsx";
import CoachDashboard from "./pages/coach-dashboard.jsx";
import Assessment from "./pages/assessment.jsx";
import AppointmentPage from "./pages/appointment.jsx";
import ProfilePage from "./pages/profile.jsx";
import ContactUs from "./pages/contactus.jsx";
import TeamPage from "./pages/teampage.jsx";
import StudentInfo from "./pages/student-info.jsx";
import ParentDashboard from "./pages/parent-dashbaord.jsx";

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
        <Route path="/student-registration" element={<StudentRegistration />} />
        <Route path="/coach-registration" element={<CoachRegistration />} />
        <Route path="/coach-dashboard" element={<CoachDashboard />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/appointments" element={<AppointmentPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/student-info/:studentId" element={<StudentInfo />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
