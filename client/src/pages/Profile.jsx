import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";
import { apiErrorMessage } from "../lib/apiError";
import { ErrorState, CardSkeleton } from "../components/states";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError("");
    api.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch((err) => setError(apiErrorMessage(err, "Could not load your profile.")))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <Layout>
      <h1 className="page-title">My Profile</h1>

      {loading && <CardSkeleton lines={6} />}
      {!loading && error && <ErrorState title="Unable to load your profile" message={error} onRetry={load} />}

      {!loading && user && (
        <div className="card">
          <table className="profile-table">
            <tbody>
              <tr><th scope="row">Name</th><td>{user.name}</td></tr>
              <tr><th scope="row">Email</th><td>{user.email}</td></tr>
              <tr><th scope="row">Role</th><td style={{ textTransform: "capitalize" }}>{user.role}</td></tr>
              <tr><th scope="row">CET Application ID</th><td>{user.cetApplicationId || "—"}</td></tr>
              <tr><th scope="row">CET Percentile</th><td>{user.cetPercentile ?? "—"}</td></tr>
              <tr><th scope="row">Category</th><td>{user.category || "—"}</td></tr>
            </tbody>
          </table>
          <p className="muted-line" style={{ margin: "14px 0 0" }}>
            These details are used for merit ranking during allocation. Contact the administrator if anything is incorrect.
          </p>
        </div>
      )}
    </Layout>
  );
}
