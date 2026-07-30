import { Badge } from './Badge';
import { severityVariant, type BadgeVariant } from '@/lib/badgeUtils';
import type { Severity } from '@/lib/types';

export { Badge };
export type { BadgeVariant };

interface SeverityBadgeProps {
  severity: Severity | string;
  className?: string;
}

/**
 * Legacy SeverityBadge — accepts `severity` string prop directly.
 * New code should use `<Badge variant={severityVariant(s)}>` instead.
 */
export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <Badge variant={severityVariant(severity)} className={className}>
      {severity}
    </Badge>
  );
}

