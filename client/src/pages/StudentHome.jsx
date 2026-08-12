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
  const [roundState, setRoundState] = useState("loading"); // loading | ok | error
  const [appStatus, setAppStatus] = useState("loading");

  useEffect(() => {
    api.get("/round")
      .then((res) => { setRound(res.data); setRoundState("ok"); })
      .catch(() => setRoundState("error"));
    api.get("/applications/me")
      .then((res) => setAppStatus(res.data.status))
      .catch((err) => setAppStatus(err.response?.status === 404 ? "none" : "error"));
  }, []);

  const statusMap = {
    none:        { label: "Not submitted", cls: "pill-grey",  Icon: AlertCircle },
    submitted:   { label: "Submitted",     cls: "pill-blue",  Icon: Clock },
    alloted:     { label: "Seat allotted", cls: "pill-green", Icon: CheckCircle2 },
    not_alloted: { label: "Not allotted",  cls: "pill-grey",  Icon: AlertCircle },
    loading:     { label: "Checking…",     cls: "pill-grey",  Icon: Clock },
    error:       { label: "Unavailable",   cls: "pill-red",   Icon: AlertCircle },
  };
  const status = statusMap[appStatus] || statusMap.loading;
  const roundOpen = round?.status === "open";

  // Honest progress: each step reflects what has actually happened.
  const applied = ["submitted", "alloted", "not_alloted"].includes(appStatus);
  const steps = [
    { key: "account",   label: "Account created",       done: true },
    { key: "profile",   label: "CET profile",           done: Boolean(user?.cetPercentile ?? user?.cetApplicationId) },
    { key: "apply",     label: "Preferences submitted", done: applied },
    { key: "allotment", label: "Seat allotted",         done: appStatus === "alloted" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  const nextAction = !applied
    ? { to: "/student/seats", label: "Browse seats and add your first preference" }
    : appStatus === "alloted"
      ? { to: "/student/result", label: "View your allotment letter" }
      : { to: "/student/application", label: "Review and re-order your preferences" };

  const actions = [
    { to: "/student/seats",       Icon: Search,         title: "Available Vacant Seats", desc: "Live seat availability across institutes and branches." },
    { to: "/student/application", Icon: ClipboardList,  title: "My Application",         desc: "Review and re-order your preference list." },
    { to: "/student/result",      Icon: Award,          title: "Seat Allotment",         desc: "Download your provisional allotment letter." },
    { to: "/student/profile",     Icon: UserCircle2,    title: "Candidate Profile",      desc: "CET details, category and personal information." },
  ];

  const deadlines = [
    { date: "22 Jul", title: "Choice filling closes",        urgent: true  },
    { date: "27 Jul", title: "Provisional allotment",        urgent: false },
    { date: "31 Jul", title: "Institute reporting deadline", urgent: false },
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
            <span className={`pill ${roundState === "error" ? "pill-red" : roundOpen ? "pill-green" : "pill-grey"}`}>
              {roundState === "loading" ? "Checking…" : roundState === "error" ? "Unavailable" : round.status.toUpperCase()}
            </span>
          </div>
          <div className="meta-cell">
            <span className="meta-label">Application</span>
            <span className={`pill ${status.cls}`}><status.Icon size={12} aria-hidden /> {status.label}</span>
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
        <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Application progress">
          <span style={{ width: `${pct}%` }} />
        </div>
        <ol className="progress-steps">
          {steps.map((s, i) => (
            <li key={s.key} className={`progress-step ${s.done ? "done" : ""}`}>
              <span className="progress-step-dot">{s.done ? <CheckCircle2 size={14} aria-hidden /> : i + 1}</span>
              <span className="progress-step-label">{s.label}</span>
            </li>
          ))}
        </ol>
        {appStatus !== "loading" && appStatus !== "error" && (
          <p className="muted-line" style={{ margin: "14px 0 0" }}>
            Next step: <Link to={nextAction.to}>{nextAction.label}</Link>
          </p>
        )}
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
                <span className="quick-icon"><a.Icon size={18} aria-hidden /></span>
                <div className="quick-body">
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                </div>
                <ArrowRight size={16} className="quick-arrow" aria-hidden />
              </Link>
            ))}
          </div>
        </div>

        <aside className="dash-col-side">
          <div className="side-card">
            <div className="side-card-head">
              <CalendarClock size={16} aria-hidden />
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
            <p className="muted-line" style={{ margin: "10px 0 0", fontSize: 12 }}>Indicative schedule for Round IV.</p>
          </div>

          <div className="side-card">
            <div className="side-card-head">
              <FileText size={16} aria-hidden />
              <h3>Recent activity</h3>
            </div>
            <ul className="activity-list">
              <li><span className="activity-dot" aria-hidden /> Account created and verified</li>
              {roundState === "ok" && <li><span className="activity-dot" aria-hidden /> Round IV is {roundOpen ? "open for choice filling" : "currently closed"}</li>}
              {appStatus === "submitted" && <li><span className="activity-dot" aria-hidden /> Preferences submitted successfully</li>}
              {appStatus === "alloted" && <li><span className="activity-dot" aria-hidden /> Seat allotted — check your result</li>}
              {appStatus === "not_alloted" && <li><span className="activity-dot" aria-hidden /> Allocation ran — no seat could be allotted</li>}
            </ul>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
