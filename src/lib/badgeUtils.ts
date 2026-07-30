export type BadgeVariant = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'active' | 'inactive';

// Convenience mapper from severity string
export function severityVariant(s: string): BadgeVariant {
  switch (s.toUpperCase()) {
    case 'CRITICAL': return 'critical';
    case 'HIGH': return 'high';
    case 'MEDIUM': return 'medium';
    case 'LOW': return 'low';
    default: return 'info';
  }
}
