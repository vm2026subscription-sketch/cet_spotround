import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";

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
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-card-head">New Candidate Registration</div>
          <div className="auth-card-body">
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={onChange} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={onChange} required />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" name="password" value={form.password} onChange={onChange} required />
              </div>
              <div className="field">
                <label>CET Application ID</label>
                <input name="cetApplicationId" value={form.cetApplicationId} onChange={onChange} />
              </div>
              <div className="field">
                <label>CET Percentile *</label>
                <input type="number" step="0.01" min="0" max="100" required
                  name="cetPercentile" value={form.cetPercentile} onChange={onChange} />
              </div>
              <div className="field">
                <label>Category</label>
                <select name="category" value={form.category} onChange={onChange}>
                  <option value="OPEN">OPEN</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                  <option value="NT">NT</option>
                  <option value="SBC">SBC</option>
                </select>
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
            <div className="auth-foot">
              Already registered? <Link to="/login">Login here</Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}