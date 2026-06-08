'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';

import { EmptyState } from '@/components/landlord/empty-state';
import { PageIntro } from '@/components/landlord/page-intro';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { Button } from '@/components/ui/button';
import { formatRelative } from '@/lib/utils';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } =
    useLandlordData();

  const unread = notifications.filter((n) => !n.read);

  return (
    <LandlordShell title="Notifications">
      <div className="space-y-4">
        <PageIntro description="Real-time alerts for rent, arrears, maintenance, approvals, inspections, and statements." />

        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
            Mark all as read
          </Button>
        )}

        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up."
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <Link
                key={notif.id}
                href={notif.href}
                onClick={() => markNotificationRead(notif.id)}
                className={`block rounded-xl border p-4 transition hover:border-primary/30 ${
                  notif.read
                    ? 'border-border/60 bg-card/50 opacity-75'
                    : 'border-primary/30 bg-primary/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{notif.title}</p>
                  {!notif.read && (
                    <span className="bg-primary mt-1 size-2 shrink-0 rounded-full" />
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">{notif.body}</p>
                <p className="text-muted-foreground mt-2 text-[10px]">
                  {formatRelative(notif.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </LandlordShell>
  );
}
