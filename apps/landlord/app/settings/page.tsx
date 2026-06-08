'use client';

import { PageIntro } from '@/components/landlord/page-intro';
import { LandlordShell } from '@/components/layout/landlord-shell';

export default function SettingsPage() {
  return (
    <LandlordShell title="Settings">
      <div className="space-y-5">
        <PageIntro description="Notification preferences and account settings." />

        <section className="rounded-xl border bg-card p-4 space-y-4">
          <h3 className="text-sm font-semibold">Notification Preferences</h3>
          {[
            'Rent received',
            'Tenant arrears',
            'Maintenance approval required',
            'Inspection completed',
            'Rent review approval',
            'Lease renewal approval',
            'Monthly statement available',
          ].map((label) => (
            <label key={label} className="flex items-center justify-between text-sm">
              <span>{label}</span>
              <input type="checkbox" defaultChecked className="accent-primary size-4" />
            </label>
          ))}
        </section>

        <p className="text-muted-foreground text-xs">
          AI Landlord Assistant (coming soon) — ask natural-language questions about your portfolio.
        </p>
      </div>
    </LandlordShell>
  );
}
