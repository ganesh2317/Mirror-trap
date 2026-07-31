import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    to?: string;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    to?: string;
    icon?: LucideIcon;
  };
  badge?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  badge,
  className,
}: EmptyStateProps) {
  return (
    <GlassCard className={cn('flex flex-col items-center justify-center p-8 text-center animate-fade-in', className)}>
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-glow">
        <Icon className="h-7 w-7" />
        <span className="absolute -right-1 -top-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" />
        </span>
      </div>

      {badge && <div className="mb-2">{badge}</div>}

      <h3 className="text-lg font-semibold text-text-primary tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-muted leading-relaxed">{description}</p>

      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            primaryAction.onClick ? (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="btn-primary !px-4 !py-2 text-xs active:scale-[0.98] transition-transform"
              >
                {primaryAction.icon && <primaryAction.icon className="h-3.5 w-3.5 mr-1.5 inline" />}
                {primaryAction.label}
              </button>
            ) : primaryAction.to ? (
              <a
                href={primaryAction.to}
                className="btn-primary !px-4 !py-2 text-xs active:scale-[0.98] transition-transform inline-flex items-center"
              >
                {primaryAction.icon && <primaryAction.icon className="h-3.5 w-3.5 mr-1.5 inline" />}
                {primaryAction.label}
              </a>
            ) : null
          )}

          {secondaryAction && (
            secondaryAction.onClick ? (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="btn-secondary !px-4 !py-2 text-xs active:scale-[0.98] transition-transform"
              >
                {secondaryAction.icon && <secondaryAction.icon className="h-3.5 w-3.5 mr-1.5 inline" />}
                {secondaryAction.label}
              </button>
            ) : secondaryAction.to ? (
              <a
                href={secondaryAction.to}
                className="btn-secondary !px-4 !py-2 text-xs active:scale-[0.98] transition-transform inline-flex items-center"
              >
                {secondaryAction.icon && <secondaryAction.icon className="h-3.5 w-3.5 mr-1.5 inline" />}
                {secondaryAction.label}
              </a>
            ) : null
          )}
        </div>
      )}
    </GlassCard>
  );
}
