'use client';

import { use } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';

import { StatusBadge } from '@/components/landlord/status-badge';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { ROUTES } from '@/constants/routes';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { maintenance } = useLandlordData();
  const job = maintenance.find((m) => m.id === id);

  if (!job) {
    return (
      <LandlordShell title="Maintenance" backHref={ROUTES.MAINTENANCE}>
        <p className="text-muted-foreground text-sm">Maintenance record not found.</p>
      </LandlordShell>
    );
  }

  return (
    <LandlordShell title="Maintenance Detail" backHref={ROUTES.MAINTENANCE}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <StatusBadge label={job.status.replace('_', ' ')} variant={job.status} />
          <StatusBadge label={job.priority} variant={job.priority} />
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Issue</p>
            <p className="font-medium">{job.issueDescription}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Property</p>
            <p>{job.propertyAddress}</p>
          </div>
          {job.contractorName && (
            <div>
              <p className="text-muted-foreground text-xs">Contractor</p>
              <p>{job.contractorName}</p>
            </div>
          )}
          {job.quotedAmount !== undefined && (
            <div>
              <p className="text-muted-foreground text-xs">Quoted Amount</p>
              <p className="text-primary text-lg font-semibold">
                {formatCurrency(job.quotedAmount)}
              </p>
            </div>
          )}
          {job.status === 'completed' && job.totalCost !== undefined && (
            <div>
              <p className="text-muted-foreground text-xs">Total Cost</p>
              <p className="text-primary text-lg font-semibold">
                {formatCurrency(job.totalCost)}
              </p>
              {job.completionDate && (
                <p className="text-muted-foreground text-xs">
                  Completed {formatDate(job.completionDate)}
                </p>
              )}
            </div>
          )}
        </div>

        {job.status === 'awaiting_approval' && (
          <Link
            href={ROUTES.APPROVALS}
            className="block rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-center text-sm font-medium text-amber-400 hover:bg-amber-500/10"
          >
            Review approval in Approval Centre →
          </Link>
        )}

        {job.invoiceUrl && (
          <a
            href={job.invoiceUrl}
            className="flex items-center gap-2 rounded-lg border bg-secondary/30 px-3 py-2 text-sm hover:bg-secondary"
          >
            <FileText className="text-primary size-4" />
            View invoice
          </a>
        )}
      </div>
    </LandlordShell>
  );
}
