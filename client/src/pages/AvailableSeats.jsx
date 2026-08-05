import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function AvailableSeats() {
  const [rows, setRows] = useState([]);
  const [round, setRound] = useState(null);
  const [appId, setAppId] = useState(null);
  const [applied, setApplied] = useState(new Set()); // "collegeId|branchName"
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
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
      } catch {
        setError("Could not load vacant seats. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const roundOpen = round?.status === "open";

  const apply = async (row) => {
    setMsg(""); setError("");
    const key = `${row.collegeId}|${row.branchName}`;
    if (applied.has(key)) return;

    try {
      if (appId) {
        const appRes = await api.get("/applications/me");
        const current = [...appRes.data.preferences]
          .sort((a, b) => a.priority - b.priority)
          .map((p, i) => ({ college: p.college._id || p.college, branchName: p.branchName, priority: i + 1 }));
        const updated = [...current, { college: row.collegeId, branchName: row.branchName, priority: current.length + 1 }];
        await api.put("/applications/me", { preferences: updated });
      } else {
        const res = await api.post("/applications", {
          preferences: [{ college: row.collegeId, branchName: row.branchName, priority: 1 }],
        });
        setAppId(res.data._id);
      }
      setApplied(new Set(applied).add(key));
      setMsg(`Added ${row.branchName} — ${row.collegeName} to your preferences.`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not apply. Please try again.");
    }
  };

  if (loading) return <Layout><div className="card">Loading…</div></Layout>;

  return (
    <Layout>
      <h1 className="page-title">Available Vacant Seats</h1>

      {!roundOpen && (
        <div className="notice notice-warn">The round is currently <strong>closed</strong>. You cannot apply right now.</div>
      )}
      {msg && <div className="auth-success">{msg}</div>}
      {error && <div className="auth-error">{error}</div>}

      <p className="muted-line table-legend">
        <strong>CAP Seats</strong> = seats you can apply for here.{" "}
        <strong>Institutional Quota</strong> seats are filled directly by the college.
      </p>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr><th>College</th><th>Branch</th><th>City</th><th className="ta-num">Inst. Quota</th><th className="ta-num">CAP Seats</th><th className="ta-center">Apply</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const already = applied.has(`${r.collegeId}|${r.branchName}`);
              return (
                <tr key={i}>
                  <td>{r.collegeName}</td>
                  <td>{r.branchName}</td>
                  <td>{r.city}</td>
                  <td className="ta-num">{r.instituteQuota}</td>
                  <td className="ta-num">{r.capSeats}</td>
                  <td className="ta-center">
                    {already
                      ? <span className="applied-tag">✓ Added</span>
                      : <button className="btn-apply" disabled={!roundOpen} onClick={() => apply(r)}>Apply</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}