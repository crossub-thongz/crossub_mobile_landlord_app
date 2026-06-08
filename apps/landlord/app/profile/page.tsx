'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { LandlordShell } from '@/components/layout/landlord-shell';
import { Button } from '@/components/ui/button';
import { displayName } from '@/lib/utils';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <LandlordShell title="Profile">
      <div className="space-y-5">
        {user && (
          <div className="rounded-xl border bg-card p-4 space-y-2 text-sm">
            <p className="text-lg font-semibold">{displayName(user)}</p>
            <p className="text-muted-foreground">{user.email}</p>
            {user.phone && <p className="text-muted-foreground">{user.phone}</p>}
          </div>
        )}

        <div className="rounded-xl border bg-card p-4 space-y-2 text-sm">
          <p className="text-muted-foreground text-xs uppercase">Linked apps</p>
          {process.env.NEXT_PUBLIC_AGENT_PORTAL_URL && (
            <a
              href={process.env.NEXT_PUBLIC_AGENT_PORTAL_URL}
              className="text-primary block hover:underline"
            >
              Agent Portal
            </a>
          )}
          {process.env.NEXT_PUBLIC_WEB_URL && (
            <a
              href={process.env.NEXT_PUBLIC_WEB_URL}
              className="text-primary block hover:underline"
            >
              CROSSUB Dashboard
            </a>
          )}
        </div>

        <Button variant="destructive" onClick={() => void logout()} className="w-full">
          Sign out
        </Button>
      </div>
    </LandlordShell>
  );
}
