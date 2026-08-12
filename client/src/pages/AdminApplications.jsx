import { useEffect, useMemo, useState } from "react";
import { Inbox, SearchX } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";
import { apiErrorMessage } from "../lib/apiError";
import { ErrorState, EmptyState, TableSkeleton } from "../components/states";

const PAGE = 50;

export default function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const load = () => {
    setLoading(true);
    setError("");
    api.get("/applications")
      .then((res) => setApps([...res.data].sort((a, b) => (b.student?.cetPercentile ?? -1) - (a.student?.cetPercentile ?? -1))))
      .catch((err) => setError(apiErrorMessage(err, "Could not load applications.")))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return apps.filter((a) => {
      if (status && a.status !== status) return false;
      if (needle && !`${a.student?.name || ""} ${a.student?.email || ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [apps, q, status]);

  useEffect(() => { setLimit(PAGE); }, [q, status]);
  const visible = filtered.slice(0, limit);

  const statusPill = (s) =>
    s === "alloted" ? <span className="pill pill-green">ALLOTTED</span>
    : s === "not_alloted" ? <span className="pill pill-grey">NOT ALLOTTED</span>
    : <span className="pill pill-blue">SUBMITTED</span>;

  return (
    <Layout>
      <div className="list-head">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Applications Received</h1>
        {!loading && !error && apps.length > 0 && <span className="count-badge">{apps.length.toLocaleString()} total</span>}
      </div>

      {error && <ErrorState title="Unable to load applications" message={error} onRetry={load} />}

      {!error && !loading && apps.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="No applications yet"
          message="Once candidates submit their preferences, they'll appear here ranked by percentile."
        />
      )}

      {!error && (loading || apps.length > 0) && (
        <>
          <div className="toolbar" role="search">
            <input
              className="filter-search"
              type="search"
              placeholder="Search candidate name or email…"
              aria-label="Search candidates"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="alloted">Allotted</option>
              <option value="not_alloted">Not allotted</option>
            </select>
            <span className="toolbar-count" aria-live="polite">
              {loading ? "Loading…" : `${filtered.length.toLocaleString()} shown`}
            </span>
          </div>

          <div className="card table-card">
            <div className="table-scroll" tabIndex={-1}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Candidate</th>
                    <th scope="col" className="ta-num">Percentile</th>
                    <th scope="col">Category</th>
                    <th scope="col">Preferences (in priority order)</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                {loading ? (
                  <TableSkeleton rows={8} cols={6} />
                ) : (
                  <tbody>
                    {visible.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="table-msg">
                          <SearchX size={18} style={{ verticalAlign: "-4px", marginRight: 8 }} aria-hidden />
                          No candidates match your search.
                        </td>
                      </tr>
                    ) : visible.map((a, i) => {
                      const ordered = [...a.preferences].sort((x, y) => x.priority - y.priority);
                      return (
                        <tr key={a._id}>
                          <td>{i + 1}</td>
                          <td>{a.student?.name || "—"}<br /><span className="sub-text">{a.student?.email}</span></td>
                          <td className="ta-num">{a.student?.cetPercentile ?? "—"}</td>
                          <td>{a.student?.category || "—"}</td>
                          <td><ol className="pref-list">{ordered.map((p, idx) => (<li key={idx}>{p.college?.name || "College"} — {p.branchName}</li>))}</ol></td>
                          <td>{statusPill(a.status)}</td>
                        </tr>
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
    </Layout>
  );
}
