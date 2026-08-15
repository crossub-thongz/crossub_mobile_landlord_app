# Changelog

## 2026-08-15

### Changed
- **The API contract moved 0.7.0 → 0.14.0 — seven versions — and the app now type-checks clean for the first time.** This repo consumes `@crossub-thongz/api-contract` from GitHub Packages, so a release published from `crossub_web` does not arrive on its own; nobody had bumped it since 0.7.0 landed on 17 July.

  **The installed package was older still than the lockfile claimed.** `pnpm-lock.yaml` recorded 0.7.0, but `apps/landlord/node_modules/@crossub-thongz/api-contract` pointed at **0.1.0** — the very first release ever published. `node_modules` had drifted from the lockfile and nothing surfaces that, because `typescript.ignoreBuildErrors` is on and the build passes either way.

  **The bump fixed an error rather than causing one.** `POST /landlord/documents` was rejected as *"not assignable to parameter of type `PathsWithMethod<paths, 'post'>`"* — the route exists on the API and 0.7.0 had simply never heard of it. That was the app's only type error, and it is gone.

  **Two pieces of drift it revealed are fixed with it.** `LandlordDocumentDto.category` gained `application` (a tenancy application filed against the property), which `DocumentCategory` could not name — so such a document mapped to a value nothing rendered; the union and the `CATEGORY_LABELS` map both list it now. And `CommDepartment` grew `RENT_REVIEW` and `COMPLAINT`, so a thread routed to either arrived with **no category at all** — an `undefined` the message filters cannot match. Both fold into the nearest existing `MessageCategory` (`leasing` and `general`) rather than widening a five-value union the message UI filters against.

  **Type errors: 1 before, 0 after.** `next build` passes.

  **Known and not fixed here: 26 of the 311 schemas in this contract are empty** — `{"type":"object","properties":{}}` — because those DTOs carry `class-validator` decorators but no `@ApiProperty()`, so Swagger sees no fields. `LoginDto` is one of them. Any typed client sending those bodies gets `Type 'string' is not assignable to type 'never'`. API-side fix and a re-publish.

## 2026-08-11

### Fixed
- **The sign-in form no longer rejects a correct password before sending it.** `schema` enforced `.min(PASSWORD_MIN)` — 10 characters — on the *login* field, so an account whose password predates the policy greyed out with "Min 10 characters" under credentials that were perfectly valid, in the browser, without the API ever seeing the attempt. Signing in verifies a password; it does not set one, and the minimum still applies on every screen that does. `LoginDto` dropped this exact rule on 10 Aug 2026 after it locked out 23 of the 43 migrated agent logins, and `login-dto-validation.spec.ts` pins it there; the agent app's copy went with it and the other four were missed. Found while fixing the tenant app's "cannot log in" P0 and cleared across tenant, inspector, landlord and maintenance together. `.max(PASSWORD_MAX)` stays, as a cost guard on what reaches Argon2. **Preventive rather than urgent: production carries 0 LANDLORD accounts.**

### Known
- ⚠️ **`/forgot-password` posts correctly, but a genuine landlord would never receive the email — and the screen would still say the link is on its way.** CROSSUB must never email a landlord, so every landlord-addressed send is dropped at `LandlordMailGuardService`; `sendSetupLogin`/`sendPasswordReset` do not pass `allowLandlordRecipient`, and the guard's only exemption is agency contact addresses. Latent today at 0 landlord accounts, and deliberately not patched here: the resolution is a decision about that standing rule — who, if anyone, may send a landlord their own credentials — not a change to this form. Settle it before landlord logins are provisioned.

## 2026-06-28

### Added
- Messaging is now persisted, not local-only: compose (`/messages/new`) and reply (`/messages/[id]`) call the new `POST /api/v1/landlord/messages` and `/messages/{id}/reply` endpoints via `createMessageThread` / `replyToThread` (`lib/crossub-api/landlord-client.ts`), reconciling with the server's canonical thread. `CATEGORY_TO_DEPARTMENT` maps the app's category to the API `CommDepartment` for writes; `toThreadMessage` labels the landlord's own messages (`fromSelf`) as "You" so bubble alignment survives a refresh. Both writers surface a toast on failure. Bumped `@crossub-thongz/api-contract` to `^0.7.0`.

