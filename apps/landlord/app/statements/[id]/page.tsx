'use client';

import { use } from 'react';
import { Download, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/lib/utils';

export default function StatementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { statements } = useLandlordData();
  const stmt = statements.find((s) => s.id === id);

  if (!stmt) {
    return (
      <LandlordShell title="Statement" backHref={ROUTES.STATEMENTS}>
        <p className="text-muted-foreground text-sm">Statement not found.</p>
      </LandlordShell>
    );
  }

  const lineItems = [
    { label: 'Rental Income', value: stmt.rentalIncome, positive: true },
    { label: 'Management Fees', value: -stmt.managementFees },
    { label: 'Maintenance Costs', value: -stmt.maintenanceCosts },
    { label: 'Inspection Costs', value: -stmt.inspectionCosts },
    { label: 'Utility Expenses', value: -stmt.utilityExpenses },
    { label: 'Other Expenses', value: -stmt.otherExpenses },
  ];

  return (
    <LandlordShell title={`Statement — ${stmt.period}`} backHref={ROUTES.STATEMENTS}>
      <div className="space-y-5">
        <p className="text-muted-foreground text-sm">{stmt.propertyAddress}</p>

        <div className="rounded-xl border bg-card p-4 space-y-3">
          {lineItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className={item.positive ? 'text-primary font-medium' : ''}>
                {item.value >= 0 ? '' : '−'}
                {formatCurrency(Math.abs(item.value))}
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex items-center justify-between">
            <span className="font-semibold">Net Amount</span>
            <span className="text-primary text-lg font-bold">
              {formatCurrency(stmt.netAmount)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={() => toast.success('PDF download started')}>
            <Download className="size-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => toast.success('Statement emailed')}>
            <Mail className="size-4" />
            Email Statement
          </Button>
        </div>
      </div>
    </LandlordShell>
  );
}
