import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

/**
 * Shared public header — used by the marketing home page and every public page,
 * so navigation looks and behaves the same everywhere (including on mobile).
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === "/";

  // Close the mobile menu on navigation and on Escape.
  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Section links only make sense on the home page; from other pages go home first.
  const section = (hash) => (onHome ? `#${hash}` : `/#${hash}`);

  const navLinks = (
    <>
      <a href={section("process")} className="tn-link">Process</a>
      <a href={section("timeline")} className="tn-link">Timeline</a>
      <a href={section("faq")} className="tn-link">FAQs</a>
      <NavLink to="/colleges" className="tn-link">Institutes</NavLink>
    </>
  );

  return (
    <header className="topnav topnav-marketing">
      <Link to="/" className="brand-link">
        <div className="brand-block">
          <div className="topnav-brand">Virtual CAP Portal</div>
          <div className="brand-sub">Vidyarthi Mitra · Maharashtra Admissions</div>
        </div>
      </Link>

      <nav className="mkt-nav" aria-label="Main">{navLinks}</nav>

      <div className="topnav-right">
        <Link to="/login" className="tn-link">Sign in</Link>
        <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
        <button
          className="mkt-menu-btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <nav className={`mkt-mobile-nav ${open ? "open" : ""}`} aria-label="Mobile">
        {navLinks}
        <Link to="/login" className="tn-link">Sign in</Link>
        <Link to="/register" className="btn btn-primary btn-block mkt-mobile-cta">Register</Link>
      </nav>
    </header>
  );
}
