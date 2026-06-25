import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Layers, FileText, CheckCircle2 } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";

export default function AdminHome() {
  const [stats, setStats] = useState({ colleges: 0, seats: 0, applications: 0, allotted: 0 });
  const [round, setRound] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [collegesRes, appsRes, allotRes, roundRes] = await Promise.all([
          api.get("/colleges"), api.get("/applications"), api.get("/allocations"), api.get("/round"),
        ]);
        const seats = collegesRes.data.reduce((sum, c) => sum + c.branches.reduce((s, b) => s + (b.vacantSeats || 0), 0), 0);
        setStats({ colleges: collegesRes.data.length, seats, applications: appsRes.data.length, allotted: allotRes.data.length });
        setRound(roundRes.data);
      } catch { setError("Could not load dashboard stats."); }
    }
    load();
  }, []);

  const statCards = [
    { icon: Building2, color: "#2563eb", bg: "#e0ecff", num: stats.colleges, label: "Colleges" },
    { icon: Layers, color: "#7c3aed", bg: "#f3e8ff", num: stats.seats, label: "Vacant Seats" },
    { icon: FileText, color: "#d97706", bg: "#fef3c7", num: stats.applications, label: "Applications" },
    { icon: CheckCircle2, color: "#16a34a", bg: "#dcfce7", num: stats.allotted, label: "Seats Allotted" },
  ];
  const navCards = [
    { to: "/admin/colleges", icon: Building2, color: "#2563eb", bg: "#e0ecff", title: "Colleges & Seats", desc: "Add colleges and edit vacant seats." },
    { to: "/admin/round", icon: Layers, color: "#7c3aed", bg: "#f3e8ff", title: "Round Control", desc: "Open or close the application round." },
    { to: "/admin/applications", icon: FileText, color: "#d97706", bg: "#fef3c7", title: "Applications", desc: "See every candidate and their preferences." },
    { to: "/admin/allocation", icon: CheckCircle2, color: "#16a34a", bg: "#dcfce7", title: "Allocation", desc: "Run the seat allocation and view results." },
  ];

  return (
    <Layout>
      <h1 className="page-title">Admin Dashboard</h1>
      {error && <div className="auth-error">{error}</div>}

      <div className="stat-grid">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div className="stat-box" key={s.label}>
              <span className="stat-icon" style={{ background: s.bg, color: s.color }}><Icon size={22} /></span>
              <span className="stat-num">{s.num}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="status-row">
          <div className="status-item">
            <span className="status-label">Round status</span>
            <span className={`pill ${round?.status === "open" ? "pill-green" : "pill-grey"}`}>{round ? round.status.toUpperCase() : "…"}</span>
          </div>
        </div>
        <div className="card-grid">
          {navCards.map((c) => {
            const Icon = c.icon;
            return (
              <Link to={c.to} className="dash-card" key={c.to}>
                <span className="dash-icon" style={{ background: c.bg, color: c.color }}><Icon size={24} /></span>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}