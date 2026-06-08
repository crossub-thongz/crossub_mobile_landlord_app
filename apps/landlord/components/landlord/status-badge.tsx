import { cn } from '@/lib/utils';

const STYLES: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  approved: 'bg-primary/15 text-primary border-primary/30',
  declined: 'bg-destructive/15 text-destructive border-destructive/30',
  more_info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  occupied: 'bg-primary/15 text-primary border-primary/30',
  vacant: 'bg-muted text-muted-foreground border-border',
  vacating: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  periodic: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  in_progress: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completed: 'bg-primary/15 text-primary border-primary/30',
  awaiting_approval: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  urgent: 'bg-destructive/15 text-destructive border-destructive/30',
  normal: 'bg-secondary text-muted-foreground border-border',
};

export function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
        STYLES[variant] ?? STYLES.normal,
      )}
    >
      {label}
    </span>
  );
}
