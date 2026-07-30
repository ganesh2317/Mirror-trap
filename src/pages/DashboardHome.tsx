import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Globe,
  Radar,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  TrendingDown,
  TrendingUp,
  Zap,
  Clock,
  Target,
  Activity,
} from 'lucide-react';
import { useApp } from '@/lib/useApp';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { LivePulseDot } from '@/components/ui/LivePulseDot';
import { ThreatActivityGraph } from '@/components/charts/ThreatActivityGraph';
import { AttackVectorRadar } from '@/components/charts/AttackVectorRadar';
import { Badge } from '@/components/ui/Badge';
import { severityVariant } from '@/lib/badgeUtils';

import { GlassCard } from '@/components/ui/GlassCard';
import { cn, formatDate } from '@/lib/utils';
import { usePageTitle } from '@/lib/usePageTitle';
import { arsScoreColor } from '@/lib/design-system';

function StatCard({
  label,
  children,
  glow,
  className,
}: {
  label: string;
  children: React.ReactNode;
  glow?: 'purple' | 'cyan' | 'red' | 'none';
  className?: string;
}) {
  return (
    <GlassCard glow={glow ?? 'none'} hover className={cn('p-5', className)}>
      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </div>
      {children}
    </GlassCard>
  );
}

function ARSStatCard({ score, delta }: { score: number | null; delta: number | null }) {
  const navigate = useNavigate();
  if (score === null) {
    return (
      <StatCard label="ARS Score">
        <div className="mt-3 text-center">
          <div className="text-sm text-text-muted">No scan yet</div>
          <button onClick={() => navigate('/scan')} className="mt-3 btn-primary !text-xs !py-1.5">
            Run first scan
          </button>
        </div>
      </StatCard>
    );
  }
  const color = arsScoreColor(score);
  return (
    <StatCard label="Attack Readiness Score" glow={score >= 70 ? 'red' : score >= 40 ? 'none' : 'none'}>
      <div className="flex items-end gap-3 mt-1">
        <span className="font-mono text-5xl font-bold tabular-nums leading-none" style={{ color }}>
          <AnimatedCounter value={score} duration={1200} />
        </span>
        <span className="text-xl text-text-muted mb-1">/100</span>
      </div>
      {delta !== null && (
        <div className={cn(
          'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
          delta > 0 ? 'bg-red-500/15 text-red-400' : delta < 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-text-muted',
        )}>
          {delta > 0 ? <TrendingUp className="h-3 w-3" /> : delta < 0 ? <TrendingDown className="h-3 w-3" /> : null}
          {delta > 0 ? '+' : ''}{delta} vs last scan
        </div>
      )}
      <Link to="/scan" className="mt-3 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
        Rescan <ArrowRight className="h-3 w-3" />
      </Link>
    </StatCard>
  );
}

function ActiveTrapsCard({ active, total, triggeredThisWeek }: { active: number; total: number; triggeredThisWeek: number }) {
  return (
    <StatCard label="Active Traps" glow="cyan">
      <div className="flex items-baseline gap-2 mt-1">
        <span className="font-mono text-5xl font-bold tabular-nums leading-none text-cyan-400">
          <AnimatedCounter value={active} duration={800} />
        </span>
        <LivePulseDot color="green" size="md" />
      </div>
      <div className="mt-1 text-sm text-text-muted">of {total} deployed</div>
      <div className="mt-2 text-xs text-text-muted">
        <span className="text-amber-400 font-semibold">{triggeredThisWeek}</span> triggered this week
      </div>
    </StatCard>
  );
}

function ThreatsInterceptedCard({ count, criticalCount }: { count: number; criticalCount: number }) {
  return (
    <StatCard label="Threats Intercepted" glow={count > 5 ? 'red' : 'none'}>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="font-mono text-5xl font-bold tabular-nums leading-none text-red-400">
          <AnimatedCounter value={count} duration={1000} />
        </span>
        {count >= 5 && <TrendingUp className="h-4 w-4 text-red-400" />}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Badge variant="critical" className="text-[10px]">{criticalCount} critical</Badge>
      </div>
    </StatCard>
  );
}

