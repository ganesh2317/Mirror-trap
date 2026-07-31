import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BadgeDollarSign,
  Check,
  Download,
  FileBarChart,
  Radar,
  TrendingUp,
  X,
} from 'lucide-react';
import { useApp } from '@/lib/useApp';
import { ArsBadge } from '@/components/ui/ArsBadge';
import { arsColor, cn, formatDate } from '@/lib/utils';
import type { ScanResult } from '@/lib/types';
import { usePageTitle } from '@/lib/usePageTitle';
import { FinancialImpact } from '@/components/FinancialImpact';

import { EmptyState } from '@/components/ui/EmptyState';

function escapeHtml(str: string): string {

  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function downloadReport(s: ScanResult) {
  const safeDomain = escapeHtml(s.domain);
  const safeEntry = escapeHtml(s.primary_entry_path);
  const isLive = s.real_sources_used && s.real_sources_used.length > 0;

  const html = `<!doctype html><html><head><title>MirrorTrap Executive AI Threat Report — ${safeDomain}</title>
<style>
body{font-family:Inter,system-ui,sans-serif;background:#0D0B1A;color:#e6e4f2;padding:32px;max-width:850px;margin:0 auto;line-height:1.5}
h1{font-weight:700;margin:0;font-size:24px;color:#fff}
h2{font-size:16px;font-weight:700;margin:20px 0 8px;color:#A78BFA;border-bottom:1px solid rgba(167,139,250,0.2);padding-bottom:6px}
.muted{color:#8c8aa6;font-size:13px}
.badge{display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase}
.live{background:rgba(52,211,153,0.15);color:#34D399;border:1px solid rgba(52,211,153,0.4)}
.demo{background:rgba(251,191,36,0.15);color:#FBBF24;border:1px solid rgba(251,191,36,0.4)}
.box{border:1px solid rgba(127,119,221,0.3);border-radius:12px;padding:16px;margin:12px 0;background:#1A1730}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.sev{display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:2px}
.c{background:rgba(240,149,149,0.15);color:#F09595}
.h{background:rgba(239,159,39,0.15);color:#EF9F27}
.m{background:rgba(250,204,21,0.15);color:#FDE68A}
.l{background:rgba(29,158,117,0.15);color:#1D9E75}
</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
  <div>
    <h1>MirrorTrap Executive AI Threat Report</h1>
    <div class="muted">Domain: <b>${safeDomain}</b> · Generated: ${new Date(s.timestamp).toLocaleString()}</div>
  </div>
  <div>
    <span class="badge ${isLive ? 'live' : 'demo'}">${isLive ? 'LIVE OSINT RECON' : 'DEMO MODE DATA'}</span>
  </div>
</div>

<h2>1. Executive Summary</h2>
<div class="box">
  <p style="margin:0">MirrorTrap AI conducted automated external reconnaissance against <b>${safeDomain}</b> across DNS records, SSL/TLS validation, public CT logs, GitHub secret search, and security headers. Overall attack surface exposure is evaluated at <b>ARS ${s.ars_score} / 100</b> with primary entry vector identified as <b>${safeEntry}</b>.</p>
</div>

<h2>2. Risk Overview & Exposure Breakdown</h2>
<div class="box grid">
  <div><b>Attack Readiness Score:</b> <span style="color:#EF9F27;font-weight:700">ARS ${s.ars_score}</span></div>
  <div><b>Estimated Time to Exploit:</b> <b>${s.estimated_time_to_exploit_hours} hours</b></div>
  <div><b>Primary Entry Path:</b> ${safeEntry}</div>
  <div><b>Confidence Score:</b> ${s.confidence}%</div>
</div>

<h2>3. Critical Findings (${s.findings.length})</h2>
${s.findings
  .map(
    (f) => `<div class="box">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <span class="sev ${f.severity === 'CRITICAL' ? 'c' : f.severity === 'HIGH' ? 'h' : f.severity === 'MEDIUM' ? 'm' : 'l'}">${escapeHtml(f.severity)}</span>
    <span class="muted">${escapeHtml(f.source)} ${f.isReal ? '(LIVE)' : '(ESTIMATED)'}</span>
  </div>
  <div style="margin-top:6px;font-weight:600;color:#fff">${escapeHtml(f.title)}</div>
  <div class="muted" style="margin-top:4px">${escapeHtml(f.description)}</div>
  <div style="margin-top:6px;font-size:12px;color:#cbd5e1">${escapeHtml(f.meaning)}</div>
</div>`,
  )
  .join('')}

<h2>4. Observed Technologies</h2>
<div class="box">
  <div class="muted">Detected fingerprints: ${s.intel_data?.tech ? s.intel_data.tech.map((t) => `${t.name} (${t.confidence}%)`).join(' · ') : 'React, Cloudflare CDN, Google Workspace, Nginx'}</div>
</div>

<h2>5. Strategic Recommendations</h2>
<div class="box">
  <ol style="margin:0;padding-left:20px">
    <li>Deploy SPF/DKIM/DMARC DNS records to prevent email spoofing.</li>
    <li>Enforce HTTP Strict Transport Security (HSTS) and Content-Security-Policy (CSP).</li>
    <li>Audit public GitHub search findings for co-located secret leakage.</li>
    <li>Deploy PhantomShield honeypots on exposed subdomains to poison reconnaissance bots.</li>
  </ol>
</div>

<h2>6. Next Steps & Active Deception</h2>
<div class="box">
  <p style="margin:0">Activate <b>PhantomShield Decoys</b> on subdomains to capture real-time attacker IP locations and divert active exploits before they reach core infrastructure.</p>
</div>
</body></html>`;
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}



function StatCard({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className="card p-4">
      <div className="text-[10px] uppercase tracking-widest text-slate-400">{label}</div>
      <div className={cn('mt-1 font-mono text-3xl tabular-nums', tone)}>{value}</div>
    </div>
  );
}

const COMP_ROWS = [
  {
    tool: 'Thinkst Canary',
    price: '$7,500/yr',
    osint: false,
    traps: true,
    ai: false,
    ars: false,
  },
  { tool: 'SpiderFoot', price: '$500/yr', osint: true, traps: false, ai: false, ars: false },
  {
    tool: 'Shodan',
    price: '$199/yr',
    osint: 'partial' as const,
    traps: false,
    ai: false,
    ars: false,
  },
  {
    tool: 'Manual OSINT',
    price: '10+ hrs',
    osint: 'partial' as const,
    traps: false,
    ai: false,
    ars: false,
  },
  {
    tool: 'MirrorTrap',
    price: '₹999/mo',
    osint: true,
    traps: true,
    ai: true,
    ars: true,
    us: true,
  },
];

function Cell({ v }: { v: boolean | 'partial' }) {
  if (v === 'partial')
    return <span className="text-[11px] font-semibold text-brand-amber">Partial</span>;
  if (v) return <Check className="inline h-4 w-4 text-brand-success" />;
  return <X className="inline h-4 w-4 text-slate-600" />;
}

type Tab = 'overview' | 'financial';

export function ReportsPage() {
  usePageTitle('MirrorTrap — Reports');
  const { scans, alerts, latestScan } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: Tab = (searchParams.get('tab') as Tab) === 'financial' ? 'financial' : 'overview';
  const setTab = (t: Tab) => {
    const next = new URLSearchParams(searchParams);
    if (t === 'overview') next.delete('tab');
    else next.set('tab', t);
    setSearchParams(next, { replace: true });
  };
  const sorted = useMemo(
    () => [...scans].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp)),
    [scans],
  );
  const trend = useMemo(
    () =>
      sorted.slice(-7).map((s, i) => ({
        i: i + 1,
        label: formatDate(s.timestamp),
        ars: s.ars_score,
        domain: s.domain,
      })),
    [sorted],
  );
  const avg = sorted.length
    ? Math.round(sorted.reduce((a, s) => a + s.ars_score, 0) / sorted.length)
    : 0;

  const uniqueDomains = new Set(scans.map((s) => s.domain)).size;

  const latestArs = trend.length ? trend[trend.length - 1].ars : 0;
  const lineColor =
    latestArs > 70 ? '#F09595' : latestArs >= 40 ? '#EF9F27' : '#1D9E75';

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
          <FileBarChart className="h-3.5 w-3.5" /> Reports
        </div>
        <h1 className="mt-1 text-2xl font-bold text-white">
          {activeTab === 'financial'
            ? 'Financial impact analyzer'
            : 'Scan history & ARS trend'}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {activeTab === 'financial'
            ? 'Translate your OSINT findings into real monetary exposure — with industry benchmarks and MirrorTrap ROI.'
            : 'Historical view of your attack-readiness posture, exportable threat reports per scan, and competitive intelligence vs other security tools.'}
        </p>
        <div className="mt-4 inline-flex rounded-lg border border-border bg-bg-terminal/60 p-1">
          <button
            onClick={() => setTab('overview')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors',
              activeTab === 'overview'
                ? 'bg-brand-purple/25 text-brand-purple'
                : 'text-slate-400 hover:text-slate-200',
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" /> Overview
          </button>
          <button
            onClick={() => setTab('financial')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors',
              activeTab === 'financial'
                ? 'bg-brand-amber/25 text-brand-amber'
                : 'text-slate-400 hover:text-slate-200',
            )}
          >
            <BadgeDollarSign className="h-3.5 w-3.5" /> Financial Impact
          </button>
        </div>
      </div>

      {activeTab === 'financial' ? (
        <FinancialImpact latestScan={latestScan} />
      ) : (
        <OverviewTab
          scans={scans}
          alerts={alerts}
          avg={avg}
          uniqueDomains={uniqueDomains}
          sorted={sorted}
          trend={trend}
          lineColor={lineColor}
        />
      )}
    </div>
  );
}

