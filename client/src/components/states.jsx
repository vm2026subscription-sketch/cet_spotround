import { AlertTriangle } from "lucide-react";

/** Error panel with a retry action — use instead of bare error text for failed page loads. */
export function ErrorState({ title = "Unable to load data", message, onRetry, retryLabel = "Try again" }) {
  return (
    <div className="error-state" role="alert">
      <span className="empty-icon"><AlertTriangle size={26} /></span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry}>{retryLabel}</button>
      )}
    </div>
  );
}

/** Generic empty state panel. */
export function EmptyState({ icon: Icon, title, message, children }) {
  return (
    <div className="empty-state">
      {Icon && <span className="empty-icon"><Icon size={36} /></span>}
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {children}
    </div>
  );
}

/** Shimmer line — width in px or CSS value. */
export function SkLine({ w = 120, h = 12, style }) {
  return <span className="sk-line" style={{ width: w, height: h, ...style }} aria-hidden />;
}

/** Table body skeleton: `rows` × `cols` shimmer cells. */
export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <tbody aria-hidden>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c}><SkLine w={c === 0 ? "70%" : "50%"} /></td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/** Full-card page skeleton. */
export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="card" aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <p key={i} style={{ marginBottom: 10 }}>
          <SkLine w={`${85 - i * 18}%`} />
        </p>
      ))}
    </div>
  );
}
