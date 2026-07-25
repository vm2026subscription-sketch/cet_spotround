import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, SearchX } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Result() {
  const { user } = useAuth();
  const [state, setState] = useState("loading");
  const [allotment, setAllotment] = useState(null);

  useEffect(() => {
    api.get("/allocations/me")
      .then((res) => { setAllotment(res.data); setState("allotted"); })
      .catch((err) => setState(err.response?.status === 404 ? "none" : "error"));
  }, []);

  return (
    <Layout>
      <h1 className="page-title">Seat Allotment Result</h1>

      {state === "loading" && <div className="card"><p className="muted-line">Checking your result…</p></div>}

      {state === "allotted" && (
        <div className="letter">
          <div className="letter-head">
            <div>
              <div className="letter-brand">Vidyarthi Mitra · CAP Portal</div>
              <div className="letter-sub">Centralized Admission Process — Round IV (Institute Level)</div>
            </div>
            <span className="letter-badge"><Award size={16} /> ALLOTTED</span>
          </div>

          <h2 className="letter-title">Provisional Seat Allotment Letter</h2>
          <p className="letter-line">
            This is to confirm that the following seat has been provisionally allotted to <strong>{user?.name || "the candidate"}</strong>,
            based on merit and preference order:
          </p>

          <div className="letter-grid">
            <div className="letter-field"><span>College</span><strong>{allotment.college?.name}</strong></div>
            <div className="letter-field"><span>College Code</span><strong>{allotment.college?.code}</strong></div>
            <div className="letter-field"><span>City</span><strong>{allotment.college?.city}</strong></div>
            <div className="letter-field"><span>Branch</span><strong>{allotment.branchName}</strong></div>
            <div className="letter-field"><span>Round</span><strong>{allotment.round}</strong></div>
          </div>

          <p className="letter-note">
            Please follow the official reporting instructions to confirm and secure your seat.
            This letter is provisional and subject to document verification.
          </p>
          <Link to="/student" className="back-link">← Back to dashboard</Link>
        </div>
      )}

      {state === "none" && (
        <div className="empty-state">
          <span className="empty-icon"><SearchX size={40} /></span>
          <h3>No seat allotted yet</h3>
          <p>Either the allocation hasn't run, or no seat from your preference list was available at your merit rank. Check back after the results are published.</p>
          <Link to="/student" className="btn btn-primary">Back to dashboard</Link>
        </div>
      )}

      {state === "error" && <div className="auth-error">Could not load your result. Try again later.</div>}
    </Layout>
  );
}