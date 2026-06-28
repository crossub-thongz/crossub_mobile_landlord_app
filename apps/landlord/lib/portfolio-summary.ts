import type {
  ApprovalItem,
  LandlordProperty,
  MaintenanceJob,
  OutstandingAmount,
  PortfolioSummary,
} from './types';

export function buildPortfolioSummary(
  properties: LandlordProperty[],
  approvals: ApprovalItem[],
  maintenance: MaintenanceJob[],
  outstanding: OutstandingAmount[],
): PortfolioSummary {
  const occupied = properties.filter(
    (p) => p.status === 'occupied' || p.status === 'vacating' || p.status === 'periodic',
  ).length;
  const vacant = properties.filter((p) => p.status === 'vacant').length;
  const weeklyRent = properties.reduce((sum, p) => sum + p.rentWeekly, 0);

  return {
    totalProperties: properties.length,
    occupiedProperties: occupied,
    vacantProperties: vacant,
    weeklyRent,
    monthlyRent: Math.round(weeklyRent * 52 / 12),
    arrears: outstanding.reduce((sum, o) => sum + o.amount, 0),
    maintenanceInProgress: maintenance.filter((m) => m.status === 'in_progress').length,
    needApproval: approvals.filter((a) => a.status === 'pending').length,
  };
}
