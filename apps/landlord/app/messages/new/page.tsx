'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES, messageDetail } from '@/constants/routes';
import type { MessageCategory } from '@/lib/types';

const CATEGORIES: { id: MessageCategory; label: string }[] = [
  { id: 'general', label: 'General Enquiry' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'inspections', label: 'Inspections' },
  { id: 'leasing', label: 'Leasing' },
];

export default function NewMessagePage() {
  const router = useRouter();
  const { properties, createMessageThread } = useLandlordData();
  const [category, setCategory] = useState<MessageCategory>('general');
  const [propertyId, setPropertyId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    setSubmitting(true);
    try {
      const threadId = await createMessageThread({
        category,
        subject: subject.trim(),
        propertyId: propertyId || undefined,
        body: body.trim(),
      });
      if (threadId) {
        toast.success('Message sent');
        router.push(messageDetail(threadId));
      } else {
        toast.error('Could not send your message. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LandlordShell title="New Message" backHref={ROUTES.MESSAGES}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  category === c.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-secondary'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="property">Property (optional)</Label>
          <select
            id="property"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm dark:bg-input/30"
          >
            <option value="">— General enquiry —</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.address}, {p.suburb}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What is this about?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Message</Label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message..."
            rows={5}
            className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm dark:bg-input/30"
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Send Message
        </Button>
      </form>
    </LandlordShell>
  );
}
