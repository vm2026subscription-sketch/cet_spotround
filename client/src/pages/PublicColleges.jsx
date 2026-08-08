import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api";
import PublicLayout from "../components/PublicLayout";

const STREAMS = [
  "Technical-PG","Technical-UG","Agricultural Education",
  "Fineart Education","Higher Education_PG","Higher Education_UG",
  "Medical Education_PG","Medical Education_UG","Ayush Education",
];
const TYPES = ["Government", "Private", "Autonomous","Unaided"];

export default function PublicColleges() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stream, setStream] = useState(searchParams.get("stream") || "");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);
const [course, setCourse] = useState(searchParams.get("course") || "");   // ← ADD

  useEffect(() => {
    api.get("/colleges/public")
      .then((res) => setColleges(res.data))
      .catch(() => setError("Could not load colleges."))
      .finally(() => setLoading(false));
  }, []);

  const onStreamChange = (value) => {
    setStream(value);
    setSearchParams(value ? { stream: value } : {});
  };

  const sumTotal = (c) => c.branches.reduce((s, b) => s + (b.totalSeats || 0), 0);
  const sumQuota = (c) => c.branches.reduce((s, b) => s + (b.instituteQuota || 0), 0);
  // CAP seats = what a student can actually get here = vacant minus institute quota.
  const capOf = (b) => Math.max(0, (b.vacantSeats || 0) - (b.instituteQuota || 0));
  const sumCap = (c) => c.branches.reduce((s, b) => s + capOf(b), 0);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return colleges.filter((c) => {
      if (stream && c.stream !== stream) return false;
      if (type && (c.type || "Private") !== type) return false;
      if (needle && !`${c.name} ${c.code} ${c.city}`.toLowerCase().includes(needle)) return false;
      if (course && !c.branches.some((b) => b.course === course)) return false;   
      return true;
    });
  }, [colleges, stream, type, q,course]);

  const clearFilter = () => { setStream(""); setType(""); setQ(""); setCourse(""); setSearchParams({}); };

  return (
    <PublicLayout>
      <div className="list-head">
        <div>
          <h1 className="page-title">{course || stream || "All"} Colleges</h1>
          <p className="muted-line">Find real-time seat availability across institutions.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={clearFilter}>Clear Filter</button>
      </div>

      <div className="filter-row">
        <select className="filter-select" value={stream} onChange={(e) => onStreamChange(e.target.value)}>
          <option value="">All Disciplines</option>
          {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input className="filter-search" placeholder="Search by name, code or city..."
          value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {error && <div className="auth-error">{error}</div>}

      <p className="muted-line table-legend">
        <strong>CAP Seats</strong> = seats you can get through this portal.{" "}
        <strong>Institutional Quota</strong> seats are filled directly by the college.
      </p>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr><th>Code</th><th>College Name</th><th>Type</th><th className="ta-num">Total Seats</th><th className="ta-num">Inst. Quota</th><th className="ta-num">CAP Seats</th><th>Location</th><th className="ta-center">Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: "center", padding: "24px" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: "center", padding: "24px" }}>No colleges found matching your search.</td></tr>
            ) : filtered.map((c) => (
              <Fragment key={c._id}>
                <tr>
                  <td>{c.code}</td>
                  <td>{c.name}</td>
                  <td>{c.type || "Private"}</td>
                  <td className="ta-num">{sumTotal(c)}</td>
                  <td className="ta-num">{sumQuota(c)}</td>
                  <td className="ta-num"><span className={`seat-badge ${sumCap(c) > 0 ? "seat-open" : "seat-full"}`}>{sumCap(c)}</span></td>
                  <td>{c.city}</td>
                  <td className="ta-center">
                    <button className="btn btn-ghost btn-sm" onClick={() => setOpenId(openId === c._id ? null : c._id)}>
                      {openId === c._id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>
                {openId === c._id && (
                  <tr className="detail-row">
                    <td colSpan="8">
                      <div className="detail-wrap">
                        <strong>Branches at {c.name}</strong>
                        <table className="inner-table">
                          <thead><tr><th>Branch</th><th>Code</th><th className="ta-num">Total</th><th className="ta-num">Inst. Quota</th><th className="ta-num">CAP Seats</th></tr></thead>
                          <tbody>
                            {c.branches.map((b) => (
                              <tr key={b._id}>
                                <td>{b.branchName}</td>
                                <td>{b.branchCode || "—"}</td>
                                <td className="ta-num">{b.totalSeats ?? 0}</td>
                                <td className="ta-num">{b.instituteQuota ?? 0}</td>
                                <td className="ta-num">{capOf(b)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="muted-line login-hint">
                          Want to apply? <Link to="/login">Login as a student</Link> to submit your preferences.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </PublicLayout>
  );
}