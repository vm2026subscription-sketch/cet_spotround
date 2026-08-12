import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, SearchX, Printer, ArrowLeft } from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../lib/apiError";
import { ErrorState, EmptyState, CardSkeleton } from "../components/states";

export default function Result() {
  const { user } = useAuth();
  const [state, setState] = useState("loading");
  const [allotment, setAllotment] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setState("loading");
    setError("");
    api.get("/allocations/me")
      .then((res) => { setAllotment(res.data); setState("allotted"); })
      .catch((err) => {
        if (err.response?.status === 404) setState("none");
        else { setError(apiErrorMessage(err, "Could not load your result.")); setState("error"); }
      });
  };
  useEffect(() => { load(); }, []);

  return (
    <Layout>
      <h1 className="page-title">Seat Allotment Result</h1>

      {state === "loading" && <CardSkeleton lines={5} />}

      {state === "allotted" && (
        <div className="letter">
          <div className="letter-head">
            <div>
              <div className="letter-brand">Vidyarthi Mitra · Virtual CAP Portal</div>
              <div className="letter-sub">Centralized Admission Process — Round IV (Institute Level)</div>
            </div>
            <span className="letter-badge"><Award size={16} aria-hidden /> ALLOTTED</span>
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

          <div className="letter-actions">
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Printer size={15} aria-hidden /> Print / Save as PDF
            </button>
            <Link to="/student" className="btn btn-ghost">
              <ArrowLeft size={15} aria-hidden /> Back to dashboard
            </Link>
          </div>
        </div>
      )}

      {state === "none" && (
        <EmptyState
          icon={SearchX}
          title="No seat allotted yet"
          message="Either the allocation hasn't run, or no seat from your preference list was available at your merit rank. Check back after the results are published."
        >
          <Link to="/student" className="btn btn-primary">Back to dashboard</Link>
        </EmptyState>
      )}

      {state === "error" && <ErrorState title="Unable to load your result" message={error} onRetry={load} />}
    </Layout>
  );
}
