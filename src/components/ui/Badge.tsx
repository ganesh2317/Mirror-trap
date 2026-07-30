import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import type { BadgeVariant } from '@/lib/badgeUtils';

export type { BadgeVariant };


const VARIANT_STYLES: Record<BadgeVariant, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:     'bg-rose-500/15 text-rose-400 border-rose-500/25',
  medium:   'bg-amber-500/15 text-amber-400 border-amber-500/25',
  low:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  info:     'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
  active:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  pulse?: boolean;
  className?: string;
}

export function Badge({ variant, children, pulse = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {variant === 'active' && (
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
      )}
      {pulse && variant !== 'active' && (
        <span className={cn(
          'relative inline-flex h-1.5 w-1.5',
          variant === 'critical' && 'animate-ping-red',
        )}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}

// Backward-compat alias for code referencing SeverityBadge
export { Badge as SeverityBadge };

