'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { PageIntro } from '@/components/landlord/page-intro';
import { StatusBadge } from '@/components/landlord/status-badge';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { ROUTES } from '@/constants/routes';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AccountingPage() {
  const { payments, outstanding, portfolio } = useLandlordData();

  const totalOutstanding = outstanding.reduce((sum, o) => sum + o.amount, 0);
  const rentOutstanding = outstanding
    .filter((o) => o.type === 'rent')
    .reduce((sum, o) => sum + o.amount, 0);
  const utilityOutstanding = outstanding
    .filter((o) => o.type === 'utility')
    .reduce((sum, o) => sum + o.amount, 0);
  const maintenanceOutstanding = outstanding
    .filter((o) => o.type === 'maintenance')
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <LandlordShell title="Accounting">
      <div className="space-y-5">
        <PageIntro description="Rent collection, outstanding amounts, and payment history." />

        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border bg-card p-3">
            <p className="text-muted-foreground text-[10px]">Monthly Rent</p>
            <p className="text-primary text-lg font-bold">
              {formatCurrency(portfolio.monthlyRent)}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <p className="text-muted-foreground text-[10px]">Total Arrears</p>
            <p className={`text-lg font-bold ${portfolio.arrears > 0 ? 'text-destructive' : ''}`}>
              {formatCurrency(portfolio.arrears)}
            </p>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Outstanding Amounts</h3>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-secondary/50 p-2">
              <p className="text-muted-foreground text-[10px]">Rent</p>
              <p className="font-semibold">{formatCurrency(rentOutstanding)}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-2">
              <p className="text-muted-foreground text-[10px]">Utilities</p>
              <p className="font-semibold">{formatCurrency(utilityOutstanding)}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-2">
              <p className="text-muted-foreground text-[10px]">Maintenance</p>
              <p className="font-semibold">{formatCurrency(maintenanceOutstanding)}</p>
            </div>
          </div>
          {totalOutstanding > 0 && (
            <div className="space-y-2 pt-2">
              {outstanding.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm"
                >
                  <div>
                    <p>{item.propertyAddress}</p>
                    <p className="text-muted-foreground text-xs">
                      Due {formatDate(item.dueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-destructive">
                      {formatCurrency(item.amount)}
                    </p>
                    <StatusBadge label={item.type} variant="normal" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Payment History</h3>
            <Link
              href={ROUTES.STATEMENTS}
              className="text-primary flex items-center gap-1 text-xs"
            >
              Statements <ChevronRight className="size-3" />
            </Link>
          </div>
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{payment.propertyAddress}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDate(payment.paymentDate)} · {payment.method}
                </p>
              </div>
              <p className="text-primary font-semibold">
                {formatCurrency(payment.amount)}
              </p>
            </div>
          ))}
        </section>
      </div>
    </LandlordShell>
  );
}
