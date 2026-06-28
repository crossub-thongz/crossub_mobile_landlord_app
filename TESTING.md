# Landlord App — Tester Guide

How to sign in and what to exercise. The app runs **fully against the live backend** — there is no mock/demo fallback, so every screen reflects real data from the API.

## Test accounts

There are two kinds of login. All share the password **`ChangeMe!Now123`**.

| Account | Purpose |
|---|---|
| `landlord1@crossub.local` | **Demo landlord** — a synthetic but **fully-populated** portfolio. Use this to exercise *every* screen (statements, payments, approvals, messages…). |
| `landlord.test.12804@crossub.local` | **Real landlord** — Bondi Coast PTY LTD, **30 real properties** (migrated data). |
| `landlord.test.8179@crossub.local` | **Real landlord** — Dachuan Gao, 9 real properties. |
| `landlord.test.14848@crossub.local` | **Real landlord** — Wu Li, 3 real properties (incl. arrears). |

Each account only ever sees its **own** properties; everything else is out of scope by design (a non-owned property returns *not found*). The **demo** account is below; the **real** accounts are in [Real-data accounts](#real-data-accounts-real-migrated-data).

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

## Real-data accounts (real migrated data)

These logins are anchored to **real owner records** from the legacy system, so they show
**real properties, addresses, inspection and maintenance history at real scale** — the best
test of how the app handles production-shaped data. (Owner identities are real; the email +
password are test credentials, so no real landlord is ever contacted.)

| Login (password `ChangeMe!Now123`) | Owner | Properties | What's populated |
|---|---|---:|---|
| `landlord.test.12804@crossub.local` | Bondi Coast PTY LTD | **30** | Properties, Inspections (91), Maintenance (75), Documents (56), Notifications |
| `landlord.test.8179@crossub.local` | Dachuan Gao | 9 | Properties, Inspections (53), Maintenance (13), Documents (52), Notifications |
| `landlord.test.14848@crossub.local` | Wu Li | 3 | Properties, Inspections (25), Maintenance (2), Documents (9), Notifications + an arrears case |

**What is empty on the real accounts (and why):** Statements, Payments, Outstanding, Messages,
and Approvals render empty. The legacy migration recovered the owner→property mapping and the
inspection/maintenance/document history, but **rent ledgers, monthly settlements, leases, and
conversations were not part of that owner data** — so those screens are legitimately empty for
real owners. To test those fully-populated screens, use the **demo** account (`landlord1`) above.

> Tip for testers: use the **demo** account to verify each feature works end-to-end, and the
> **real** accounts (especially Bondi Coast's 30-property portfolio) to check list performance,
> pagination, and real-address/photo rendering.

## Environment prerequisites (for whoever provisions the test environment)

The credentials and demo data above are confirmed in the **local dev database**. For a deployed (Render/staging) environment, that database must first have:

1. **Migrations applied** — `prisma migrate deploy` (must include `20260628000000_landlord_approvals_notifications`, which adds the approvals/notifications tables).
2. **The seed run** — `pnpm --filter @crossub/api exec prisma db seed`, which creates `landlord1@crossub.local`, Demo Landlord House, and the full portfolio above.

Until both are done on the target DB, the demo login will fail or the portfolio will be empty.

### Real-data accounts on the target DB

The three `landlord.test.*` logins are **additive** — no schema migration is needed (they reuse
existing tables). To create them on the target DB, run from `crossub_web/apps/api` with
`DATABASE_URL` pointed at that DB (the owner-mapping artifact must be present locally — it is
produced by `pnpm migrate:owners` and is **gitignored PII**, kept off-repo):

```bash
# 1) provision the three real landlords (idempotent; writes Person + owner-link Disbursement + LANDLORD User)
pnpm --filter @crossub/api migrate:test-landlords --owners 12804,8179,14848

# 2) (optional) populate their Notifications screen — same generator the hourly sweep runs
#    POST /api/landlord-notifications/generate  (staff token, MODIFY_ALL_DATA)
```

Per project convention the **local** dev DB is written directly; **staging/prod writes are owned
by the deployer**. Because the accounts are additive and idempotent, running the command above
against staging is preferable to a full re-dump (it leaves the rest of staging untouched).
