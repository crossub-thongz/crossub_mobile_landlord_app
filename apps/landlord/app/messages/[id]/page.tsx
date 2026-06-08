'use client';

import { use, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/lib/utils';

export default function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { messages, getThreadMessages, sendMessage } = useLandlordData();
  const thread = messages.find((m) => m.id === id);
  const threadMessages = getThreadMessages(id);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  if (!thread) {
    return (
      <LandlordShell title="Message" backHref={ROUTES.MESSAGES}>
        <p className="text-muted-foreground text-sm">Thread not found.</p>
      </LandlordShell>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      sendMessage(id, reply.trim());
      setReply('');
    } finally {
      setSending(false);
    }
  };

  return (
    <LandlordShell title={thread.subject} backHref={ROUTES.MESSAGES}>
      <div className="space-y-4">
        {thread.propertyAddress && (
          <p className="text-muted-foreground text-xs">{thread.propertyAddress}</p>
        )}

        <div className="space-y-3">
          {threadMessages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl border p-3 text-sm ${
                msg.from === 'You'
                  ? 'border-primary/30 bg-primary/5 ml-4'
                  : 'border-border/80 bg-card mr-4'
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-medium">{msg.from}</span>
                <span className="text-muted-foreground text-[10px]">
                  {formatDateTime(msg.at)}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{msg.body}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type a reply..."
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !reply.trim()}>
            {sending ? <Loader2 className="size-4 animate-spin" /> : 'Send'}
          </Button>
        </form>
      </div>
    </LandlordShell>
  );
}
