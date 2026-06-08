'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { EmptyState } from '@/components/landlord/empty-state';
import { PageIntro } from '@/components/landlord/page-intro';
import { StatusBadge } from '@/components/landlord/status-badge';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { Input } from '@/components/ui/input';
import { propertyDetail } from '@/constants/routes';
import { formatCurrency } from '@/lib/utils';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'occupied', label: 'Occupied' },
  { id: 'vacant', label: 'Vacant' },
  { id: 'vacating', label: 'Vacating' },
];

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const urlFilter = searchParams.get('filter');
  const { properties } = useLandlordData();
  const [filter, setFilter] = useState(
    urlFilter && ['occupied', 'vacant', 'vacating'].includes(urlFilter)
      ? urlFilter
      : 'all',
  );
  const [search, setSearch] = useState('');

  const list = useMemo(() => {
    let items = [...properties];
    if (filter === 'occupied') {
      items = items.filter(
        (p) => p.status === 'occupied' || p.status === 'periodic' || p.status === 'vacating',
      );
    } else if (filter !== 'all') {
      items = items.filter((p) => p.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.address.toLowerCase().includes(q) ||
          p.tenantName.toLowerCase().includes(q) ||
          p.suburb.toLowerCase().includes(q),
      );
    }
    return items;
  }, [properties, filter, search]);

  const needActionCount = properties.filter((p) => p.needAction).length;

  return (
    <LandlordShell title="Property Portfolio">
      <div className="space-y-4">
        <PageIntro description="Your owned properties — tap for details, tenant info, and agent contacts." />

        {needActionCount > 0 && (
          <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm">
            <span className="font-semibold text-destructive">{needActionCount}</span>
            <span className="text-muted-foreground">
              {' '}
              propert{needActionCount === 1 ? 'y' : 'ies'} need action
            </span>
          </div>
        )}

        <Input
          placeholder="Search address or tenant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl"
        />

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
            icon={Building2}
            title="No properties"
            description="No properties match your search or filter."
          />
        ) : (
          <div className="space-y-2">
            {list.map((property) => (
              <Link
                key={property.id}
                href={propertyDetail(property.id)}
                className={`flex items-center gap-3 rounded-xl border p-4 transition hover:border-primary/30 ${
                  property.needAction
                    ? 'border-destructive/30 bg-destructive/5'
                    : 'border-border/80 bg-card'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      {property.address}, {property.suburb}
                    </p>
                    {property.needAction && (
                      <span className="bg-destructive size-2 shrink-0 rounded-full" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Tenant: {property.tenantName}
                  </p>
                  <div className="flex items-center gap-2">
                    <StatusBadge label={property.status} variant={property.status} />
                    {property.rentWeekly > 0 && (
                      <span className="text-primary text-xs font-medium">
                        {formatCurrency(property.rentWeekly)}/wk
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground size-5 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </LandlordShell>
  );
}
