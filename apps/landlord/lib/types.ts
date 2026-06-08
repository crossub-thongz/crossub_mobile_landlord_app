export type ApprovalCategory =
  | 'maintenance'
  | 'rent_review'
  | 'lease_renewal'
  | 'special_expense'
  | 'tribunal_legal'
  | 'ingoing_inspection';

export type ApprovalStatus = 'pending' | 'approved' | 'declined' | 'more_info';

export interface ApprovalItem {
  id: string;
  category: ApprovalCategory;
  title: string;
  description: string;
  propertyId: string;
  propertyAddress: string;
  amount?: number;
  requestedBy: string;
  requestedAt: string;
  status: ApprovalStatus;
  priority: 'normal' | 'urgent';
  documents?: { name: string; url: string }[];
  recommendation?: string;
}

export type PropertyStatus = 'occupied' | 'vacant' | 'vacating' | 'periodic';

export interface LandlordProperty {
  id: string;
  address: string;
  suburb: string;
  tenantName: string;
  rentWeekly: number;
  status: PropertyStatus;
  needAction: boolean;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  leaseStart?: string;
  leaseEnd?: string;
  agencyName: string;
  propertyManager: string;
  managerEmail: string;
  managerPhone: string;
}

export type InspectionType = 'open' | 'ingoing' | 'routine' | 'outgoing';

export interface InspectionRecord {
  id: string;
  type: InspectionType;
  propertyId: string;
  propertyAddress: string;
  inspectionDate: string;
  inspectorName: string;
  attendees?: number;
  status: 'scheduled' | 'completed' | 'pending_approval';
  issuesIdentified?: number;
  tenantComments?: string;
  agentComments?: string;
  damageSummary?: string;
  bondClaimItems?: string[];
}

export type MaintenanceStatus = 'in_progress' | 'completed' | 'awaiting_approval';

export interface MaintenanceJob {
  id: string;
  propertyId: string;
  propertyAddress: string;
  issueDescription: string;
  priority: 'normal' | 'urgent';
  contractorName?: string;
  quotedAmount?: number;
  status: MaintenanceStatus;
  completionDate?: string;
  totalCost?: number;
  invoiceUrl?: string;
}

export interface PaymentRecord {
  id: string;
  propertyId: string;
  propertyAddress: string;
  paymentDate: string;
  amount: number;
  method: string;
}

export interface OutstandingAmount {
  id: string;
  propertyId: string;
  propertyAddress: string;
  type: 'rent' | 'utility' | 'maintenance';
  amount: number;
  dueDate: string;
}

export interface MonthlyStatement {
  id: string;
  propertyId: string;
  propertyAddress: string;
  period: string;
  rentalIncome: number;
  managementFees: number;
  maintenanceCosts: number;
  inspectionCosts: number;
  utilityExpenses: number;
  otherExpenses: number;
  netAmount: number;
  availableAt: string;
}

export type MessageCategory =
  | 'general'
  | 'maintenance'
  | 'accounting'
  | 'inspections'
  | 'leasing';

export interface MessageThread {
  id: string;
  propertyId?: string;
  propertyAddress?: string;
  subject: string;
  category: MessageCategory;
  participants: string[];
  lastMessage: string;
  lastAt: string;
  unread: number;
}

export interface ThreadMessage {
  id: string;
  from: string;
  body: string;
  at: string;
  attachments?: { name: string; url: string }[];
}

export type DocumentCategory =
  | 'management_agreement'
  | 'lease'
  | 'inspection'
  | 'maintenance_quote'
  | 'maintenance_invoice'
  | 'statement'
  | 'tribunal'
  | 'insurance';

export interface LandlordDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  propertyAddress?: string;
  uploadedAt: string;
  version: number;
  url: string;
}

export interface LandlordNotification {
  id: string;
  type:
    | 'rent_received'
    | 'arrears'
    | 'maintenance'
    | 'approval_required'
    | 'inspection'
    | 'rent_review'
    | 'lease_renewal'
    | 'statement';
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
}

export interface PortfolioSummary {
  totalProperties: number;
  occupiedProperties: number;
  vacantProperties: number;
  weeklyRent: number;
  monthlyRent: number;
  arrears: number;
  maintenanceInProgress: number;
  needApproval: number;
}
