import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function ApplicationForm() {
  const [colleges, setColleges] = useState([]);
  const [round, setRound] = useState(null);
  const [existingApp, setExistingApp] = useState(null);

  const [prefs, setPrefs] = useState([]); // [{ college, collegeName, branchName }]
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
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
      } catch {
        setError("Could not load the form. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
    setError(""); setSuccess("");
    if (prefs.length === 0) return setError("Add at least one preference before submitting.");

    const preferences = prefs.map((p, i) => ({
      college: p.college, branchName: p.branchName, priority: i + 1,
    }));

    setSaving(true);
    try {
      if (existingApp) {
        const res = await api.put("/applications/me", { preferences });
        setExistingApp(res.data);
        setSuccess("Your preferences have been updated.");
      } else {
        const res = await api.post("/applications", { preferences });
        setExistingApp(res.data);
        setSuccess("Your application has been submitted.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div className="panel">Loading…</div></Layout>;

  return (
    <Layout>
      <div className="panel">
        <h2>My Applications — Preference List</h2>
        <p className="muted-line">
          Add college–branch options, then order them by priority with the arrows.
          Priority 1 is your most preferred choice. (You can also add seats from the Available Vacant Seats page.)
        </p>

        {!roundOpen && (
          <div className="notice notice-warn">
            The round is currently <strong>closed</strong>. You can view your saved preferences but cannot make changes.
          </div>
        )}
        {locked && (
          <div className="notice notice-warn">
            Your application is locked because allocation has been processed. It can no longer be edited.
          </div>
        )}
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {editable && (
          <div className="add-row">
            <div className="field">
              <label>College</label>
              <select value={selectedCollege}
                onChange={(e) => { setSelectedCollege(e.target.value); setSelectedBranch(""); }}>
                <option value="">-- Select college --</option>
                {colleges.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <div className="field">
              <label>Branch</label>
              <select value={selectedBranch} disabled={!selectedCollege}
                onChange={(e) => setSelectedBranch(e.target.value)}>
                <option value="">-- Select branch --</option>
                {branchesForSelected.map((b) => (
                  <option key={b._id} value={b.branchName}>{b.branchName} ({b.vacantSeats} seats)</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary add-btn" onClick={addPreference}>+ Add</button>
          </div>
        )}

        <h3 className="pref-title">Your Preferences ({prefs.length})</h3>
        {prefs.length === 0 ? (
          <div className="empty-inline"><p>No preferences added yet. Add a college and branch above, or apply from the Available Vacant Seats page.</p></div>
        ) : (
          <table className="pref-table">
            <thead>
              <tr>
                <th>Priority</th><th>College</th><th>Branch</th>
                {editable && <th>Order</th>}{editable && <th></th>}
              </tr>
            </thead>
            <tbody>
              {prefs.map((p, i) => (
                <tr key={`${p.college}-${p.branchName}`}>
                  <td className="pri-cell">{i + 1}</td>
                  <td>{p.collegeName}</td>
                  <td>{p.branchName}</td>
                  {editable && (
                    <td className="order-cell">
                      <button className="mini-btn" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                      <button className="mini-btn" onClick={() => move(i, 1)} disabled={i === prefs.length - 1}>↓</button>
                    </td>
                  )}
                  {editable && (
                    <td><button className="mini-btn danger" onClick={() => remove(i)}>✕</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {editable && (
          <button className="btn btn-primary submit-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : existingApp ? "Update Preferences" : "Submit Application"}
          </button>
        )}
      </div>
    </Layout>
  );
}