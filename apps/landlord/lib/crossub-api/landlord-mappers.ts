/**
 * Pure adapters from the typed CROSSUB landlord facade DTOs
 * (`@crossub-thongz/api-contract`) to the view-models the landlord screens already
 * render (`lib/types.ts`). Keeping the translation here means the screens stay agnostic
 * about where their data came from — the provider swaps demo seeds for these mapped
 * results with no component changes.
 *
 * Covers the four facade domains that map faithfully onto their screens:
 *   - `/landlord/maintenance`        -> MaintenanceJob
 *   - `/landlord/inspections`        -> InspectionRecord
 *   - `/landlord/properties`         -> LandlordProperty (enriched: rent/lease/contacts/manager)
 *   - `/landlord/statements/monthly` -> MonthlyStatement (authoritative monthly P&L)
 *
 * The maintenance/inspection DTOs are THIN projections of the real Prisma rows, so
 * view-model fields the facade does not carry (contractor, costs, inspector, comments)
 * land on safe defaults — the same shape the screens already tolerate for demo data.
 */
import {
  COMM_DEPARTMENT,
  INSPECTION_STATUS,
  INSPECTION_TYPE,
  LANDLORD_APPROVAL_CATEGORY,
  LANDLORD_APPROVAL_PRIORITY,
  LANDLORD_APPROVAL_STATUS,
  LANDLORD_NOTIFICATION_TYPE,
  LEASE_STATUS,
  MAINTENANCE_STATUS,
} from '@/constants/api-enums';
import type {
  ApprovalCategory,
  ApprovalItem,
  ApprovalStatus,
  InspectionRecord,
  InspectionType,
  LandlordDocument,
  LandlordNotification,
  LandlordProperty,
  MaintenanceJob,
  MaintenanceStatus,
  MessageCategory,
  MessageThread,
  MonthlyStatement,
  OutstandingAmount,
  PaymentRecord,
  PropertyStatus,
  ThreadMessage,
} from '@/lib/types';

