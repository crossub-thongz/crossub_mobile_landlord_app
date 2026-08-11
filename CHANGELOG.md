# Changelog

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
