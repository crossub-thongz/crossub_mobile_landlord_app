'use client';

import { use } from 'react';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

import { StatusBadge } from '@/components/landlord/status-badge';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { ROUTES, maintenanceDetail } from '@/constants/routes';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getProperty, maintenance, inspections, approvals } = useLandlordData();
  const property = getProperty(id);

  if (!property) {
    return (
      <LandlordShell title="Property" backHref={ROUTES.PROPERTIES}>
        <p className="text-muted-foreground text-sm">Property not found.</p>
      </LandlordShell>
    );
  }

  const propertyMaintenance = maintenance.filter((m) => m.propertyId === id);
  const propertyInspections = inspections.filter((i) => i.propertyId === id);
  const propertyApprovals = approvals.filter(
    (a) => a.propertyId === id && (a.status === 'pending' || a.status === 'more_info'),
  );

  return (
    <LandlordShell
      title={`${property.address}, ${property.suburb}`}
      backHref={ROUTES.PROPERTIES}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <StatusBadge label={property.status} variant={property.status} />
          {property.rentWeekly > 0 && (
            <span className="text-primary text-sm font-semibold">
              {formatCurrency(property.rentWeekly)}/week
            </span>
          )}
        </div>

        <section className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Property Information</h3>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-lg bg-secondary/50 p-2">
              <p className="text-muted-foreground text-[10px]">Bedrooms</p>
              <p className="font-semibold">{property.bedrooms}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-2">
              <p className="text-muted-foreground text-[10px]">Bathrooms</p>
              <p className="font-semibold">{property.bathrooms}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-2">
              <p className="text-muted-foreground text-[10px]">Parking</p>
              <p className="font-semibold">{property.parkingSpaces}</p>
            </div>
          </div>
        </section>

        {property.tenantName !== 'Vacant' && (
          <section className="rounded-xl border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold">Tenant Information</h3>
            <p className="text-sm">{property.tenantName}</p>
            {property.leaseStart && (
              <p className="text-muted-foreground text-xs">
                Lease: {formatDate(property.leaseStart)}
                {property.leaseEnd ? ` — ${formatDate(property.leaseEnd)}` : ''}
              </p>
            )}
          </section>
        )}

        <section className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Agent Information</h3>
          <p className="text-sm">{property.agencyName}</p>
          <p className="text-sm font-medium">{property.propertyManager}</p>
          <a
            href={`mailto:${property.managerEmail}`}
            className="text-primary flex items-center gap-2 text-xs"
          >
            <Mail className="size-3.5" />
            {property.managerEmail}
          </a>
          <a
            href={`tel:${property.managerPhone}`}
            className="text-primary flex items-center gap-2 text-xs"
          >
            <Phone className="size-3.5" />
            {property.managerPhone}
          </a>
        </section>

        {propertyApprovals.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Pending Approvals</h3>
            {propertyApprovals.map((a) => (
              <Link
                key={a.id}
                href={`/approvals/${a.id}`}
                className="block rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm hover:bg-amber-500/10"
              >
                {a.title}
              </Link>
            ))}
          </section>
        )}

        {propertyMaintenance.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Maintenance</h3>
            {propertyMaintenance.map((m) => (
              <Link
                key={m.id}
                href={maintenanceDetail(m.id)}
                className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm hover:border-primary/30"
              >
                <span>{m.issueDescription}</span>
                <StatusBadge label={m.status.replace('_', ' ')} variant={m.status} />
              </Link>
            ))}
          </section>
        )}

        {propertyInspections.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Inspections</h3>
            {propertyInspections.map((i) => (
              <Link
                key={i.id}
                href={`/inspections/${i.id}`}
                className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm hover:border-primary/30"
              >
                <span className="capitalize">{i.type} inspection</span>
                <StatusBadge label={i.status} variant={i.status} />
              </Link>
            ))}
          </section>
        )}
      </div>
    </LandlordShell>
  );
}
