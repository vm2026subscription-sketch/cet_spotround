import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { X, SearchX, ChevronDown, ChevronUp } from "lucide-react";
import api from "../api";
import PublicLayout from "../components/PublicLayout";
import { apiErrorMessage } from "../lib/apiError";
import { ErrorState, TableSkeleton } from "../components/states";

const STREAMS = [
  "Technical-PG","Technical-UG","Agricultural Education",
  "Fineart Education","Higher Education_PG","Higher Education_UG",
  "Medical Education_PG","Medical Education_UG","Ayush Education",
];
const TYPES = ["Government", "Private", "Autonomous", "Unaided"];
const PAGE = 50;

export default function PublicColleges() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stream, setStream] = useState(searchParams.get("stream") || "");
  const [course, setCourse] = useState(searchParams.get("course") || "");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);
  const [limit, setLimit] = useState(PAGE);

  const load = () => {
    setLoading(true);
    setError("");
    api.get("/colleges/public")
      .then((res) => setColleges(res.data))
      .catch((err) => setError(apiErrorMessage(err, "Could not load colleges.")))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  // Keep the URL in sync with the active stream + course so links stay shareable.
  const syncParams = (nextStream, nextCourse) => {
    const params = {};
    if (nextStream) params.stream = nextStream;
    if (nextCourse) params.course = nextCourse;
    setSearchParams(params);
  };
  const onStreamChange = (value) => {
    setStream(value);
    setCourse(""); // a course belongs to one discipline — changing stream clears it
    syncParams(value, "");
  };
  const removeCourse = () => { setCourse(""); syncParams(stream, ""); };

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
  }, [colleges, stream, type, q, course]);

  useEffect(() => { setLimit(PAGE); }, [stream, type, q, course]);
  const visible = filtered.slice(0, limit);

  const hasFilters = stream || type || q || course;
  const clearFilter = () => { setStream(""); setType(""); setQ(""); setCourse(""); setSearchParams({}); };

  return (
    <PublicLayout>
      <div className="list-head">
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>{course || stream || "All"} Colleges</h1>
          <p className="muted-line" style={{ marginBottom: 0 }}>
            Real-time seat availability across institutions. <strong>CAP Seats</strong> are available
            through this portal; <strong>Institutional Quota</strong> seats are filled by the college.
          </p>
        </div>
        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilter}>Clear all filters</button>
        )}
      </div>

      {error ? (
        <ErrorState title="Unable to load colleges" message={error} onRetry={load} />
      ) : (
        <>
          <div className="toolbar" role="search">
            <input
              className="filter-search"
              type="search"
              placeholder="Search by name, code or city…"
              aria-label="Search colleges"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className="filter-select" value={stream} onChange={(e) => onStreamChange(e.target.value)} aria-label="Filter by discipline">
              <option value="">All Disciplines</option>
              {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by institute type">
              <option value="">All Types</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {course && (
              <span className="chip">
                {course}
                <button onClick={removeCourse} aria-label={`Remove course filter ${course}`}><X size={12} /></button>
              </span>
            )}
            <span className="toolbar-count" aria-live="polite">
              {loading ? "Loading…" : `${filtered.length.toLocaleString()} college${filtered.length === 1 ? "" : "s"}`}
            </span>
          </div>

          <div className="card table-card">
            <div className="table-scroll" tabIndex={-1}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Code</th>
                    <th scope="col">College Name</th>
                    <th scope="col">Type</th>
                    <th scope="col" className="ta-num">Total Seats</th>
                    <th scope="col" className="ta-num">Inst. Quota</th>
                    <th scope="col" className="ta-num">CAP Seats</th>
                    <th scope="col">Location</th>
                    <th scope="col" className="ta-center">Branches</th>
                  </tr>
                </thead>
                {loading ? (
                  <TableSkeleton rows={8} cols={8} />
                ) : (
                  <tbody>
                    {visible.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="table-msg">
                          <SearchX size={18} style={{ verticalAlign: "-4px", marginRight: 8 }} aria-hidden />
                          No colleges found matching your search.
                        </td>
                      </tr>
                    ) : visible.map((c) => {
                      const open = openId === c._id;
                      return (
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
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setOpenId(open ? null : c._id)}
                                aria-expanded={open}
                              >
                                {open ? "Hide" : "View"} {open ? <ChevronUp size={13} aria-hidden /> : <ChevronDown size={13} aria-hidden />}
                              </button>
                            </td>
                          </tr>
                          {open && (
                            <tr className="detail-row">
                              <td colSpan={8}>
                                <div className="detail-wrap">
                                  <strong>Branches at {c.name}</strong>
                                  <table className="inner-table">
                                    <thead><tr><th scope="col">Branch</th><th scope="col">Code</th><th scope="col" className="ta-num">Total</th><th scope="col" className="ta-num">Inst. Quota</th><th scope="col" className="ta-num">CAP Seats</th></tr></thead>
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
                                    Want to apply? <Link to="/login">Sign in as a candidate</Link> to submit your preferences.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                )}
              </table>
            </div>
            {!loading && filtered.length > visible.length && (
              <div className="load-more-bar">
                <button className="btn btn-ghost" onClick={() => setLimit((l) => l + PAGE)}>
                  Show more ({(filtered.length - visible.length).toLocaleString()} remaining)
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </PublicLayout>
  );
}
