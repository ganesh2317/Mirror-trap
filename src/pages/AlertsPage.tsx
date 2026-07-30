import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  Copy,
  Download,
  Flag,
  Globe2,
  Loader2,
  Play,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  Zap,
} from 'lucide-react';
import {
  Bar, BarChart, Cell, CartesianGrid, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useApp } from '@/lib/useApp';
import type { Alert } from '@/lib/types';
import { cn, formatTime } from '@/lib/utils';
import { usePageTitle } from '@/lib/usePageTitle';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { severityVariant } from '@/lib/badgeUtils';

import { LivePulseDot } from '@/components/ui/LivePulseDot';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

type SeverityFilter = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type TimeFilter = 'ALL' | 'UNREAD' | 'TODAY' | 'WEEK';
type SortOrder = 'NEWEST' | 'SEVERITY' | 'CONFIDENCE';

const SEVERITY_RANK: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
const ATTACK_TYPE_COLORS = ['#EF4444', '#F43F5E', '#6366F1', '#F59E0B', '#10B981'];

function relativeTime(iso: string): string {
  const diff = Date.now() - +new Date(iso);
  const s = Math.max(1, Math.round(diff / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function inferAttackType(a: Alert): string {
  const blob = `${a.asset_used} ${a.classification.label} ${a.behavior.pattern} ${a.behavior.requests}`.toLowerCase();
  if (/login|password|credential|auth/.test(blob)) return 'Credential Stuffing';
  if (/port|scan|probe/.test(blob)) return 'Port Scanning';
  if (/osint|recon|spider/.test(blob)) return 'OSINT Scraping';
  if (/sql|injection/.test(blob)) return 'SQL Injection';
  return 'Brute Force';
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { void navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-text-muted hover:text-indigo-400 transition-colors"
    >
      <Copy className={cn('h-3.5 w-3.5', copied && 'text-emerald-400')} />
    </button>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs">
      <div className="text-text-muted">{payload[0].name}</div>
      <div className="font-mono font-bold text-indigo-400">{payload[0].value}</div>
    </div>
  );
}

function AlertCard({ a, isNewArrival }: { a: Alert; isNewArrival: boolean }) {

  const { updateAlertStatus, pushToast } = useApp();
  const [open, setOpen] = useState(false);

  const severityColor = {
    CRITICAL: { border: 'border-l-red-500', bg: 'rgba(239,68,68,0.03)' },
    HIGH: { border: 'border-l-rose-500', bg: 'rgba(244,63,94,0.03)' },
    MEDIUM: { border: 'border-l-amber-500', bg: 'rgba(245,158,11,0.02)' },
    LOW: { border: 'border-l-emerald-500', bg: 'rgba(16,185,129,0.02)' },
  }[a.severity] ?? { border: 'border-l-indigo-500', bg: 'transparent' };

  const confidence = a.classification.confidence;

  return (
    <div
      className={cn(
        'card border-l-4 p-5 transition-all',
        severityColor.border,
        isNewArrival && 'animate-slide-in-top',
        a.status !== 'open' && 'opacity-60',
      )}
      style={{ background: isNewArrival ? severityColor.bg : undefined }}
    >
      <div className="flex flex-wrap items-start gap-4">
        {/* Left col */}
        <div className="flex flex-col gap-2 min-w-[120px]">
          <Badge variant={severityVariant(a.severity)} pulse={a.severity === 'CRITICAL'}>
            {a.severity}
          </Badge>
          <span className="text-xs text-text-muted font-semibold">{a.classification.label}</span>
          <span className="text-xs text-text-muted">{confidence}% confident</span>
        </div>

        {/* Center col */}
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-text-primary">
            {a.asset_used}
          </div>
          <div className="mt-1 text-sm text-text-muted">{a.behavior.pattern}</div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-amber-400">{a.country_flag} {a.ip}</span>
              <CopyButton text={a.ip} />
            </div>
            <span className="text-text-muted">·</span>
            <span className="text-text-muted">{a.country} — {a.network_tag}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
            <span>{formatTime(a.timestamp)}</span>
            <span>·</span>
            <span>{relativeTime(a.timestamp)}</span>
          </div>
        </div>

        {/* Right col — actions */}
        <div className="flex flex-col gap-2 items-end">
          {/* VIEW REPLAY — primary CTA */}
          <Link
            to={`/replay/${a.id}`}
            className="btn-primary !py-2 !px-4 !text-sm"
          >
            <Play className="h-3.5 w-3.5" /> View Replay
          </Link>
          <button
            onClick={() => updateAlertStatus(a.id, 'dismissed')}
            className="btn-ghost !py-1.5 !text-xs"
          >
            Mark Read
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-indigo-400 transition-colors"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
            {open ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="mt-4 space-y-3 border-t pt-4 animate-fade-in" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border p-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,8,15,0.5)' }}>
              <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Request rate</div>
              <div className="text-sm text-text-secondary">{a.behavior.requests}</div>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,8,15,0.5)' }}>
              <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Probe pattern</div>
              <div className="text-sm text-text-secondary">{a.behavior.pattern}</div>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,8,15,0.5)' }}>
              <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Fingerprint</div>
              <div className="text-sm text-text-secondary">{a.behavior.fingerprint}</div>
            </div>
          </div>

          {/* Attack path */}
          <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,8,15,0.5)' }}>
            <div className="mb-2 text-[10px] uppercase tracking-widest text-indigo-400">Probable attack path</div>
            <ol className="space-y-1.5 font-mono text-sm">
              {a.attack_path.map((p) => (
                <li key={p.step} className={cn('flex items-start gap-3', p.predicted && 'text-text-muted', p.triggered && 'text-amber-400')}>
                  <span className="w-12 shrink-0 text-text-muted">Step {p.step}:</span>
                  <span className="flex-1">
                    {p.label}
                    {p.triggered && <span className="ml-2 rounded text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/15 px-1.5 py-0.5">← triggered</span>}
                    {p.predicted && <span className="ml-2 text-[10px] uppercase tracking-widest text-text-muted">(predicted)</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { updateAlertStatus(a.id, 'flagged'); pushToast({ title: `IP ${a.ip} flagged`, tone: 'amber' }); }}
              disabled={a.status === 'flagged'}
              className="btn-amber !py-1.5 !text-xs"
            >
              <Flag className="h-3.5 w-3.5" /> Flag IP
            </button>
            <button onClick={() => updateAlertStatus(a.id, 'dismissed')} className="btn-ghost !py-1.5 !text-xs">
              <Trash2 className="h-3.5 w-3.5" /> Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AttackIntelligence({ alerts }: { alerts: Alert[] }) {
  const perCountry = useMemo(() => {
    const map = new Map<string, { flag: string; country: string; count: number }>();
    alerts.forEach((a) => {
      const key = a.country || 'Unknown';
      const entry = map.get(key) ?? { flag: a.country_flag || '🏴', country: key, count: 0 };
      entry.count += 1;
      map.set(key, entry);
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [alerts]);

  const topCountries = perCountry.slice(0, 6);
  const maxCount = Math.max(1, ...topCountries.map((c) => c.count));
  const chartData = topCountries.map((c) => ({
    label: `${c.flag} ${c.country}`,
    count: c.count,
    tone: c.count >= maxCount * 0.66 ? '#EF4444' : c.count >= maxCount * 0.33 ? '#F59E0B' : '#10B981',
  }));

  const attackTypes = useMemo(() => {
    const map = new Map<string, number>();
    alerts.forEach((a) => { const t = inferAttackType(a); map.set(t, (map.get(t) ?? 0) + 1); });
    const entries = [...map.entries()].map(([name, value]) => ({ name, value }));
    return entries.length ? entries : [
      { name: 'Credential Stuffing', value: 41 },
      { name: 'Port Scanning', value: 28 },
      { name: 'OSINT Scraping', value: 18 },
      { name: 'SQL Injection', value: 8 },
      { name: 'Brute Force', value: 5 },
    ];
  }, [alerts]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Origin chart */}
      {chartData.length > 0 && (
        <GlassCard className="p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Globe2 className="h-3.5 w-3.5 text-indigo-400" /> Attack Origin
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                <XAxis type="number" domain={[0, maxCount]} stroke="#475569" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="label" stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 11 }} width={120} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.tone} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Attack type donut */}
      <GlassCard className="p-5">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5 text-red-400" /> Attack Types
        </div>
        <div className="flex items-center gap-4">
          <div style={{ width: 160, height: 160 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={attackTypes} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={2} stroke="rgba(5,8,15,0.8)">
                  {attackTypes.map((_, i) => <Cell key={i} fill={ATTACK_TYPE_COLORS[i % ATTACK_TYPE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1.5 text-xs text-text-secondary">
            {attackTypes.map((t, i) => (
              <li key={t.name} className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-sm flex-shrink-0" style={{ background: ATTACK_TYPE_COLORS[i % ATTACK_TYPE_COLORS.length] }} />
                <span className="flex-1">{t.name}</span>
                <span className="font-mono text-text-primary">{t.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </GlassCard>
    </div>
  );
}

export function AlertsPage() {
  usePageTitle('MirrorTrap — Alerts');
  const { alerts, simulateAttack } = useApp();

  const [severity, setSeverity] = useState<SeverityFilter>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrder>('NEWEST');
  const [search, setSearch] = useState('');
  const [targeting, setTargeting] = useState(false);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const prevCountRef = useRef(alerts.length);

  // Detect new arrivals
  useEffect(() => {
    if (alerts.length > prevCountRef.current) {
      const topId = alerts[0]?.id;
      if (topId) {
        const timer = setTimeout(() => {
          setNewIds((prev) => { const next = new Set(prev); next.add(topId); return next; });
          setTimeout(() => setNewIds((prev) => { const next = new Set(prev); next.delete(topId); return next; }), 3200);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
    prevCountRef.current = alerts.length;
  }, [alerts]);


  const filtered = useMemo(() => {
    let list = [...alerts];

    if (severity !== 'ALL') list = list.filter((a) => a.severity === severity);

    if (timeFilter === 'UNREAD') list = list.filter((a) => a.status === 'open');
    else if (timeFilter === 'TODAY') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      list = list.filter((a) => new Date(a.timestamp) >= start);
    } else if (timeFilter === 'WEEK') {
      const start = new Date(); start.setDate(start.getDate() - 7);
      list = list.filter((a) => new Date(a.timestamp) >= start);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.ip.includes(q) || a.classification.label.toLowerCase().includes(q) || a.country.toLowerCase().includes(q));
    }

    if (sortOrder === 'NEWEST') list.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
    else if (sortOrder === 'SEVERITY') list.sort((a, b) => (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0));
    else if (sortOrder === 'CONFIDENCE') list.sort((a, b) => b.classification.confidence - a.classification.confidence);

    return list;
  }, [alerts, severity, timeFilter, sortOrder, search]);

  const unread = alerts.filter((a) => a.status === 'open').length;
  const criticals = alerts.filter((a) => a.severity === 'CRITICAL').length;

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(alerts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url; el.download = `mirrortrap-alerts-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(el); el.click(); document.body.removeChild(el);
    URL.revokeObjectURL(url);
  };

  const onSimulate = () => {
    if (targeting) return;
    setTargeting(true);
    setTimeout(() => { simulateAttack(); setTargeting(false); }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.02em' }}>Threat Alerts</h1>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
              <LivePulseDot color="red" size="sm" />
              MONITORING
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-muted">
            <span><span className="font-mono font-bold text-red-400"><AnimatedCounter value={alerts.length} /></span> total</span>
            <span><span className="font-mono font-bold text-amber-400">{unread}</span> unread</span>
            <span><span className="font-mono font-bold text-red-400">{criticals}</span> critical</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportAll} disabled={alerts.length === 0} className="btn-ghost !py-2 !text-xs">
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={onSimulate} disabled={targeting} className="btn-danger !px-4 !py-2">
            {targeting ? <><Loader2 className="h-4 w-4 animate-spin" /> TARGETING…</> : <><Zap className="h-4 w-4" /> Simulate Attack</>}
          </button>
        </div>
      </div>

      {/* Attack intelligence */}
      {alerts.length > 0 && <AttackIntelligence alerts={alerts} />}

      {/* Filter bar */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-3">
          {/* Severity filter */}
          <div className="flex gap-1 rounded-xl border p-1" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as SeverityFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                  severity === s ? 'bg-indigo-500/20 text-indigo-400' : 'text-text-muted hover:text-text-secondary',
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Time filter */}
          <div className="flex gap-1 rounded-xl border p-1" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            {(['ALL', 'UNREAD', 'TODAY', 'WEEK'] as TimeFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                  timeFilter === t ? 'bg-indigo-500/20 text-indigo-400' : 'text-text-muted hover:text-text-secondary',
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-text-secondary appearance-none cursor-pointer"
            style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(5,8,15,0.6)' }}
          >
            <option value="NEWEST">Newest</option>
            <option value="SEVERITY">By Severity</option>
            <option value="CONFIDENCE">By Confidence</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search IP or classification..."
              className="input-dark !py-1.5 !pl-9 w-full text-xs"
            />
          </div>
        </div>
      </GlassCard>

      {/* Alert list */}
      {filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-text-muted opacity-40 mb-4" />
          <div className="text-lg font-semibold text-text-primary">
            {alerts.length === 0 ? 'No alerts yet' : 'No alerts match your filters'}
          </div>
          <div className="mt-2 text-sm text-text-muted">
            {alerts.length === 0
              ? 'Your traps are deployed and waiting. Any attacker activity will appear here instantly.'
              : 'Try adjusting the filters above.'}
          </div>
          {alerts.length === 0 && (
            <Link to="/phantomshield" className="mt-4 btn-primary inline-flex">
              Deploy a Trap
            </Link>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-text-muted">Showing {filtered.length} of {alerts.length} alerts</div>
          {filtered.map((a) => (
            <AlertCard key={a.id} a={a} isNewArrival={newIds.has(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
