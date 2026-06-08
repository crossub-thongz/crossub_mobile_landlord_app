'use client';

import { use } from 'react';

import { StatusBadge } from '@/components/landlord/status-badge';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/lib/utils';

export default function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { inspections } = useLandlordData();
  const inspection = inspections.find((i) => i.id === id);

  if (!inspection) {
    return (
      <LandlordShell title="Inspection" backHref={ROUTES.INSPECTIONS}>
        <p className="text-muted-foreground text-sm">Inspection not found.</p>
      </LandlordShell>
    );
  }

  return (
    <LandlordShell title="Inspection Report" backHref={ROUTES.INSPECTIONS}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <StatusBadge label={inspection.type} variant="normal" />
          <StatusBadge label={inspection.status} variant={inspection.status} />
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Property</p>
            <p className="font-medium">{inspection.propertyAddress}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Inspection Date</p>
            <p>{formatDate(inspection.inspectionDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Inspector</p>
            <p>{inspection.inspectorName}</p>
          </div>
          {inspection.attendees !== undefined && (
            <div>
              <p className="text-muted-foreground text-xs">Attendees</p>
              <p>{inspection.attendees}</p>
            </div>
          )}
        </div>

        {inspection.damageSummary && (
          <section className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold">Damage Summary</h3>
            <p className="text-muted-foreground mt-2 text-sm">{inspection.damageSummary}</p>
          </section>
        )}

        {inspection.bondClaimItems && inspection.bondClaimItems.length > 0 && (
          <section className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold">Bond Claim Items</h3>
            <ul className="text-muted-foreground mt-2 list-inside list-disc text-sm">
              {inspection.bondClaimItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {inspection.tenantComments && (
          <section className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <h3 className="text-sm font-semibold">Tenant Comments</h3>
            <p className="text-muted-foreground mt-2 text-sm">{inspection.tenantComments}</p>
          </section>
        )}

        {inspection.agentComments && (
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h3 className="text-sm font-semibold">Agent Comments</h3>
            <p className="text-muted-foreground mt-2 text-sm">{inspection.agentComments}</p>
          </section>
        )}

        <p className="text-muted-foreground text-xs">
          Photos and full room-by-room reports are available in the Document Centre.
        </p>
      </div>
    </LandlordShell>
  );
}
