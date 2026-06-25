import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/auth/me").then((res) => setUser(res.data)).catch(() => setError("Could not load your profile."));
  }, []);

  return (
    <Layout>
      <h1 className="page-title">My Profile</h1>
      {error && <div className="auth-error">{error}</div>}
      {user && (
        <div className="card">
          <table className="profile-table">
            <tbody>
              <tr><th>Name</th><td>{user.name}</td></tr>
              <tr><th>Email</th><td>{user.email}</td></tr>
              <tr><th>Role</th><td>{user.role}</td></tr>
              <tr><th>CET Application ID</th><td>{user.cetApplicationId || "—"}</td></tr>
              <tr><th>CET Percentile</th><td>{user.cetPercentile ?? "—"}</td></tr>
              <tr><th>Category</th><td>{user.category || "—"}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}