import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ClipboardList, Award } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";

export default function StudentHome() {
  const [round, setRound] = useState(null);
  const [appStatus, setAppStatus] = useState("loading");

  useEffect(() => {
    api.get("/round").then((res) => setRound(res.data)).catch(() => setRound(null));
    api.get("/applications/me")
      .then((res) => setAppStatus(res.data.status))
      .catch((err) => setAppStatus(err.response?.status === 404 ? "none" : "error"));
  }, []);

  const appLabel = {
    none: "NOT SUBMITTED", submitted: "SUBMITTED",
    alloted: "SEAT ALLOTTED", not_alloted: "NOT ALLOTTED",
  }[appStatus] || "…";

  const cards = [
    { to: "/student/seats", icon: Search, color: "#2563eb", bg: "#e0ecff", title: "Available Vacant Seats", desc: "Browse open seats and apply to the colleges and branches you want." },
    { to: "/student/application", icon: ClipboardList, color: "#7c3aed", bg: "#f3e8ff", title: "My Applications", desc: "Review your chosen options and set your preference order." },
    { to: "/student/result", icon: Award, color: "#16a34a", bg: "#dcfce7", title: "Seat Allotment", desc: "View your allotted seat once the allocation is published." },
  ];

  return (
    <Layout>
      <h1 className="page-title">Candidate Dashboard</h1>
      <div className="panel">
        <p className="muted-line">Welcome to the Round IV institute-level seat allotment portal.</p>

        <div className="status-row">
          <div className="status-item">
            <span className="status-label">Round status</span>
            <span className={`pill ${round?.status === "open" ? "pill-green" : "pill-grey"}`}>
              {round ? round.status.toUpperCase() : "…"}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Your application</span>
            <span className="pill pill-blue">{appLabel}</span>
          </div>
        </div>

        <div className="card-grid">
          {cards.map((c) => {
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