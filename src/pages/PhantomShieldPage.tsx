import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Cloud,
  Copy,
  Eye,
  KeyRound,
  Link as LinkIcon,
  Rocket,
  Server,
  Shield,
  ShieldHalf,
  Terminal,
  UserX,
  Users,
  Zap,
} from 'lucide-react';
import { useApp } from '@/lib/useApp';
import type { Decoy } from '@/lib/types';
import { cn, formatTime } from '@/lib/utils';
import { usePageTitle } from '@/lib/usePageTitle';
import { GlassCard } from '@/components/ui/GlassCard';
import { LivePulseDot } from '@/components/ui/LivePulseDot';
import { Badge } from '@/components/ui/Badge';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

// Trap type definitions
const TRAP_TYPES = [
  {
    id: 'honey-admin',
    name: 'Fake Admin Portal',
    icon: Shield,
    description: 'A convincing admin dashboard that captures attacker sessions and browser fingerprints.',
    lureRate: '42%',
    popular: true,
  },
  {
    id: 'fake-aws-key',
    name: 'Decoy Cloud Bucket',
    icon: Cloud,
    description: 'A fake S3 bucket with believable filenames. Any access attempt is an immediate red flag.',
    lureRate: '31%',
    popular: false,
  },
  {
    id: 'decoy-login',
    name: 'Ghost API Endpoint',
    icon: Server,
    description: 'Mimics an internal API endpoint. Captures all request payloads and headers.',
    lureRate: '28%',
    popular: false,
  },
  {
    id: 'honey-token',
    name: 'Phantom Employee Directory',
    icon: Users,
    description: 'A fake internal employee directory loaded with decoy credentials and contact info.',
    lureRate: '19%',
    popular: false,
  },
] as const;

const ICON_MAP: Record<string, typeof Shield> = {
  'honey-admin': ShieldHalf,
  'fake-aws-key': KeyRound,
  'decoy-login': UserX,
  'honey-token': LinkIcon,
};

interface LiveEvent {
  id: string;
  time: string;
  text: string;
  tone: 'warn' | 'err' | 'ok';
}

const MOCK_EVENTS: Omit<LiveEvent, 'id' | 'time'>[] = [
  { text: 'Honey token accessed — IP 185.220.101.47 — 🇷🇴 Romania', tone: 'err' },
  { text: 'Fake AWS key validation attempt — python-requests/2.31', tone: 'err' },
  { text: 'Decoy /login portal — 3 password attempts — Tor exit', tone: 'warn' },
  { text: 'Honey gist URL crawled — Go-http-client/1.1', tone: 'warn' },
  { text: 'Admin portal probe /admin/backup — 🇷🇺 Russia', tone: 'err' },
  { text: 'Heartbeat — 0 compromises in last 5m', tone: 'ok' },
];

