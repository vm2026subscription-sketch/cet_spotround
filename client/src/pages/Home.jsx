import { useNavigate, Link } from "react-router-dom";
import {
  GraduationCap, Building2, Sprout, Palette, BookOpen, Scale,
  Stethoscope, HeartPulse, Leaf, ArrowRight, ShieldCheck, Clock,
  FileCheck2, Search, ClipboardList, Award, ChevronDown,
} from "lucide-react";
import { useState } from "react";

const DISCIPLINES = [
  { key: "Technical-PG", title: "Technical — PG", desc: "MBA, MCA, M.Tech and related PG programmes", Icon: GraduationCap },
  { key: "Technical-UG", title: "Technical — UG", desc: "B.E / B.Tech, B.Arch and related UG programmes", Icon: Building2 },
  { key: "Agricultural Education", title: "Agricultural Education", desc: "B.Sc. Agriculture, Horticulture, Food Technology", Icon: Sprout },
  { key: "Fineart Education", title: "Fine Art Education", desc: "Fine Art, Applied Art and related disciplines", Icon: Palette },
  { key: "Higher Education_PG", title: "Higher Education — PG", desc: "M.Ed., M.P.Ed. and related PG programmes", Icon: BookOpen },
  { key: "Higher Education_UG", title: "Higher Education — UG", desc: "LL.B., B.Ed. and related UG programmes", Icon: Scale },
  { key: "Medical Education_PG", title: "Medical Education — PG", desc: "NEET-PGM, PG DNB and related PG programmes", Icon: Stethoscope },
  { key: "Medical Education_UG", title: "Medical Education — UG", desc: "NEET-UG, B.Sc. Nursing and related UG programmes", Icon: HeartPulse },
  { key: "Ayush Education", title: "AYUSH Education", desc: "AIQ AYUSH courses and State Quota", Icon: Leaf },
];

// Courses shown under each discipline (edit these lists freely).
const COURSES = {
  "Technical-PG": ["MBA / MMS", "MCA", "M.E / M.Tech", "M.Arch", "M.Pharm", "M.HMCT"],
  "Technical-UG": ["B.E / B.Tech", "B.Pharm", "B.Arch", "BCA / MCA (Integrated)", "B.Planning", "B.Design", "B.HMCT"],
  "Agricultural Education": ["B.Sc. Agriculture", "Horticulture", "Food Technology", "Forestry"],
  "Fineart Education": ["BFA", "MFA", "Applied Art"],
  "Higher Education_PG": ["M.Ed.", "M.P.Ed."],
  "Higher Education_UG": ["LL.B. (3 Years)", "LL.B. (5 Years)", "B.Ed.", "B.P.Ed."],
  "Medical Education_PG": ["MD / MS (NEET-PG)", "PG DNB", "PG Diploma"],
  "Medical Education_UG": ["MBBS / BDS (NEET-UG)", "B.Sc. Nursing", "GNM"],
  "Ayush Education": ["BAMS", "BHMS", "BUMS", "BNYS"],
};

const STATS = [
  { num: "3,200+", label: "Participating Institutes" },
  { num: "1.8 L+", label: "Seats in the current round" },
  { num: "45,000+", label: "Candidates allotted so far" },
  { num: "24×7", label: "Portal availability" },
];

const TIMELINE = [
  { date: "10 Jul", title: "Registration Opens", desc: "Candidates create accounts and complete profile verification." },
  { date: "18 Jul", title: "Vacancy Publication", desc: "Institute-wise vacant seats published for Round IV." },
  { date: "22 Jul", title: "Choice Filling", desc: "Candidates submit college & branch preferences in priority order." },
  { date: "27 Jul", title: "Provisional Allotment", desc: "Merit-based seat allocation results are released." },
  { date: "31 Jul", title: "Reporting & Confirmation", desc: "Document verification at the allotted institute." },
];

const FEATURES = [
  { Icon: ShieldCheck, title: "Verified & Secure", desc: "End-to-end encrypted transactions and government-grade authentication for every candidate record." },
  { Icon: Clock,       title: "Real-Time Vacancies",  desc: "Institute-wise seat availability updates as allocations progress across categories and branches." },
  { Icon: FileCheck2,  title: "Digital Allotment",    desc: "Provisional allotment letters issued instantly; download, verify and report to the institute." },
];

