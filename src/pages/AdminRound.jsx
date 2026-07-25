import { useEffect, useState } from "react";
import { Lock, Unlock, RotateCcw } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";

export default function AdminRound() {
  const [round, setRound] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [confirmMode, setConfirmMode] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    try { setRound((await api.get("/round")).data); }
    catch { setError("Could not load round status."); }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (status) => {
    setMsg(""); setError(""); setBusy(true);
    try {
      const res = await api.put("/round/status", { status });
      setRound(res.data.round);
      setMsg(`Round is now ${status}.`);
    } catch (err) { setError(err.response?.data?.message || "Could not change round status."); }
    finally { setBusy(false); }
  };

  const canConfirm = confirmText.trim().toUpperCase() === "RESET";

  const cancelReset = () => { setConfirmMode(false); setConfirmText(""); };

  const doReset = async () => {
    if (!canConfirm) return;
    setMsg(""); setError(""); setResetting(true);
    try {
      const res = await api.post("/round/reset");
      setRound(res.data.round);
      setMsg(`${res.data.message} (Applications removed: ${res.data.applicationsDeleted}, Allotments removed: ${res.data.allotmentsDeleted}.)`);
      cancelReset();
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset the round.");
    } finally { setResetting(false); }
  };

  const isOpen = round?.status === "open";

  return (
    <Layout>
      <h1 className="page-title">Round Control</h1>
      {msg && <div className="auth-success">{msg}</div>}
      {error && <div className="auth-error">{error}</div>}

      <div className="card">
        <div className="round-banner">
          <span className={`round-ring ${isOpen ? "ring-open" : "ring-closed"}`}>
            {isOpen ? <Unlock size={26} /> : <Lock size={26} />}
          </span>
          <div>
            <div className="round-label">Round {round?.roundNumber ?? "…"} is currently</div>
            <div className={`round-status ${isOpen ? "rs-open" : "rs-closed"}`}>{round ? round.status.toUpperCase() : "…"}</div>
          </div>
        </div>

        <p className="muted-line">
          When the round is <strong>open</strong>, students can submit and edit preferences.
          When <strong>closed</strong>, submissions are locked but students keep seeing their allotted seat.
          (Running the allocation also closes the round automatically.)
        </p>

        <div className="btn-bar">
          <button className="btn btn-primary" disabled={busy || isOpen} onClick={() => setStatus("open")}>Open Round</button>
          <button className="btn btn-danger" disabled={busy || !isOpen} onClick={() => setStatus("closed")}>Close Round</button>
        </div>
      </div>

      <div className="card danger-zone">
        <h3 className="dz-title"><RotateCcw size={18} /> Start a New Round</h3>
        <p className="muted-line">
          Clears <strong>all</strong> submitted applications and <strong>all</strong> allotment results, then reopens the round
          so every student can submit a fresh application. The round number stays the same.
          <strong> This permanently deletes the current results and cannot be undone</strong> — only do this when you're ready to start over.
        </p>

        {!confirmMode ? (
          <button className="btn btn-danger" onClick={() => setConfirmMode(true)}>Reset &amp; Start New Round</button>
        ) : (
          <div className="dz-confirm">
            <label className="dz-label">Type <strong>RESET</strong> to confirm you want to delete all applications and allotments:</label>
            <div className="dz-confirm-row">
              <input className="dz-input" value={confirmText} placeholder="RESET"
                onChange={(e) => setConfirmText(e.target.value)} autoFocus />
              <button className="btn btn-danger" disabled={!canConfirm || resetting} onClick={doReset}>
                {resetting ? "Resetting…" : "Confirm Reset"}
              </button>
              <button className="btn btn-ghost" disabled={resetting} onClick={cancelReset}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}