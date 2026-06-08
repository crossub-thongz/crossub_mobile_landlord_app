'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Wrench } from 'lucide-react';

import { EmptyState } from '@/components/landlord/empty-state';
import { PageIntro } from '@/components/landlord/page-intro';
import { StatusBadge } from '@/components/landlord/status-badge';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { maintenanceDetail } from '@/constants/routes';
import { formatCurrency } from '@/lib/utils';

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export default function MaintenancePage() {
  const { maintenance } = useLandlordData();
  const [tab, setTab] = useState('active');

  const list = useMemo(() => {
    if (tab === 'completed') {
      return maintenance.filter((m) => m.status === 'completed');
    }
    return maintenance.filter((m) => m.status !== 'completed');
  }, [maintenance, tab]);

  return (
    <LandlordShell title="Maintenance">
      <div className="space-y-4">
        <PageIntro description="Monitor ongoing and completed maintenance across your portfolio." />

        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium transition ${
                tab === t.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title={tab === 'active' ? 'No active maintenance' : 'No completed records'}
            description="Maintenance jobs will appear here when reported or completed."
          />
        ) : (
          <div className="space-y-2">
            {list.map((job) => (
              <Link
                key={job.id}
                href={maintenanceDetail(job.id)}
                className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-4 transition hover:border-primary/30"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={job.status.replace('_', ' ')} variant={job.status} />
                    <StatusBadge label={job.priority} variant={job.priority} />
                  </div>
                  <p className="text-sm font-semibold">{job.issueDescription}</p>
                  <p className="text-muted-foreground text-xs">{job.propertyAddress}</p>
                  {job.contractorName && (
                    <p className="text-muted-foreground text-xs">
                      Contractor: {job.contractorName}
                    </p>
                  )}
                  {(job.quotedAmount ?? job.totalCost) !== undefined && (
                    <p className="text-primary text-sm font-medium">
                      {formatCurrency(job.quotedAmount ?? job.totalCost ?? 0)}
                    </p>
                  )}
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
