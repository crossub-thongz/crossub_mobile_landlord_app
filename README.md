# crossub_mobile_landlord_app

Property owner portal for the CROSSUB ecosystem. Consumes the [crossub_web](https://github.com/justin-crossub/crossub_web) API.

> **Use pnpm only.** Run all scripts via `pnpm`.

## Purpose

The Landlord App is **not** for day-to-day property management. It provides:

- Portfolio visibility and performance monitoring
- Centralised **Approval Centre** (maintenance, rent review, lease renewal, etc.)
- Financial transparency (rent collection, arrears, monthly statements)
- Maintenance and inspection visibility
- Communication hub with property managers
- Document centre and notifications

## Apps

- `apps/landlord` — `@crossub/landlord`, Next.js 16 landlord portal (port **3005** locally)

## Requirements

- Node.js `>=20`
- pnpm `>=9`
- `crossub_web` API running (Postgres + Redis in that repo)

## Local development

```bash
pnpm install
cp apps/landlord/.env.example apps/landlord/.env

# Terminal 1 — API (crossub_web)
cd ../crossub_web && pnpm dev:api

# Terminal 2 — landlord app (this repo)
pnpm dev
```

Open [http://localhost:3005](http://localhost:3005).

The app ships with **demo data** for all PRD modules. When the API is reachable, auth and health checks use the live backend.

---

## Deploy on Render

Deploy **after** the `crossub_web` API is live on Render.

### Step 1 — Deploy the API (crossub_web)

Deploy `crossub_web` → `apps/api` as a Render Web Service. Note the public URL, e.g.:

```
https://crossub-api.onrender.com
```

See `crossub_web/README.md` for Postgres, Redis, and API env vars.

### Step 2 — Create the landlord Web Service

**Option A — Blueprint (recommended)**

1. Push this repo to GitHub.
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect the `crossub_mobile_landlord_app` repo — Render reads `render.yaml`.
4. When prompted, set environment variables (see Step 3).

**Option B — Manual Web Service**

| Setting | Value |
|---------|--------|
| **Name** | `crossub-mobile-landlord` |
| **Environment** | Node |
| **Region** | Singapore (or your preference) |
| **Branch** | `main` |
| **Root Directory** | *(blank)* |
| **Build Command** | `corepack enable && corepack pnpm install --frozen-lockfile && corepack pnpm build:landlord` |
| **Start Command** | `corepack pnpm --filter @crossub/landlord start` |
| **Health Check Path** | `/login` |
| **Plan** | Starter (or higher) |

### Step 3 — Environment variables

Set these in Render → your service → **Environment**:

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `NEXT_PUBLIC_API_URL` | `/api` | Yes |
| `API_INTERNAL_URL` | `https://crossub-api.onrender.com` | Yes |
| `NEXT_PUBLIC_WEB_URL` | `https://crossub-web.onrender.com` | Optional |
| `NEXT_PUBLIC_AGENT_PORTAL_URL` | `https://crossub-mobile-agent.onrender.com` | Optional |

Replace URLs with your actual Render service URLs. Do **not** add `/api` to the end of `API_INTERNAL_URL`.

Render injects `PORT` automatically; the start script binds via `next start -H 0.0.0.0`.

### Step 4 — Update API CORS / email links (crossub_web)

In `crossub_web` API env on Render, add your landlord app URL:

```bash
# Password-reset emails point here when landlords use this portal
WEB_URL=https://crossub-mobile-landlord.onrender.com

# Only needed if a frontend calls the API directly (not via /api proxy)
CORS_ORIGINS=https://crossub-mobile-landlord.onrender.com,https://crossub-mobile-agent.onrender.com
```

Leave `COOKIE_DOMAIN` empty so auth cookies bind to the landlord app hostname.

### Step 5 — Verify

1. Open `https://crossub-mobile-landlord.onrender.com/login`
2. Sign in with a CROSSUB account from the shared API
3. Dashboard and Approval Centre should load (demo data until landlord API endpoints exist)

---

## PRD module map

| PRD Section | Route |
|-------------|-------|
| Landlord Dashboard | `/dashboard` |
| Approval Centre | `/approvals` |
| Property Portfolio | `/properties` |
| Property Details | `/properties/[id]` |
| Inspections | `/inspections` |
| Maintenance | `/maintenance` |
| Accounting | `/accounting` |
| Monthly Statement | `/statements` |
| Communication Hub | `/messages` |
| Document Centre | `/documents` |
| Notification Centre | `/notifications` |

## Environment reference

| Variable | Local | Render |
|----------|-------|--------|
| `NEXT_PUBLIC_API_URL` | `/api` | `/api` |
| `API_INTERNAL_URL` | `http://localhost:3001` | `https://your-api.onrender.com` |
| `PORT` | `3005` (dev script) | Set by Render |

## Build

```bash
pnpm build:landlord
```

## Project structure

```
crossub_mobile_landlord_app/
├── apps/landlord/       Next.js landlord portal
├── render.yaml          Render Blueprint
├── scripts/             Dev helpers
└── package.json         Workspace root
```

## API integration (future)

The shared API does not yet have a dedicated `LANDLORD` role or scoped endpoints. Before production:

- Add `LANDLORD` RBAC role with property-scoped permissions
- Landlord approval, statement, and inspection endpoints
- Add landlord portal URL to API `CORS_ORIGINS` / `WEB_URL`

Until then, the app uses demo data for portfolio, approvals, and financial modules while auth connects to the live API.
