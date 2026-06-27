# Changelog

## 2026-06-27

### Added
- Typed landlord-facade read path: `lib/crossub-api/landlord-mappers.ts` (maps `LandlordMaintenanceResponseDto` → `MaintenanceJob` and `LandlordInspectionResponseDto` → `InspectionRecord`) and `constants/api-enums.ts` mirroring the API's `MaintenanceStatus` / `InspectionType` / `InspectionStatus` Prisma enums.

### Changed
- Maintenance (`/api/v1/landlord/maintenance`) and Inspections (`/api/v1/landlord/inspections`) render live API data through the `LandlordDataProvider` refresh seam — replaced per-domain on a successful fetch with fallback to demo seeds on error, so no screen component changed. The maintenance read also makes the dashboard's "Maintenance In Progress" KPI live. Properties and Statements stay on demo data (their facades are thinner than the screens — a property has no rent/manager/agency/lease, a statement is one disbursement line not a monthly P&L) until those facades are enriched.
