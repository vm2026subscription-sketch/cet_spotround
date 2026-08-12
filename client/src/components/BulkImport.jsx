import { useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet } from "lucide-react";
import api from "../api";
import { apiErrorMessage } from "../lib/apiError";

export default function BulkImport({ onDone }) {
  const [colleges, setColleges] = useState([]); // parsed + grouped colleges
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);   // summary returned by the backend
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

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
        const grouped = groupRows(rows);
        if (grouped.length === 0) {
          setError("No usable rows found. Make sure the sheet has 'code' and 'branchName' columns.");
          return;
        }
        setColleges(grouped);
      } catch {
        setError("Could not read that file. Use a valid .xlsx that follows the column format below.");
      }
    };
    reader.readAsArrayBuffer(file);
    // allow picking the same file again after a failed attempt
    e.target.value = "";
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
          course: String(r.course || "").trim(),
          totalSeats: Number(r.totalSeats) || 0,
          vacantSeats: Number(r.vacantSeats) || 0,
          instituteQuota: Number(r.instituteQuota) || 0,
        });
      }
    });
    return [...map.values()];
  };

  // 3) Send the grouped colleges to the backend
  const handleConfirm = async () => {
    setError(""); setSaving(true);
    try {
      const res = await api.post("/colleges/bulk", { colleges });
      setResult(res.data);
      setColleges([]); setFileName("");
      toast.success("Import complete", {
        description: `${res.data.created} created · ${res.data.updated} updated${res.data.failed > 0 ? ` · ${res.data.failed} skipped` : ""}.`,
      });
      onDone && onDone(); // ask the parent page to refresh its college list
    } catch (err) {
      const msg = apiErrorMessage(err, "Import failed. Please try again.");
      setError(msg);
      toast.error("Import failed", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h3 className="import-head"><FileSpreadsheet size={17} aria-hidden /> Bulk Import from Excel</h3>
      <p className="muted-line" style={{ marginBottom: 6 }}>
        Upload an .xlsx with one row per branch. Existing colleges are updated by code; new ones are added.
      </p>
      <p className="muted-line" style={{ fontSize: 12 }}>
        Expected columns: <code>code, name, city, stream, type, branchName, branchCode, course, totalSeats, vacantSeats, instituteQuota</code>
      </p>

      {error && <div className="auth-error" role="alert">{error}</div>}
      {result && (
        <div className="auth-success" role="status">
          Import complete — {result.created} created, {result.updated} updated
          {result.failed > 0 ? `, ${result.failed} skipped` : ""}.
          {result.errors?.length > 0 && (
            <ul>{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          )}
        </div>
      )}

      <div className="btn-bar">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()}>
          <Upload size={14} aria-hidden /> Choose Excel file
        </button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={handleFile} aria-label="Excel file to import" />
        {fileName && <span className="muted-line" style={{ marginBottom: 0 }}>{fileName}</span>}
      </div>

      {colleges.length > 0 && (
        <>
          <h4 className="pref-title">Preview — {colleges.length} colleges found</h4>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th scope="col">Code</th><th scope="col">Name</th><th scope="col">City</th><th scope="col">Stream</th><th scope="col">Type</th><th scope="col">Branches</th></tr>
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
          </div>
          <div className="btn-bar">
            <button className="btn btn-primary" onClick={handleConfirm} disabled={saving}>
              {saving && <span className="spinner" aria-hidden />}
              {saving ? "Importing…" : `Confirm & Import ${colleges.length} colleges`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
