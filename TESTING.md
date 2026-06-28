# Landlord App — Tester Guide

How to sign in and what to exercise. The app runs **fully against the live backend** — there is no mock/demo fallback, so every screen reflects real data from the API.

## Test account

| Field | Value |
|---|---|
| **Email** | `landlord1@crossub.local` |
| **Password** | `ChangeMe!Now123` |
| **Role** | Landlord (property owner) |
| **Owns** | Demo Landlord House — 2 Mobile Way, Sydney |

> This is a seeded demo account. It only sees its **own** property; other properties in the system are out of scope by design.

## Where to sign in

- **Deployed (Render):** `https://crossub-mobile-landlord.onrender.com/login` — replace with the actual service URL.
  Note: on Render's free/starter tier the service may cold-start, so the first request after idle can take 20–40s. The backing API can cold-start too.
- **Local:** `http://localhost:3005/login` (requires the `crossub_web` API running on `:3001` — see `README.md`).

## What you'll see (demo portfolio)

Everything below is real seeded data — use it as the test script. All figures are AUD.

### Dashboard
- **1 property** (occupied), rent **$850/week**.
- **Arrears KPI** reflects the open arrears case below (not a placeholder).
- Maintenance / approvals counts roll up from the sections below.

### Property Portfolio (`/properties`)
- **Demo Landlord House** — 2 Mobile Way, Sydney · House · 3 bed / 2 bath / 2 parking · **Occupied**.
- Tenant **Tom Tenant** on an **active lease**: $850/week, bond $3,400, term Sep 2025 → Sep 2026.
- Owner contact (Larry Landlord) and assigned **property manager Pat Manager** (Demo Mobile Agency) shown.

### Approval Centre (`/approvals`)
Three approvals — **2 pending to action**, 1 already decided:
1. **Replace hot water system** — Special expense, **$2,400**, *Urgent*, **Pending** (has an attached contractor quote). → Approve or decline it.
2. **Rent increase to $880/week** — Rent review, Normal, **Pending**. → Approve or decline it.
3. **Lease renewal — 12 months** — Already **Approved** (shows in history, not actionable).

Deciding an approval persists — refresh and the status sticks.

### Maintenance (`/maintenance`)
- **Replace hot water system** (M-LL-001) — **Completed**, contractor Ace Plumbing, completed 20 Jun 2026, with a report to open.

### Inspections (`/inspections`)
- **Routine inspection** — **Completed** 1 Jun 2026, inspector Ivy Inspector, with a report to open.

### Statements / Accounting (`/statements`, `/accounting`)
- **2 monthly statements**: May 2026 (net **$3,367.20**) and Jun 2026 (net **$3,147.20**), each with a full rent / agent-fee / CROSSUB-fee P&L breakdown.
- **Payments**: 3 rent receipts of $850 (weeks ending 29 May, 12 Jun, 26 Jun 2026).
- **Outstanding**: 1 open arrears case — rent $1,700 + invoice $180 = **$1,880**.

### Documents (`/documents`)
- Signed lease PDF, the completed inspection report, and the maintenance report (links open the seeded sample URLs).

### Messages (`/messages`) — newly persisted
- One existing thread: **"June statement & rent"** (2 messages).
- **Compose a new message** (`/messages/new`) and **reply** to a thread — both now **save to the backend**. Send something, refresh the app, and confirm it's still there. Your own messages align to the right and are labelled **"You"**.

### Notifications (`/notifications`)
- A generated feed derived from the rent / arrears / statement / maintenance / inspection / approval activity above. **Mark-as-read** persists.

### Profile (`/profile`)
- Larry Landlord · `landlord1@crossub.local` · +61 400 444 555.

## Environment prerequisites (for whoever provisions the test environment)

The credentials and demo data above are confirmed in the **local dev database**. For a deployed (Render/staging) environment, that database must first have:

1. **Migrations applied** — `prisma migrate deploy` (must include `20260628000000_landlord_approvals_notifications`, which adds the approvals/notifications tables).
2. **The seed run** — `pnpm --filter @crossub/api exec prisma db seed`, which creates `landlord1@crossub.local`, Demo Landlord House, and the full portfolio above.

Until both are done on the target DB, the login will fail or the portfolio will be empty. (Per project convention, the local dev DB is seeded directly; staging/prod seeding is owned by the deployer.)
