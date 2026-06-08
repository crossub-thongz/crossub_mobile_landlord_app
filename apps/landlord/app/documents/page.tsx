'use client';

import { useMemo, useState } from 'react';
import { Download, FileText, Search } from 'lucide-react';

import { EmptyState } from '@/components/landlord/empty-state';
import { PageIntro } from '@/components/landlord/page-intro';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { Input } from '@/components/ui/input';
import type { DocumentCategory } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  management_agreement: 'Management Agreement',
  lease: 'Lease Agreement',
  inspection: 'Inspection Report',
  maintenance_quote: 'Maintenance Quote',
  maintenance_invoice: 'Maintenance Invoice',
  statement: 'Monthly Statement',
  tribunal: 'Tribunal Document',
  insurance: 'Insurance',
};

export default function DocumentsPage() {
  const { documents } = useLandlordData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  const list = useMemo(() => {
    let items = [...documents];
    if (category !== 'all') {
      items = items.filter((d) => d.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.propertyAddress?.toLowerCase().includes(q),
      );
    }
    return items;
  }, [documents, search, category]);

  return (
    <LandlordShell title="Document Centre">
      <div className="space-y-4">
        <PageIntro description="Management agreements, leases, inspection reports, invoices, and statements — all in one place." />

        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search documents..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              category === 'all'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            All
          </button>
          {(Object.keys(CATEGORY_LABELS) as DocumentCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                category === cat
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents"
            description="No documents match your search."
          />
        ) : (
          <div className="space-y-2">
            {list.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-4 transition hover:border-primary/30"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{doc.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {CATEGORY_LABELS[doc.category]}
                    {doc.propertyAddress ? ` · ${doc.propertyAddress}` : ''}
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    {formatDate(doc.uploadedAt)} · v{doc.version}
                  </p>
                </div>
                <Download className="text-muted-foreground size-4 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </LandlordShell>
  );
}