// Step 1: Choose trap type
function StepChooseType({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {TRAP_TYPES.map((trap) => {
        const Icon = trap.icon;
        const isSelected = selected === trap.id;
        return (
          <button
            key={trap.id}
            onClick={() => onSelect(trap.id)}
            className={cn(
              'relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all duration-200',
              isSelected
                ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                : 'hover:border-white/15 hover:bg-white/3',
            )}
            style={{ borderColor: isSelected ? undefined : 'rgba(255,255,255,0.07)' }}
          >
            {trap.popular && (
              <span className="absolute right-3 top-3 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                POPULAR
              </span>
            )}
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
              isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/6 text-text-muted',
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="font-semibold text-text-primary">{trap.name}</div>
            <div className="text-xs text-text-muted leading-relaxed">{trap.description}</div>
            <div className="text-xs">
              <span className="text-text-muted">Expected lure rate: </span>
              <span className="font-mono text-emerald-400">{trap.lureRate}</span>
            </div>
            {isSelected && (
              <div className="absolute right-4 bottom-4 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Step 2: Configure trap
function StepConfigure({
  name,
  setName,
  sensitivity,
  setSensitivity,
}: {
  name: string;
  setName: (v: string) => void;
  sensitivity: string;
  setSensitivity: (v: string) => void;
}) {
  const urlSlug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 32);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">Trap name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Production Admin Panel"
          className="input-dark"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">URL path (auto-generated)</label>
        <div className="input-dark font-mono text-text-muted !cursor-default">
          /{urlSlug || 'trap-url'}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">Alert sensitivity</label>
        <div className="flex gap-2">
          {(['Low', 'Medium', 'High', 'Paranoid'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSensitivity(s)}
              className={cn(
                'flex-1 rounded-xl py-2 text-xs font-semibold transition-all',
                sensitivity === s
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-text-muted hover:text-text-secondary border',
              )}
              style={{ borderColor: sensitivity !== s ? 'rgba(255,255,255,0.07)' : undefined }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 3: Deploy
function StepDeploy({
  trapType,
  name,
  sensitivity,
  onDeploy,
}: {
  trapType: string | null;
  name: string;
  sensitivity: string;
  onDeploy: () => void;
}) {
  const [deploying, setDeploying] = useState(false);
  const [phase, setPhase] = useState('');
  const [done, setDone] = useState(false);
  const liveUrl = `https://app.mirrortrap.io/trap/${name.toLowerCase().replace(/\s+/g, '-') || 'my-trap'}`;

  const handleDeploy = async () => {
    setDeploying(true);
    const phases = ['Provisioning virtual environment...', 'Configuring response templates...', 'Activating monitoring...', 'Live!'];
    for (const p of phases) {
      setPhase(p);
      await new Promise((r) => setTimeout(r, 700));
    }
    setDeploying(false);
    setDone(true);
    onDeploy();
  };

  if (done) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mx-auto">
          <Check className="h-8 w-8" />
        </div>
        <div className="text-lg font-semibold text-text-primary">Trap deployed!</div>
        <div className="text-sm text-text-muted">Your trap is now live and monitoring for threats.</div>
        <div className="rounded-xl border p-3 font-mono text-sm text-emerald-400 text-left" style={{ borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.05)' }}>
          {liveUrl}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4 space-y-2 text-sm" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex justify-between">
          <span className="text-text-muted">Type</span>
          <span className="text-text-primary font-medium">{TRAP_TYPES.find(t => t.id === trapType)?.name ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Name</span>
          <span className="text-text-primary font-medium">{name || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Sensitivity</span>
          <span className="text-text-primary font-medium">{sensitivity}</span>
        </div>
      </div>

      {deploying && (
        <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)' }}>
          <div className="text-xs font-mono text-indigo-400 animate-pulse">&gt; {phase}</div>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full bg-indigo-500 animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      <button onClick={handleDeploy} disabled={deploying || !trapType || !name} className="btn-primary w-full !py-3">
        <Rocket className="h-4 w-4" /> {deploying ? 'Deploying...' : 'Deploy Trap'}
      </button>
    </div>
  );
}

// Trap card
function DecoyCard({ d, onOpen }: { d: Decoy; onOpen: (d: Decoy) => void }) {
  const { toggleDecoy } = useApp();
  const Icon = ICON_MAP[d.id] ?? ShieldHalf;
  const [copied, setCopied] = useState(false);
  const url = `https://app.mirrortrap.io/${d.id}`;

  const copyUrl = () => {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [now] = useState(() => Date.now());
  const recentlyTriggered = d.logs.length > 0 &&
    now - new Date(d.logs[d.logs.length - 1]?.timestamp ?? 0).getTime() < 3600000;


  return (
    <GlassCard
      glow={recentlyTriggered ? 'red' : d.active ? 'cyan' : 'none'}
      className="p-5 flex flex-col gap-4"
    >
      {recentlyTriggered && (
        <div className="rounded-lg bg-amber-500/15 border border-amber-500/25 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5" /> RECENTLY TRIGGERED
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
            d.active ? 'bg-indigo-500/15 text-indigo-400' : 'bg-white/6 text-text-muted',
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-text-primary">{d.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <LivePulseDot color={d.active ? 'green' : 'red'} size="sm" />
              <span className={cn('text-xs font-semibold uppercase tracking-wider', d.active ? 'text-emerald-400' : 'text-text-muted')}>
                {d.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => toggleDecoy(d.id)}
          className={cn(
            'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
            d.active
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20',
          )}
        >
          {d.active ? 'Deactivate' : 'Activate'}
        </button>
      </div>

      {/* URL */}
      <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(5,8,15,0.5)' }}>
        <span className="flex-1 truncate font-mono text-xs text-text-muted">{url}</span>
        <button onClick={copyUrl} className="text-text-muted hover:text-indigo-400 transition-colors flex-shrink-0">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-text-muted text-xs">Interactions: </span>
          <span className="font-mono font-bold text-amber-400">
            <AnimatedCounter value={d.logs.length} duration={600} />
          </span>
        </div>
        {recentlyTriggered && d.logs[d.logs.length - 1] && (
          <div className="text-xs text-text-muted">
            Last: <span className="text-text-secondary">{formatTime(d.logs[d.logs.length - 1].timestamp)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => onOpen(d)} className="btn-ghost !py-1.5 !text-xs !px-3 flex-1">
          <Eye className="h-3.5 w-3.5" /> View Logs ({d.logs.length})
        </button>
      </div>
    </GlassCard>
  );
}

function LogsDialog({ d, onClose }: { d: Decoy | null; onClose: () => void }) {
  if (!d) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
      <GlassCard className="w-full max-w-2xl p-5 shadow-glow">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-base font-semibold text-text-primary">{d.name} · Access Logs</div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">✕</button>
        </div>
        {d.logs.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-text-muted" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            No access attempts yet. This decoy is waiting for its first visitor.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <table className="w-full text-left text-xs">
              <thead style={{ background: 'rgba(5,8,15,0.8)' }}>
                <tr className="text-text-muted uppercase tracking-widest text-[10px]">
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">IP</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {d.logs.map((l) => (
                  <tr key={l.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-4 py-2.5 font-mono text-text-muted">{formatTime(l.timestamp)}</td>
                    <td className="px-4 py-2.5 font-mono text-amber-400">{l.ip}</td>
                    <td className="px-4 py-2.5 text-text-secondary">{l.location}</td>
                    <td className="px-4 py-2.5 text-red-400 font-medium">{l.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
      </div>
    </div>
  );
}

export function PhantomShieldPage() {
  usePageTitle('MirrorTrap — PhantomShield');
  const { decoys, deployAll, pushToast } = useApp();
  const [open, setOpen] = useState<Decoy | null>(null);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [trapName, setTrapName] = useState('');
  const [sensitivity, setSensitivity] = useState('High');
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeCount = decoys.filter((d) => d.active).length;
  const allActive = decoys.every((d) => d.active);

  useEffect(() => {
    const someActive = decoys.some((d) => d.active);
    if (!someActive) return;
    const int = setInterval(() => {
      const base = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
      setEvents((prev) => [
        { id: Math.random().toString(36).slice(2), time: formatTime(new Date()), ...base },
        ...prev,
      ].slice(0, 30));
    }, 3500);
    return () => clearInterval(int);
  }, [decoys]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.02em' }}>
              PhantomShield
            </h1>
            {allActive ? (
              <div className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <LivePulseDot color="green" size="sm" /> ACTIVE
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400" style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <LivePulseDot color="amber" size="sm" /> PARTIAL
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-text-muted">
            {activeCount} / {decoys.length} decoys active. Any attacker touching these assets is instantly exposed.
          </p>
        </div>
        <button onClick={deployAll} className="btn-emerald !px-5 self-start">
          <Rocket className="h-4 w-4" /> Deploy All
        </button>
      </div>

      {/* Deploy New Trap Wizard */}
      <GlassCard className="p-6">
        <div className="mb-6">
          <div className="text-base font-semibold text-text-primary">Deploy New Trap</div>
          <div className="mt-1 text-sm text-text-muted">Follow the 3-step wizard to set up a new honeypot decoy.</div>
        </div>

        {/* Step indicators */}
        <div className="mb-6 flex items-center gap-2">
          {([1, 2, 3] as const).map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <button
                onClick={() => { if (step < wizardStep || (step === 2 && selectedType) || (step === 1)) setWizardStep(step); }}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                  wizardStep === step
                    ? 'bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                    : step < wizardStep
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-text-muted border',
                )}
                style={{ borderColor: step >= wizardStep ? 'rgba(255,255,255,0.1)' : undefined }}
              >
                {step < wizardStep ? <Check className="h-4 w-4" /> : step}
              </button>
              <span className={cn('text-xs', wizardStep === step ? 'text-text-primary' : 'text-text-muted')}>
                {['Choose type', 'Configure', 'Deploy'][idx]}
              </span>
              {idx < 2 && <ChevronRight className="h-3.5 w-3.5 text-text-muted" />}
            </div>
          ))}
        </div>

        {wizardStep === 1 && (
          <>
            <StepChooseType selected={selectedType} onSelect={setSelectedType} />
            <button
              onClick={() => { if (selectedType) setWizardStep(2); }}
              disabled={!selectedType}
              className="mt-4 btn-primary"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
        {wizardStep === 2 && (
          <>
            <StepConfigure name={trapName} setName={setTrapName} sensitivity={sensitivity} setSensitivity={setSensitivity} />
            <div className="mt-4 flex gap-2">
              <button onClick={() => setWizardStep(1)} className="btn-ghost">Back</button>
              <button onClick={() => { if (trapName) setWizardStep(3); }} disabled={!trapName} className="btn-primary">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
        {wizardStep === 3 && (
          <>
            <StepDeploy
              trapType={selectedType}
              name={trapName}
              sensitivity={sensitivity}
              onDeploy={() => {
                pushToast({ title: `Trap "${trapName}" deployed!`, body: 'Monitoring is now active.', tone: 'success' });
                setTimeout(() => { setWizardStep(1); setSelectedType(null); setTrapName(''); setSensitivity('High'); }, 3000);
              }}
            />
            <button onClick={() => setWizardStep(2)} className="mt-2 btn-ghost text-xs">Back</button>
          </>
        )}
      </GlassCard>

      {/* Active Traps Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">Active Traps</h2>
          <Badge variant="active" className="text-[10px]">{activeCount} Online</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {decoys.map((d) => (
            <DecoyCard key={d.id} d={d} onOpen={setOpen} />
          ))}
        </div>
      </div>

      {/* Live monitoring */}
      <GlassCard className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
            <Terminal className="h-3.5 w-3.5 text-indigo-400" /> Live Monitoring Feed
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <LivePulseDot color={activeCount > 0 ? 'green' : 'red'} size="sm" />
            {activeCount > 0 ? 'Listening' : 'Idle — no active traps'}
          </div>
        </div>
        <div ref={scrollRef} className="terminal h-[220px] overflow-y-auto space-y-1">
          {events.length === 0 ? (
            <div className="text-text-muted">
              {activeCount > 0 ? '> Awaiting first tripwire event…' : '> Activate a decoy to start monitoring.'}
            </div>
          ) : (
            events.map((e) => (
              <div
                key={e.id}
                className={cn(
                  'animate-slide-in-top',
                  e.tone === 'err' && 'text-red-400',
                  e.tone === 'warn' && 'text-amber-400',
                  e.tone === 'ok' && 'text-emerald-400',
                )}
              >
                [{e.time}] {e.text}
              </div>
            ))
          )}
        </div>
      </GlassCard>

      <LogsDialog d={open} onClose={() => setOpen(null)} />
    </div>
  );
}
