import { useNavigate, Link } from "react-router-dom";

const DISCIPLINES = [
  { key: "Technical-PG", title: "TECHNICAL-PG", desc: "MBA, MCA, M.Tech, and related PG courses", color: "#7c3aed", bg: "#f3e8ff" },
  { key: "Technical-UG", title: "TECHNICAL-UG", desc: "B.E/B.Tech, B.Architecture, and related UG courses", color: "#2563eb", bg: "#e0ecff" },
  { key: "Agricultural Education", title: "AGRICULTURAL EDUCATION", desc: "B.Sc. Agriculture, Horticulture, Food Technology", color: "#16a34a", bg: "#dcfce7" },
  { key: "Fineart Education", title: "FINEART EDUCATION", desc: "Fine Art and related disciplines", color: "#db2777", bg: "#fce7f3" },
  { key: "Higher Education_PG", title: "HIGHER EDUCATION_PG", desc: "M.Ed., M.P.Ed., and related PG education courses", color: "#6366f1", bg: "#e0e7ff" },
  { key: "Higher Education_UG", title: "HIGHER EDUCATION_UG", desc: "LL.B., B.Ed., and related UG education courses", color: "#d97706", bg: "#fef3c7" },
  { key: "Medical Education_PG", title: "MEDICAL EDUCATION_PG", desc: "NEET-PGM, PG DNB, and related PG medical courses", color: "#dc2626", bg: "#fee2e2" },
  { key: "Medical Education_UG", title: "MEDICAL EDUCATION_UG", desc: "NEET-UG, B.Sc. Nursing, and related UG medical courses", color: "#dc2626", bg: "#fee2e2" },
  { key: "Ayush Education", title: "AYUSH EDUCATION", desc: "AIQ AYUSH Courses and State Quota", color: "#059669", bg: "#d1fae5" },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="public-page">
      <header className="topnav">
        <div>
          <div className="topnav-brand">CAP Vacancy Portal</div>
          <div className="brand-sub">Powered by Vidyarthi Mitra</div>
        </div>
        <div className="topnav-right">
          <Link to="/login" className="tn-link">Login</Link>
          <Link to="/colleges" className="btn-keep">View All Colleges</Link>
        </div>
      </header>

      <section className="hero">
        <h1 className="hero-title">Discover Your Ideal College</h1>
        <p className="hero-sub">Browse through various disciplines to find real-time seat availability and details for top institutions.</p>
      </section>

      <section className="disc-grid">
        {DISCIPLINES.map((d) => (
          <button key={d.key} className="disc-card" onClick={() => navigate(`/colleges?stream=${encodeURIComponent(d.key)}`)}>
            <span className="disc-icon" style={{ background: d.bg, color: d.color }}>◆</span>
            <h3 className="disc-title">{d.title}</h3>
            <p className="disc-desc">{d.desc}</p>
          </button>
        ))}
      </section>

      <div className="view-all-wrap">
        <Link to="/colleges" className="btn btn-primary view-all-btn">View All Colleges</Link>
      </div>

      <footer className="portal-footer">
        © {new Date().getFullYear()} CAP Vacancy Portal · Powered by Vidyarthi Mitra. All rights reserved.
      </footer>
    </div>
  );
}