import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

const STREAMS = [
  "Technical-PG","Technical-UG","Agricultural Education",
  "Fineart Education","Higher Education_PG","Higher Education_UG",
  "Medical Education_PG","Medical Education_UG","Ayush Education",
];
const TYPES = ["Government", "Private", "Autonomous","Unaided"];

export default function AdminColleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const blankNew = {
    name: "", code: "", city: "", stream: "", type: "Private",
    branches: [{ branchName: "", branchCode: "", totalSeats: 0, vacantSeats: 0 }],
  };
  const [form, setForm] = useState(blankNew);

  const loadColleges = async () => {
    try { setColleges((await api.get("/colleges")).data); }
    catch { setError("Could not load colleges."); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadColleges(); }, []);

  const onSeatChange = (collegeId, branchId, value) =>
    setColleges((prev) => prev.map((c) =>
      c._id !== collegeId ? c : { ...c, branches: c.branches.map((b) => (b._id !== branchId ? b : { ...b, vacantSeats: value })) }
    ));

  const saveSeat = async (collegeId, branch) => {
    setMsg(""); setError("");
    try {
      await api.patch(`/colleges/${collegeId}/branches/${branch._id}`, { vacantSeats: Number(branch.vacantSeats) });
      setMsg(`Updated ${branch.branchName} seats.`);
    } catch (err) { setError(err.response?.data?.message || "Could not update seats."); }
  };

  const deleteCollege = async (college) => {
    if (!window.confirm(`Delete "${college.name}"? This cannot be undone.`)) return;
    setMsg(""); setError("");
    try { await api.delete(`/colleges/${college._id}`); setMsg(`Deleted ${college.name}.`); if (editingId === college._id) cancelEdit(); loadColleges(); }
    catch (err) { setError(err.response?.data?.message || "Could not delete college."); }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setForm({
      name: c.name, code: c.code, city: c.city,
      stream: c.stream || "", type: c.type || "Private",
      branches: c.branches.length
        ? c.branches.map((b) => ({ _id: b._id, branchName: b.branchName, branchCode: b.branchCode || "", totalSeats: b.totalSeats ?? 0, vacantSeats: b.vacantSeats ?? 0 }))
        : [{ branchName: "", branchCode: "", totalSeats: 0, vacantSeats: 0 }],
    });
    setMsg(""); setError("");
    document.getElementById("college-form")?.scrollIntoView({ behavior: "smooth" });
  };
  const cancelEdit = () => { setEditingId(null); setForm(blankNew); };

  const onField = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onBranchField = (i, field, value) =>
    setForm({ ...form, branches: form.branches.map((b, idx) => (idx === i ? { ...b, [field]: value } : b)) });
  const addBranchRow = () =>
    setForm({ ...form, branches: [...form.branches, { branchName: "", branchCode: "", totalSeats: 0, vacantSeats: 0 }] });
  const removeBranchRow = (i) =>
    setForm({ ...form, branches: form.branches.filter((_, idx) => idx !== i) });

  const saveCollege = async () => {
    setMsg(""); setError("");
    if (!form.name || !form.code || !form.city) return setError("College name, code and city are required.");
    if (!form.stream) return setError("Please choose a discipline for this college.");

    const payload = {
      name: form.name, code: form.code, city: form.city, stream: form.stream, type: form.type,
      branches: form.branches.filter((b) => b.branchName.trim()).map((b) => ({
        ...(b._id ? { _id: b._id } : {}),
        branchName: b.branchName, branchCode: b.branchCode,
        totalSeats: Number(b.totalSeats), vacantSeats: Number(b.vacantSeats),
      })),
    };

    try {
      if (editingId) {
        await api.put(`/colleges/${editingId}`, payload);
        setMsg(`Updated "${form.name}".`);
      } else {
        await api.post("/colleges", payload);
        setMsg(`College "${form.name}" created.`);
      }
      cancelEdit();
      loadColleges();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save college.");
    }
  };

  if (loading) return <Layout><div className="card">Loading…</div></Layout>;

  return (
    <Layout>
      <h1 className="page-title">Colleges &amp; Vacant Seats</h1>
      {msg && <div className="auth-success">{msg}</div>}
      {error && <div className="auth-error">{error}</div>}

      {colleges.length === 0 && <div className="card">No colleges yet. Add one below.</div>}

      {colleges.map((c) => (
        <div className={`card admin-college-card ${editingId === c._id ? "editing" : ""}`} key={c._id}>
          <div className="college-card-head">
            <h3 className="college-head">{c.name} <span className="college-meta">({c.code} · {c.city})</span></h3>
            <div className="college-tags">
              {c.stream ? <span className="pill pill-blue">{c.stream}</span> : <span className="pill pill-grey">No discipline</span>}
              <span className="pill pill-grey">{c.type || "Private"}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => startEdit(c)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteCollege(c)}>Delete</button>
            </div>
          </div>
          <table className="data-table">
            <thead><tr><th>Branch</th><th>Code</th><th>Total</th><th>Vacant Seats</th><th></th></tr></thead>
            <tbody>
              {c.branches.map((b) => (
                <tr key={b._id}>
                  <td>{b.branchName}</td>
                  <td>{b.branchCode}</td>
                  <td>{b.totalSeats ?? 0}</td>
                  <td><input type="number" min="0" className="seat-input" value={b.vacantSeats}
                    onChange={(e) => onSeatChange(c._id, b._id, e.target.value)} /></td>
                  <td><button className="btn btn-primary btn-sm" onClick={() => saveSeat(c._id, b)}>Save</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="card" id="college-form">
        <h3 className="college-head">{editingId ? "Edit College" : "Add New College"}</h3>
        {editingId && <p className="muted-line">Editing an existing college. Change anything and click Update — or Cancel to discard.</p>}
        <div className="add-row">
          <div className="field"><label>Name</label><input name="name" value={form.name} onChange={onField} /></div>
          <div className="field"><label>Code</label><input name="code" value={form.code} onChange={onField} /></div>
          <div className="field"><label>City</label><input name="city" value={form.city} onChange={onField} /></div>
        </div>
        <div className="add-row">
          <div className="field"><label>Discipline (Stream) *</label>
            <select name="stream" value={form.stream} onChange={onField}>
              <option value="">— Select discipline —</option>
              {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field"><label>Type</label>
            <select name="type" value={form.type} onChange={onField}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <h4 className="pref-title">Branches</h4>
        {form.branches.map((b, i) => (
          <div className="add-row" key={i}>
            <div className="field"><label>Branch name</label>
              <input value={b.branchName} onChange={(e) => onBranchField(i, "branchName", e.target.value)} /></div>
            <div className="field"><label>Branch code</label>
              <input value={b.branchCode} onChange={(e) => onBranchField(i, "branchCode", e.target.value)} /></div>
            <div className="field"><label>Total seats</label>
              <input type="number" min="0" value={b.totalSeats} onChange={(e) => onBranchField(i, "totalSeats", e.target.value)} /></div>
            <div className="field"><label>Vacant seats</label>
              <input type="number" min="0" value={b.vacantSeats} onChange={(e) => onBranchField(i, "vacantSeats", e.target.value)} /></div>
            <button className="mini-btn danger" onClick={() => removeBranchRow(i)} disabled={form.branches.length === 1}>✕</button>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={addBranchRow}>+ Add branch</button>
        <div className="btn-bar">
          <button className="btn btn-primary" onClick={saveCollege}>{editingId ? "Update College" : "Create College"}</button>
          {editingId && <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>}
        </div>
      </div>
    </Layout>
  );
}