const PROCESS = [
  { step: "01", Icon: ClipboardList, title: "Register & Verify", desc: "Create an account with your CET application ID; percentile and category are validated automatically." },
  { step: "02", Icon: Search,        title: "Explore Vacancies", desc: "Browse live vacant seats across institutes filtered by discipline, city and branch." },
  { step: "03", Icon: FileCheck2,    title: "Fill Preferences",  desc: "Order your college and branch preferences. Edits are allowed until the round closes." },
  { step: "04", Icon: Award,         title: "Get Allotted",      desc: "Receive a merit-based provisional allotment letter and report to the institute for confirmation." },
];

const FAQS = [
  { q: "Who can apply through this portal?",
    a: "Candidates who have appeared for the MHT-CET or the corresponding entrance examination for their discipline and hold a valid application ID are eligible to participate in the institute-level round." },
  { q: "Is there a fee for choice filling?",
    a: "No fee is charged for filling preferences on this portal. Institute-level fees apply only at the time of admission confirmation as prescribed by the respective institute." },
  { q: "Can I edit my preferences after submission?",
    a: "Yes. As long as the round is open, you can modify and re-order your college and branch preferences at any time from the ‘My Applications’ page." },
  { q: "How is the allotment decided?",
    a: "Allotment is strictly merit-based, considering your CET percentile, category and preference order, subject to seat availability under the applicable reservation policy." },
  { q: "What happens after I get allotted?",
    a: "You will receive a provisional allotment letter on the portal. Report to the allotted institute within the notified window for document verification and admission confirmation." },
];