function MTTDCard({ minutes, percentileFaster }: { minutes: number; percentileFaster: number }) {
  return (
    <StatCard label="Mean Time to Detect" glow="none">
      <div className="flex items-baseline gap-2 mt-1">
        <span className="font-mono text-4xl font-bold tabular-nums leading-none text-emerald-400">
          {minutes.toFixed(1)}
        </span>
        <span className="text-lg text-text-muted">min</span>
      </div>
      <div className="mt-1 text-xs text-text-muted">Industry avg: <span className="text-slate-300">24 min</span></div>
      <div className="mt-2">
        <Badge variant="low" className="text-[10px]">{percentileFaster}% faster</Badge>
      </div>
    </StatCard>
  );
}

function RecentAlertsFeed({ alerts }: { alerts: ReturnType<typeof useApp>['alerts'] }) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <Shield className="h-10 w-10 text-text-muted mb-3 opacity-40" />
        <div className="text-sm text-text-muted">No alerts yet</div>
        <div className="text-xs text-text-muted mt-1">Deploy traps to start catching reconnaissance</div>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {alerts.slice(0, 5).map((a) => (
        <li key={a.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/3" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <Zap className={cn('h-4 w-4 shrink-0', a.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400')} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-text-primary">{a.asset_used}</div>
            <div className="truncate text-xs text-text-muted font-mono">{a.ip} · {formatDate(a.timestamp)}</div>
          </div>
          <Badge variant={severityVariant(a.severity)} className="flex-shrink-0 text-[10px]">{a.severity}</Badge>
        </li>
      ))}
    </ul>
  );
}

