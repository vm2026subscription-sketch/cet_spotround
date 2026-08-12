import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, X, Plus, ClipboardList } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";
import { apiErrorMessage } from "../lib/apiError";
import { ErrorState, CardSkeleton } from "../components/states";

export default function ApplicationForm() {
  const [colleges, setColleges] = useState([]);
  const [round, setRound] = useState(null);
  const [existingApp, setExistingApp] = useState(null);

  const [prefs, setPrefs] = useState([]); // [{ college, collegeName, branchName }]
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [collegesRes, roundRes] = await Promise.all([
        api.get("/colleges"),
        api.get("/round"),
      ]);
      setColleges(collegesRes.data);
      setRound(roundRes.data);

      try {
        const appRes = await api.get("/applications/me");
        setExistingApp(appRes.data);
        const saved = [...appRes.data.preferences]
          .sort((a, b) => a.priority - b.priority)
          .map((p) => ({
            college: p.college._id,
            collegeName: p.college.name,
            branchName: p.branchName,
          }));
        setPrefs(saved);
      } catch (err) {
        if (err.response?.status !== 404) throw err; // 404 = no app yet, fine
      }
    } catch (err) {
      setLoadError(apiErrorMessage(err, "Could not load the form."));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const roundOpen = round?.status === "open";
  const locked = existingApp && existingApp.status !== "submitted";
  const editable = roundOpen && !locked;

  const branchesForSelected =
    colleges.find((c) => c._id === selectedCollege)?.branches || [];

  const addPreference = () => {
    setError("");
    if (!selectedCollege || !selectedBranch)
      return setError("Pick both a college and a branch before adding.");
    if (prefs.some((p) => p.college === selectedCollege && p.branchName === selectedBranch))
      return setError("That college + branch is already in your list.");

    const college = colleges.find((c) => c._id === selectedCollege);
    setPrefs([...prefs, { college: selectedCollege, collegeName: college.name, branchName: selectedBranch }]);
    setSelectedBranch("");
  };

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= prefs.length) return;
    const copy = [...prefs];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setPrefs(copy);
  };

  const remove = (index) => setPrefs(prefs.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setError("");
    if (prefs.length === 0) return setError("Add at least one preference before submitting.");
    if (saving) return;

    const preferences = prefs.map((p, i) => ({
      college: p.college, branchName: p.branchName, priority: i + 1,
    }));

    setSaving(true);
    try {
      if (existingApp) {
        const res = await api.put("/applications/me", { preferences });
        setExistingApp(res.data);
        toast.success("Preferences updated", { description: `${preferences.length} option${preferences.length === 1 ? "" : "s"} saved in priority order.` });
      } else {
        const res = await api.post("/applications", { preferences });
        setExistingApp(res.data);
        toast.success("Application submitted", { description: "You can re-order preferences until the round closes." });
      }
    } catch (err) {
      const msg = apiErrorMessage(err, "Could not save. Please try again.");
      setError(msg);
      toast.error("Could not save your preferences", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><CardSkeleton lines={6} /></Layout>;
  if (loadError) return <Layout><ErrorState title="Unable to load the application form" message={loadError} onRetry={load} /></Layout>;

  return (
    <Layout>
      <div className="panel">
        <h2>My Application — Preference List</h2>
        <p className="muted-line">
          Add college–branch options, then order them by priority with the arrows.
          Priority 1 is your most preferred choice. You can also add seats directly from the Available Vacant Seats page.
        </p>

        {!roundOpen && (
          <div className="notice notice-warn" role="status">
            The round is currently <strong>closed</strong>. You can view your saved preferences but cannot make changes.
          </div>
        )}
        {locked && (
          <div className="notice notice-warn" role="status">
            Your application is locked because allocation has been processed. It can no longer be edited.
          </div>
        )}
        {error && <div className="auth-error" role="alert">{error}</div>}

        {editable && (
          <div className="add-row">
            <div className="field">
              <label htmlFor="pref-college">College</label>
              <select id="pref-college" value={selectedCollege}
                onChange={(e) => { setSelectedCollege(e.target.value); setSelectedBranch(""); }}>
                <option value="">— Select college —</option>
                {colleges.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="pref-branch">Branch</label>
              <select id="pref-branch" value={selectedBranch} disabled={!selectedCollege}
                onChange={(e) => setSelectedBranch(e.target.value)}>
                <option value="">— Select branch —</option>
                {branchesForSelected.map((b) => (
                  <option key={b._id} value={b.branchName}>{b.branchName} ({b.vacantSeats} seats)</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={addPreference}>
              <Plus size={15} aria-hidden /> Add
            </button>
          </div>
        )}

        <h3 className="pref-title">Your Preferences ({prefs.length})</h3>
        {prefs.length === 0 ? (
          <div className="empty-inline">
            <p>No preferences added yet. Add a college and branch above, or apply from the Available Vacant Seats page.</p>
          </div>
        ) : (
          <div className="table-scroll" style={{ maxHeight: "none", overflowY: "visible" }}>
            <table className="pref-table">
              <thead>
                <tr>
                  <th scope="col">Priority</th><th scope="col">College</th><th scope="col">Branch</th>
                  {editable && <th scope="col">Order</th>}
                  {editable && <th scope="col"><span className="sr-only">Remove</span></th>}
                </tr>
              </thead>
              <tbody>
                {prefs.map((p, i) => (
                  <tr key={`${p.college}-${p.branchName}`}>
                    <td className="pri-cell">{i + 1}</td>
                    <td>{p.collegeName}</td>
                    <td>{p.branchName}</td>
                    {editable && (
                      <td>
                        <span className="order-cell">
                          <button className="mini-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${p.branchName} at ${p.collegeName} up`}>
                            <ArrowUp size={14} aria-hidden />
                          </button>
                          <button className="mini-btn" onClick={() => move(i, 1)} disabled={i === prefs.length - 1} aria-label={`Move ${p.branchName} at ${p.collegeName} down`}>
                            <ArrowDown size={14} aria-hidden />
                          </button>
                        </span>
                      </td>
                    )}
                    {editable && (
                      <td>
                        <button className="mini-btn danger" onClick={() => remove(i)} aria-label={`Remove ${p.branchName} at ${p.collegeName}`}>
                          <X size={14} aria-hidden />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editable && (
          <button className="btn btn-primary submit-btn" onClick={handleSubmit} disabled={saving}>
            {saving && <span className="spinner" aria-hidden />}
            {saving ? "Saving…" : existingApp ? (<><ClipboardList size={15} aria-hidden /> Update Preferences</>) : (<><ClipboardList size={15} aria-hidden /> Submit Application</>)}
          </button>
        )}
      </div>
    </Layout>
  );
}
