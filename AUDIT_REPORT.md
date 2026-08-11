# Virtual CAP Counselling Portal — UI/UX & Frontend Audit Report

Date: 2026-08-11 · Scope: `client/` only (backend inspected read-only, never modified)

---

## A. Executive Summary

The portal is a functional Lovable-generated TanStack Start shell hosting a `react-router-dom` SPA (React 19, Tailwind v4 tokens + a hand-rolled semantic CSS system in `styles.css`). The information architecture is sound and the visual foundation is better than average, but the product currently ships with a **blue brand** (the requirement is **orange**), several **fake/dead UI elements** (search box, notification bell, settings links, forgot-password), **no search/filter/pagination on the most data-heavy student page** (Available Seats renders every branch row in the state at once), **missing loading skeletons**, **tables that clip on mobile** (`overflow: hidden` wrapper), a **stale-session bug** (401 clears the token but not the user), and a **user email that never displays** (login response has no email and the app never hydrates the profile).

Totals: **6 × P0, 14 × P1, 15 × P2, 8 × P3 = 43 issues.**

## B. Current Architecture

- `client/` — Vite 8 + `@lovable.dev/vite-tanstack-config`, TanStack Start SSR shell (`routes/__root.tsx`) hosting the actual app client-only under a `/$` splat (`AppShell.tsx` → `BrowserRouter` → `App.jsx`).
- Styling — Tailwind v4 is loaded but pages use a **hand-rolled class system** in `src/styles.css` (1,650 lines, well-tokenized: `--primary-*`, surfaces, shadows). 46 shadcn/ui components exist in `components/ui/` but are **not imported by any page** (tree-shaken out; harmless dead weight).
- State — `AuthContext` (localStorage token + user), per-page `useState`/`useEffect` + axios instance (`api.js`). React Query is installed but unused.
- Backend (read-only) — Express/Mongoose: `/api/auth`, `/api/colleges(+/public,/bulk)`, `/api/applications`, `/api/allocations`, `/api/round`. Login returns `{token, user:{id,name,role}}` (no email). `GET /auth/me` returns the full profile.

## C. Page-by-Page Audit

### Home (`Home.jsx`) — public marketing
| Problem | Why it matters | Sev | Fix |
|---|---|---|---|
| Hardcoded **blue** inline styles (`#2563eb`, `#f8fafc`) in discipline cards | Off-brand, bypasses tokens | P0 | Move to token classes |
| Discipline card expander is a click-only `<div>` | Not keyboard/screen-reader operable | P1 | Real `<button>` with `aria-expanded` |
| Marketing nav disappears < 900px with **no mobile menu** | Process/Timeline/FAQ/Institutes unreachable on phones | P1 | Hamburger + slide-down menu |
| Footer "Resources" links are dead `href="#"` | Placeholder UI in production | P1 | Link to real sections only |
| Brand name differs across pages ("CAP Admission Portal" / "Virtual CAP Portal" / "CAP Vacancy Portal") | Erodes trust | P2 | One brand everywhere |
| FAQ answers not linked via `aria-controls`; chevron only cue | Minor a11y gap | P3 | ids + `aria-controls` |

### Login / Register (`Login.jsx`, `Register.jsx`)
| Problem | Why | Sev | Fix |
|---|---|---|---|
| "Forgot password?" is a dead link (`preventDefault`) | Misleading during a stressful flow; no backend endpoint exists | P1 | Remove (document backend gap) |
| No password visibility toggle | Typos on mobile; OTP-era users expect it | P2 | Show/hide toggle |
| Required-field marking inconsistent ("CET Percentile *" vs nothing elsewhere) | Users can't predict validation | P2 | Uniform required markers |
| Register allows any password length (backend accepts any; change-password later requires 6+) | Confusing downstream failure | P2 | `minLength=6` + hint text |
| Auth side-panel gradient is blue | Re-brand | P0 (part of token swap) | Orange-accented dark panel |

### Student Dashboard (`StudentHome.jsx`)
| Problem | Why | Sev | Fix |
|---|---|---|---|
| Progress steps "Profile" & "Browse seats" are hardcoded `done: true` → 50–75% before doing anything | Misleading status for a stressed applicant | P1 | Derive from real profile/application state |
| Round status pill shows "…" forever if `/round` fails | Silent failure | P2 | Error fallback text + retry |
| Deadlines/activity are hardcoded | Acceptable (no backend dates) but should read as guidance | P3 | Label as indicative schedule |