export default function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);
  const [openStream, setOpenStream] = useState("");

  return (
    <div className="public-page">
      {/* ============== TOP NAV ============== */}
      <header className="topnav topnav-marketing">
        <div className="brand-block">
          <div className="topnav-brand brand-link">CAP Admission Portal</div>
          <div className="brand-sub">Government of Maharashtra · Vidyarthi Mitra</div>
        </div>
        <nav className="mkt-nav">
          <a href="#process" className="tn-link">Process</a>
          <a href="#timeline" className="tn-link">Timeline</a>
          <a href="#faq" className="tn-link">FAQs</a>
          <Link to="/colleges" className="tn-link">Institutes</Link>
        </nav>
        <div className="topnav-right">
          <Link to="/login" className="tn-link">Sign in</Link>
          <Link to="/register" className="btn-keep">Register</Link>
        </div>
      </header>

      {/* ============== HERO ============== */}
      <section className="mkt-hero">
        <div className="mkt-hero-inner">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> CAP 2026 · Round IV Institute-Level Admission
          </span>
          <h1 className="mkt-hero-title">
            The official portal for Maharashtra&apos;s <span className="hero-accent">centralized admission process</span>.
          </h1>
          <p className="mkt-hero-sub">
            Explore live seat vacancies, submit merit-based preferences and receive your provisional allotment
            letter — all in one secure, government-managed platform.
          </p>
          <div className="mkt-hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Application <ArrowRight size={16} />
            </Link>
            <Link to="/colleges" className="btn btn-ghost btn-lg">Browse Institutes</Link>
          </div>
          <div className="mkt-hero-trust">
            <ShieldCheck size={14} /> Government-verified &nbsp;·&nbsp; Merit-based allocation &nbsp;·&nbsp; Category-aware
          </div>
        </div>

        {/* Stats strip */}
        <div className="mkt-stats">
          {STATS.map((s) => (
            <div className="mkt-stat" key={s.label}>
              <div className="mkt-stat-num">{s.num}</div>
              <div className="mkt-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============== DISCIPLINES ============== */}
      <section className="mkt-section" id="disciplines">
        <div className="section-head">
          <div>
            <span className="kicker">Explore</span>
            <h2 className="section-title">Choose your discipline</h2>
            <p className="section-sub">Real-time vacant seats across nine streams of higher education in Maharashtra.</p>
          </div>
          <Link to="/colleges" className="btn btn-ghost">View all institutes <ArrowRight size={14} /></Link>
        </div>

        <div className="disc-grid">
          {DISCIPLINES.map((d) => {
            const open = openStream === d.key;
            const courses = COURSES[d.key] || [];
            return (
              <div key={d.key} className="disc-card" style={{ display: "block", cursor: "pointer" }}>
                <div onClick={() => setOpenStream(open ? "" : d.key)}>
                  <span className="disc-icon"><d.Icon size={20} /></span>
                  <h3 className="disc-title">{d.title}</h3>
                  <p className="disc-desc">{d.desc}</p>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#2563eb" }}>
                    {open ? "Hide courses ▲" : `View ${courses.length} courses ▼`}
                  </span>
                </div>
                {open && (
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    {courses.map((course) => (
                      <button
                        key={course}
                        onClick={() => navigate(`/colleges?stream=${encodeURIComponent(d.key)}&course=${encodeURIComponent(course)}`)}
                        style={{ textAlign: "left", padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f8fafc", cursor: "pointer", fontSize: 14 }}
                      >
                        {course} →
                      </button>
                    ))}
                    <button
                      onClick={() => navigate(`/colleges?stream=${encodeURIComponent(d.key)}`)}
                      style={{ textAlign: "left", padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#2563eb" }}
                    >
                      View all {d.title} colleges →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============== FEATURES ============== */}
      <section className="mkt-section mkt-section-alt">
        <div className="section-head">
          <div>
            <span className="kicker">Why this portal</span>
            <h2 className="section-title">Built for transparency and trust</h2>
            <p className="section-sub">A single source of truth for every candidate, institute and administrator.</p>
          </div>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon"><f.Icon size={20} /></span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============== PROCESS ============== */}
      <section className="mkt-section" id="process">
        <div className="section-head">
          <div>
            <span className="kicker">How it works</span>
            <h2 className="section-title">Admission in four guided steps</h2>
            <p className="section-sub">From registration to reporting, the entire journey is tracked in one dashboard.</p>
          </div>
        </div>
        <div className="process-grid">
          {PROCESS.map((p, i) => (
            <div className="process-card" key={p.step}>
              <div className="process-head">
                <span className="process-step">{p.step}</span>
                <span className="process-icon"><p.Icon size={18} /></span>
              </div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              {i < PROCESS.length - 1 && <span className="process-arrow" aria-hidden><ArrowRight size={14} /></span>}
            </div>
          ))}
        </div>
      </section>

      {/* ============== TIMELINE ============== */}
      <section className="mkt-section mkt-section-alt" id="timeline">
        <div className="section-head">
          <div>
            <span className="kicker">Round IV</span>
            <h2 className="section-title">Key dates &amp; deadlines</h2>
            <p className="section-sub">Mark these dates. Notifications are also sent to your registered email.</p>
          </div>
        </div>
        <ol className="timeline">
          {TIMELINE.map((t) => (
            <li className="timeline-item" key={t.title}>
              <div className="timeline-date">{t.date}</div>
              <div className="timeline-dot" />
              <div className="timeline-body">
                <h4>{t.title}</h4>
                <p>{t.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ============== FAQ ============== */}
      <section className="mkt-section" id="faq">
        <div className="section-head">
          <div>
            <span className="kicker">FAQ</span>
            <h2 className="section-title">Answers to common questions</h2>
            <p className="section-sub">Reach out to the support desk if your question isn&apos;t listed below.</p>
          </div>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <div className={`faq-item ${open ? "open" : ""}`} key={i}>
                <button className="faq-q" onClick={() => setOpenFaq(open ? -1 : i)} aria-expanded={open}>
                  <span>{f.q}</span>
                  <ChevronDown size={16} className="faq-chev" />
                </button>
                {open && <div className="faq-a">{f.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="mkt-cta">
        <div className="mkt-cta-inner">
          <div>
            <h2>Ready to begin your admission journey?</h2>
            <p>Register in minutes with your CET application ID and start exploring live seat vacancies.</p>
          </div>
          <div className="mkt-cta-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Register now <ArrowRight size={16} /></Link>
            <Link to="/login" className="btn btn-ghost btn-lg">I already have an account</Link>
          </div>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="mkt-footer">
        <div className="mkt-footer-inner">
          <div className="mkt-footer-brand">
            <div className="topnav-brand">CAP Admission Portal</div>
            <p>Centralized admission process for engineering, medical and higher education institutes in the state of Maharashtra.</p>
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
              <a href="#process">How it works</a>
              <a href="#timeline">Timeline</a>
              <a href="#faq">FAQs</a>
            </div>
            <div>
              <h5>Resources</h5>
              <a href="#">Information brochure</a>
              <a href="#">Reservation policy</a>
              <a href="#">Grievance redressal</a>
              <a href="#">Contact support</a>
            </div>
          </div>
        </div>
        <div className="mkt-footer-bar">
          © {new Date().getFullYear()} Vidyarthi Mitra · Government of Maharashtra. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
