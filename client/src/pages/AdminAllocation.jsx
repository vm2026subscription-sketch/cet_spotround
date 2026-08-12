import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Play, Trophy } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";
import ConfirmDialog from "../components/ConfirmDialog";
import { apiErrorMessage } from "../lib/apiError";
import { ErrorState, EmptyState, TableSkeleton } from "../components/states";

export default function AdminAllocation() {
  const [allotments, setAllotments] = useState([]);
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [running, setRunning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  const loadAllotments = async () => {
    setLoading(true);
    setError("");
    try {
      const [allotRes, roundRes] = await Promise.all([api.get("/allocations"), api.get("/round")]);
      setAllotments(allotRes.data);
      setRound(roundRes.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load allotments."));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadAllotments(); }, []);

  const runAllocation = async () => {
    setSummary(null);
    setRunning(true);
    try {
      const res = await api.post("/allocations/run");
      setSummary(res.data);
      setConfirmOpen(false);
      toast.success("Allocation complete", {
        description: `${res.data.alloted} allotted · ${res.data.notAlloted} not allotted (of ${res.data.totalApplications}). The round is now closed.`,
      });
      await loadAllotments();
    } catch (err) {
      setConfirmOpen(false);
      toast.error("Allocation failed", { description: apiErrorMessage(err, "Please try again.") });
    } finally {
      setRunning(false);
    }
  };

  const ranked = allotments.slice().sort((a, b) => (b.student?.cetPercentile ?? -1) - (a.student?.cetPercentile ?? -1));

  return (
    <Layout>
      <h1 className="page-title">Allocation &amp; Results</h1>

      {summary && (
        <div className="auth-success" role="status">
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
        <button className="btn btn-primary" onClick={() => setConfirmOpen(true)} disabled={running}>
          {running ? <span className="spinner" aria-hidden /> : <Play size={17} aria-hidden />}
          {running ? "Running…" : "Run Allocation"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Run the seat allocation?"
        message={`This clears any previous result and re-allots every seat from scratch based on current preferences${round?.status === "open" ? ", then closes the round" : ""}. Candidates will see their new result immediately.`}
        confirmLabel="Run allocation"
        busy={running}
        onConfirm={runAllocation}
        onCancel={() => setConfirmOpen(false)}
      />

      <div className="list-head" style={{ marginTop: 8 }}>
        <h3 className="pref-title" style={{ margin: 0 }}>Allotments</h3>
        {!loading && allotments.length > 0 && <span className="count-badge">{allotments.length.toLocaleString()} seats</span>}
      </div>

      {error ? (
        <ErrorState title="Unable to load allotments" message={error} onRetry={loadAllotments} />
      ) : !loading && allotments.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No allotments yet"
          message="Run the allocation to generate results. Allotted candidates will appear here, ranked by percentile."
        />
      ) : (
        <div className="card table-card">
          <div className="table-scroll" tabIndex={-1}>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Candidate</th>
                  <th scope="col" className="ta-num">Percentile</th>
                  <th scope="col">Allotted College</th>
                  <th scope="col">Branch</th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={6} cols={5} />
              ) : (
                <tbody>
                  {ranked.map((al, i) => (
                    <tr key={al._id}>
                      <td>{i + 1}</td>
                      <td>{al.student?.name || "—"}<br /><span className="sub-text">{al.student?.email}</span></td>
                      <td className="ta-num">{al.student?.cetPercentile ?? "—"}</td>
                      <td>{al.college?.name || "—"} <span className="sub-text">({al.college?.code})</span></td>
                      <td>{al.branchName}</td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
