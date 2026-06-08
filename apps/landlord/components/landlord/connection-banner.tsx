'use client';

import { RefreshCw, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

import { useLandlordData } from '@/components/providers/landlord-data-provider';
import { Button } from '@/components/ui/button';

export function ConnectionBanner() {
  const { apiConnected, apiError, loading, refresh } = useLandlordData();

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success('Data refreshed');
    } catch {
      toast.error('Refresh failed');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              apiConnected
                ? 'bg-primary/15 text-primary'
                : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            {apiConnected ? 'Live API' : 'Demo data'}
          </span>
          {typeof navigator !== 'undefined' && !navigator.onLine && (
            <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
              <WifiOff className="size-3" />
              Offline
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          disabled={loading}
          onClick={() => void handleRefresh()}
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      {apiError && (
        <p className="text-destructive rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs">
          {apiError} — showing demo data where needed.
        </p>
      )}
    </div>
  );
}