function QuickScanCard({ recentScans }: { recentScans: ReturnType<typeof useApp>['scans'] }) {
  const navigate = useNavigate();
  const [domain, setDomain] = useState('');
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = domain.trim();
    if (!d) return;
    navigate(`/scan?domain=${encodeURIComponent(d)}&auto=1`);
  };
  return (
    <div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted flex items-center gap-2">
        <Radar className="h-3.5 w-3.5 text-indigo-400" /> Quick Scan
      </div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="company.com"
            className="input-dark !pl-9"
          />
        </div>
        <button type="submit" className="btn-primary !px-4">
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      {recentScans.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {[...recentScans].reverse().slice(0, 3).map((s) => (
            <Link
              key={s.id}
              to="/scan"
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs hover:bg-white/4 transition-colors"
            >
              <span className="font-mono text-text-secondary truncate">{s.domain}</span>
              <span className="font-mono text-amber-400 ml-2 flex-shrink-0">ARS {s.ars_score}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function TrapPerformanceCard({ decoys }: { decoys: ReturnType<typeof useApp>['decoys'] }) {
  const active = decoys.filter((d) => d.active);
  return (
    <div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted flex items-center gap-2">
        <Target className="h-3.5 w-3.5 text-indigo-400" /> Trap Performance
      </div>
      {active.length === 0 ? (
        <div className="text-sm text-text-muted">
          No active traps. <Link to="/phantomshield" className="text-indigo-400 hover:underline">Deploy one →</Link>
        </div>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-text-muted">
              <th className="text-left pb-2 font-semibold">Trap</th>
              <th className="text-right pb-2 font-semibold">Hits</th>
              <th className="text-right pb-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="space-y-1">
            {active.slice(0, 3).map((d) => (
              <tr key={d.id}>
                <td className="py-1 text-text-secondary truncate max-w-[100px]">{d.name}</td>
                <td className="py-1 text-right font-mono text-amber-400">{d.logs.length}</td>
                <td className="py-1 text-right">
                  <Badge variant="active" className="text-[10px] !py-0">LIVE</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Link to="/phantomshield" className="mt-3 flex items-center gap-1 text-xs text-indigo-400 hover:underline">
        View all traps <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

export function DashboardHome() {
  usePageTitle('MirrorTrap — Dashboard');
  const { scans, latestScan, alerts, decoys, demoMode, user } = useApp();

  const activeDecoys = decoys.filter((d) => d.active).length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL').length;

  const thisWeekAlerts = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return alerts.filter((a) => new Date(a.timestamp) >= start).length;
  }, [alerts]);

  const arsDelta = useMemo(() => {
    if (scans.length < 2) return null;
    const sorted = [...scans].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
    return sorted[sorted.length - 1].ars_score - sorted[sorted.length - 2].ars_score;
  }, [scans]);

  const firstName = user?.email?.split('@')[0] ?? 'Analyst';
  const lastScanAge = latestScan
    ? formatDate(latestScan.timestamp)
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.02em' }}>
            Welcome back, <span className="text-indigo-400">{firstName}</span>
          </h1>
          {lastScanAge && (
            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-text-muted">
              <Clock className="h-3.5 w-3.5" />
              Last scan: {lastScanAge}
            </div>
          )}
        </div>
        <Link to="/scan" className="btn-primary !px-5 self-start sm:self-auto">
          <Radar className="h-4 w-4" /> Scan Now
        </Link>
      </div>

      {/* Row 1 — 4 stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ARSStatCard score={latestScan?.ars_score ?? null} delta={arsDelta} />
        <ActiveTrapsCard active={activeDecoys} total={decoys.length} triggeredThisWeek={thisWeekAlerts} />
        <ThreatsInterceptedCard count={alerts.length} criticalCount={criticalAlerts} />
        <MTTDCard minutes={2.3} percentileFaster={83} />
      </div>

      {/* Row 2 — Threat graph + Recent alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2 p-5">
          <ThreatActivityGraph />
        </GlassCard>
        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
              <Bell className="h-3.5 w-3.5 text-red-400" /> Recent Alerts
            </div>
            <Link to="/alerts" className="text-xs text-indigo-400 hover:underline">
              View all →
            </Link>
          </div>
          <RecentAlertsFeed alerts={alerts} />
        </GlassCard>
      </div>

      {/* Row 3 — Radar + Quick scan + Trap performance */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <GlassCard className="p-5">
          <AttackVectorRadar />
        </GlassCard>
        <GlassCard className="p-5">
          <QuickScanCard recentScans={scans} />
        </GlassCard>
        <GlassCard className="p-5">
          <TrapPerformanceCard decoys={decoys} />
        </GlassCard>
      </div>

      {/* Breach window banner if score critical */}
      {latestScan && latestScan.ars_score >= 60 && (
        <GlassCard glow="red" className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-red-400">⚡ BREACH WINDOW OPEN</div>
                <div className="text-sm text-text-secondary mt-0.5">
                  Estimated exploit time: <span className="font-mono text-amber-400">{latestScan.estimated_time_to_exploit_hours}h</span> — based on your current ARS score.
                </div>
              </div>
            </div>
            <Link to="/phantomshield" className="btn-danger !px-5 self-start sm:self-auto">
              <ShieldHalf className="h-4 w-4" /> Deploy Shield
            </Link>
          </div>
        </GlassCard>
      )}

      {/* Onboarding checklist */}
      {scans.length === 0 && !demoMode && (
        <GlassCard className="p-5">
          <div className="mb-4 text-sm font-semibold text-text-primary">Get started with MirrorTrap</div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Run your first scan', to: '/scan', done: scans.length > 0, icon: Radar },
              { label: 'Deploy PhantomShield', to: '/phantomshield', done: activeDecoys > 0, icon: ShieldCheck },
              { label: 'Monitor alerts', to: '/alerts', done: alerts.length > 0, icon: Activity },
            ].map((step, i) => (
              <Link
                key={step.label}
                to={step.to}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 transition-all',
                  step.done
                    ? 'border-emerald-500/30 bg-emerald-500/5 opacity-70'
                    : 'hover:border-indigo-500/30 hover:bg-indigo-500/5',
                )}
                style={{ borderColor: step.done ? undefined : 'rgba(255,255,255,0.06)' }}
              >
                <step.icon className={cn('h-5 w-5', step.done ? 'text-emerald-400' : 'text-text-muted')} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-text-muted">Step {i + 1}</div>
                  <div className={cn('text-sm font-medium', step.done ? 'text-text-muted line-through' : 'text-text-primary')}>
                    {step.label}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
