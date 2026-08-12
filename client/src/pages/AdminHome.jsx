import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Layers, FileText, CheckCircle2 } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";
import { apiErrorMessage } from "../lib/apiError";
import { ErrorState, SkLine } from "../components/states";

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [round, setRound] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setStats(null);
    try {
      const [collegesRes, appsRes, allotRes, roundRes] = await Promise.all([
        api.get("/colleges"), api.get("/applications"), api.get("/allocations"), api.get("/round"),
      ]);
      const seats = collegesRes.data.reduce((sum, c) => sum + c.branches.reduce((s, b) => s + (b.vacantSeats || 0), 0), 0);
      setStats({ colleges: collegesRes.data.length, seats, applications: appsRes.data.length, allotted: allotRes.data.length });
      setRound(roundRes.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load dashboard stats."));
    }
  };
  useEffect(() => { load(); }, []);

  const statCards = [
    { icon: Building2,    tint: "tint-brand", num: stats?.colleges,     label: "Colleges" },
    { icon: Layers,       tint: "tint-slate", num: stats?.seats,        label: "Vacant Seats" },
    { icon: FileText,     tint: "tint-amber", num: stats?.applications, label: "Applications" },
    { icon: CheckCircle2, tint: "tint-green", num: stats?.allotted,     label: "Seats Allotted" },
  ];
  const navCards = [
    { to: "/admin/colleges",     icon: Building2,    tint: "tint-brand", title: "Colleges & Seats", desc: "Add colleges and edit vacant seats." },
    { to: "/admin/round",        icon: Layers,       tint: "tint-slate", title: "Round Control",    desc: "Open or close the application round." },
    { to: "/admin/applications", icon: FileText,     tint: "tint-amber", title: "Applications",     desc: "See every candidate and their preferences." },
    { to: "/admin/allocation",   icon: CheckCircle2, tint: "tint-green", title: "Allocation",       desc: "Run the seat allocation and view results." },
  ];

  return (
    <Layout>
      <h1 className="page-title">Admin Dashboard</h1>
      {error && <ErrorState title="Unable to load dashboard" message={error} onRetry={load} />}

      {!error && (
        <>
          <div className="stat-grid">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div className="stat-box" key={s.label}>
                  <span className={`stat-icon ${s.tint}`}><Icon size={22} aria-hidden /></span>
                  <span className="stat-num">{stats ? s.num.toLocaleString() : <SkLine w={64} h={22} />}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              );
            })}
          </div>

          <div className="card">
            <div className="status-row">
              <div className="status-item">
                <span className="status-label">Round status</span>
                <span className={`pill ${round?.status === "open" ? "pill-green" : "pill-grey"}`}>
                  {round ? round.status.toUpperCase() : "Checking…"}
                </span>
              </div>
            </div>
            <div className="card-grid">
              {navCards.map((c) => {
                const Icon = c.icon;
                return (
                  <Link to={c.to} className="dash-card" key={c.to}>
                    <span className={`dash-icon ${c.tint}`}><Icon size={24} aria-hidden /></span>
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
