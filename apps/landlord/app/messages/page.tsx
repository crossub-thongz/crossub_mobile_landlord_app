'use client';

import Link from 'next/link';
import { ChevronRight, MessageSquare, Plus } from 'lucide-react';

import { EmptyState } from '@/components/landlord/empty-state';
import { PageIntro } from '@/components/landlord/page-intro';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { Button } from '@/components/ui/button';
import { messageDetail, messagesNew } from '@/constants/routes';
import { formatRelative } from '@/lib/utils';

export default function MessagesPage() {
  const { messages } = useLandlordData();

  return (
    <LandlordShell title="Communication Hub">
      <div className="space-y-4">
        <PageIntro description="Centralised communication with property managers, account managers, and CROSSUB support." />

        <Link href={messagesNew()}>
          <Button className="w-full">
            <Plus className="size-4" />
            New Message
          </Button>
        </Link>

        {messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages"
            description="Start a conversation with your property manager or CROSSUB support."
          />
        ) : (
          <div className="space-y-2">
            {messages.map((thread) => (
              <Link
                key={thread.id}
                href={messageDetail(thread.id)}
                className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-4 transition hover:border-primary/30"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{thread.subject}</p>
                    {thread.unread > 0 && (
                      <span className="bg-destructive flex size-4 items-center justify-center rounded-full text-[9px] text-white">
                        {thread.unread}
                      </span>
                    )}
                  </div>
                  {thread.propertyAddress && (
                    <p className="text-muted-foreground text-xs">{thread.propertyAddress}</p>
                  )}
                  <p className="text-muted-foreground truncate text-xs">{thread.lastMessage}</p>
                  <p className="text-muted-foreground text-[10px]">
                    {formatRelative(thread.lastAt)} · {thread.category}
                  </p>
                </div>
                <ChevronRight className="text-muted-foreground mt-1 size-5 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </LandlordShell>
  );
}
