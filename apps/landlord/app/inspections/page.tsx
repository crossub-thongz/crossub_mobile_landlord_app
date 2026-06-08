'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ClipboardList } from 'lucide-react';

import { EmptyState } from '@/components/landlord/empty-state';
import { PageIntro } from '@/components/landlord/page-intro';
import { StatusBadge } from '@/components/landlord/status-badge';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { inspectionDetail } from '@/constants/routes';
import type { InspectionType } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const TYPE_LABELS: Record<InspectionType, string> = {
  open: 'Open Inspection',
  ingoing: 'Ingoing',
  routine: 'Routine',
  outgoing: 'Outgoing',
};

const FILTERS: { id: 'all' | InspectionType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'ingoing', label: 'Ingoing' },
  { id: 'routine', label: 'Routine' },
  { id: 'outgoing', label: 'Outgoing' },
];

export default function InspectionsPage() {
  const { inspections } = useLandlordData();
  const [filter, setFilter] = useState<string>('all');

  const list = useMemo(() => {
    if (filter === 'all') return inspections;
    return inspections.filter((i) => i.type === filter);
  }, [inspections, filter]);

  return (
    <LandlordShell title="Inspections">
      <div className="space-y-4">
        <PageIntro description="Open, ingoing, routine, and outgoing inspection reports for your properties." />

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
            icon={ClipboardList}
            title="No inspections"
            description="No inspection records match this filter."
          />
        ) : (
          <div className="space-y-2">
            {list.map((item) => (
              <Link
                key={item.id}
                href={inspectionDetail(item.id)}
                className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-4 transition hover:border-primary/30"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={TYPE_LABELS[item.type]} variant="normal" />
                    <StatusBadge label={item.status} variant={item.status} />
                  </div>
                  <p className="text-sm font-semibold">{item.propertyAddress}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(item.inspectionDate)} · {item.inspectorName}
                    {item.attendees !== undefined && ` · ${item.attendees} attendees`}
                  </p>
                  {item.issuesIdentified !== undefined && item.issuesIdentified > 0 && (
                    <p className="text-amber-400 text-xs">
                      {item.issuesIdentified} issue{item.issuesIdentified === 1 ? '' : 's'} identified
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
