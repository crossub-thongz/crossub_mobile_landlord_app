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
