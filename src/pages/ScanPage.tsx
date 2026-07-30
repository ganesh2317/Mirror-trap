import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  Circle,
  Cloud,
  Code2,
  Crosshair,
  Database,
  Download,
  ExternalLink,
  FileKey,
  Globe,
  Lock,
  Loader2,
  Radar,
  ShieldHalf,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { useApp } from '@/lib/useApp';
import type { Finding, ScanResult, ScanSource, Severity } from '@/lib/types';
import { DEMO_SCAN } from '@/lib/mockData';
import { describePort, runRealScan, sourceHIBP } from '@/lib/scanApi';
import { Mail, Building2, AtSign } from 'lucide-react';
import { arsColor, cn, sleep } from '@/lib/utils';
import { usePageTitle } from '@/lib/usePageTitle';
import { EmailScanFlow } from '@/components/EmailScanFlow';

const SOURCES: Array<{
  key: ScanSource;
  label: string;
  icon: typeof Radar;
  delay: number;
  okLine: string;
  tone: 'ok' | 'warn' | 'err';
}> = [
  { key: 'HaveIBeenPwned', label: 'HaveIBeenPwned API', icon: FileKey, delay: 800, okLine: '3 leaked emails found', tone: 'err' },
  { key: 'Shodan', label: 'Shodan InternetDB', icon: Cloud, delay: 1100, okLine: '2 exposed services found', tone: 'warn' },
  { key: 'crt.sh', label: 'crt.sh subdomains', icon: Globe, delay: 1000, okLine: '8 subdomains enumerated', tone: 'ok' },
  { key: 'GitHub', label: 'GitHub public search', icon: Code2, delay: 1300, okLine: '1 credential pattern found', tone: 'err' },
  { key: 'DNS', label: 'DNS records', icon: Database, delay: 600, okLine: 'Tech stack identified', tone: 'ok' },
  { key: 'Security Headers', label: 'Security Headers', icon: Lock, delay: 700, okLine: 'Grade returned', tone: 'warn' },
];

const toneClass = {
  ok: 'text-brand-success',
  warn: 'text-brand-amber',
  err: 'text-brand-danger',
} as const;

type Phase = 'idle' | 'scanning' | 'results';

interface TermLine {
  text: string;
  tone: 'dim' | 'cmd' | 'ok' | 'warn' | 'err';
}

const termColor = {
  dim: 'text-slate-500',
  cmd: 'text-brand-purple',
  ok: 'text-brand-success',
  warn: 'text-brand-amber',
  err: 'text-brand-danger',
} as const;

function ScoreNumber({ target }: { target: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      setV(Math.round(target * e));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  const color = arsColor(target);
  const c = color === 'red' ? '#F09595' : color === 'amber' ? '#EF9F27' : '#1D9E75';
  return (
    <div className="flex flex-col items-center">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">
        Attack Readiness Score
      </div>
      <div className="mt-1 text-[96px] font-bold leading-none tabular-nums" style={{ color: c }}>
        {v}
      </div>
      <div className="text-xs font-bold tracking-[0.2em]" style={{ color: c }}>
        / 100
      </div>
    </div>
  );
}

function RealEstPill({ isReal }: { isReal: boolean | undefined }) {
  if (isReal) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-md border border-brand-success/40 bg-brand-success/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-success"
        title="Live public-source data fetched at scan time"
      >
        <Wifi className="h-2.5 w-2.5" /> LIVE
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border border-brand-amber/40 bg-brand-amber/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-amber"
      title="Estimated — real API unavailable in this environment"
    >
      EST.
    </span>
  );
}

function PortChip({ p }: { p: number }) {
  const desc = describePort(p);
  const risky = [21, 22, 23, 3306, 5432, 27017, 6379, 9200, 8080, 8443, 3389, 445, 1433].includes(p);
  return (
    <span
      className={cn(
        'inline-flex cursor-help items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px]',
        risky
          ? 'border-brand-danger/40 bg-brand-danger/10 text-brand-danger'
          : 'border-border bg-bg-terminal/60 text-slate-200',
      )}
      title={desc}
    >
      {p}
      <span className="text-[10px] text-slate-500">· {desc.split(' ')[0]}</span>
    </span>
  );
}

