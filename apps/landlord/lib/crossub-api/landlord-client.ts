import type { components } from '@crossub-thongz/api-contract';

import { crossub } from './client';

// Aliased `...Dto` so it never collides with the `LandlordProperty` view-model
// (lib/types.ts) the mappers translate these into.
export type LandlordPropertyDto = components['schemas']['LandlordPropertyResponseDto'];
export type LandlordMaintenance = components['schemas']['LandlordMaintenanceResponseDto'];
export type LandlordInspection = components['schemas']['LandlordInspectionResponseDto'];
export type LandlordStatement = components['schemas']['LandlordStatementResponseDto'];
export type LandlordMonthlyStatement =
  components['schemas']['LandlordMonthlyStatementResponseDto'];
export type LandlordPaymentDto = components['schemas']['LandlordPaymentResponseDto'];
export type LandlordOutstandingDto =
  components['schemas']['LandlordOutstandingResponseDto'];
// `...Dto` so it never collides with the `LandlordDocument` view-model (lib/types.ts).
export type LandlordDocumentDto = components['schemas']['LandlordDocumentResponseDto'];
export type LandlordMessageThreadDto =
  components['schemas']['LandlordMessageThreadResponseDto'];
/** Body for opening a new message thread (`POST /api/v1/landlord/messages`). */
export type CreateMessageThreadBody =
  components['schemas']['CreateMessageThreadDto'];
export type LandlordApprovalDto = components['schemas']['LandlordApprovalResponseDto'];
export type LandlordNotificationDto =
  components['schemas']['LandlordNotificationResponseDto'];
/** The decision statuses the approval PATCH accepts (APPROVED | DECLINED | MORE_INFO). */
export type ApprovalDecisionStatus =
  components['schemas']['DecideApprovalDto']['status'];

/** Owned properties (`GET /api/v1/landlord/properties`). */
export async function fetchProperties(): Promise<LandlordPropertyDto[]> {
  const { data, error } = await crossub.GET('/landlord/properties');
  if (error || !data) throw new Error('Failed to load properties');
  return data.items;
}

/** One owned property by id (`GET /api/v1/landlord/properties/{propertyId}`). */
export async function fetchProperty(propertyId: string): Promise<LandlordPropertyDto> {
  const { data, error } = await crossub.GET('/landlord/properties/{propertyId}', {
    params: { path: { propertyId } },
  });
  if (error || !data) throw new Error('Failed to load property');
  return data;
}

/** Maintenance across owned properties (`GET /api/v1/landlord/maintenance`). */
export async function fetchMaintenance(): Promise<LandlordMaintenance[]> {
  const { data, error } = await crossub.GET('/landlord/maintenance');
  if (error || !data) throw new Error('Failed to load maintenance');
  return data.items;
}

/** Inspections across owned properties (`GET /api/v1/landlord/inspections`). */
export async function fetchInspections(): Promise<LandlordInspection[]> {
  const { data, error } = await crossub.GET('/landlord/inspections');
  if (error || !data) throw new Error('Failed to load inspections');
  return data.items;
}

/** Owner payout statements (`GET /api/v1/landlord/statements`). */
export async function fetchStatements(): Promise<LandlordStatement[]> {
  const { data, error } = await crossub.GET('/landlord/statements');
  if (error || !data) throw new Error('Failed to load statements');
  return data.items;
}

/** Monthly owner statements / P&L (`GET /api/v1/landlord/statements/monthly`). */
export async function fetchMonthlyStatements(): Promise<LandlordMonthlyStatement[]> {
  const { data, error } = await crossub.GET('/landlord/statements/monthly');
  if (error || !data) throw new Error('Failed to load monthly statements');
  // This endpoint returns a bare array (not a paginated envelope).
  return data;
}

/** Rent payments received (`GET /api/v1/landlord/payments`). */
export async function fetchPayments(): Promise<LandlordPaymentDto[]> {
  const { data, error } = await crossub.GET('/landlord/payments');
  if (error || !data) throw new Error('Failed to load payments');
  return data;
}

/** Outstanding amounts owed (`GET /api/v1/landlord/outstanding`). */
export async function fetchOutstanding(): Promise<LandlordOutstandingDto[]> {
  const { data, error } = await crossub.GET('/landlord/outstanding');
  if (error || !data) throw new Error('Failed to load outstanding amounts');
  return data;
}

/** Documents across owned properties (`GET /api/v1/landlord/documents`). */
export async function fetchDocuments(): Promise<LandlordDocumentDto[]> {
  const { data, error } = await crossub.GET('/landlord/documents');
  if (error || !data) throw new Error('Failed to load documents');
  return data;
}

/** Message threads with nested messages (`GET /api/v1/landlord/messages`). */
export async function fetchMessageThreads(): Promise<LandlordMessageThreadDto[]> {
  const { data, error } = await crossub.GET('/landlord/messages');
  if (error || !data) throw new Error('Failed to load messages');
  return data;
}

/** Open a new message thread (`POST /api/v1/landlord/messages`). */
export async function createMessageThread(
  body: CreateMessageThreadBody,
): Promise<LandlordMessageThreadDto> {
  const { data, error } = await crossub.POST('/landlord/messages', { body });
  if (error || !data) throw new Error('Failed to create message thread');
  return data;
}

/** Reply to an existing thread (`POST /api/v1/landlord/messages/{threadId}/reply`). */
export async function replyToThread(
  threadId: string,
  body: string,
): Promise<LandlordMessageThreadDto> {
  const { data, error } = await crossub.POST('/landlord/messages/{threadId}/reply', {
    params: { path: { threadId } },
    body: { body },
  });
  if (error || !data) throw new Error('Failed to send reply');
  return data;
}

/** Approvals to decide (`GET /api/v1/landlord/approvals`). */
export async function fetchApprovals(): Promise<LandlordApprovalDto[]> {
  const { data, error } = await crossub.GET('/landlord/approvals');
  if (error || !data) throw new Error('Failed to load approvals');
  return data;
}

/** Record a decision on an approval (`PATCH /api/v1/landlord/approvals/{id}`). */
export async function decideApproval(
  approvalId: string,
  status: ApprovalDecisionStatus,
  note?: string,
): Promise<LandlordApprovalDto> {
  const { data, error } = await crossub.PATCH('/landlord/approvals/{approvalId}', {
    params: { path: { approvalId } },
    body: { status, note },
  });
  if (error || !data) throw new Error('Failed to decide approval');
  return data;
}

/** Notifications (`GET /api/v1/landlord/notifications`). */
export async function fetchNotifications(): Promise<LandlordNotificationDto[]> {
  const { data, error } = await crossub.GET('/landlord/notifications');
  if (error || !data) throw new Error('Failed to load notifications');
  return data;
}

/** Mark one notification read (`PATCH /api/v1/landlord/notifications/{id}/read`). */
export async function markNotificationRead(
  notificationId: string,
): Promise<LandlordNotificationDto> {
  const { data, error } = await crossub.PATCH(
    '/landlord/notifications/{notificationId}/read',
    { params: { path: { notificationId } } },
  );
  if (error || !data) throw new Error('Failed to mark notification read');
  return data;
}

/** Mark all notifications read (`POST /api/v1/landlord/notifications/read-all`). */
export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  const { data, error } = await crossub.POST('/landlord/notifications/read-all');
  if (error || !data) throw new Error('Failed to mark all notifications read');
  return data;
}
