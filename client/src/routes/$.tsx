import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// Host the react-router-dom SPA under a TanStack splat so every URL renders it.
// Client-only: react-router-dom's BrowserRouter requires window.
const AppShell = lazy(() => import("../AppShell"));

function BootFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #f6f8fb)",
      }}
      aria-busy="true"
      aria-label="Loading portal"
    >
      <span className="spinner spinner-dark" style={{ width: 22, height: 22 }} />
    </div>
  );
}

export const Route = createFileRoute("/$")({
  component: () => (
    <ClientOnly fallback={<BootFallback />}>
      <Suspense fallback={<BootFallback />}>
        <AppShell />
      </Suspense>
    </ClientOnly>
  ),
});
