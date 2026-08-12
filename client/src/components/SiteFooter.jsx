import { Link } from "react-router-dom";

/** Shared public footer with only working links. */
export default function SiteFooter() {
  return (
    <footer className="mkt-footer">
      <div className="mkt-footer-inner">
        <div className="mkt-footer-brand">
          <div className="topnav-brand">Virtual CAP Portal</div>
          <p>
            Centralized admission process for engineering, medical and higher education
            institutes in the state of Maharashtra.
          </p>
        </div>
        <div className="mkt-footer-cols">
          <div>
            <h5>Portal</h5>
            <Link to="/">Home</Link>
            <Link to="/colleges">Institutes</Link>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Register</Link>
          </div>
          <div>
            <h5>Process</h5>
            <a href="/#process">How it works</a>
            <a href="/#timeline">Timeline</a>
            <a href="/#faq">FAQs</a>
          </div>
          <div>
            <h5>Candidates</h5>
            <Link to="/student/seats">Available seats</Link>
            <Link to="/student/application">My application</Link>
            <Link to="/student/result">Allotment result</Link>
          </div>
        </div>
      </div>
      <div className="mkt-footer-bar">
        © {new Date().getFullYear()} Vidyarthi Mitra · Virtual CAP Portal. For demonstration purposes only.
      </div>
    </footer>
  );
}
