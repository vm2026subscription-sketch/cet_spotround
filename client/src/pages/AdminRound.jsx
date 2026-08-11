import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, Unlock, RotateCcw } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";
import { apiErrorMessage } from "../lib/apiError";
import { ErrorState, CardSkeleton } from "../components/states";

export default function AdminRound() {
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);

  const [confirmMode, setConfirmMode] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      setRound((await api.get("/round")).data);
    } catch (err) {
      setLoadError(apiErrorMessage(err, "Could not load round status."));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (status) => {
    setBusy(true);
    try {
      const res = await api.put("/round/status", { status });
      setRound(res.data.round);
      toast.success(`Round is now ${status}`, {
        description: status === "open"
          ? "Students can submit and edit preferences."
          : "Submissions are locked. Students keep seeing their results.",
      });
    } catch (err) {
      toast.error("Could not change round status", { description: apiErrorMessage(err, "Please try again.") });
    } finally {
      setBusy(false);
    }
  };

  const canConfirm = confirmText.trim().toUpperCase() === "RESET";
  const cancelReset = () => { setConfirmMode(false); setConfirmText(""); };

  const doReset = async () => {
    if (!canConfirm) return;
    setResetting(true);
    try {
      const res = await api.post("/round/reset");
      setRound(res.data.round);
      toast.success("Round reset", {
        description: `${res.data.applicationsDeleted} applications and ${res.data.allotmentsDeleted} allotments removed. The round is open again.`,
      });
      cancelReset();
    } catch (err) {
      toast.error("Could not reset the round", { description: apiErrorMessage(err, "Please try again.") });
    } finally {
      setResetting(false);
    }
  };

  const isOpen = round?.status === "open";

  return (
    <Layout>
      <h1 className="page-title">Round Control</h1>

      {loading && <CardSkeleton lines={4} />}
      {!loading && loadError && <ErrorState title="Unable to load round status" message={loadError} onRetry={load} />}

      {!loading && !loadError && round && (
        <>
          <div className="card">
            <div className="round-banner">
              <span className={`round-ring ${isOpen ? "ring-open" : "ring-closed"}`}>
                {isOpen ? <Unlock size={26} aria-hidden /> : <Lock size={26} aria-hidden />}
              </span>
              <div>
                <div className="round-label">Round {round.roundNumber ?? "—"} is currently</div>
                <div className={`round-status ${isOpen ? "rs-open" : "rs-closed"}`}>{round.status.toUpperCase()}</div>
              </div>
            </div>

            <p className="muted-line">
              When the round is <strong>open</strong>, students can submit and edit preferences.
              When <strong>closed</strong>, submissions are locked but students keep seeing their allotted seat.
              (Running the allocation also closes the round automatically.)
            </p>

            <div className="btn-bar">
              <button className="btn btn-primary" disabled={busy || isOpen} onClick={() => setStatus("open")}>
                {busy && <span className="spinner" aria-hidden />} Open Round
              </button>
              <button className="btn btn-danger" disabled={busy || !isOpen} onClick={() => setStatus("closed")}>
                Close Round
              </button>
            </div>
          </div>

          <div className="card danger-zone">
            <h3 className="dz-title"><RotateCcw size={18} aria-hidden /> Start a New Round</h3>
            <p className="muted-line">
              Clears <strong>all</strong> submitted applications and <strong>all</strong> allotment results, then reopens the round
              so every student can submit a fresh application. The round number stays the same.
              <strong> This permanently deletes the current results and cannot be undone</strong> — only do this when you're ready to start over.
            </p>

            {!confirmMode ? (
              <button className="btn btn-danger" onClick={() => setConfirmMode(true)}>Reset &amp; Start New Round</button>
            ) : (
              <div className="dz-confirm">
                <label className="dz-label" htmlFor="dz-input">
                  Type <strong>RESET</strong> to confirm you want to delete all applications and allotments:
                </label>
                <div className="dz-confirm-row">
                  <input id="dz-input" className="dz-input" value={confirmText} placeholder="RESET"
                    onChange={(e) => setConfirmText(e.target.value)} autoFocus />
                  <button className="btn btn-danger" disabled={!canConfirm || resetting} onClick={doReset}>
                    {resetting && <span className="spinner" aria-hidden />}
                    {resetting ? "Resetting…" : "Confirm Reset"}
                  </button>
                  <button className="btn btn-ghost" disabled={resetting} onClick={cancelReset}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