### Available Seats (`AvailableSeats.jsx`) — the core CAP page
| Problem | Why | Sev | Fix |
|---|---|---|---|
| **No search, no filters, no pagination** — every branch of every college renders as one giant table | With a realistic dataset (1,400+ colleges) this is thousands of DOM rows: unusable and slow | **P0** | Search + city filter + hide-zero toggle + incremental "Show more" |
| Apply button has no in-flight state — double-click can double-add the same preference (two racing GET→PUT cycles) | Data corruption from the UI | **P0** | Per-row pending state, disable while applying |
| Success/error messages render at top of page — invisible when clicking row 900 | Users don't get feedback | P1 | Toasts (sonner already installed) |
| Plain-text "Loading…" on a blank page | Perceived slowness | P1 | Table skeleton |
| Table wrapper `overflow: hidden` clips columns on mobile | Data becomes unreachable | **P0** (global table issue) | Scrollable `.table-scroll` wrapper + sticky header |

### My Application (`ApplicationForm.jsx`)
| Problem | Why | Sev | Fix |
|---|---|---|---|
| Reorder/remove buttons are text glyphs "↑ ↓ ✕" | Inconsistent icon language, tiny touch targets | P2 | Lucide icons, ≥40px hit area |
| No feedback toast on save; success banner top-only | Same feedback gap | P1 | Toast + inline banner |
| Add-row selects have no empty/`No colleges` handling | Edge-case confusion | P3 | Guard copy |

### Result (`Result.jsx`)
| Problem | Why | Sev | Fix |
|---|---|---|---|
| Allotment letter can't be printed/saved | The letter is the whole point of the flow | P2 | Print button + print stylesheet |

### Profile (`Profile.jsx`)
| Problem | Why | Sev | Fix |
|---|---|---|---|
| No loading state; error has no retry | Blank flash | P2 | Skeleton + retry |

### Public Colleges (`PublicColleges.jsx`)
| Problem | Why | Sev | Fix |
|---|---|---|---|
| `course` filter arrives via URL but has **no visible control** — changing stream clears it from the URL yet keeps filtering | Users see mysteriously missing colleges | P1 | Removable filter chip synced to URL |
| All rows render at once (same scale problem as seats) | Slow with real data | P1 | "Show more" pagination + result count |
| Header/nav differs from Home header | Inconsistent navigation | P2 | Shared `SiteHeader` |
| 8-column table on mobile clips | Same global table bug | P0 (shared) | `.table-scroll` |

### Admin Overview (`AdminHome.jsx`)
| Problem | Why | Sev | Fix |
|---|---|---|---|
| Inline hex colors per card (blue/violet/amber/green) | Bypasses tokens; off-brand | P1 | Token-based tint classes |
| No loading skeleton for stats (0s flash then jump) | Feels broken | P2 | Skeletons |

### Admin Colleges (`AdminColleges.jsx`)
| Problem | Why | Sev | Fix |
|---|---|---|---|
| Renders **every college as a full card+table** with no search or pagination | Admin page dies at real data volume | **P0** | Search + incremental rendering |
| `window.confirm` for destructive delete | No styling, no context, easy to fat-finger | P2 | Accessible in-app confirm dialog |
| Seat save feedback only at page top; no per-row state | Same feedback gap | P1 | Toast + per-row saving state |
| Bulk import: file picker `<label>` not keyboard-accessible; no expected-columns hint | A11y + guesswork | P2 | Button-triggered input + column hint |

### Admin Round / Applications / Allocation
| Problem | Why | Sev | Fix |
|---|---|---|---|
| `window.confirm` before running allocation | Highest-stakes action in the app | P2 | In-app confirm dialog |
| Applications list: no search/count; unbounded table | Scale | P1 | Search + count + scroll container |
| No skeletons | Perceived slowness | P2 | Skeletons |

### App Shell (`Layout.jsx`)
| Problem | Why | Sev | Fix |
|---|---|---|---|
| **Fake global search** ("⌘K" does nothing), **fake notification bell** with permanent red dot, dead Settings/Help links | Placeholder UI in production; a red dot that lies to anxious students | **P0** | Remove fakes; Help → real FAQ |
| `user.email` shown in menu is **always empty after login** (login API returns no email; app never calls `/auth/me`) | Broken-looking account menu | P1 | Hydrate profile from `/auth/me` |
| User menu: no Escape close / focus management | A11y | P2 | Escape + focus return |
| Mobile drawer: no Escape, no `aria-modal` | A11y | P2 | Add semantics |

