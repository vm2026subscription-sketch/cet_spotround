import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentHome from "./pages/StudentHome";
import Profile from "./pages/Profile";
import AvailableSeats from "./pages/AvailableSeats";
import ApplicationForm from "./pages/ApplicationForm";
import Result from "./pages/Result";
import AdminHome from "./pages/AdminHome";
import AdminColleges from "./pages/AdminColleges";
import AdminRound from "./pages/AdminRound";
import AdminApplications from "./pages/AdminApplications";
import AdminAllocation from "./pages/AdminAllocation";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicColleges from "./pages/PublicColleges";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/student" element={<ProtectedRoute role="student"><StudentHome /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />
      <Route path="/student/seats" element={<ProtectedRoute role="student"><AvailableSeats /></ProtectedRoute>} />
      <Route path="/student/application" element={<ProtectedRoute role="student"><ApplicationForm /></ProtectedRoute>} />
      <Route path="/student/result" element={<ProtectedRoute role="student"><Result /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminHome /></ProtectedRoute>} />
      <Route path="/admin/colleges" element={<ProtectedRoute role="admin"><AdminColleges /></ProtectedRoute>} />
      <Route path="/admin/round" element={<ProtectedRoute role="admin"><AdminRound /></ProtectedRoute>} />
      <Route path="/admin/applications" element={<ProtectedRoute role="admin"><AdminApplications /></ProtectedRoute>} />
      <Route path="/admin/allocation" element={<ProtectedRoute role="admin"><AdminAllocation /></ProtectedRoute>} />

      <Route path="/colleges" element={<PublicColleges />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}