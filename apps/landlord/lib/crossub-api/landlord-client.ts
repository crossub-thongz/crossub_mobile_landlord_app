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
