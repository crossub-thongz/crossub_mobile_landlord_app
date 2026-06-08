import type { ApprovalCategory } from './types';

export const APPROVAL_CATEGORY_LABELS: Record<ApprovalCategory, string> = {
  maintenance: 'Maintenance',
  rent_review: 'Rent Review',
  lease_renewal: 'Lease Renewal',
  special_expense: 'Special Expense',
  tribunal_legal: 'Tribunal / Legal',
  ingoing_inspection: 'Ingoing Inspection',
};
