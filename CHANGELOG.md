# Changelog

## 2026-06-27

### Added
- Properties + monthly-statements mappers (`lib/crossub-api/landlord-mappers.ts`): `toLandlordPropertyCard` (enriched `LandlordPropertyResponseDto` → `LandlordProperty`, mapping `leaseStatus 'active' → 'occupied'`) and `toMonthlyStatement` (`LandlordMonthlyStatementResponseDto` → `MonthlyStatement`, with `otherExpenses` as a balancing plug so the six P&L lines sum exactly to the authoritative net). `fetchMonthlyStatements()` on the landlord client + `PROPERTY_STATUS` / `LEASE_STATUS` enum mirrors.
- Typed landlord-facade read path: `lib/crossub-api/landlord-mappers.ts` (maps `LandlordMaintenanceResponseDto` → `MaintenanceJob` and `LandlordInspectionResponseDto` → `InspectionRecord`) and `constants/api-enums.ts` mirroring the API's `MaintenanceStatus` / `InspectionType` / `InspectionStatus` Prisma enums.

### Changed
- Properties (`/api/v1/landlord/properties`) and Statements (`/api/v1/landlord/statements/monthly`) now render live API data through the `LandlordDataProvider` refresh seam (per-domain fallback to demo seeds on error), so the dashboard's rent/income KPIs, tenant/owner + property-manager contacts, and the monthly P&L are real — with no screen component changed. Bumped `@crossub-thongz/api-contract` to `^0.4.0`.
- Maintenance (`/api/v1/landlord/maintenance`) and Inspections (`/api/v1/landlord/inspections`) render live API data through the `LandlordDataProvider` refresh seam — replaced per-domain on a successful fetch with fallback to demo seeds on error, so no screen component changed. The maintenance read also makes the dashboard's "Maintenance In Progress" KPI live.
