import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";

export default function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/applications")
      .then((res) => setApps([...res.data].sort((a, b) => (b.student?.cetPercentile ?? -1) - (a.student?.cetPercentile ?? -1))))
      .catch(() => setError("Could not load applications."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="card">Loading…</div></Layout>;

  return (
    <Layout>
      <div className="list-head">
        <h1 className="page-title">Applications Received</h1>
        {apps.length > 0 && <span className="count-badge">{apps.length} total</span>}
      </div>
      {error && <div className="auth-error">{error}</div>}

      {apps.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><Inbox size={40} /></span>
          <h3>No applications yet</h3>
          <p>Once candidates submit their preferences, they'll appear here ranked by percentile.</p>
        </div>
      ) : (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Candidate</th><th>Percentile</th><th>Category</th><th>Preferences (in priority order)</th><th>Status</th></tr>
            </thead>
            <tbody>
              {apps.map((a, i) => {
                const ordered = [...a.preferences].sort((x, y) => x.priority - y.priority);
                return (
                  <tr key={a._id}>
                    <td>{i + 1}</td>
                    <td>{a.student?.name || "—"}<br /><span className="sub-text">{a.student?.email}</span></td>
                    <td>{a.student?.cetPercentile ?? "—"}</td>
                    <td>{a.student?.category || "—"}</td>
                    <td><ol className="pref-list">{ordered.map((p, idx) => (<li key={idx}>{p.college?.name || "College"} — {p.branchName}</li>))}</ol></td>
                    <td>
                      <span className={`pill ${a.status === "alloted" ? "pill-green" : a.status === "not_alloted" ? "pill-grey" : "pill-blue"}`}>
                        {a.status === "alloted" ? "ALLOTTED" : a.status === "not_alloted" ? "NOT ALLOTTED" : "SUBMITTED"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}