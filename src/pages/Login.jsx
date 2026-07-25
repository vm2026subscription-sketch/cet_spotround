import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/student");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
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
          <span className="auth-side-eyebrow"><ShieldCheck size={13} /> Secure Admission Access</span>
          <h1 className="auth-side-title">One portal for every CAP round.</h1>
          <p className="auth-side-sub">
            Track vacancies, submit preferences, and download your provisional allotment letter — all in a single verified workspace.
          </p>
          <ul className="auth-side-list">
            <li><CheckCircle2 size={15} /> Real-time seat visibility across institutes</li>
            <li><CheckCircle2 size={15} /> Merit-based automated allocation</li>
            <li><CheckCircle2 size={15} /> Signed provisional allotment letters</li>
          </ul>
        </div>

        <div className="auth-side-foot">CAP 2026 · Round IV · Institute Level</div>
      </aside>

      <section className="auth-main">
        <div className="auth-panel">
          <div className="auth-panel-head">
            <h2 className="auth-panel-title">Sign in to your account</h2>
            <p className="auth-panel-sub">Candidate and administrator access.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label htmlFor="email">Email address</label>
              <div className="input-icon">
                <Mail size={15} />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoComplete="email" />
              </div>
            </div>
            <div className="field">
              <div className="field-row">
                <label htmlFor="password">Password</label>
                <a href="#" className="field-link" onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>
              <div className="input-icon">
                <Lock size={15} />
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" required autoComplete="current-password" />
              </div>
            </div>

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
              {loading ? "Signing in…" : (<>Sign in <ArrowRight size={16} /></>)}
            </button>
          </form>

          <div className="auth-foot">
            New candidate? <Link to="/register">Create an account</Link>
          </div>
        </div>

        <p className="auth-tos">By continuing you agree to the portal terms and privacy notice.</p>
      </section>
    </div>
  );
}