interface OverviewTabProps {
  scans: ScanResult[];
  alerts: ReturnType<typeof useApp>['alerts'];
  avg: number;
  uniqueDomains: number;
  sorted: ScanResult[];
  trend: Array<{ i: number; label: string; ars: number; domain: string }>;
  lineColor: string;
}

function OverviewTab({
  scans,
  alerts,
  avg,
  uniqueDomains,
  sorted,
  trend,
  lineColor,
}: OverviewTabProps) {
  return (
    <>
      {/* Summary stat row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Scans" value={scans.length} tone="text-white" />
        <StatCard label="Avg ARS" value={avg} tone="text-brand-amber" />
        <StatCard label="Tripwires Fired" value={alerts.length} tone="text-brand-danger" />
        <StatCard label="Domains Protected" value={uniqueDomains} tone="text-brand-purple" />
      </div>

      {/* Trend chart */}
      <div className="card p-5">
        <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
          <TrendingUp className="h-3.5 w-3.5" /> Attack Readiness Score — Historical Trend
        </div>
        <div className="mb-3 text-sm text-slate-400">
          Line color reflects the latest score band. Dashed red line marks the{' '}
          <span className="font-semibold text-brand-danger">CRITICAL threshold</span> at ARS 70.
        </div>
        {trend.length === 0 ? (
          <EmptyState
            icon={Radar}
            title="No scan history available"
            description="Run your first OSINT attack-surface scan to record historical ARS trends and executive threat reports."
            primaryAction={{ label: 'Run Attack Surface Scan', to: '/scan', icon: Radar }}
            className="!p-6 my-4"
          />
        ) : (

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <ComposedChart data={trend} margin={{ top: 12, right: 24, bottom: 8, left: 0 }}>
                <defs>
                  <linearGradient id="arsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lineColor} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(127,119,221,0.12)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="i"
                  stroke="#7F77DD"
                  tick={{ fill: '#8c8aa6', fontSize: 11 }}
                  tickFormatter={(v) => `#${v}`}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#7F77DD"
                  tick={{ fill: '#8c8aa6', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0A0814',
                    border: '1px solid rgba(127,119,221,0.3)',
                    borderRadius: 10,
                    color: '#e6e4f2',
                    fontSize: 12,
                  }}
                  labelFormatter={(_, payload) => {
                    const p = payload?.[0]?.payload as { domain?: string; label?: string } | undefined;
                    return p ? `${p.domain} · ${p.label}` : '';
                  }}
                  formatter={(v) => [`${v}`, 'ARS']}
                />
                <ReferenceLine
                  y={70}
                  stroke="#F09595"
                  strokeDasharray="6 4"
                  label={{
                    value: 'CRITICAL THRESHOLD',
                    fill: '#F09595',
                    fontSize: 10,
                    position: 'right',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ars"
                  stroke="none"
                  fill="url(#arsFill)"
                  isAnimationActive
                />
                <Line
                  type="monotone"
                  dataKey="ars"
                  stroke={lineColor}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1A1730', stroke: lineColor, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive
                />
                <ReferenceDot
                  x={trend[trend.length - 1].i}
                  y={trend[trend.length - 1].ars}
                  r={7}
                  fill={lineColor}
                  stroke="#fff"
                  strokeWidth={1.5}
                  ifOverflow="extendDomain"
                  className="animate-pulse-dot"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Scan history */}
      <div className="card overflow-hidden">
        <div className="border-b border-border bg-bg-terminal/60 px-4 py-3 text-xs uppercase tracking-widest text-slate-400">
          Scan history
        </div>
        {sorted.length === 0 ? (
          <div className="p-6 text-sm text-slate-400">
            No scans yet.{' '}
            <Link to="/scan" className="text-brand-purple hover:underline">
              Run your first
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-4 py-2">Domain</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">ARS Score</th>
                  <th className="px-4 py-2">Findings</th>
                  <th className="px-4 py-2">Time-to-Exploit</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...sorted].reverse().map((s, idx) => {
                  const color = arsColor(s.ars_score);
                  const status =
                    color === 'red' ? 'Critical' : color === 'amber' ? 'Elevated' : 'Healthy';
                  const statusTone =
                    color === 'red'
                      ? 'bg-brand-danger/15 text-brand-danger'
                      : color === 'amber'
                        ? 'bg-brand-amber/15 text-brand-amber'
                        : 'bg-brand-success/15 text-brand-success';
                  return (
                    <tr
                      key={s.id}
                      className={cn(
                        'border-t border-border',
                        idx % 2 === 1 && 'bg-bg-terminal/30',
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-slate-100">{s.domain}</td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(s.timestamp)}</td>
                      <td className="px-4 py-3">
                        <ArsBadge score={s.ars_score} />
                      </td>
                      <td className="px-4 py-3 text-slate-300">{s.findings.length}</td>
                      <td className="px-4 py-3 font-mono text-brand-amber">
                        {s.estimated_time_to_exploit_hours}h
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
                            statusTone,
                          )}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <Link to="/scan" className="btn-ghost !py-1.5 !text-xs">
                            View Details
                          </Link>
                          <button
                            onClick={() => downloadReport(s)}
                            className="btn-ghost !py-1.5 !text-xs"
                          >
                            <Download className="h-3.5 w-3.5" /> Export Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Competitive intelligence */}
      <div className="card p-5">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
          <TrendingUp className="h-3.5 w-3.5" /> Why MirrorTrap vs Alternatives
        </div>
        <h2 className="mt-1 text-lg font-semibold text-white">
          All 4 layers — at SMB-affordable pricing.
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-3 py-2">Tool</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2 text-center">OSINT Scan</th>
                <th className="px-3 py-2 text-center">Active Traps</th>
                <th className="px-3 py-2 text-center">AI Profiling</th>
                <th className="px-3 py-2 text-center">ARS Score</th>
              </tr>
            </thead>
            <tbody>
              {COMP_ROWS.map((r) => (
                <tr
                  key={r.tool}
                  className={cn(
                    'border-t border-border',
                    r.us && 'bg-brand-success/5 outline outline-1 outline-brand-success/40',
                  )}
                >
                  <td className="px-3 py-3 font-semibold text-slate-100">
                    {r.tool}
                    {r.us ? (
                      <span className="ml-2 rounded-md bg-brand-success/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-success">
                        you
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-300">{r.price}</td>
                  <td className="px-3 py-3 text-center">
                    <Cell v={r.osint} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Cell v={r.traps} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Cell v={r.ai} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Cell v={r.ars} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-[11px] text-slate-500">
          Only MirrorTrap combines all 4 layers at SMB-affordable pricing.
        </div>
      </div>

      <div className="flex">
        <Link to="/scan" className="btn-primary ml-auto !py-2.5">
          <Radar className="h-4 w-4" /> New scan
        </Link>
      </div>
    </>
  );
}
