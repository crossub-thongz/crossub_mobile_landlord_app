/**
 * Pure adapters from the typed CROSSUB landlord facade DTOs
 * (`@crossub-thongz/api-contract`) to the view-models the landlord screens already
 * render (`lib/types.ts`). Keeping the translation here means the screens stay agnostic
 * about where their data came from — the provider swaps demo seeds for these mapped
 * results with no component changes.
 *
 * Covers the two facade domains that map faithfully onto their screens:
 *   - `/landlord/maintenance`  -> MaintenanceJob
 *   - `/landlord/inspections`  -> InspectionRecord
 * (`/landlord/properties` and `/landlord/statements` are deferred — their DTOs are
 * structurally thinner than the property card / monthly-P&L screens; see the data
 * provider + CHANGELOG.)
 *
 * Both DTOs are THIN projections of the real Prisma rows, so view-model fields the
 * facade does not carry (contractor, costs, inspector, comments) land on safe defaults —
 * the same shape the screens already tolerate for demo data.
 */
import {
  INSPECTION_STATUS,
  INSPECTION_TYPE,
  MAINTENANCE_STATUS,
} from '@/constants/api-enums';
import type {
  InspectionRecord,
  InspectionType,
  MaintenanceJob,
  MaintenanceStatus,
} from '@/lib/types';

import type {
  LandlordInspection as LandlordInspectionDto,
  LandlordMaintenance as LandlordMaintenanceDto,
} from './landlord-client';

/**
 * The generated contract types nullable columns inconsistently — some surface as
 * `T | Record<string, never>` rather than `T | null` (an openapi-typescript rendering of
 * a `nullable: true` schema with no explicit `type`). So every scalar we read is funnelled
 * through this guard to land a clean string or null, never a stray `{}`.
 */
function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** API MaintenanceStatus (7 states) -> the app's 3-state maintenance badge. */
const MAINTENANCE_STATUS_VIEW: Record<
  LandlordMaintenanceDto['status'],
  MaintenanceStatus
> = {
  [MAINTENANCE_STATUS.OPEN]: 'awaiting_approval',
  [MAINTENANCE_STATUS.QUOTING]: 'awaiting_approval',
  [MAINTENANCE_STATUS.APPROVED]: 'in_progress',
  [MAINTENANCE_STATUS.SCHEDULED]: 'in_progress',
  [MAINTENANCE_STATUS.INVOICED]: 'in_progress',
  [MAINTENANCE_STATUS.COMPLETED]: 'completed',
  [MAINTENANCE_STATUS.CANCELLED]: 'completed',
};

/** API InspectionType vocabulary -> the app's inspection types. */
const INSPECTION_TYPE_VIEW: Record<
  LandlordInspectionDto['type'],
  InspectionType
> = {
  [INSPECTION_TYPE.OPEN]: 'open',
  [INSPECTION_TYPE.INGOING]: 'ingoing',
  [INSPECTION_TYPE.OUTGOING]: 'outgoing',
  [INSPECTION_TYPE.ROUTINE]: 'routine',
  [INSPECTION_TYPE.CONDITION]: 'routine',
  [INSPECTION_TYPE.WARD_ROUND]: 'routine',
};

/** API InspectionStatus (7 states) -> the app's 3-state inspection badge. */
const INSPECTION_STATUS_VIEW: Record<
  LandlordInspectionDto['status'],
  InspectionRecord['status']
> = {
  [INSPECTION_STATUS.DRAFT]: 'scheduled',
  [INSPECTION_STATUS.IN_PROGRESS]: 'scheduled',
  [INSPECTION_STATUS.FIRST_REVIEW]: 'pending_approval',
  [INSPECTION_STATUS.SECOND_REVIEW]: 'pending_approval',
  [INSPECTION_STATUS.COMPLETED]: 'completed',
  [INSPECTION_STATUS.PUBLISHED]: 'completed',
  [INSPECTION_STATUS.CANCELLED]: 'completed',
};

/** Map one maintenance request (thin facade DTO) onto the app's MaintenanceJob card. */
export function toMaintenanceJob(dto: LandlordMaintenanceDto): MaintenanceJob {
  return {
    id: dto.id,
    propertyId: asString(dto.propertyId) ?? '',
    propertyAddress: asString(dto.propertyAddress) ?? '—',
    issueDescription:
      asString(dto.description) ??
      asString(dto.categoryName) ??
      'Maintenance request',
    priority: dto.urgent ? 'urgent' : 'normal',
    status: MAINTENANCE_STATUS_VIEW[dto.status] ?? 'awaiting_approval',
    completionDate: asString(dto.completedDate) ?? undefined,
  };
}

export function mapLandlordMaintenance(
  dtos: LandlordMaintenanceDto[],
): MaintenanceJob[] {
  return dtos.map(toMaintenanceJob);
}

/** Map one inspection (thin facade DTO) onto the app's InspectionRecord card. */
export function toInspectionRecord(dto: LandlordInspectionDto): InspectionRecord {
  return {
    id: dto.id,
    type: INSPECTION_TYPE_VIEW[dto.type] ?? 'routine',
    propertyId: asString(dto.propertyId) ?? '',
    propertyAddress: asString(dto.propertyAddress) ?? '—',
    inspectionDate:
      asString(dto.inspectionDate) ??
      asString(dto.scheduledDate) ??
      asString(dto.createdAt) ??
      '',
    // The facade carries no inspector name on the landlord view.
    inspectorName: 'CROSSUB Inspector',
    status: INSPECTION_STATUS_VIEW[dto.status] ?? 'scheduled',
  };
}

export function mapLandlordInspections(
  dtos: LandlordInspectionDto[],
): InspectionRecord[] {
  return dtos.map(toInspectionRecord);
}
