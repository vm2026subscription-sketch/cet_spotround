import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import api from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    cetApplicationId: "", cetPercentile: "", category: "OPEN",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      await api.post("/auth/register", {
        ...form,
        cetPercentile: form.cetPercentile === "" ? undefined : Number(form.cetPercentile),
      });
      setSuccess("Registration successful! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <aside className="auth-side">
        <Link to="/" className="auth-side-brand">
          <span className="app-brand-mark" aria-hidden />
          <span>
            <div className="app-brand-title">Virtual CAP Portal</div>
            <div className="app-brand-sub" style={{ color: "rgba(255,255,255,0.65)" }}>Government of Maharashtra</div>
          </span>
        </Link>
        <div className="auth-side-copy">
          <span className="auth-side-eyebrow"><ShieldCheck size={13} /> Candidate Registration</span>
          <h1 className="auth-side-title">Create your candidate account.</h1>
          <p className="auth-side-sub">
            Register once with your MHT-CET credentials and use the portal for every CAP round through the admission cycle.
          </p>
          <ul className="auth-side-list">
            <li><CheckCircle2 size={15} /> Verified against your CET application</li>
            <li><CheckCircle2 size={15} /> Category-wise merit computation</li>
            <li><CheckCircle2 size={15} /> Preference list carries across rounds</li>
          </ul>
        </div>
        <div className="auth-side-foot">CAP 2026 · Round IV · Institute Level</div>
      </aside>

      <section className="auth-main auth-main-wide">
        <div className="auth-panel">
          <div className="auth-panel-head">
            <h2 className="auth-panel-title">Register as a candidate</h2>
            <p className="auth-panel-sub">Provide your MHT-CET details to begin.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="grid-2">
              <div className="field">
                <label>Full name</label>
                <input name="name" value={form.name} onChange={onChange} placeholder="As per CET application" required />
              </div>
              <div className="field">
                <label>Email address</label>
                <input type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" required />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={onChange} placeholder="Choose a strong password" required />
              <span className="field-hint">Use at least 8 characters with a mix of letters and numbers.</span>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>CET Application ID</label>
                <input name="cetApplicationId" value={form.cetApplicationId} onChange={onChange} placeholder="e.g. EN25xxxxxx" />
              </div>
              <div className="field">
                <label>CET Percentile *</label>
                <input type="number" step="0.01" min="0" max="100" required
                  name="cetPercentile" value={form.cetPercentile} onChange={onChange} placeholder="0.00 – 100.00" />
              </div>
            </div>

            <div className="field">
              <label>Category</label>
              <select name="category" value={form.category} onChange={onChange}>
                {["OPEN","OBC","SC","ST","EWS","NT","SBC"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
              {loading ? "Creating account…" : (<>Create account <ArrowRight size={16} /></>)}
            </button>
          </form>

          <div className="auth-foot">Already registered? <Link to="/login">Sign in instead</Link></div>
        </div>
      </section>
    </div>
  );
}
