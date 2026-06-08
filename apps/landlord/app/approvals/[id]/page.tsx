'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { PageIntro } from '@/components/landlord/page-intro';
import { StatusBadge } from '@/components/landlord/status-badge';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { APPROVAL_CATEGORY_LABELS } from '@/lib/approval-labels';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getApproval, resolveApproval } = useLandlordData();
  const approval = getApproval(id);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!approval) {
    return (
      <LandlordShell title="Approval" backHref={ROUTES.APPROVALS}>
        <p className="text-muted-foreground text-sm">Approval not found.</p>
      </LandlordShell>
    );
  }

  const isResolved = approval.status === 'approved' || approval.status === 'declined';

  const handleAction = async (action: 'approved' | 'declined' | 'more_info') => {
    setSubmitting(true);
    try {
      resolveApproval(approval.id, action, note);
      const labels = {
        approved: 'Approved',
        declined: 'Declined',
        more_info: 'More information requested',
      };
      toast.success(labels[action]);
      router.push(ROUTES.APPROVALS);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LandlordShell title="Review Approval" backHref={ROUTES.APPROVALS}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <StatusBadge
            label={APPROVAL_CATEGORY_LABELS[approval.category]}
            variant={approval.category}
          />
          <StatusBadge label={approval.status.replace('_', ' ')} variant={approval.status} />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{approval.title}</h2>
          <p className="text-muted-foreground text-sm">{approval.propertyAddress}</p>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Description</p>
            <p className="mt-1">{approval.description}</p>
          </div>
          {approval.amount !== undefined && (
            <div>
              <p className="text-muted-foreground text-xs">Amount</p>
              <p className="text-primary mt-1 text-lg font-semibold">
                {formatCurrency(approval.amount)}
              </p>
            </div>
          )}
          {approval.recommendation && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-muted-foreground text-xs">Property manager recommendation</p>
              <p className="mt-1">{approval.recommendation}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground text-xs">Requested by</p>
            <p className="mt-1">{approval.requestedBy}</p>
            <p className="text-muted-foreground text-xs">{formatDateTime(approval.requestedAt)}</p>
          </div>
        </div>

        {approval.documents && approval.documents.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Attachments</p>
            {approval.documents.map((doc) => (
              <a
                key={doc.name}
                href={doc.url}
                className="flex items-center gap-2 rounded-lg border bg-secondary/30 px-3 py-2 text-sm hover:bg-secondary"
              >
                <FileText className="text-primary size-4" />
                {doc.name}
              </a>
            ))}
          </div>
        )}

        {!isResolved && (
          <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4">
            <PageIntro description="Add an optional note for your property manager." />
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                placeholder="Your comments..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                disabled={submitting}
                onClick={() => void handleAction('approved')}
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                Approve
              </Button>
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() => void handleAction('more_info')}
              >
                Request More Information
              </Button>
              <Button
                variant="destructive"
                disabled={submitting}
                onClick={() => void handleAction('declined')}
              >
                Decline
              </Button>
            </div>
          </div>
        )}
      </div>
    </LandlordShell>
  );
}