import type {
  ApprovalDecisionStatus,
  LandlordApprovalDto,
  LandlordDocumentDto,
  LandlordInspection as LandlordInspectionDto,
  LandlordMaintenance as LandlordMaintenanceDto,
  LandlordMessageThreadDto,
  LandlordMonthlyStatement as LandlordMonthlyStatementDto,
  LandlordNotificationDto,
  LandlordOutstandingDto,
  LandlordPaymentDto,
  LandlordPropertyDto,
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

// --------------------------------------------------------------------------
// Properties
// --------------------------------------------------------------------------

/** API leaseStatus badge -> the app's PropertyStatus view-model ('active' -> 'occupied'). */
const PROPERTY_STATUS_VIEW: Record<
  LandlordPropertyDto['leaseStatus'],
  PropertyStatus
> = {
  [LEASE_STATUS.ACTIVE]: 'occupied',
  [LEASE_STATUS.PERIODIC]: 'periodic',
  [LEASE_STATUS.VACATING]: 'vacating',
  [LEASE_STATUS.VACANT]: 'vacant',
};

/**
 * Map one enriched property (full facade DTO) onto the app's LandlordProperty card.
 * Lease/rent/contacts pass straight through; the leaseStatus badge maps onto the
 * view-model PropertyStatus; the managing-agency + property-manager contacts fall back
 * to '' / '—' when unassigned. The DTO now types every nullable as `T | null`, so a
 * plain `??` lands the right default (no `asString` guard needed here).
 */
export function toLandlordPropertyCard(dto: LandlordPropertyDto): LandlordProperty {
  return {
    id: dto.id,
    address: dto.address,
    suburb: dto.suburb ?? '',
    // The detail screen hides tenant info when tenantName === 'Vacant'.
    tenantName: dto.tenantName ?? 'Vacant',
    rentWeekly: dto.rentWeekly ?? 0,
    status: PROPERTY_STATUS_VIEW[dto.leaseStatus] ?? 'vacant',
    needAction: false,
    bedrooms: dto.bedrooms ?? 0,
    bathrooms: dto.bathrooms ?? 0,
    parkingSpaces: dto.parking ?? 0,
    leaseStart: dto.leaseStart ?? undefined,
    leaseEnd: dto.leaseEnd ?? undefined,
    agencyName: dto.agencyName ?? '',
    propertyManager: dto.propertyManager ?? '—',
    managerEmail: dto.managerEmail ?? '',
    managerPhone: dto.managerPhone ?? '',
  };
}

export function mapLandlordProperties(
  dtos: LandlordPropertyDto[],
): LandlordProperty[] {
  return dtos.map(toLandlordPropertyCard);
}

// --------------------------------------------------------------------------
// Monthly statements
// --------------------------------------------------------------------------

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const MONTH_TOKENS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const;

/** 'jun-2026' -> 'June 2026' (falls back to the raw token if it doesn't parse). */
function humanizeMonth(token: string): string {
  const [mon, year] = token.split('-');
  const idx = MONTH_TOKENS.indexOf(mon as (typeof MONTH_TOKENS)[number]);
  if (idx < 0 || !year) return token;
  return `${MONTH_NAMES[idx]} ${year}`;
}

/** Round to whole cents so the balancing plug never carries float drift (e.g. −0). */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Map one authoritative monthly settlement onto the app's MonthlyStatement P&L card.
 * The server figures (rent received, fee split, net to landlord) are taken as-is;
 * `otherExpenses` is a balancing plug so the screen's six lines sum exactly to the
 * authoritative net (net = rentReceived − approvedInvoices − agentFee − crossubFee, so
 * with management = agentFee + crossubFee and maintenance = approvedInvoices the plug
 * is 0 when the row reconciles). Inspection/utility buckets aren't carried by the
 * settlement header, so they land on 0.
 */
export function toMonthlyStatement(
  dto: LandlordMonthlyStatementDto,
): MonthlyStatement {
  const rentalIncome = dto.rentReceived;
  const managementFees = round2(dto.agentFee + dto.crossubFee);
  const maintenanceCosts = dto.approvedInvoices;
  const inspectionCosts = 0;
  const utilityExpenses = 0;
  const netAmount = dto.netToLandlord;
  const otherExpenses = round2(
    rentalIncome -
      managementFees -
      maintenanceCosts -
      inspectionCosts -
      utilityExpenses -
      netAmount,
  );
  return {
    id: dto.id,
    propertyId: dto.propertyId,
    propertyAddress: dto.propertyAddress,
    period: humanizeMonth(dto.month),
    rentalIncome,
    managementFees,
    maintenanceCosts,
    inspectionCosts,
    utilityExpenses,
    otherExpenses,
    netAmount,
    availableAt: dto.issuedAt,
  };
}

export function mapLandlordStatements(
  dtos: LandlordMonthlyStatementDto[],
): MonthlyStatement[] {
  return dtos.map(toMonthlyStatement);
}

// --------------------------------------------------------------------------
// Payments
// --------------------------------------------------------------------------

/** Map one RENT ledger payment (facade DTO) onto the app's PaymentRecord. */
export function toPaymentRecord(dto: LandlordPaymentDto): PaymentRecord {
  return {
    id: dto.id,
    propertyId: dto.propertyId ?? '',
    propertyAddress: dto.propertyAddress,
    paymentDate: dto.paymentDate,
    amount: dto.amount,
    method: dto.method,
  };
}

export function mapLandlordPayments(dtos: LandlordPaymentDto[]): PaymentRecord[] {
  return dtos.map(toPaymentRecord);
}

// --------------------------------------------------------------------------
// Outstanding
// --------------------------------------------------------------------------

/** Map one outstanding line (facade DTO) onto the app's OutstandingAmount. */
export function toOutstandingAmount(
  dto: LandlordOutstandingDto,
): OutstandingAmount {
  return {
    id: dto.id,
    propertyId: dto.propertyId ?? '',
    propertyAddress: dto.propertyAddress,
    // The facade `type` already uses the app's vocabulary ('rent'|'utility'|'maintenance').
    type: dto.type,
    amount: dto.amount,
    dueDate: dto.dueDate,
  };
}

export function mapLandlordOutstanding(
  dtos: LandlordOutstandingDto[],
): OutstandingAmount[] {
  return dtos.map(toOutstandingAmount);
}

// --------------------------------------------------------------------------
// Documents
// --------------------------------------------------------------------------

/** Map one document (facade DTO) onto the app's LandlordDocument. */
export function toLandlordDocument(dto: LandlordDocumentDto): LandlordDocument {
  return {
    id: dto.id,
    name: dto.name,
    // The facade `category` already uses the app's DocumentCategory vocabulary.
    category: dto.category,
    propertyAddress: dto.propertyAddress ?? undefined,
    uploadedAt: dto.uploadedAt,
    version: dto.version,
    url: dto.url,
  };
}

export function mapLandlordDocuments(
  dtos: LandlordDocumentDto[],
): LandlordDocument[] {
  return dtos.map(toLandlordDocument);
}

// --------------------------------------------------------------------------
// Messages
// --------------------------------------------------------------------------

/** API CommDepartment -> the app's MessageCategory. */
const MESSAGE_CATEGORY_VIEW: Record<
  LandlordMessageThreadDto['department'],
  MessageCategory
> = {
  [COMM_DEPARTMENT.LEASING]: 'leasing',
  [COMM_DEPARTMENT.MAINTENANCE]: 'maintenance',
  [COMM_DEPARTMENT.INSPECTION]: 'inspections',
  [COMM_DEPARTMENT.ACCOUNTING]: 'accounting',
  [COMM_DEPARTMENT.TRIBUNAL]: 'general',
  [COMM_DEPARTMENT.GENERAL]: 'general',
};

/** Map one conversation (facade DTO) onto the app's MessageThread list card. */
export function toMessageThread(dto: LandlordMessageThreadDto): MessageThread {
  return {
    id: dto.id,
    propertyId: dto.propertyId ?? undefined,
    propertyAddress: dto.propertyAddress ?? undefined,
    subject: dto.subject,
    category: MESSAGE_CATEGORY_VIEW[dto.department] ?? 'general',
    participants: dto.participants,
    lastMessage: dto.lastMessage ?? '',
    lastAt: dto.lastAt ?? '',
    unread: dto.unread,
  };
}

export function mapLandlordThreads(
  dtos: LandlordMessageThreadDto[],
): MessageThread[] {
  return dtos.map(toMessageThread);
}

/** Map one nested message (facade DTO) onto the app's ThreadMessage. */
export function toThreadMessage(
  dto: LandlordMessageThreadDto['messages'][number],
): ThreadMessage {
  return { id: dto.id, from: dto.from, body: dto.body, at: dto.at };
}

/** Build the threadId -> ThreadMessage[] map the provider holds (sync screen access). */
export function buildThreadMessages(
  dtos: LandlordMessageThreadDto[],
): Record<string, ThreadMessage[]> {
  return Object.fromEntries(
    dtos.map((t) => [t.id, t.messages.map(toThreadMessage)]),
  );
}

// --------------------------------------------------------------------------
// Approvals
// --------------------------------------------------------------------------

/** API LandlordApprovalCategory -> the app's ApprovalCategory. */
const APPROVAL_CATEGORY_VIEW: Record<
  LandlordApprovalDto['category'],
  ApprovalCategory
> = {
  [LANDLORD_APPROVAL_CATEGORY.MAINTENANCE]: 'maintenance',
  [LANDLORD_APPROVAL_CATEGORY.RENT_REVIEW]: 'rent_review',
  [LANDLORD_APPROVAL_CATEGORY.LEASE_RENEWAL]: 'lease_renewal',
  [LANDLORD_APPROVAL_CATEGORY.SPECIAL_EXPENSE]: 'special_expense',
  [LANDLORD_APPROVAL_CATEGORY.TRIBUNAL_LEGAL]: 'tribunal_legal',
  [LANDLORD_APPROVAL_CATEGORY.INGOING_INSPECTION]: 'ingoing_inspection',
};

/** API LandlordApprovalStatus -> the app's ApprovalStatus. */
const APPROVAL_STATUS_VIEW: Record<
  LandlordApprovalDto['status'],
  ApprovalStatus
> = {
  [LANDLORD_APPROVAL_STATUS.PENDING]: 'pending',
  [LANDLORD_APPROVAL_STATUS.APPROVED]: 'approved',
  [LANDLORD_APPROVAL_STATUS.DECLINED]: 'declined',
  [LANDLORD_APPROVAL_STATUS.MORE_INFO]: 'more_info',
};

/** App ApprovalStatus decision -> the API decision status (null for non-decisions). */
const APPROVAL_DECISION_API: Partial<Record<ApprovalStatus, ApprovalDecisionStatus>> = {
  approved: LANDLORD_APPROVAL_STATUS.APPROVED,
  declined: LANDLORD_APPROVAL_STATUS.DECLINED,
  more_info: LANDLORD_APPROVAL_STATUS.MORE_INFO,
};

/** Map an app approval decision onto the API decision status (null if not a decision). */
export function approvalDecisionToApi(
  status: ApprovalStatus,
): ApprovalDecisionStatus | null {
  return APPROVAL_DECISION_API[status] ?? null;
}

/** Map one approval (facade DTO) onto the app's ApprovalItem. */
export function toApprovalItem(dto: LandlordApprovalDto): ApprovalItem {
  return {
    id: dto.id,
    category: APPROVAL_CATEGORY_VIEW[dto.category] ?? 'maintenance',
    title: dto.title,
    description: dto.description,
    propertyId: dto.propertyId ?? '',
    propertyAddress: dto.propertyAddress ?? '—',
    amount: dto.amount ?? undefined,
    requestedBy: dto.requestedBy,
    requestedAt: dto.requestedAt,
    status: APPROVAL_STATUS_VIEW[dto.status] ?? 'pending',
    priority: dto.priority === LANDLORD_APPROVAL_PRIORITY.URGENT ? 'urgent' : 'normal',
    documents: dto.documents ?? undefined,
    recommendation: dto.recommendation ?? undefined,
  };
}

export function mapLandlordApprovals(dtos: LandlordApprovalDto[]): ApprovalItem[] {
  return dtos.map(toApprovalItem);
}

// --------------------------------------------------------------------------
// Notifications
// --------------------------------------------------------------------------

/** API LandlordNotificationType -> the app's notification type. */
const NOTIFICATION_TYPE_VIEW: Record<
  LandlordNotificationDto['type'],
  LandlordNotification['type']
> = {
  [LANDLORD_NOTIFICATION_TYPE.RENT_RECEIVED]: 'rent_received',
  [LANDLORD_NOTIFICATION_TYPE.ARREARS]: 'arrears',
  [LANDLORD_NOTIFICATION_TYPE.MAINTENANCE]: 'maintenance',
  [LANDLORD_NOTIFICATION_TYPE.APPROVAL_REQUIRED]: 'approval_required',
  [LANDLORD_NOTIFICATION_TYPE.INSPECTION]: 'inspection',
  [LANDLORD_NOTIFICATION_TYPE.RENT_REVIEW]: 'rent_review',
  [LANDLORD_NOTIFICATION_TYPE.LEASE_RENEWAL]: 'lease_renewal',
  [LANDLORD_NOTIFICATION_TYPE.STATEMENT]: 'statement',
};

/** Map one notification (facade DTO) onto the app's LandlordNotification. */
export function toLandlordNotification(
  dto: LandlordNotificationDto,
): LandlordNotification {
  return {
    id: dto.id,
    type: NOTIFICATION_TYPE_VIEW[dto.type] ?? 'rent_received',
    title: dto.title,
    body: dto.body,
    href: dto.href,
    read: dto.read,
    createdAt: dto.createdAt,
  };
}

export function mapLandlordNotifications(
  dtos: LandlordNotificationDto[],
): LandlordNotification[] {
  return dtos.map(toLandlordNotification);
}
