import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SearchX } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";
import { apiErrorMessage } from "../lib/apiError";
import { ErrorState, TableSkeleton } from "../components/states";

const PAGE = 60; // rows rendered at a time — keeps the DOM light with 1,000+ branches

export default function AvailableSeats() {
  const [rows, setRows] = useState([]);
  const [round, setRound] = useState(null);
  const [appId, setAppId] = useState(null);
  const [applied, setApplied] = useState(new Set()); // "collegeId|branchName"
  const [applying, setApplying] = useState(null);    // key currently in flight
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [limit, setLimit] = useState(PAGE);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [collegesRes, roundRes] = await Promise.all([api.get("/colleges"), api.get("/round")]);
      const flat = [];
      collegesRes.data.forEach((c) =>
        c.branches.forEach((b) =>
          flat.push({
            collegeId: c._id, collegeName: c.name, city: c.city, branchName: b.branchName,
            instituteQuota: b.instituteQuota || 0,
            capSeats: Math.max(0, (b.vacantSeats || 0) - (b.instituteQuota || 0)),
          })
        )
      );
      setRows(flat);
      setRound(roundRes.data);

      try {
        const appRes = await api.get("/applications/me");
        setAppId(appRes.data._id);
        setApplied(new Set(appRes.data.preferences.map((p) => `${p.college._id || p.college}|${p.branchName}`)));
      } catch (err) {
        if (err.response?.status !== 404) throw err;
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load vacant seats."));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const cities = useMemo(
    () => [...new Set(rows.map((r) => r.city).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [rows]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (onlyOpen && r.capSeats <= 0) return false;
      if (city && r.city !== city) return false;
      if (needle && !`${r.collegeName} ${r.branchName} ${r.city}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [rows, q, city, onlyOpen]);

  // Reset pagination whenever the filters change.
  useEffect(() => { setLimit(PAGE); }, [q, city, onlyOpen]);

  const visible = filtered.slice(0, limit);
  const roundOpen = round?.status === "open";

  const apply = async (row) => {
    const key = `${row.collegeId}|${row.branchName}`;
    if (applied.has(key) || applying) return;
    setApplying(key);
    try {
      if (appId) {
        const appRes = await api.get("/applications/me");
        const current = [...appRes.data.preferences]
          .sort((a, b) => a.priority - b.priority)
          .map((p, i) => ({ college: p.college._id || p.college, branchName: p.branchName, priority: i + 1 }));
        // Guard against the same option already being on the server list.
        if (!current.some((p) => `${p.college}|${p.branchName}` === key)) {
          const updated = [...current, { college: row.collegeId, branchName: row.branchName, priority: current.length + 1 }];
          await api.put("/applications/me", { preferences: updated });
        }
      } else {
        const res = await api.post("/applications", {
          preferences: [{ college: row.collegeId, branchName: row.branchName, priority: 1 }],
        });
        setAppId(res.data._id);
      }
      setApplied((prev) => new Set(prev).add(key));
      toast.success("Added to your preference list", {
        description: `${row.branchName} — ${row.collegeName}`,
      });
    } catch (err) {
      toast.error("Could not add this option", { description: apiErrorMessage(err, "Please try again.") });
    } finally {
      setApplying(null);
    }
  };

  return (
    <Layout>
      <div className="list-head">
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Available Vacant Seats</h1>
          <p className="muted-line" style={{ marginBottom: 0 }}>
            <strong>CAP Seats</strong> can be applied for here. <strong>Institutional Quota</strong> seats are filled directly by the college.
          </p>
        </div>
      </div>

      {!roundOpen && !loading && !error && (
        <div className="notice notice-warn" role="status">
          The round is currently <strong>closed</strong>. You can browse seats but cannot apply right now.
        </div>
      )}

      {error ? (
        <ErrorState title="Unable to load vacant seats" message={error} onRetry={load} />
      ) : (
        <>
          <div className="toolbar" role="search">
            <input
              className="filter-search"
              type="search"
              placeholder="Search college, branch or city…"
              aria-label="Search college, branch or city"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className="filter-select" value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city">
              <option value="">All cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="tn-link" style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={onlyOpen}
                onChange={(e) => setOnlyOpen(e.target.checked)}
                style={{ width: "auto", accentColor: "var(--primary-600)" }}
              />
              Only seats available
            </label>
            <span className="toolbar-count" aria-live="polite">
              {loading ? "Loading…" : `${filtered.length.toLocaleString()} option${filtered.length === 1 ? "" : "s"}`}
            </span>
          </div>

          <div className="card table-card">
            <div className="table-scroll" tabIndex={-1}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">College</th>
                    <th scope="col">Branch</th>
                    <th scope="col">City</th>
                    <th scope="col" className="ta-num">Inst. Quota</th>
                    <th scope="col" className="ta-num">CAP Seats</th>
                    <th scope="col" className="ta-center">Action</th>
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
                          No seats match your search. Try clearing the filters.
                        </td>
                      </tr>
                    ) : visible.map((r) => {
                      const key = `${r.collegeId}|${r.branchName}`;
                      const already = applied.has(key);
                      const busy = applying === key;
                      return (
                        <tr key={key}>
                          <td>{r.collegeName}</td>
                          <td>{r.branchName}</td>
                          <td>{r.city}</td>
                          <td className="ta-num">{r.instituteQuota}</td>
                          <td className="ta-num">
                            <span className={`seat-badge ${r.capSeats > 0 ? "seat-open" : "seat-full"}`}>{r.capSeats}</span>
                          </td>
                          <td className="ta-center">
                            {already ? (
                              <span className="applied-tag">✓ Added</span>
                            ) : (
                              <button
                                className="btn btn-primary btn-sm"
                                disabled={!roundOpen || busy || r.capSeats <= 0}
                                onClick={() => apply(r)}
                                aria-label={`Add ${r.branchName} at ${r.collegeName} to preferences`}
                              >
                                {busy && <span className="spinner" aria-hidden />}
                                {busy ? "Adding…" : "Apply"}
                              </button>
                            )}
                          </td>
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
