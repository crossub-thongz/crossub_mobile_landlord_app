/**
 * Runtime mirrors of the CROSSUB API's Prisma enums. The typed contract
 * (`@crossub-thongz/api-contract`) ships these as string-literal *types* only — there
 * are no runtime values to compare against — so the mappers import these constants
 * instead of hard-coding raw strings (per the repo's "no raw string comparisons" rule).
 *
 * Keep in sync with `apps/api/prisma/schema.prisma`.
 */

/** MaintenanceStatus — the real persisted lifecycle of a maintenance request. */
export const MAINTENANCE_STATUS = {
  OPEN: 'OPEN',
  APPROVED: 'APPROVED',
  QUOTING: 'QUOTING',
  SCHEDULED: 'SCHEDULED',
  INVOICED: 'INVOICED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

/** InspectionType — what kind of inspection (API vocabulary). */
export const INSPECTION_TYPE = {
  CONDITION: 'CONDITION',
  ROUTINE: 'ROUTINE',
  INGOING: 'INGOING',
  OUTGOING: 'OUTGOING',
  WARD_ROUND: 'WARD_ROUND',
  OPEN: 'OPEN',
} as const;

/** InspectionStatus — the real persisted lifecycle of an inspection. */
export const INSPECTION_STATUS = {
  DRAFT: 'DRAFT',
  IN_PROGRESS: 'IN_PROGRESS',
  FIRST_REVIEW: 'FIRST_REVIEW',
  SECOND_REVIEW: 'SECOND_REVIEW',
  COMPLETED: 'COMPLETED',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
} as const;

/** PropertyStatus — the real persisted state of a property. */
export const PROPERTY_STATUS = {
  OCCUPIED: 'OCCUPIED',
  VACANT: 'VACANT',
  SHOWING: 'SHOWING',
  MAINTENANCE: 'MAINTENANCE',
} as const;

/**
 * LeaseStatus — the server-derived lease-standing badge the property card carries
 * (`LandlordPropertyResponseDto.leaseStatus`). These are the wire values the contract
 * emits; the property mapper maps them onto the app's PropertyStatus view-model
 * (notably `'active' → 'occupied'`).
 */
export const LEASE_STATUS = {
  ACTIVE: 'active',
  PERIODIC: 'periodic',
  VACATING: 'vacating',
  VACANT: 'vacant',
} as const;

/**
 * CommDepartment — the conversation department on `LandlordMessageThreadResponseDto`.
 * The message mapper maps it onto the app's MessageCategory view-model.
 */
export const COMM_DEPARTMENT = {
  LEASING: 'LEASING',
  MAINTENANCE: 'MAINTENANCE',
  INSPECTION: 'INSPECTION',
  ACCOUNTING: 'ACCOUNTING',
  TRIBUNAL: 'TRIBUNAL',
  GENERAL: 'GENERAL',
} as const;