## D. UI Problems (cross-cutting)
1. Brand color is blue `#0056d2` throughout tokens + ~20 hardcoded blue literals (gradients, avatar, glows, scroll shadows). Requirement: **orange**.
2. Five parallel primary-button classes (`.btn-primary`, `.btn-keep`, `.add-btn`, `.run-btn`, `.submit-btn`, `.btn-apply`) — consolidate.
3. Mixed icon language: Lucide + Unicode glyphs (↑↓✕→▲▼).
4. Inline styles scattered in JSX (Home, AdminHome, PublicColleges, AdminAllocation).
5. ~200 lines of dead CSS from two older shells (`.portal-body`, `.sidebar`, `.auth-wrap`, `.auth-card`, old `.hero`, `.btn-logout`, `.tn-user`, `.tn-role`, `.view-all-*`).

## E. UX Problems (cross-cutting)
Feedback appears only at page top; destructive actions use browser dialogs; no toasts; fake affordances; misleading progress; inconsistent brand naming; dead links.

## F. Responsive Problems
Tables clip under `overflow: hidden` wrappers (all data pages); marketing nav unreachable on mobile; admin add-branch rows wrap awkwardly; auth pages OK; dashboards OK.

## G. Accessibility Problems
Click-only `<div>` expanders; icon buttons lacking labels in places; menus without Escape/focus handling; table headers missing `scope`; white-on-`#ea580c`-style contrast traps to avoid in the new palette (solved by using orange-700 `#c2410c`-class fills for text-bearing surfaces); no `prefers-reduced-motion` handling.

## H. Frontend Bugs
1. Stale session: 401 removes token but keeps `user` → every page fails quietly (`api.js`).
2. `user.email` never populated (login payload).
3. Double-apply race on Available Seats.
4. `course` filter ghost state on PublicColleges.
5. Round pill stuck on "…" on fetch failure.
6. Progress % wrong by construction (hardcoded `done: true`).

## I. Performance Problems
Unbounded table rendering on 3 pages (seats, public colleges, admin colleges/applications); no incremental rendering; everything else is fine (bundle is lean; shadcn dead code is tree-shaken; fonts preconnected).

## J. Code Quality Problems
Dead CSS; duplicated button styles; inline styles; unused `hero.png`; stray formatting in `PublicColleges.jsx`; no shared error-message helper (each page hand-rolls `err.response?.data?.message`); React Query installed but unused (left as-is — using it would be a rewrite).

## K. Design System Problems
Tokens exist but blue; no motion/reduced-motion tokens; no shared table-scroll primitive; no chip/skeleton-row/confirm-dialog primitives.

## L. CAP-specific UX Problems
Seats page not searchable/filterable (the single most important student task); no result counts anywhere; CAP-vs-institute-quota legend easy to miss; no way to print the allotment letter; admin bulk import gives no column guidance.

## M. Recommended New Components
`SiteHeader`, `SiteFooter` (shared public shell), `ConfirmDialog`, `ErrorState` (message + retry), `EmptyState` (exists as CSS only → componentize), `TableSkeleton`/`Skeleton`, `FilterChip`, `ShowMore` pagination pattern, global `Toaster` (sonner), `apiErrorMessage()` helper.

## N. Recommended Refactoring
Token swap to orange; consolidate button classes; extract shared public header/footer; centralize auth hydration + 401 handling; wrap all data tables in `.table-scroll`; replace Unicode glyph buttons with Lucide; remove dead CSS & fake UI.

## O. Final Prioritized Implementation Plan
1. **P0** — Orange design-token system (incl. all hardcoded blues); table scroll containers; Available-Seats search/filter/pagination + apply race fix; Admin-Colleges search/pagination; remove fake search/bell/dead links; 401 session fix.
2. **P1** — Profile hydration (`/auth/me`); toasts for all mutations; skeleton loading everywhere; mobile marketing nav; real progress logic; course filter chip; public-colleges pagination + counts; admin per-row save states; error retry states; keyboard-accessible expanders.
3. **P2** — Confirm dialogs; print letter; password toggle + validation consistency; icon consistency; shared header/footer; menu focus management; bulk-import guidance; required-field markers.
4. **P3** — Dead CSS pruning; `aria-controls`; `prefers-reduced-motion`; content labels.

**Backend issues found while reading (NOT fixed, per scope):** duplicate `POST /colleges/bulk` route + duplicated `module.exports` in `server/routes/colleges.js` (second definitions are dead code; harmless); login payload omits `email` (worked around client-side via `/auth/me`); no forgot-password endpoint (dead link removed client-side); typos in API error strings ("Atleast ont preference").