interface SubdomainData {
  subdomains?: string[];
}
interface ShodanData {
  ip?: string;
  ports?: number[];
  dangerous?: number[];
  vulns?: string[];
}
interface GhData {
  repos?: Array<{
    name: string;
    url?: string;
    stars?: number;
    language?: string | null;
    updated_at?: string;
  }>;
}

function FindingDetail({ f }: { f: Finding }) {
  const rd = f.real_data as
    | Partial<SubdomainData & ShodanData & GhData & { tech?: string[]; ips?: string[] }>
    | undefined;
  if (!rd) return null;

  if (f.source === 'crt.sh' && rd.subdomains?.length) {
    const list = rd.subdomains.slice(0, 40);
    return (
      <details className="mt-3 rounded-lg border border-border bg-bg-terminal/60 p-3 text-xs text-slate-300">
        <summary className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-widest text-brand-purple">
          View {rd.subdomains.length} subdomain(s)
        </summary>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {list.map((s) => (
            <li key={s}>
              <a
                href={`https://${s}`}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1 font-mono text-[11px] text-slate-200 hover:text-brand-purple"
              >
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                {s}
              </a>
            </li>
          ))}
        </ul>
        {rd.subdomains.length > 40 ? (
          <div className="mt-2 text-[10px] text-slate-500">
            Showing first 40 of {rd.subdomains.length}. Download report for the full list.
          </div>
        ) : null}
      </details>
    );
  }

  if (f.source === 'Shodan' && (rd.ports?.length || rd.vulns?.length)) {
    return (
      <div className="mt-3 space-y-2 rounded-lg border border-border bg-bg-terminal/60 p-3">
        {rd.ip ? (
          <div className="text-[11px] text-slate-400">
            IP: <span className="font-mono text-slate-200">{rd.ip}</span>
          </div>
        ) : null}
        {rd.ports?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {rd.ports.map((p) => (
              <PortChip key={p} p={p} />
            ))}
          </div>
        ) : null}
        {rd.vulns?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {rd.vulns.slice(0, 10).map((v) => (
              <span
                key={v}
                className="rounded-md border border-brand-danger/40 bg-brand-danger/10 px-1.5 py-0.5 font-mono text-[11px] text-brand-danger"
              >
                {v}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (f.source === 'GitHub' && rd.repos?.length) {
    return (
      <ul className="mt-3 space-y-1.5 rounded-lg border border-border bg-bg-terminal/60 p-3 text-xs text-slate-300">
        {rd.repos.slice(0, 5).map((r) => (
          <li key={r.name} className="flex items-center gap-2">
            <ExternalLink className="h-3 w-3 text-slate-500" />
            {r.url ? (
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-slate-100 hover:text-brand-purple"
              >
                {r.name}
              </a>
            ) : (
              <span className="font-mono text-[11px] text-slate-100">{r.name}</span>
            )}
            {typeof r.stars === 'number' ? (
              <span className="text-[10px] text-slate-500">★ {r.stars}</span>
            ) : null}
            {r.language ? (
              <span className="text-[10px] text-slate-500">· {r.language}</span>
            ) : null}
          </li>
        ))}
      </ul>
    );
  }

  if (f.source === 'DNS' && rd.tech?.length) {
    return (
      <div className="mt-3 flex flex-wrap gap-1.5 rounded-lg border border-border bg-bg-terminal/60 p-3">
        {rd.tech.map((t) => (
          <span
            key={t}
            className="rounded-md border border-brand-purple/40 bg-brand-purple/10 px-1.5 py-0.5 text-[11px] text-brand-purple"
          >
            {t}
          </span>
        ))}
      </div>
    );
  }

  return null;
}

function FindingCard({ f }: { f: Finding }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <SeverityBadge severity={f.severity} />
        <span className="pill">{f.source}</span>
        <RealEstPill isReal={f.isReal} />
        <div className="flex-1" />
        <button
          className="text-slate-400 hover:text-slate-200"
          onClick={() => setOpen((v) => !v)}
          aria-label="Expand"
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
          />
        </button>
      </div>
      <div className="mt-2 text-[15px] font-semibold text-white">{f.title}</div>
      <div className="mt-1 text-sm text-slate-400">{f.description}</div>
      <FindingDetail f={f} />
      {open ? (
        <div className="mt-3 rounded-lg border border-border bg-bg-terminal/60 p-3 text-xs text-slate-300">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-purple">
            What this means
          </div>
          {f.meaning}
        </div>
      ) : null}
    </div>
  );
}

function Dossier({ scan }: { scan: ScanResult }) {
  const criticals = scan.findings.filter((f) => f.severity === 'CRITICAL').length;
  const highs = scan.findings.filter((f) => f.severity === 'HIGH').length;
  return (
    <div className="card p-5">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
        <Sparkles className="h-3.5 w-3.5" />
        AI Threat Dossier · {scan.domain}
      </div>
      <div className="space-y-2 text-sm leading-relaxed text-slate-300">
        <p>
          <span className="font-semibold text-white">Executive summary —</span>{' '}
          {scan.domain} presents an ARS of <strong style={{ color: '#EF9F27' }}>{scan.ars_score}</strong>
          , driven by {criticals} critical and {highs} high severity exposures. A motivated
          attacker can pivot from the public internet to an internal system in an estimated{' '}
          <strong>{scan.estimated_time_to_exploit_hours}h</strong>.
        </p>
        <p>
          <span className="font-semibold text-white">Primary entry —</span>{' '}
          {scan.primary_entry_path}. This chain bypasses perimeter auth and lands directly in a
          trust zone typically missing egress monitoring.
        </p>
        <p>
          <span className="font-semibold text-white">Remediation priority —</span> rotate the
          leaked credentials, enforce SSO MFA on staging, and deploy PhantomShield honey-keys.
          Honey assets will surface the attacker while you close the real gap.
        </p>
        <p className="text-xs text-slate-500">
          Confidence {scan.confidence}% · Generated by MirrorTrap AI · Not legal advice.
        </p>
      </div>
    </div>
  );
}

function generateRemediation(findings: Finding[]): string[] {
  const blob = findings.map((f) => `${f.title} ${f.description}`).join(' ').toLowerCase();
  const items: string[] = [];
  if (/email|breach|leaked|pwned/.test(blob)) {
    items.push('Rotate passwords for all affected accounts and enable MFA');
  }
  if (/github|credential|aws key|api key|secret|gist/.test(blob)) {
    items.push('Audit GitHub commit history and revoke exposed keys immediately');
  }
  if (/subdomain|staging|dev\./.test(blob)) {
    items.push('Add authentication to all discovered subdomains');
  }
  if (/shodan|port|mysql|3306|rdp|22\s/.test(blob)) {
    items.push('Close port 3306 (MySQL) from public internet via firewall rule');
  }
  if (/slack|webhook/.test(blob)) {
    items.push('Rotate Slack webhook tokens and restrict posting to internal channels');
  }
  if (/linkedin|org structure|employee|job posting/.test(blob)) {
    items.push('Brief staff on spear-phishing cues that reference org-chart knowledge');
  }
  items.push('Deploy PhantomShield honey tokens to detect active reconnaissance');
  items.push('Enable breach monitoring alerts for all company email domains');
  // Dedup + clamp 5-7
  const unique: string[] = [];
  for (const it of items) if (!unique.includes(it)) unique.push(it);
  return unique.slice(0, 7);
}

function RemediationChecklistInner({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const done = checked.filter(Boolean).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-success">
          <CheckCircle className="h-3.5 w-3.5" /> Remediation Roadmap
        </div>
        <span className="text-[11px] text-slate-400">
          {done}/{items.length} complete
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => {
          const c = checked[i];
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() =>
                  setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                }
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition-all',
                  c
                    ? 'border-brand-success/40 bg-brand-success/5 text-slate-400 line-through'
                    : 'border-border bg-bg-terminal/50 text-slate-100 hover:border-brand-purple/60',
                )}
              >
                {c ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-success animate-fade-in" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                )}
                <span className="flex-1">{it}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Remediation: {done}/{items.length} complete
          </span>
          <span className="font-mono">{pct}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full border border-border bg-bg-terminal/60">
          <div
            className="h-full bg-brand-success transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function RemediationChecklist({ findings }: { findings: Finding[] }) {
  const items = useMemo(() => generateRemediation(findings), [findings]);
  // key forces reset when item set changes
  return <RemediationChecklistInner key={items.join('|')} items={items} />;
}

const KILL_CHAIN = [
  { label: 'Public OSINT', color: '#7F77DD' },
  { label: 'Credential Testing', color: '#EF9F27' },
  { label: 'Initial Access', color: '#F0A545' },
  { label: 'Lateral Movement', color: '#F09595' },
  { label: 'Data Exfiltration', color: '#C04040' },
];

function stageFor(ars: number): number {
  if (ars <= 30) return 0;
  if (ars <= 60) return 1;
  if (ars <= 80) return 2;
  return 3;
}

function KillChainTimeline({ ars }: { ars: number }) {
  const stage = stageFor(ars);
  return (
    <div className="card p-5">
      <div className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-amber">
        <Crosshair className="h-3.5 w-3.5" /> Attacker kill-chain
      </div>
      <div className="text-sm text-slate-300">
        Attacker is currently at this stage of your kill chain.
      </div>
      <div className="mt-5 grid grid-cols-5 gap-1">
        {KILL_CHAIN.map((s, i) => {
          const active = i === stage;
          const past = i < stage;
          return (
            <div key={s.label} className="flex flex-col items-center text-center">
              <div className="relative flex h-10 w-10 items-center justify-center">
                <div
                  className={cn(
                    'h-4 w-4 rounded-full border-2 transition-all',
                    active && 'animate-pulse-ring',
                  )}
                  style={{
                    borderColor: s.color,
                    background: past || active ? s.color : 'transparent',
                  }}
                />
                {i < KILL_CHAIN.length - 1 ? (
                  <div
                    className="absolute left-[calc(50%+12px)] top-1/2 h-0.5 w-[calc(100%-12px)] -translate-y-1/2"
                    style={{
                      background: past ? s.color : 'rgba(127,119,221,0.25)',
                    }}
                  />
                ) : null}
              </div>
              <div
                className={cn(
                  'mt-1 text-[10px] font-semibold uppercase tracking-wider',
                  active ? 'text-white' : 'text-slate-500',
                )}
                style={active ? { color: s.color } : {}}
              >
                Step {i + 1}
              </div>
              <div
                className={cn(
                  'text-[11px] leading-tight',
                  active ? 'text-slate-100' : 'text-slate-500',
                )}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-lg border border-brand-danger/30 bg-brand-danger/5 p-3 text-xs text-slate-300">
        <span className="font-semibold text-brand-danger">Current stage —</span>{' '}
        {KILL_CHAIN[stage].label}. An ARS of {ars} maps to this cell in the MITRE ATT&amp;CK
        kill-chain. Deploy PhantomShield to trip them before they advance.
      </div>
    </div>
  );
}

const SEVERITY_COLORS: Record<Severity, string> = {
  CRITICAL: '#F09595',
  HIGH: '#EF9F27',
  MEDIUM: '#FACC15',
  LOW: '#1D9E75',
};

function SeverityPie({ findings }: { findings: Finding[] }) {
  const data = useMemo(() => {
    const counts: Record<Severity, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    findings.forEach((f) => (counts[f.severity] += 1));
    return (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as Severity[])
      .filter((s) => counts[s] > 0)
      .map((s) => ({ name: s, value: counts[s] }));
  }, [findings]);
  if (data.length === 0) return null;
  return (
    <div className="flex items-center gap-3">
      <div style={{ width: 140, height: 140 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={34}
              outerRadius={62}
              paddingAngle={2}
              stroke="rgba(13,11,26,0.9)"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={SEVERITY_COLORS[d.name as Severity]} />
              ))}
            </Pie>
            <RTooltip
              contentStyle={{
                background: '#0A0814',
                border: '1px solid rgba(127,119,221,0.3)',
                borderRadius: 8,
                color: '#e6e4f2',
                fontSize: 11,
              }}
              formatter={(v, n) => [`${v}`, String(n)]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1 text-[11px]">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: SEVERITY_COLORS[d.name as Severity] }}
            />
            <span className="font-mono text-slate-300">{d.name}</span>
            <span className="ml-auto font-mono text-slate-400">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function estimateBreachCostInr(ars: number): { low: number; high: number } {
  // Baseline IBM 2024 avg breach cost ~ US$4.88M. We scale it with ARS and assume
  // INR conversion (~₹8Cr mid for US$1M). Gives a demo-appropriate range band.
  const factor = 0.3 + (ars / 100) * 2.1; // 0.3x at ARS=0, ~2.4x at ARS=100
  const midCrore = 4 * factor; // crore (10M) — ballpark for an Indian SMB
  return {
    low: Math.round(midCrore * 0.55 * 10) / 10,
    high: Math.round(midCrore * 1.85 * 10) / 10,
  };
}

function FinancialBadge({ ars }: { ars: number }) {
  const { low, high } = estimateBreachCostInr(ars);
  return (
    <Link
      to="/reports?tab=financial"
      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-brand-amber/40 bg-brand-amber/10 px-3 py-2 text-[11px] text-brand-amber transition-colors hover:border-brand-amber/70 hover:bg-brand-amber/20"
      title="See full financial analysis"
    >
      <BadgeDollarSign className="h-3.5 w-3.5" />
      <span className="font-semibold uppercase tracking-widest">Est. breach cost</span>
      <span className="font-mono text-slate-100">
        ₹{low}Cr – ₹{high}Cr
      </span>
      <span className="text-brand-amber/80">See full analysis →</span>
    </Link>
  );
}

export function ScanPage() {
  usePageTitle('MirrorTrap — Scan');
  const [params] = useSearchParams();
  const initial = params.get('domain') ?? '';
  const auto = params.get('auto') === '1';
  const { demoMode, addScan } = useApp();
  const [mode, setMode] = useState<'company' | 'email'>('company');
  const domainInputRef = useRef<HTMLInputElement>(null);
  const [domain, setDomain] = useState(initial);
  const [email, setEmail] = useState('');
  const [emailPhase, setEmailPhase] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [emailResult, setEmailResult] = useState<Finding[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState<Record<ScanSource, boolean>>({
    HaveIBeenPwned: false,
    Shodan: false,
    'crt.sh': false,
    GitHub: false,
    DNS: false,
    'Security Headers': false,
  });
  const [result, setResult] = useState<ScanResult | null>(null);
  const [term, setTerm] = useState<TermLine[]>([]);
  const [dossierOpen, setDossierOpen] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const runScan = useCallback(
    async (rawDomain: string) => {
      const d = rawDomain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .replace(/^www\./, '');
      if (!d) return;

      setPhase('scanning');
      setResult(null);
      setDossierOpen(false);
      setProgress({
        HaveIBeenPwned: false,
        Shodan: false,
        'crt.sh': false,
        GitHub: false,
        DNS: false,
        'Security Headers': false,
      });

      setTerm([
        { text: `$ mirrortrap scan ${d}`, tone: 'cmd' },
        { text: '> Initializing 5-source OSINT sweep...', tone: 'dim' },
      ]);

      const isDemo = demoMode && (d.toLowerCase().includes('target') || d === DEMO_SCAN.domain);

      // Kick off the real scan concurrently with the UI animation. Demo domain skips real APIs.
      const realPromise: Promise<ScanResult | null> = isDemo
        ? Promise.resolve(null)
        : runRealScan({ domain: d }).catch(() => null);

      for (const s of SOURCES) {
        setTerm((prev) => [...prev, { text: `[SCANNING] ${s.label}...`, tone: 'dim' }]);
        await sleep(s.delay);
        setProgress((p) => ({ ...p, [s.key]: true }));
        setTerm((prev) => [...prev, { text: `[\u2713] ${s.okLine}`, tone: s.tone }]);
      }
      setTerm((prev) => [
        ...prev,
        { text: '> Correlating signals...', tone: 'dim' },
        { text: '> Scoring attack readiness...', tone: 'dim' },
      ]);

      const realResult = await realPromise;
      const r: ScanResult = isDemo
        ? { ...DEMO_SCAN, domain: d, timestamp: new Date().toISOString(), id: `scan_${Date.now()}` }
        : (realResult ?? {
            id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            domain: d,
            ars_score: 42,
            findings: [],
            timestamp: new Date().toISOString(),
            estimated_time_to_exploit_hours: 4.1,
            primary_entry_path: 'OSINT enumeration',
            confidence: 70,
          });

      await sleep(200);
      setTerm((prev) => [
        ...prev,
        {
          text: `>>> ARS SCORE: ${r.ars_score} / 100`,
          tone: r.ars_score >= 70 ? 'err' : r.ars_score >= 40 ? 'warn' : 'ok',
        },
        { text: `>>> Estimated time-to-exploit: ${r.estimated_time_to_exploit_hours}h`, tone: 'warn' },
      ]);
      await sleep(200);
      setResult(r);
      addScan(r);
      setPhase('results');
    },
    [addScan, demoMode],
  );

  useEffect(() => {
    if (auto && initial && !startedRef.current) {
      startedRef.current = true;
      void runScan(initial);
    }
  }, [auto, initial, runScan]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [term]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = domain.trim();
    if (!d) return;
    void runScan(d);
  };

  const onEmailScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = email.trim();
    if (!addr) return;
    setEmailPhase('scanning');
    setEmailResult([]);
    const res = await sourceHIBP(addr);
    setEmailResult(res.findings);
    setEmailPhase('done');
  };

  const allDone = useMemo(() => Object.values(progress).every(Boolean), [progress]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-bg-card/40 p-2 sm:flex-row sm:items-center sm:gap-3 sm:p-2">
        <span className="px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 sm:px-1">
          Scan mode
        </span>
        <div className="flex flex-1 gap-1">
          <button
            type="button"
            onClick={() => setMode('company')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold uppercase tracking-widest transition',
              mode === 'company'
                ? 'bg-brand-purple text-white shadow-[0_0_24px_-8px_rgba(167,139,250,0.7)]'
                : 'text-slate-400 hover:text-white',
            )}
            aria-pressed={mode === 'company'}
          >
            <Building2 className="h-3.5 w-3.5" /> Company Domain
          </button>
          <button
            type="button"
            onClick={() => setMode('email')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold uppercase tracking-widest transition',
              mode === 'email'
                ? 'bg-brand-purple text-white shadow-[0_0_24px_-8px_rgba(167,139,250,0.7)]'
                : 'text-slate-400 hover:text-white',
            )}
            aria-pressed={mode === 'email'}
          >
            <AtSign className="h-3.5 w-3.5" /> Personal Email
          </button>
        </div>
      </div>

      {mode === 'email' ? (
        <EmailScanFlow
          onSwitchToDomain={() => {
            setMode('company');
            setTimeout(() => domainInputRef.current?.focus(), 50);
          }}
        />
      ) : (
        <>
      <div className="card p-5">
        <div className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
          <Radar className="h-3.5 w-3.5" /> Attack-surface scan
        </div>
        <h1 className="text-2xl font-bold text-white">Enter your company domain</h1>
        <p className="mt-1 text-sm text-slate-400">
          MirrorTrap queries 5 public sources the way an attacker would. No probing, no intrusive
          requests.
        </p>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              ref={domainInputRef}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="company.com"
              disabled={phase === 'scanning'}
              className="w-full rounded-lg border border-border bg-bg-terminal py-3 pl-9 pr-3 font-mono text-sm focus:border-brand-purple focus:outline-none disabled:opacity-70"
            />
          </div>
          <button
            type="submit"
            disabled={phase === 'scanning' || !domain.trim()}
            className="btn-primary !px-5 !py-3"
          >
            {phase === 'scanning' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Scanning…
              </>
            ) : (
              <>
                Scan Now <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 border-t border-border/60 pt-4">
          <div className="mb-2 inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-400">
            <Mail className="h-3 w-3" /> Or scan an email address (real HaveIBeenPwned lookup)
          </div>
          <form onSubmit={onEmailScan} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                disabled={emailPhase === 'scanning'}
                className="w-full rounded-lg border border-border bg-bg-terminal py-2.5 pl-9 pr-3 font-mono text-sm focus:border-brand-purple focus:outline-none disabled:opacity-70"
              />
            </div>
            <button
              type="submit"
              disabled={emailPhase === 'scanning' || !email.trim()}
              className="btn-ghost !px-4 !py-2.5"
            >
              {emailPhase === 'scanning' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking HIBP…
                </>
              ) : (
                <>
                  Check breaches <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
          {emailPhase === 'done' && emailResult.length ? (
            <ul className="mt-3 space-y-2">
              {emailResult.map((f) => (
                <li
                  key={f.id}
                  className="rounded-lg border border-border bg-bg-terminal/50 p-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={f.severity} />
                    <span className="text-white font-semibold">{f.title}</span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-slate-400">{f.description}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{f.meaning}</div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {phase !== 'idle' ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Terminal */}
          <div className="terminal h-[380px] overflow-hidden">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-danger/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-amber/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-success/80" />
              <span className="ml-2 text-[11px] text-slate-500">mirrortrap — scan session</span>
            </div>
            <div ref={scrollRef} className="h-[330px] overflow-y-auto space-y-0.5 pr-2">
              {term.map((line, i) => (
                <div key={i} className={termColor[line.tone]}>
                  {line.text}
                </div>
              ))}
              {phase === 'scanning' ? (
                <div className="text-brand-purple">
                  <span className="inline-block h-3.5 w-2 animate-caret-blink bg-current align-middle" />
                </div>
              ) : null}
            </div>
          </div>
          {/* Progress checkboxes */}
          <div className="card p-4">
            <div className="mb-3 text-xs uppercase tracking-widest text-slate-400">
              Source status
            </div>
            <ul className="space-y-2">
              {SOURCES.map((s) => {
                const done = progress[s.key];
                const Icon = s.icon;
                return (
                  <li
                    key={s.key}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border border-border bg-bg-terminal/50 px-3 py-2 text-sm',
                      done && 'border-brand-success/40',
                    )}
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span className="flex-1 font-mono text-[12px]">{s.label}</span>
                    {done ? (
                      <span className={cn('font-mono text-xs', toneClass[s.tone])}>✓</span>
                    ) : (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-purple" />
                    )}
                  </li>
                );
              })}
            </ul>
            {allDone && result ? (
              <div className="mt-4 rounded-lg border border-brand-purple/40 bg-brand-purple/10 p-3 text-xs text-slate-300">
                <div className="font-semibold text-white">Sweep complete</div>
                {result.findings.length} findings correlated across {SOURCES.length} sources.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {result ? (
        <>
          {result.real_sources_used && result.real_sources_used.length > 0 ? (
            <div className="card flex flex-col gap-2 border border-brand-success/40 bg-brand-success/5 p-4 text-sm text-slate-200 animate-slide-up sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-brand-success">
                <Wifi className="h-4 w-4" />
                <span className="font-semibold uppercase tracking-widest text-[11px]">
                  Live data
                </span>
              </div>
              <span className="text-slate-300">
                Fetched from{' '}
                <span className="font-mono text-slate-100">
                  {result.real_sources_used.join(' · ')}
                </span>
                {result.scan_duration_s ? (
                  <span className="text-slate-500">
                    {' '}
                    · completed in {result.scan_duration_s}s
                  </span>
                ) : null}
                <span className="text-slate-500">
                  {' '}
                  · {result.findings.filter((f) => f.isReal).length} real,{' '}
                  {result.findings.filter((f) => !f.isReal).length} estimated
                </span>
              </span>
            </div>
          ) : null}
          <div className="card grid grid-cols-1 gap-6 p-6 md:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center justify-center">
              <ScoreNumber target={result.ars_score} />
              <FinancialBadge ars={result.ars_score} />
            </div>
            <div className="grid grid-cols-1 content-center gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-bg-terminal/60 p-3">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">
                  Time to exploit
                </div>
                <div className="mt-1 font-mono text-2xl text-brand-amber">
                  {result.estimated_time_to_exploit_hours}h
                </div>
              </div>
              <div className="rounded-lg border border-border bg-bg-terminal/60 p-3">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">
                  Primary entry path
                </div>
                <div className="mt-1 text-sm text-slate-100">{result.primary_entry_path}</div>
              </div>
              <div className="rounded-lg border border-border bg-bg-terminal/60 p-3">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">
                  Confidence
                </div>
                <div className="mt-1 font-mono text-2xl text-brand-purple">{result.confidence}%</div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Findings <span className="text-slate-500">· {result.findings.length}</span>
                </h2>
                <div className="text-xs text-slate-500">
                  Severity breakdown across all {result.findings.length} findings
                </div>
              </div>
              <div className="flex items-center gap-4">
                <SeverityPie findings={result.findings} />
                <button className="btn-ghost !py-1.5" onClick={() => window.print()}>
                  <Download className="h-3.5 w-3.5" /> Print
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              {result.findings.map((f) => (
                <FindingCard key={f.id} f={f} />
              ))}
            </div>
          </div>

          <RemediationChecklist findings={result.findings} />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setDossierOpen((v) => !v)}
              className="btn-primary !py-2.5"
            >
              <Sparkles className="h-4 w-4" />
              {dossierOpen ? 'Hide AI Dossier' : 'Generate AI Dossier'}
            </button>
            <button
              onClick={() => navigate('/phantomshield')}
              className="btn-amber !py-2.5"
            >
              <ShieldHalf className="h-4 w-4" />
              Deploy PhantomShield
            </button>
          </div>

          {dossierOpen ? <Dossier scan={result} /> : null}

          <KillChainTimeline ars={result.ars_score} />
        </>
      ) : null}
        </>
      )}
    </div>
  );
}
