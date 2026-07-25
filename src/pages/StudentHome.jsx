import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, ClipboardList, Award, ArrowRight, CalendarClock,
  UserCircle2, CheckCircle2, AlertCircle, Clock, FileText,
} from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function StudentHome() {
  const { user } = useAuth();
  const [round, setRound] = useState(null);
  const [appStatus, setAppStatus] = useState("loading");

  useEffect(() => {
    api.get("/round").then((res) => setRound(res.data)).catch(() => setRound(null));
    api.get("/applications/me")
      .then((res) => setAppStatus(res.data.status))
      .catch((err) => setAppStatus(err.response?.status === 404 ? "none" : "error"));
  }, []);

  const statusMap = {
    none:        { label: "Not submitted", cls: "pill-grey",  Icon: AlertCircle },
    submitted:   { label: "Submitted",     cls: "pill-blue",  Icon: Clock },
    alloted:     { label: "Seat allotted", cls: "pill-green", Icon: CheckCircle2 },
    not_alloted: { label: "Not allotted",  cls: "pill-grey",  Icon: AlertCircle },
    loading:     { label: "Loading…",      cls: "pill-grey",  Icon: Clock },
    error:       { label: "Error",         cls: "pill-red",   Icon: AlertCircle },
  };
  const status = statusMap[appStatus] || statusMap.loading;
  const roundOpen = round?.status === "open";

  // Progress: profile → browse → application → allotment
  const steps = [
    { key: "profile",   label: "Profile",     done: true },
    { key: "browse",    label: "Browse seats",done: true },
    { key: "apply",     label: "Application", done: ["submitted","alloted","not_alloted"].includes(appStatus) },
    { key: "allotment", label: "Allotment",   done: appStatus === "alloted" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  const actions = [
    { to: "/student/seats",       Icon: Search,         title: "Available Vacant Seats", desc: "Live seat availability across institutes and branches." },
    { to: "/student/application", Icon: ClipboardList,  title: "My Application",         desc: "Review and re-order your preference list." },
    { to: "/student/result",      Icon: Award,          title: "Seat Allotment",         desc: "Download your provisional allotment letter." },
    { to: "/student/profile",     Icon: UserCircle2,    title: "Candidate Profile",      desc: "CET details, category and personal information." },
  ];

  const deadlines = [
    { date: "22 Jul", title: "Choice filling closes",       urgent: true  },
    { date: "27 Jul", title: "Provisional allotment",       urgent: false },
    { date: "31 Jul", title: "Institute reporting deadline",urgent: false },
  ];

  return (
    <Layout>
      {/* Header row */}
      <div className="dash-header">
        <div>
          <span className="kicker">Candidate dashboard</span>
          <h1 className="dash-title">Welcome back, {user?.name?.split(" ")[0] || "candidate"}</h1>
          <p className="dash-sub">
            Track your application through the CAP Round IV institute-level admission process.
          </p>
        </div>
        <div className="dash-header-meta">
          <div className="meta-cell">
            <span className="meta-label">Round status</span>
            <span className={`pill ${roundOpen ? "pill-green" : "pill-grey"}`}>{round ? round.status.toUpperCase() : "…"}</span>
          </div>
          <div className="meta-cell">
            <span className="meta-label">Application</span>
            <span className={`pill ${status.cls}`}><status.Icon size={12} /> {status.label}</span>
          </div>
        </div>
      </div>

      {/* Progress card */}
      <div className="progress-card">
        <div className="progress-head">
          <div>
            <h2 className="progress-title">Application progress</h2>
            <p className="progress-sub">{doneCount} of {steps.length} steps completed</p>
          </div>
          <div className="progress-pct">{pct}%</div>
        </div>
        <div className="progress-bar"><span style={{ width: `${pct}%` }} /></div>
        <ol className="progress-steps">
          {steps.map((s, i) => (
            <li key={s.key} className={`progress-step ${s.done ? "done" : ""}`}>
              <span className="progress-step-dot">{s.done ? <CheckCircle2 size={14} /> : i + 1}</span>
              <span className="progress-step-label">{s.label}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Two-column: quick actions + deadlines */}
      <div className="dash-cols">
        <div className="dash-col-main">
          <div className="section-head compact">
            <h2 className="section-title-sm">Quick actions</h2>
          </div>
          <div className="quick-grid">
            {actions.map((a) => (
              <Link to={a.to} key={a.to} className="quick-card">
                <span className="quick-icon"><a.Icon size={18} /></span>
                <div className="quick-body">
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                </div>
                <ArrowRight size={16} className="quick-arrow" />
              </Link>
            ))}
          </div>
        </div>

        <aside className="dash-col-side">
          <div className="side-card">
            <div className="side-card-head">
              <CalendarClock size={16} />
              <h3>Upcoming deadlines</h3>
            </div>
            <ul className="deadline-list">
              {deadlines.map((d) => (
                <li className="deadline-item" key={d.title}>
                  <div className={`deadline-date ${d.urgent ? "urgent" : ""}`}>{d.date}</div>
                  <div className="deadline-title">{d.title}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="side-card">
            <div className="side-card-head">
              <FileText size={16} />
              <h3>Recent activity</h3>
            </div>
            <ul className="activity-list">
              <li><span className="activity-dot" /> Profile verification completed</li>
              <li><span className="activity-dot" /> Round IV vacancies published</li>
              {appStatus === "submitted" && <li><span className="activity-dot" /> Preferences submitted successfully</li>}
              {appStatus === "alloted" && <li><span className="activity-dot" /> Seat allotted — check result</li>}
            </ul>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
