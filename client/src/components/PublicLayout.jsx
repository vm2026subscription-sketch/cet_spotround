import { Link } from "react-router-dom";

export default function PublicLayout({ children }) {
  return (
    <div className="public-page">
      <header className="topnav">
        <div className="topnav-inner">
          <div>
            <Link to="/" className="topnav-brand brand-link">CAP Vacancy Portal</Link>
            <div className="brand-sub">Powered by Vidyarthi Mitra</div>
          </div>
          <div className="topnav-right">
            <Link to="/login" className="tn-link">Login</Link>
            <Link to="/colleges" className="btn-keep">View All Colleges</Link>
          </div>
        </div>
      </header>
      <main className="public-main">{children}</main>
      <footer className="portal-footer">
        © {new Date().getFullYear()} CAP Vacancy Portal · Powered by Vidyarthi Mitra. All rights reserved.
      </footer>
    </div>
  );
}