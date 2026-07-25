import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// Host the react-router-dom SPA under a TanStack splat so every URL renders it.
// Client-only: react-router-dom's BrowserRouter requires window.
const AppShell = lazy(() => import("../AppShell"));

export const Route = createFileRoute("/$")({
  component: () => (
    <ClientOnly fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <AppShell />
      </Suspense>
    </ClientOnly>
  ),
});
