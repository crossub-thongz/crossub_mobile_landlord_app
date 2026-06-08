'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { KpiTile } from '@/components/landlord/kpi-tile';
import { PageIntro } from '@/components/landlord/page-intro';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { ROUTES } from '@/constants/routes';

export default function DashboardPage() {
  const { portfolio, notifications, loading } = useLandlordData();
  const pushShown = useRef(false);

  useEffect(() => {
    if (pushShown.current || loading) return;
    const urgent = notifications.filter(
      (n) => !n.read && n.type === 'approval_required',
    );
    if (urgent.length > 0) {
      pushShown.current = true;
      toast.info(urgent[0].title, {
        description: urgent[0].body,
        action: {
          label: 'Review',
          onClick: () => {
            window.location.href = urgent[0].href;
          },
        },
      });
    }
  }, [loading, notifications]);

  return (
    <LandlordShell title="Dashboard">
      <div className="space-y-5">
        <PageIntro description="Portfolio overview — tap any metric for details. This app is for visibility and approvals, not day-to-day management." />

        {portfolio.needApproval > 0 && (
          <Link
            href={ROUTES.APPROVALS}
            className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-gradient-to-r from-destructive/10 to-destructive/5 p-4 transition hover:border-destructive/50"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {portfolio.needApproval} approval{portfolio.needApproval === 1 ? '' : 's'} waiting
              </p>
              <p className="text-muted-foreground text-xs">Open Approval Centre</p>
            </div>
            <ChevronRight className="text-destructive size-5 shrink-0" />
          </Link>
        )}

        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card">
          <div className="border-b border-border/80 px-4 py-3.5">
            <h2 className="text-sm font-semibold">Portfolio Summary</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            <KpiTile
              label="Total Properties"
              value={portfolio.totalProperties}
              href={ROUTES.PROPERTIES}
            />
            <KpiTile
              label="Occupied"
              value={portfolio.occupiedProperties}
              href={`${ROUTES.PROPERTIES}?filter=occupied`}
            />
            <KpiTile
              label="Vacant"
              value={portfolio.vacantProperties}
              href={`${ROUTES.PROPERTIES}?filter=vacant`}
              highlight={portfolio.vacantProperties > 0}
            />
            <KpiTile
              label="Weekly Rent"
              value={portfolio.weeklyRent}
              href={ROUTES.ACCOUNTING}
              isCurrency
            />
            <KpiTile
              label="Monthly Rent"
              value={portfolio.monthlyRent}
              href={ROUTES.ACCOUNTING}
              isCurrency
            />
            <KpiTile
              label="Arrears"
              value={portfolio.arrears}
              href={ROUTES.ACCOUNTING}
              isCurrency
              highlight={portfolio.arrears > 0}
            />
            <KpiTile
              label="Maintenance In Progress"
              value={portfolio.maintenanceInProgress}
              href={ROUTES.MAINTENANCE}
            />
            <KpiTile
              label="Need Approval"
              value={portfolio.needApproval}
              href={ROUTES.APPROVALS}
              highlight={portfolio.needApproval > 0}
            />
          </div>
        </section>
      </div>
    </LandlordShell>
  );
}
