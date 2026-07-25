import { useEffect, useState } from "react";
import { Play, Trophy } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";

export default function AdminAllocation() {
  const [allotments, setAllotments] = useState([]);
  const [round, setRound] = useState(null);
  const [summary, setSummary] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const loadAllotments = async () => {
    try {
      const [allotRes, roundRes] = await Promise.all([api.get("/allocations"), api.get("/round")]);
      setAllotments(allotRes.data);
      setRound(roundRes.data);
    } catch { setError("Could not load allotments."); }
  };
  useEffect(() => { loadAllotments(); }, []);

  const runAllocation = async () => {
    if (!window.confirm("Run the seat allocation? This clears any previous result and re-allots from scratch.")) return;
    setError(""); setSummary(null); setRunning(true);
    try {
      const res = await api.post("/allocations/run");
      setSummary(res.data);
      await loadAllotments();
    } catch (err) { setError(err.response?.data?.message || "Allocation failed."); }
    finally { setRunning(false); }
  };

  return (
    <Layout>
      <h1 className="page-title">Allocation &amp; Results</h1>
      {error && <div className="auth-error">{error}</div>}
      {summary && (
        <div className="auth-success">
          {summary.message}: {summary.alloted} allotted, {summary.notAlloted} not allotted (of {summary.totalApplications} applications).
        </div>
      )}

      <div className="card run-card">
        <div>
          <h3 className="run-title">Run Seat Allocation</h3>
          <p className="muted-line" style={{ marginBottom: 0 }}>
            Ranks all candidates by percentile and assigns seats by preference order.
            Clears the previous result first, and automatically closes the round.
          </p>
        </div>
        <button className="btn btn-primary run-btn" onClick={runAllocation} disabled={running}>
          <Play size={17} /> {running ? "Running…" : "Run Allocation"}
        </button>
      </div>

      <div className="list-head" style={{ marginTop: 8 }}>
        <h3 className="pref-title" style={{ margin: 0 }}>Allotments</h3>
        {allotments.length > 0 && <span className="count-badge">{allotments.length} seats</span>}
      </div>

      {allotments.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><Trophy size={40} /></span>
          <h3>No allotments yet</h3>
          <p>Run the allocation to generate results. Allotted candidates will appear here, ranked by percentile.</p>
        </div>
      ) : (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Candidate</th><th>Percentile</th><th>Allotted College</th><th>Branch</th></tr>
            </thead>
            <tbody>
              {allotments.slice().sort((a, b) => (b.student?.cetPercentile ?? -1) - (a.student?.cetPercentile ?? -1)).map((al, i) => (
                <tr key={al._id}>
                  <td>{i + 1}</td>
                  <td>{al.student?.name || "—"}<br /><span className="sub-text">{al.student?.email}</span></td>
                  <td>{al.student?.cetPercentile ?? "—"}</td>
                  <td>{al.college?.name || "—"} <span className="sub-text">({al.college?.code})</span></td>
                  <td>{al.branchName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}