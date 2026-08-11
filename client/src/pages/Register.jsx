import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import api from "../api";
import { apiErrorMessage } from "../lib/apiError";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    cetApplicationId: "", cetPercentile: "", category: "OPEN",
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", {
        ...form,
        cetPercentile: form.cetPercentile === "" ? undefined : Number(form.cetPercentile),
      });
      setSuccess("Registration successful! Redirecting to sign in…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(apiErrorMessage(err, "Registration failed. Please try again."));
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
            <div className="app-brand-sub" style={{ color: "rgba(255,255,255,0.65)" }}>Vidyarthi Mitra · Maharashtra</div>
          </span>
        </Link>
        <div className="auth-side-copy">
          <span className="auth-side-eyebrow"><ShieldCheck size={13} aria-hidden /> Candidate Registration</span>
          <h1 className="auth-side-title">Create your candidate account.</h1>
          <p className="auth-side-sub">
            Register once with your MHT-CET credentials and use the portal for every CAP round through the admission cycle.
          </p>
          <ul className="auth-side-list">
            <li><CheckCircle2 size={15} aria-hidden /> Verified against your CET application</li>
            <li><CheckCircle2 size={15} aria-hidden /> Category-wise merit computation</li>
            <li><CheckCircle2 size={15} aria-hidden /> Preference list carries across rounds</li>
          </ul>
        </div>
        <div className="auth-side-foot">CAP 2026 · Round IV · Institute Level</div>
      </aside>

      <section className="auth-main auth-main-wide">
        <div className="auth-panel">
          <div className="auth-panel-head">
            <h2 className="auth-panel-title">Register as a candidate</h2>
            <p className="auth-panel-sub">Provide your MHT-CET details to begin. Fields marked <span style={{ color: "var(--danger)" }}>*</span> are required.</p>
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}
          {success && <div className="auth-success" role="status">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="grid-2">
              <div className="field">
                <label htmlFor="reg-name" className="req">Full name</label>
                <input id="reg-name" name="name" value={form.name} onChange={onChange} placeholder="As per CET application" required autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="reg-email" className="req">Email address</label>
                <input id="reg-email" type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" required autoComplete="email" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="reg-password" className="req">Password</label>
              <div className="input-icon no-icon">
                <input id="reg-password" type={showPw ? "text" : "password"} name="password" className="has-toggle"
                  value={form.password} onChange={onChange} placeholder="Choose a strong password"
                  required minLength={6} autoComplete="new-password" aria-describedby="pw-hint" />
                <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <span className="field-hint" id="pw-hint">At least 6 characters — use a mix of letters and numbers.</span>
            </div>

            <div className="grid-2">
              <div className="field">
                <label htmlFor="reg-cetid">CET Application ID</label>
                <input id="reg-cetid" name="cetApplicationId" value={form.cetApplicationId} onChange={onChange} placeholder="e.g. EN25xxxxxx" />
              </div>
              <div className="field">
                <label htmlFor="reg-pct" className="req">CET Percentile</label>
                <input id="reg-pct" type="number" step="0.01" min="0" max="100" required
                  name="cetPercentile" value={form.cetPercentile} onChange={onChange} placeholder="0.00 – 100.00"
                  aria-describedby="pct-hint" />
                <span className="field-hint" id="pct-hint">Used to rank you during merit-based allocation.</span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="reg-category">Category</label>
              <select id="reg-category" name="category" value={form.category} onChange={onChange}>
                {["OPEN","OBC","SC","ST","EWS","NT","SBC"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
              {loading ? (<><span className="spinner" aria-hidden /> Creating account…</>) : (<>Create account <ArrowRight size={16} aria-hidden /></>)}
            </button>
          </form>

          <div className="auth-foot">Already registered? <Link to="/login">Sign in instead</Link></div>
        </div>
      </section>
    </div>
  );
}
