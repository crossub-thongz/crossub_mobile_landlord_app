# Changelog

## 2026-06-28

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
