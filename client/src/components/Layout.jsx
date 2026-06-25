import { useAuth } from "../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <>
      <header className="topnav">
        <div className="topnav-brand">Virtual CAP Portal</div>
        <div className="topnav-right">
          {user ? (
            <>
              <span className="tn-user">{user.name}</span>
              <span className="tn-role">{user.role}</span>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="tn-link">Student Login</NavLink>
              <NavLink to="/login" className="tn-link">Admin Login</NavLink>
            </>
          )}
        </div>
      </header>

      <div className="portal-body">
        {user?.role === "student" && (
          <aside className="sidebar">
            <div className="side-title">CAP Portal</div>
            <div className="side-section">Student</div>
            <NavLink to="/student" end className="side-link">Dashboard</NavLink>
            <NavLink to="/student/profile" className="side-link">Profile</NavLink>
            <NavLink to="/student/seats" className="side-link">Available Vacant Seats</NavLink>
            <NavLink to="/student/application" className="side-link">My Applications</NavLink>
            <NavLink to="/student/result" className="side-link">Seat Allotment</NavLink>
          </aside>
        )}
        {user?.role === "admin" && (
          <aside className="sidebar">
            <div className="side-title">CAP Portal</div>
            <div className="side-section">Admin</div>
            <NavLink to="/admin" end className="side-link">Dashboard</NavLink>
            <NavLink to="/admin/colleges" className="side-link">Colleges &amp; Seats</NavLink>
            <NavLink to="/admin/round" className="side-link">Round Control</NavLink>
            <NavLink to="/admin/applications" className="side-link">Applications Received</NavLink>
            <NavLink to="/admin/allocation" className="side-link">Allocation &amp; Results</NavLink>
          </aside>
        )}

        <main className="content">{children}</main>
      </div>

      <footer className="portal-footer">
        © {new Date().getFullYear()} Virtual CAP Portal · For demonstration purposes only.
      </footer>
    </>
  );
}