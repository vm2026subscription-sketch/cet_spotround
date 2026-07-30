# Deployment Guide

Backend → Render. Frontend → Vercel. Do the steps in order: the frontend build
needs the backend's URL baked into it.

---

## Step 0 — Credentials (already done)

The app now runs against a fresh cluster in the company Atlas account, migrated
with `server/migrate-db.js`. All 17 documents and the unique indexes on
`users.email` / `colleges.code` came across, so both admin logins still work with
their old passwords. The live connection string lives only in `server/.env`.

This also settles the old leak: `server/.env` was committed in `ef5980f` and
removed in `0d42e00`, but git history still holds it. Those credentials now point
at a cluster this app no longer uses, so they're dead weight. Worth telling
whoever owns that older account to delete the cluster or rotate its password.

`JWT_SECRET` was rotated too — local and production use different values.

## Step 1 — Let Render reach Atlas

**Not done yet — this will break the deploy if skipped.** Atlas currently only
allows the one IP it added when the cluster was created. Render's outbound IPs
aren't fixed on the free plan, so the cluster has to accept any origin:

Atlas → **Network Access** → **Add IP Address** → **Allow Access from Anywhere**
(`0.0.0.0/0`) → Confirm.

The database is still password-protected; this only removes the IP filter.

## Step 2 — Backend on Render

`render.yaml` at the repo root already describes the service, so use the Blueprint flow:

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect the `truealok/cap-portal` repo → Render reads `render.yaml`.
3. It will prompt for the two secrets marked `sync: false`. Both are on disk —
   don't retype them, copy the values:
   - `MONGO_URI` → the `MONGO_URI=` line in `server/.env` (already points at the
     new cluster, `/capportal` included)
   - `JWT_SECRET` → `server/PRODUCTION_SECRET.txt`

   Neither file is in git, which is why Render has to be told them by hand.
4. **Apply** and wait for the first build.

Do **not** set `PORT` — Render injects its own, and `server.js` already reads it.

When it's live, check `https://<your-service>.onrender.com/` returns
`CAP Round 4 API is running`. Copy that base URL.

Then delete `server/PRODUCTION_SECRET.txt` — Render has the value now.

> Free plan sleeps after ~15 min idle, so the first request after a pause takes
> roughly 50 s. Later requests are normal speed.

## Step 3 — Frontend on Vercel

1. [vercel.com/new](https://vercel.com/new) → import `truealok/cap-portal`.
2. **Root Directory** → `client`. This one matters — the repo root has no app in it.
3. Framework preset: leave whatever it auto-detects; the build script is already correct.
4. Add **Environment Variables** (all environments):

   | Name | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-render-service>.onrender.com/api` |
   | `NITRO_PRESET` | `vercel` |

   `NITRO_PRESET` is required. Without it the build defaults to
   `cloudflare-module` and emits a Cloudflare Worker that Vercel can't serve.

   Note the `/api` suffix on `VITE_API_URL` — `src/api.js` appends paths directly
   to it, so leaving it off makes every request 404.

5. **Deploy**.

`VITE_*` values are inlined into the bundle at build time, not read at runtime. If
you ever change `VITE_API_URL`, you must redeploy for it to take effect.

## Step 4 — Verify

1. Open the Vercel URL, register a new student, log in.
2. If login hangs on the very first try, that's the Render cold start — retry once.
3. Browser devtools → Network: requests should go to the `onrender.com` host, not
   `localhost:5000`.

---

## Optional hardening

The API currently runs `app.use(cors())`, which accepts requests from any origin.
That isn't a hole on its own — the JWT lives in `localStorage`, which CORS doesn't
guard either way — but once the Vercel domain is known you can narrow it:

```js
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
```

and set `CLIENT_ORIGIN` to the Vercel URL in Render.
