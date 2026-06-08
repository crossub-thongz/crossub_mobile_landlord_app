'use client';

import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';

import { EmptyState } from '@/components/landlord/empty-state';
import { PageIntro } from '@/components/landlord/page-intro';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { statementDetail } from '@/constants/routes';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function StatementsPage() {
  const { statements } = useLandlordData();

  return (
    <LandlordShell title="Monthly Statements">
      <div className="space-y-4">
        <PageIntro description="Automatically generated monthly statements with rental income, fees, and net amount." />

        {statements.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No statements"
            description="Monthly statements will appear here when available."
          />
        ) : (
          <div className="space-y-2">
            {statements.map((stmt) => (
              <Link
                key={stmt.id}
                href={statementDetail(stmt.id)}
                className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-4 transition hover:border-primary/30"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{stmt.period}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {stmt.propertyAddress}
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    Available {formatDate(stmt.availableAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-primary text-sm font-bold">
                    {formatCurrency(stmt.netAmount)}
                  </p>
                  <p className="text-muted-foreground text-[10px]">net</p>
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
