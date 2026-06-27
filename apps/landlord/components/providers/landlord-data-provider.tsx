'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '@/components/providers/auth-provider';
import {
  fetchInspections,
  fetchMaintenance,
} from '@/lib/crossub-api/landlord-client';
import {
  mapLandlordInspections,
  mapLandlordMaintenance,
} from '@/lib/crossub-api/landlord-mappers';
import { api, ApiError } from '@/lib/api';
import {
  APPROVALS,
  DOCUMENTS,
  INSPECTIONS,
  MAINTENANCE,
  MESSAGE_THREADS,
  NOTIFICATIONS,
  OUTSTANDING,
  PAYMENTS,
  PROPERTIES,
  STATEMENTS,
  THREAD_MESSAGES,
} from '@/lib/mock-data';
import { buildPortfolioSummary } from '@/lib/portfolio-summary';
import type {
  ApprovalItem,
  ApprovalStatus,
  InspectionRecord,
  LandlordDocument,
  LandlordNotification,
  LandlordProperty,
  MaintenanceJob,
  MessageCategory,
  MessageThread,
  MonthlyStatement,
  OutstandingAmount,
  PaymentRecord,
  PortfolioSummary,
  ThreadMessage,
} from '@/lib/types';

interface LandlordDataContextValue {
  loading: boolean;
  apiConnected: boolean;
  apiError: string | null;
  refresh: () => Promise<void>;
  portfolio: PortfolioSummary;
  properties: LandlordProperty[];
  approvals: ApprovalItem[];
  inspections: InspectionRecord[];
  maintenance: MaintenanceJob[];
  payments: PaymentRecord[];
  outstanding: OutstandingAmount[];
  statements: MonthlyStatement[];
  messages: MessageThread[];
  documents: LandlordDocument[];
  notifications: LandlordNotification[];
  getThreadMessages: (threadId: string) => ThreadMessage[];
  getProperty: (id: string) => LandlordProperty | undefined;
  getApproval: (id: string) => ApprovalItem | undefined;
  resolveApproval: (id: string, status: ApprovalStatus, note?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  sendMessage: (threadId: string, body: string) => void;
  createMessageThread: (input: {
    category: MessageCategory;
    subject: string;
    propertyId?: string;
    body: string;
  }) => string;
}

const LandlordDataContext = createContext<LandlordDataContextValue | null>(null);

export function LandlordDataProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [approvals, setApprovals] = useState(APPROVALS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [messages, setMessages] = useState(MESSAGE_THREADS);
  const [threadMessages, setThreadMessages] = useState(THREAD_MESSAGES);

  // Wired to the live landlord facade (replaced on a successful fetch, demo seed on error).
  const [inspections, setInspections] = useState(INSPECTIONS);
  const [maintenance, setMaintenance] = useState(MAINTENANCE);

  // Still demo-only: properties + statements facades are thinner than these screens
  // (property has no rent/manager/agency/lease; a statement is one disbursement line, not
  // a monthly P&L) — deferred until those facades are enriched. The rest have no facade.
  const properties = PROPERTIES;
  const payments = PAYMENTS;
  const outstanding = OUTSTANDING;
  const statements = STATEMENTS;
  const documents = DOCUMENTS;

  const portfolio = useMemo(
    () => buildPortfolioSummary(properties, approvals, maintenance),
    [properties, approvals, maintenance],
  );

  const refresh = useCallback(async () => {
    if (status !== 'authed') {
      setLoading(false);
      return;
    }
    setLoading(true);
    setApiError(null);
    try {
      await api.get('/health');
      setApiConnected(true);
    } catch (err) {
      setApiConnected(false);
      if (err instanceof ApiError) {
        setApiError(`API unavailable (${err.status})`);
      } else {
        setApiError('API unavailable — using demo data');
      }
    }
    // Load the live facade domains the screens map cleanly — each independently, so a
    // failure in one leaves just that slice on demo data (the portfolio never blanks).
    const [maint, insp] = await Promise.allSettled([
      fetchMaintenance(),
      fetchInspections(),
    ]);
    if (maint.status === 'fulfilled') {
      setMaintenance(mapLandlordMaintenance(maint.value));
      setApiConnected(true);
    }
    if (insp.status === 'fulfilled') {
      setInspections(mapLandlordInspections(insp.value));
      setApiConnected(true);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const resolveApproval = useCallback(
    (id: string, newStatus: ApprovalStatus, _note?: string) => {
      setApprovals((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.href.includes(id) ? { ...n, read: true } : n,
        ),
      );
    },
    [],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const getThreadMessages = useCallback(
    (threadId: string) => threadMessages[threadId] ?? [],
    [threadMessages],
  );

  const sendMessage = useCallback((threadId: string, body: string) => {
    const msg: ThreadMessage = {
      id: `msg-${Date.now()}`,
      from: 'You',
      body,
      at: new Date().toISOString(),
    };
    setThreadMessages((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] ?? []), msg],
    }));
    setMessages((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, lastMessage: body, lastAt: msg.at, unread: 0 }
          : t,
      ),
    );
  }, []);

  const createMessageThread = useCallback(
    (input: {
      category: MessageCategory;
      subject: string;
      propertyId?: string;
      body: string;
    }) => {
      const id = `msg-${Date.now()}`;
      const property = input.propertyId
        ? properties.find((p) => p.id === input.propertyId)
        : undefined;
      const thread: MessageThread = {
        id,
        propertyId: input.propertyId,
        propertyAddress: property
          ? `${property.address}, ${property.suburb}`
          : undefined,
        subject: input.subject,
        category: input.category,
        participants: ['CROSSUB Support'],
        lastMessage: input.body,
        lastAt: new Date().toISOString(),
        unread: 0,
      };
      setMessages((prev) => [thread, ...prev]);
      setThreadMessages((prev) => ({
        ...prev,
        [id]: [
          {
            id: `m-${Date.now()}`,
            from: 'You',
            body: input.body,
            at: new Date().toISOString(),
          },
        ],
      }));
      return id;
    },
    [properties],
  );

  const value: LandlordDataContextValue = {
    loading,
    apiConnected,
    apiError,
    refresh,
    portfolio,
    properties,
    approvals,
    inspections,
    maintenance,
    payments,
    outstanding,
    statements,
    messages,
    documents,
    notifications,
    getThreadMessages,
    getProperty: (id) => properties.find((p) => p.id === id),
    getApproval: (id) => approvals.find((a) => a.id === id),
    resolveApproval,
    markNotificationRead,
    markAllNotificationsRead,
    sendMessage,
    createMessageThread,
  };

  return (
    <LandlordDataContext.Provider value={value}>
      {children}
    </LandlordDataContext.Provider>
  );
}

export function useLandlordData(): LandlordDataContextValue {
  const ctx = useContext(LandlordDataContext);
  if (!ctx) {
    throw new Error('useLandlordData must be used within LandlordDataProvider');
  }
  return ctx;
}
