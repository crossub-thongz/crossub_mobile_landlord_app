export const ROUTES = {
  DASHBOARD: '/dashboard',
  APPROVALS: '/approvals',
  PROPERTIES: '/properties',
  INSPECTIONS: '/inspections',
  MAINTENANCE: '/maintenance',
  ACCOUNTING: '/accounting',
  STATEMENTS: '/statements',
  MESSAGES: '/messages',
  DOCUMENTS: '/documents',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

export const PUBLIC_ROUTE_PATTERNS = [
  /^\/login\/?$/,
  /^\/forgot-password\/?$/,
  /^\/reset-password(\/|$)/,
];

export const isPublicRoute = (pathname: string): boolean =>
  PUBLIC_ROUTE_PATTERNS.some((rx) => rx.test(pathname));

export const approvalDetail = (id: string) => `/approvals/${id}`;
export const propertyDetail = (id: string) => `/properties/${id}`;
export const inspectionDetail = (id: string) => `/inspections/${id}`;
export const maintenanceDetail = (id: string) => `/maintenance/${id}`;
export const statementDetail = (id: string) => `/statements/${id}`;
export const messagesNew = () => '/messages/new';
export const messageDetail = (id: string) => `/messages/${id}`;
