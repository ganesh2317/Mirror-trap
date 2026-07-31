import { Check, Crown, X } from 'lucide-react';
import type { PlanTier } from '@/lib/types';
import { useApp } from '@/lib/useApp';
import { GlassCard } from './ui/GlassCard';
import { Badge } from './ui/Badge';

interface SubscriptionGatingModalProps {
  open: boolean;
  onClose: () => void;
  requiredTier?: PlanTier;
  featureName?: string;
}

const PLANS: Array<{
  id: PlanTier;
  name: string;
  price: string;
  period: string;
  badge?: string;
  highlight?: boolean;
  features: string[];
  scanLimit: string;
  domainLimit: string;
}> = [
  {
    id: 'free',
    name: 'Developer Free',
    price: '$0',
    period: 'forever',
    features: ['1 Monitored Domain', '5 Scans / month', '2 PhantomShield Decoys', '7-day Log Retention'],
    scanLimit: '5/mo',
    domainLimit: '1 Domain',
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '$49',
    period: 'per month',
    highlight: true,
    badge: 'MOST POPULAR',
    features: ['5 Monitored Domains', '50 Scans / month', '10 PhantomShield Decoys', '30-day Retention', 'Role-Based Access (5 users)'],
    scanLimit: '50/mo',
    domainLimit: '5 Domains',
  },
  {
    id: 'business',
    name: 'Business',
    price: '$199',
    period: 'per month',
    features: ['25 Monitored Domains', 'Unlimited Scans', '50 Decoys', '90-day Retention', 'Audit Log Exports', 'Dedicated Webhooks'],
    scanLimit: 'Unlimited',
    domainLimit: '25 Domains',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$499',
    period: 'per month',
    badge: 'AUTONOMOUS DEFENSE',
    features: ['Unlimited Domains', 'Continuous Threat Sweep', 'Autonomous Poisoning Engine', 'Custom SLAs & 24/7 SOC Support'],
    scanLimit: 'Continuous',
    domainLimit: 'Unlimited',
  },
];

export function SubscriptionGatingModal({ open, onClose, featureName }: SubscriptionGatingModalProps) {
  const { setPlan } = useApp();

  if (!open) return null;

  const handleSelectPlan = (tier: PlanTier) => {
    setPlan(tier === 'enterprise' ? 'enterprise' : tier === 'pro' ? 'pro' : 'free');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-5xl max-h-[90vh] flex flex-col p-6 shadow-glow overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Subscription Upgrade"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary tracking-tight">Upgrade Your Threat Intelligence Plan</h2>
              <p className="text-xs text-text-muted">
                {featureName ? `Unlock "${featureName}" and expand your security envelope.` : 'Scale domain monitoring, team seats, and autonomous deception.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1" aria-label="Close tier modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((p) => (
            <GlassCard
              key={p.id}
              className={`p-5 flex flex-col justify-between relative transition-all ${
                p.highlight ? 'border-indigo-500/60 bg-indigo-500/10 shadow-glow' : 'border-border/60'
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant={p.highlight ? 'info' : 'active'} className="text-[9px] uppercase tracking-wider">
                    {p.badge}
                  </Badge>
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-text-primary mt-1">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-text-primary">{p.price}</span>
                  <span className="text-xs text-text-muted">/{p.period}</span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-text-secondary">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan(p.id)}
                className={`mt-6 w-full !py-2 text-xs ${
                  p.highlight ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                Select {p.name}
              </button>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
