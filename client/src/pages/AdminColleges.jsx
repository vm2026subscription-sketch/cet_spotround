import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X, SearchX } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";
import BulkImport from "../components/BulkImport";
import ConfirmDialog from "../components/ConfirmDialog";
import { apiErrorMessage } from "../lib/apiError";
import { ErrorState, CardSkeleton } from "../components/states";

const STREAMS = [
  "Technical-PG","Technical-UG","Agricultural Education",
  "Fineart Education","Higher Education_PG","Higher Education_UG",
  "Medical Education_PG","Medical Education_UG","Ayush Education",
];
const TYPES = ["Government", "Private", "Autonomous", "Unaided"];
const PAGE = 20; // college cards rendered at a time

export default function AdminColleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [savingSeat, setSavingSeat] = useState(null); // branchId in flight
  const [savingCollege, setSavingCollege] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [q, setQ] = useState("");
  const [streamFilter, setStreamFilter] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const blankNew = {
    name: "", code: "", city: "", stream: "", type: "Private",
    branches: [{ branchName: "", branchCode: "", totalSeats: 0, vacantSeats: 0, instituteQuota: 0 }],
  };
  const [form, setForm] = useState(blankNew);

  const loadColleges = async () => {
    setLoadError("");
    try { setColleges((await api.get("/colleges")).data); }
    catch (err) { setLoadError(apiErrorMessage(err, "Could not load colleges.")); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadColleges(); }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return colleges.filter((c) => {
      if (streamFilter && c.stream !== streamFilter) return false;
      if (needle && !`${c.name} ${c.code} ${c.city}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [colleges, q, streamFilter]);

  useEffect(() => { setLimit(PAGE); }, [q, streamFilter]);
  const visible = filtered.slice(0, limit);

  const onSeatChange = (collegeId, branchId, value) =>
    setColleges((prev) => prev.map((c) =>
      c._id !== collegeId ? c : { ...c, branches: c.branches.map((b) => (b._id !== branchId ? b : { ...b, vacantSeats: value })) }
    ));

  const saveSeat = async (collegeId, branch) => {
    setSavingSeat(branch._id);
    try {
      await api.patch(`/colleges/${collegeId}/branches/${branch._id}`, { vacantSeats: Number(branch.vacantSeats) });
      toast.success("Seats updated", { description: `${branch.branchName} now shows ${branch.vacantSeats} vacant seats.` });
    } catch (err) {
      toast.error("Could not update seats", { description: apiErrorMessage(err, "Please try again.") });
    } finally {
      setSavingSeat(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/colleges/${deleteTarget._id}`);
      toast.success(`Deleted ${deleteTarget.name}`);
      if (editingId === deleteTarget._id) cancelEdit();
      setDeleteTarget(null);
      loadColleges();
    } catch (err) {
      toast.error("Could not delete college", { description: apiErrorMessage(err, "Please try again.") });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setForm({
      name: c.name, code: c.code, city: c.city,
      stream: c.stream || "", type: c.type || "Private",
      branches: c.branches.length
        ? c.branches.map((b) => ({ _id: b._id, branchName: b.branchName, branchCode: b.branchCode || "", totalSeats: b.totalSeats ?? 0, vacantSeats: b.vacantSeats ?? 0, instituteQuota: b.instituteQuota ?? 0 }))
        : [{ branchName: "", branchCode: "", totalSeats: 0, vacantSeats: 0, instituteQuota: 0 }],
    });
    setError("");
    document.getElementById("college-form")?.scrollIntoView({ behavior: "smooth" });
  };
  const cancelEdit = () => { setEditingId(null); setForm(blankNew); setError(""); };

  const onField = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onBranchField = (i, field, value) =>
    setForm({ ...form, branches: form.branches.map((b, idx) => (idx === i ? { ...b, [field]: value } : b)) });
  const addBranchRow = () =>
    setForm({ ...form, branches: [...form.branches, { branchName: "", branchCode: "", totalSeats: 0, vacantSeats: 0, instituteQuota: 0 }] });
  const removeBranchRow = (i) =>
    setForm({ ...form, branches: form.branches.filter((_, idx) => idx !== i) });

  const saveCollege = async () => {
    setError("");
    if (!form.name || !form.code || !form.city) return setError("College name, code and city are required.");
    if (!form.stream) return setError("Please choose a discipline for this college.");

    const payload = {
      name: form.name, code: form.code, city: form.city, stream: form.stream, type: form.type,
      branches: form.branches.filter((b) => b.branchName.trim()).map((b) => ({
        ...(b._id ? { _id: b._id } : {}),
        branchName: b.branchName, branchCode: b.branchCode,
        totalSeats: Number(b.totalSeats), vacantSeats: Number(b.vacantSeats),
        instituteQuota: Number(b.instituteQuota) || 0,
      })),
    };

    setSavingCollege(true);
    try {
      if (editingId) {
        await api.put(`/colleges/${editingId}`, payload);
        toast.success(`Updated "${form.name}"`);
      } else {
        await api.post("/colleges", payload);
        toast.success(`College "${form.name}" created`);
      }
      cancelEdit();
      loadColleges();
    } catch (err) {
      const msg = apiErrorMessage(err, "Could not save college.");
      setError(msg);
      toast.error("Could not save college", { description: msg });
    } finally {
      setSavingCollege(false);
    }
  };

  if (loading) return <Layout><CardSkeleton lines={5} /></Layout>;

  return (
    <Layout>
      <div className="list-head">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Colleges &amp; Vacant Seats</h1>
        {colleges.length > 0 && <span className="count-badge">{colleges.length.toLocaleString()} colleges</span>}
      </div>

      {loadError && <ErrorState title="Unable to load colleges" message={loadError} onRetry={() => { setLoading(true); loadColleges(); }} />}

      {!loadError && (
        <>
          <BulkImport onDone={loadColleges} />

          {colleges.length > 0 && (
            <div className="toolbar" role="search">
              <input
                className="filter-search"
                type="search"
                placeholder="Search by name, code or city…"
                aria-label="Search colleges"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <select className="filter-select" value={streamFilter} onChange={(e) => setStreamFilter(e.target.value)} aria-label="Filter by discipline">
                <option value="">All Disciplines</option>
                {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="toolbar-count" aria-live="polite">{filtered.length.toLocaleString()} shown</span>
            </div>
          )}

          {colleges.length === 0 && <div className="card">No colleges yet. Import a sheet above or add one below.</div>}
          {colleges.length > 0 && filtered.length === 0 && (
            <div className="card table-msg" style={{ textAlign: "center" }}>
              <SearchX size={18} style={{ verticalAlign: "-4px", marginRight: 8 }} aria-hidden />
              No colleges match your search.
            </div>
          )}

          {visible.map((c) => (
            <div className={`card admin-college-card ${editingId === c._id ? "editing" : ""}`} key={c._id}>
              <div className="college-card-head">
                <h3 className="college-head">{c.name} <span className="college-meta">({c.code} · {c.city})</span></h3>
                <div className="college-tags">
                  {c.stream ? <span className="pill pill-blue">{c.stream}</span> : <span className="pill pill-grey">No discipline</span>}
                  <span className="pill pill-grey">{c.type || "Private"}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => startEdit(c)}>
                    <Pencil size={13} aria-hidden /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(c)}>
                    <Trash2 size={13} aria-hidden /> Delete
                  </button>
                </div>
              </div>
              <div className="table-scroll" style={{ maxHeight: "none" }}>
                <table className="data-table">
                  <thead><tr><th scope="col">Branch</th><th scope="col">Code</th><th scope="col" className="ta-num">Total</th><th scope="col" className="ta-num">Inst. Quota</th><th scope="col" className="ta-num">Vacant Seats</th><th scope="col"><span className="sr-only">Save</span></th></tr></thead>
                  <tbody>
                    {c.branches.map((b) => (
                      <tr key={b._id}>
                        <td>{b.branchName}</td>
                        <td>{b.branchCode}</td>
                        <td className="ta-num">{b.totalSeats ?? 0}</td>
                        <td className="ta-num">{b.instituteQuota ?? 0}</td>
                        <td className="ta-num">
                          <input type="number" min="0" className="seat-input" value={b.vacantSeats}
                            aria-label={`Vacant seats for ${b.branchName}`}
                            onChange={(e) => onSeatChange(c._id, b._id, e.target.value)} />
                        </td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => saveSeat(c._id, b)} disabled={savingSeat === b._id}>
                            {savingSeat === b._id && <span className="spinner" aria-hidden />}
                            {savingSeat === b._id ? "Saving…" : "Save"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {filtered.length > visible.length && (
            <div className="load-more-bar" style={{ border: "none" }}>
              <button className="btn btn-ghost" onClick={() => setLimit((l) => l + PAGE)}>
                Show more colleges ({(filtered.length - visible.length).toLocaleString()} remaining)
              </button>
            </div>
          )}

          <div className="card" id="college-form">
            <h3 className="college-head">{editingId ? "Edit College" : "Add New College"}</h3>
            {editingId && <p className="muted-line">Editing an existing college. Change anything and click Update — or Cancel to discard.</p>}
            {error && <div className="auth-error" role="alert">{error}</div>}
            <div className="add-row">
              <div className="field"><label htmlFor="col-name" className="req">Name</label><input id="col-name" name="name" value={form.name} onChange={onField} /></div>
              <div className="field"><label htmlFor="col-code" className="req">Code</label><input id="col-code" name="code" value={form.code} onChange={onField} /></div>
              <div className="field"><label htmlFor="col-city" className="req">City</label><input id="col-city" name="city" value={form.city} onChange={onField} /></div>
            </div>
            <div className="add-row">
              <div className="field"><label htmlFor="col-stream" className="req">Discipline (Stream)</label>
                <select id="col-stream" name="stream" value={form.stream} onChange={onField}>
                  <option value="">— Select discipline —</option>
                  {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field"><label htmlFor="col-type">Type</label>
                <select id="col-type" name="type" value={form.type} onChange={onField}>
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
                <div className="field"><label>Inst. quota</label>
                  <input type="number" min="0" value={b.instituteQuota} onChange={(e) => onBranchField(i, "instituteQuota", e.target.value)} /></div>
                <button className="mini-btn danger" onClick={() => removeBranchRow(i)} disabled={form.branches.length === 1} aria-label={`Remove branch row ${i + 1}`}>
                  <X size={14} aria-hidden />
                </button>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={addBranchRow}><Plus size={13} aria-hidden /> Add branch</button>
            <div className="btn-bar">
              <button className="btn btn-primary" onClick={saveCollege} disabled={savingCollege}>
                {savingCollege && <span className="spinner" aria-hidden />}
                {editingId ? "Update College" : "Create College"}
              </button>
              {editingId && <button className="btn btn-ghost" onClick={cancelEdit} disabled={savingCollege}>Cancel</button>}
            </div>
          </div>

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            danger
            title={`Delete "${deleteTarget?.name}"?`}
            message="This permanently removes the college, its branches, and any allotments or preferences pointing at it. This cannot be undone."
            confirmLabel="Delete college"
            busy={deleting}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        </>
      )}
    </Layout>
  );
}