### Changed
- `createMessageThread` / `sendMessage` are now async (return the real thread id / a success boolean) and persist to the backend instead of fabricating ephemeral local threads that vanished on refresh.

### Removed
- Mock/demo data fallback: deleted `lib/mock-data.ts` and removed all demo seeds from `LandlordDataProvider`. All ten domains now start empty and are filled only from the live facade — a failed slice stays empty (screens render their own empty states) instead of silently showing fabricated data.

### Changed
- `buildPortfolioSummary` now derives the dashboard arrears KPI from the live `outstanding` data instead of a hardcoded `650`.

### Added
- Approvals + notifications mappers + client (`lib/crossub-api/`): `toApprovalItem`, `toLandlordNotification`, `approvalDecisionToApi` (the FE-decision → API-status reverse map), and the client read fetchers + write calls (`decideApproval`, `markNotificationRead`, `markAllNotificationsRead`). `LANDLORD_APPROVAL_CATEGORY` / `_STATUS` / `_PRIORITY` and `LANDLORD_NOTIFICATION_TYPE` enum mirrors.
- Payments, outstanding, documents, and messages mappers + client fetchers (`lib/crossub-api/`): `toPaymentRecord`, `toOutstandingAmount`, `toLandlordDocument`, `toMessageThread` / `toThreadMessage` (+ `buildThreadMessages` to fill the thread-message map from one fetch). `COMM_DEPARTMENT` enum mirror for the conversation-department → message-category mapping.

### Changed
- Approvals and Notifications now render live API data and persist their actions: `resolveApproval` / `markNotificationRead` / `markAllNotificationsRead` do an optimistic local update then fire the backend write (no screen component changed). This was the last landlord domain on mock — the app is now fully live. Bumped `@crossub-thongz/api-contract` to `^0.6.0`.
- Payments, Outstanding, Documents, and Messages now render live API data through the `LandlordDataProvider` refresh seam (per-domain fallback to demo seeds on error), with no screen component changed. Bumped `@crossub-thongz/api-contract` to `^0.5.0`.

## 2026-06-27

### Added
- Properties + monthly-statements mappers (`lib/crossub-api/landlord-mappers.ts`): `toLandlordPropertyCard` (enriched `LandlordPropertyResponseDto` → `LandlordProperty`, mapping `leaseStatus 'active' → 'occupied'`) and `toMonthlyStatement` (`LandlordMonthlyStatementResponseDto` → `MonthlyStatement`, with `otherExpenses` as a balancing plug so the six P&L lines sum exactly to the authoritative net). `fetchMonthlyStatements()` on the landlord client + `PROPERTY_STATUS` / `LEASE_STATUS` enum mirrors.
- Typed landlord-facade read path: `lib/crossub-api/landlord-mappers.ts` (maps `LandlordMaintenanceResponseDto` → `MaintenanceJob` and `LandlordInspectionResponseDto` → `InspectionRecord`) and `constants/api-enums.ts` mirroring the API's `MaintenanceStatus` / `InspectionType` / `InspectionStatus` Prisma enums.

### Changed
- Properties (`/api/v1/landlord/properties`) and Statements (`/api/v1/landlord/statements/monthly`) now render live API data through the `LandlordDataProvider` refresh seam (per-domain fallback to demo seeds on error), so the dashboard's rent/income KPIs, tenant/owner + property-manager contacts, and the monthly P&L are real — with no screen component changed. Bumped `@crossub-thongz/api-contract` to `^0.4.0`.
- Maintenance (`/api/v1/landlord/maintenance`) and Inspections (`/api/v1/landlord/inspections`) render live API data through the `LandlordDataProvider` refresh seam — replaced per-domain on a successful fetch with fallback to demo seeds on error, so no screen component changed. The maintenance read also makes the dashboard's "Maintenance In Progress" KPI live.
