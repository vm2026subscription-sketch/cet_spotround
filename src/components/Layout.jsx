import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, NavLink, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, UserCircle2, Search, ClipboardList, Award,
  Building2, Layers, FileText, CheckCircle2,
  Bell, ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen,
  Menu, X, Settings, LifeBuoy, ChevronRight,
} from "lucide-react";

const STUDENT_NAV = [
  { to: "/student",              label: "Dashboard",              icon: LayoutDashboard, end: true },
  { to: "/student/profile",      label: "Profile",                icon: UserCircle2 },
  { to: "/student/seats",        label: "Available Seats",        icon: Search },
  { to: "/student/application",  label: "My Application",         icon: ClipboardList },
  { to: "/student/result",       label: "Seat Allotment",         icon: Award },
];
const ADMIN_NAV = [
  { to: "/admin",                label: "Overview",               icon: LayoutDashboard, end: true },
  { to: "/admin/colleges",       label: "Colleges & Seats",       icon: Building2 },
  { to: "/admin/round",          label: "Round Control",          icon: Layers },
  { to: "/admin/applications",   label: "Applications",           icon: FileText },
  { to: "/admin/allocation",     label: "Allocation & Results",   icon: CheckCircle2 },
];

const CRUMBS = {
  "/student":             ["Student", "Dashboard"],
  "/student/profile":     ["Student", "Profile"],
  "/student/seats":       ["Student", "Available Seats"],
  "/student/application": ["Student", "My Application"],
  "/student/result":      ["Student", "Seat Allotment"],
  "/admin":               ["Admin", "Overview"],
  "/admin/colleges":      ["Admin", "Colleges & Seats"],
  "/admin/round":         ["Admin", "Round Control"],
  "/admin/applications":  ["Admin", "Applications"],
  "/admin/allocation":    ["Admin", "Allocation & Results"],
};

function initials(name = "") {
  return name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "U";
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("side:collapsed") === "1");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => { localStorage.setItem("side:collapsed", collapsed ? "1" : "0"); }, [collapsed]);
  useEffect(() => { setMobileOpen(false); setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };
  const nav = user?.role === "admin" ? ADMIN_NAV : user?.role === "student" ? STUDENT_NAV : null;
  const crumbs = CRUMBS[location.pathname] || (user?.role === "admin" ? ["Admin"] : user?.role === "student" ? ["Student"] : []);

  // Public (unauth) — clean marketing shell
  if (!user) {
    return (
      <>
        <header className="topnav">
          <Link to="/" className="topnav-brand brand-link">
            <div className="brand-block">
              <span>Virtual CAP Portal</span>
              <span className="brand-sub">Government of Maharashtra · Admission Services</span>
            </div>
          </Link>
          <div className="topnav-right">
            <NavLink to="/login" className="tn-link">Sign in</NavLink>
            <NavLink to="/register" className="btn btn-primary btn-sm">Register</NavLink>
          </div>
        </header>
        <main className="content">{children}</main>
        <footer className="portal-footer">© {new Date().getFullYear()} Virtual CAP Portal · For demonstration purposes only.</footer>
      </>
    );
  }

  return (
    <div className={`app-shell ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}>
      {/* Sidebar */}
      <aside className="app-side" aria-label="Primary">
        <div className="app-side-head">
          <Link to={user.role === "admin" ? "/admin" : "/student"} className="app-brand">
            <span className="app-brand-mark" aria-hidden />
            <span className="app-brand-text">
              <span className="app-brand-title">CAP Portal</span>
              <span className="app-brand-sub">Maharashtra</span>
            </span>
          </Link>
          <button className="side-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>

        <nav className="app-side-nav">
          <div className="side-group">
            <span className="side-group-label">{user.role === "admin" ? "Administration" : "Candidate"}</span>
            {nav?.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `app-nav-link ${isActive ? "is-active" : ""}`}>
                <span className="app-nav-ico"><item.icon size={17} strokeWidth={1.75} /></span>
                <span className="app-nav-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
          <div className="side-group">
            <span className="side-group-label">General</span>
            <a className="app-nav-link" href="#" onClick={(e) => e.preventDefault()}>
              <span className="app-nav-ico"><LifeBuoy size={17} strokeWidth={1.75} /></span>
              <span className="app-nav-label">Help & Support</span>
            </a>
            <a className="app-nav-link" href="#" onClick={(e) => e.preventDefault()}>
              <span className="app-nav-ico"><Settings size={17} strokeWidth={1.75} /></span>
              <span className="app-nav-label">Settings</span>
            </a>
          </div>
        </nav>

        <div className="app-side-foot">
          <button className="side-collapse" onClick={() => setCollapsed((v) => !v)} aria-label="Toggle sidebar">
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            <span className="app-nav-label">Collapse</span>
          </button>
        </div>
      </aside>

      {/* Mobile scrim */}
      {mobileOpen && <div className="side-scrim" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="app-main">
        <header className="app-header">
          <div className="app-header-l">
            <button className="icon-btn only-mobile" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={18} /></button>
            <nav className="crumbs" aria-label="Breadcrumb">
              {crumbs.map((c, i) => (
                <span key={i} className="crumb">
                  {i > 0 && <ChevronRight size={13} className="crumb-sep" />}
                  <span className={i === crumbs.length - 1 ? "crumb-cur" : ""}>{c}</span>
                </span>
              ))}
            </nav>
          </div>

          <div className="app-header-r">
            <div className="app-search">
              <Search size={15} />
              <input placeholder="Search" aria-label="Search" />
              <kbd className="kbd">⌘K</kbd>
            </div>
            <button className="icon-btn" aria-label="Notifications">
              <Bell size={17} />
              <span className="dot-badge" />
            </button>
            <div className="app-user" ref={menuRef}>
              <button className="app-user-btn" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
                <span className="avatar">{initials(user.name)}</span>
                <span className="app-user-meta">
                  <span className="app-user-name">{user.name}</span>
                  <span className="app-user-role">{user.role}</span>
                </span>
                <ChevronDown size={14} className="app-user-chev" />
              </button>
              {menuOpen && (
                <div className="app-menu" role="menu">
                  <div className="app-menu-head">
                    <span className="avatar avatar-lg">{initials(user.name)}</span>
                    <div>
                      <div className="app-menu-name">{user.name}</div>
                      <div className="app-menu-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="app-menu-sep" />
                  {user.role === "student" && (
                    <Link to="/student/profile" className="app-menu-item"><UserCircle2 size={15} /> View profile</Link>
                  )}
                  <a href="#" className="app-menu-item" onClick={(e) => e.preventDefault()}><Settings size={15} /> Settings</a>
                  <a href="#" className="app-menu-item" onClick={(e) => e.preventDefault()}><LifeBuoy size={15} /> Help & support</a>
                  <div className="app-menu-sep" />
                  <button className="app-menu-item danger" onClick={handleLogout}><LogOut size={15} /> Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-content">{children}</main>

        <footer className="app-foot">
          <span>© {new Date().getFullYear()} Virtual CAP Portal</span>
          <span className="app-foot-dot" />
          <span>Government of Maharashtra</span>
          <span className="app-foot-dot" />
          <span>For demonstration purposes only</span>
        </footer>
      </div>
    </div>
  );
}
