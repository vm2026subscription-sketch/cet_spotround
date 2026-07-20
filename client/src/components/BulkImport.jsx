import { useState } from "react";
import * as XLSX from "xlsx";
import api from "../api";

export default function BulkImport({ onDone }) {
  const [colleges, setColleges] = useState([]); // parsed + grouped colleges
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);   // summary returned by the backend
  const [saving, setSaving] = useState(false);

  // 1) Read the .xlsx the admin picked and turn it into rows
  const handleFile = (e) => {
    setError(""); setResult(null); setColleges([]);
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];              // first tab
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        setColleges(groupRows(rows));
      } catch {
        setError("Could not read that file. Use a valid .xlsx from the template.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 2) Turn "one row per branch" into "one object per college"
  const groupRows = (rows) => {
    const map = new Map();
    rows.forEach((r) => {
      const code = String(r.code || "").trim();
      if (!code) return; // skip blank rows
      if (!map.has(code)) {
        map.set(code, {
          name: String(r.name || "").trim(),
          code,
          city: String(r.city || "").trim(),
          stream: String(r.stream || "").trim(),
          type: String(r.type || "").trim() || "Private",
          branches: [],
        });
      }
      const branchName = String(r.branchName || "").trim();
      if (branchName) {
        map.get(code).branches.push({
          branchName,
          branchCode: String(r.branchCode || "").trim(),
          totalSeats: Number(r.totalSeats) || 0,
          vacantSeats: Number(r.vacantSeats) || 0,
        });
      }
    });
    return [...map.values()];
  };

  // 3) Send the grouped colleges to your backend engine
  const handleConfirm = async () => {
    setError(""); setSaving(true);
    try {
      const res = await api.post("/colleges/bulk", { colleges });
      setResult(res.data);
      setColleges([]); setFileName("");
      onDone && onDone(); // ask the parent page to refresh its college list
    } catch (err) {
      setError(err.response?.data?.message || "Import failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h3 className="college-head">Bulk Import from Excel</h3>
      <p className="muted-line">
        Upload an .xlsx (one row per branch). Existing colleges are updated by code; new ones are added.
      </p>

      {error && <div className="auth-error">{error}</div>}
      {result && (
        <div className="auth-success">
          Import complete — {result.created} created, {result.updated} updated
          {result.failed > 0 ? `, ${result.failed} skipped` : ""}.
          {result.errors?.length > 0 && (
            <ul>{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          )}
        </div>
      )}

      <div className="btn-bar">
        <label className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}>
          Choose Excel file
          <input type="file" accept=".xlsx,.xls" hidden onChange={handleFile} />
        </label>
        {fileName && <span className="muted-line">{fileName}</span>}
      </div>

      {colleges.length > 0 && (
        <>
          <h4 className="pref-title">Preview — {colleges.length} colleges found</h4>
          <table className="data-table">
            <thead>
              <tr><th>Code</th><th>Name</th><th>City</th><th>Stream</th><th>Type</th><th>Branches</th></tr>
            </thead>
            <tbody>
              {colleges.map((c) => (
                <tr key={c.code}>
                  <td>{c.code}</td>
                  <td>{c.name}</td>
                  <td>{c.city}</td>
                  <td>{c.stream || "—"}</td>
                  <td>{c.type}</td>
                  <td>{c.branches.length} branch(es)</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={saving}>
            {saving ? "Importing…" : `Confirm & Import ${colleges.length} colleges`}
          </button>
        </>
      )}
    </div>
  );
}