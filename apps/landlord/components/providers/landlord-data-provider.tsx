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
  createMessageThread as apiCreateMessageThread,
  decideApproval as apiDecideApproval,
  fetchApprovals,
  fetchDocuments,
  fetchInspections,
  fetchMaintenance,
  fetchMessageThreads,
  fetchMonthlyStatements,
  fetchNotifications,
  fetchOutstanding,
  fetchPayments,
  fetchProperties,
  markAllNotificationsRead as apiMarkAllNotificationsRead,
  markNotificationRead as apiMarkNotificationRead,
  replyToThread as apiReplyToThread,
} from '@/lib/crossub-api/landlord-client';
import {
  approvalDecisionToApi,
  buildThreadMessages,
  CATEGORY_TO_DEPARTMENT,
  mapLandlordApprovals,
  mapLandlordDocuments,
  mapLandlordInspections,
  mapLandlordMaintenance,
  mapLandlordNotifications,
  mapLandlordOutstanding,
  mapLandlordPayments,
  mapLandlordProperties,
  mapLandlordStatements,
  mapLandlordThreads,
  toMessageThread,
  toThreadMessage,
} from '@/lib/crossub-api/landlord-mappers';
import { api, ApiError } from '@/lib/api';
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
  sendMessage: (threadId: string, body: string) => Promise<boolean>;
  createMessageThread: (input: {
    category: MessageCategory;
    subject: string;
    propertyId?: string;
    body: string;
  }) => Promise<string | null>;
}

const LandlordDataContext = createContext<LandlordDataContextValue | null>(null);

export function LandlordDataProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // All ten domains are served by the live landlord facade. State starts empty and is
  // populated by `refresh()`; on an API failure a slice simply stays empty (the screens
  // render their own empty states) — no mock/demo data is ever shown to a tester.
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [notifications, setNotifications] = useState<LandlordNotification[]>([]);
  const [messages, setMessages] = useState<MessageThread[]>([]);
  const [threadMessages, setThreadMessages] = useState<Record<string, ThreadMessage[]>>({});
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceJob[]>([]);
  const [properties, setProperties] = useState<LandlordProperty[]>([]);
  const [statements, setStatements] = useState<MonthlyStatement[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [outstanding, setOutstanding] = useState<OutstandingAmount[]>([]);
  const [documents, setDocuments] = useState<LandlordDocument[]>([]);

  const portfolio = useMemo(
    () => buildPortfolioSummary(properties, approvals, maintenance, outstanding),
    [properties, approvals, maintenance, outstanding],
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
        setApiError('API unavailable');
      }
    }
    // Load every live facade domain independently, so a failure in one leaves just that
    // slice empty (its screen shows an empty state) rather than blanking the whole app.
    const [maint, insp, props, stmts, pays, owed, docs, msgs, apprs, notifs] =
      await Promise.allSettled([
        fetchMaintenance(),
        fetchInspections(),
        fetchProperties(),
        fetchMonthlyStatements(),
        fetchPayments(),
        fetchOutstanding(),
        fetchDocuments(),
        fetchMessageThreads(),
        fetchApprovals(),
        fetchNotifications(),
      ]);
    if (maint.status === 'fulfilled') {
      setMaintenance(mapLandlordMaintenance(maint.value));
      setApiConnected(true);
    }
    if (insp.status === 'fulfilled') {
      setInspections(mapLandlordInspections(insp.value));
      setApiConnected(true);
    }
    if (props.status === 'fulfilled') {
      setProperties(mapLandlordProperties(props.value));
      setApiConnected(true);
    }
    if (stmts.status === 'fulfilled') {
      setStatements(mapLandlordStatements(stmts.value));
      setApiConnected(true);
    }
    if (pays.status === 'fulfilled') {
      setPayments(mapLandlordPayments(pays.value));
      setApiConnected(true);
    }
    if (owed.status === 'fulfilled') {
      setOutstanding(mapLandlordOutstanding(owed.value));
      setApiConnected(true);
    }
    if (docs.status === 'fulfilled') {
      setDocuments(mapLandlordDocuments(docs.value));
      setApiConnected(true);
    }
    if (msgs.status === 'fulfilled') {
      // One fetch fills both the thread list and each thread's message history.
      setMessages(mapLandlordThreads(msgs.value));
      setThreadMessages(buildThreadMessages(msgs.value));
      setApiConnected(true);
    }
    if (apprs.status === 'fulfilled') {
      setApprovals(mapLandlordApprovals(apprs.value));
      setApiConnected(true);
    }
    if (notifs.status === 'fulfilled') {
      setNotifications(mapLandlordNotifications(notifs.value));
      setApiConnected(true);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const resolveApproval = useCallback(
    (id: string, newStatus: ApprovalStatus, note?: string) => {
      // Optimistic local update (instant UI), then persist to the API.
      setApprovals((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
      );
      setNotifications((prev) =>
        prev.map((n) => (n.href.includes(id) ? { ...n, read: true } : n)),
      );
      const decision = approvalDecisionToApi(newStatus);
      if (decision) void apiDecideApproval(id, decision, note).catch(() => {});
    },
    [],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    void apiMarkNotificationRead(id).catch(() => {});
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    void apiMarkAllNotificationsRead().catch(() => {});
  }, []);

  const getThreadMessages = useCallback(
    (threadId: string) => threadMessages[threadId] ?? [],
    [threadMessages],
  );

  const sendMessage = useCallback(
    async (threadId: string, body: string): Promise<boolean> => {
      // Optimistic append for instant feedback...
      const optimistic: ThreadMessage = {
        id: `tmp-${Date.now()}`,
        from: 'You',
        body,
        at: new Date().toISOString(),
      };
      setThreadMessages((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] ?? []), optimistic],
      }));
      try {
        // ...then persist and reconcile with the server's canonical thread.
        const dto = await apiReplyToThread(threadId, body);
        setThreadMessages((prev) => ({
          ...prev,
          [dto.id]: dto.messages.map(toThreadMessage),
        }));
        setMessages((prev) =>
          prev.map((t) => (t.id === dto.id ? toMessageThread(dto) : t)),
        );
        return true;
      } catch {
        // Roll the optimistic message back so the UI reflects the failed send.
        setThreadMessages((prev) => ({
          ...prev,
          [threadId]: (prev[threadId] ?? []).filter((m) => m.id !== optimistic.id),
        }));
        return false;
      }
    },
    [],
  );

  const createMessageThread = useCallback(
    async (input: {
      category: MessageCategory;
      subject: string;
      propertyId?: string;
      body: string;
    }): Promise<string | null> => {
      try {
        const dto = await apiCreateMessageThread({
          subject: input.subject,
          body: input.body,
          department: CATEGORY_TO_DEPARTMENT[input.category],
          propertyId: input.propertyId,
        });
        setMessages((prev) => [
          toMessageThread(dto),
          ...prev.filter((t) => t.id !== dto.id),
        ]);
        setThreadMessages((prev) => ({
          ...prev,
          [dto.id]: dto.messages.map(toThreadMessage),
        }));
        return dto.id;
      } catch {
        return null;
      }
    },
    [],
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
