'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';

import { EmptyState } from '@/components/landlord/empty-state';
import { PageIntro } from '@/components/landlord/page-intro';
import { StatusBadge } from '@/components/landlord/status-badge';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { approvalDetail } from '@/constants/routes';
import { APPROVAL_CATEGORY_LABELS } from '@/lib/approval-labels';
import type { ApprovalCategory } from '@/lib/types';
import { formatCurrency, formatRelative } from '@/lib/utils';

const FILTERS: { id: 'all' | 'pending' | ApprovalCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'rent_review', label: 'Rent Review' },
  { id: 'lease_renewal', label: 'Lease Renewal' },
  { id: 'special_expense', label: 'Special Expense' },
  { id: 'tribunal_legal', label: 'Legal' },
];

export default function ApprovalsPage() {
  const { approvals } = useLandlordData();
  const [filter, setFilter] = useState<string>('pending');

  const list = useMemo(() => {
    let items = [...approvals];
    if (filter === 'pending') {
      items = items.filter((a) => a.status === 'pending' || a.status === 'more_info');
    } else if (filter !== 'all') {
      items = items.filter((a) => a.category === filter);
    }
    return items.sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    );
  }, [approvals, filter]);

  const pendingCount = approvals.filter(
    (a) => a.status === 'pending' || a.status === 'more_info',
  ).length;

  return (
    <LandlordShell title="Approval Centre">
      <div className="space-y-4">
        <PageIntro
          title="Centralised approvals"
          description="All items requiring your decision — maintenance quotes, rent reviews, lease renewals, and more. No more scattered email or SMS requests."
        />

        {pendingCount > 0 && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            <span className="font-semibold text-primary">{pendingCount}</span>
            <span className="text-muted-foreground"> item{pendingCount === 1 ? '' : 's'} awaiting your decision</span>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filter === f.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No approvals"
            description="You're all caught up — nothing needs your decision right now."
          />
        ) : (
          <div className="space-y-2">
            {list.map((item) => (
              <Link
                key={item.id}
                href={approvalDetail(item.id)}
                className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-4 transition hover:border-primary/30"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      label={APPROVAL_CATEGORY_LABELS[item.category]}
                      variant={item.category}
                    />
                    <StatusBadge label={item.status.replace('_', ' ')} variant={item.status} />
                    {item.priority === 'urgent' && (
                      <StatusBadge label="Urgent" variant="urgent" />
                    )}
                  </div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-muted-foreground text-xs">{item.propertyAddress}</p>
                  {item.amount !== undefined && (
                    <p className="text-primary text-sm font-medium">
                      {formatCurrency(item.amount)}
                      {item.category === 'rent_review' && '/week increase'}
                    </p>
                  )}
                  <p className="text-muted-foreground text-[10px]">
                    {item.requestedBy} · {formatRelative(item.requestedAt)}
                  </p>
                </div>
                <ChevronRight className="text-muted-foreground mt-1 size-5 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </LandlordShell>
  );
}
