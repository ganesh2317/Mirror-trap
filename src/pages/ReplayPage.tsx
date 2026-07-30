import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  ChevronRight,
  Globe,
  MapPin,
  Play,
  Share2,
  Shield,
  Target,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { useApp } from '@/lib/useApp';
import { cn } from '@/lib/utils';
import { usePageTitle } from '@/lib/usePageTitle';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { severityVariant } from '@/lib/badgeUtils';

import { CircularGauge } from '@/components/ui/CircularGauge';
import { Timeline } from '@/components/ui/Timeline';
import { LivePulseDot } from '@/components/ui/LivePulseDot';
import { DEMO_REPLAY_SESSION, DEMO_ALERTS } from '@/lib/demo-data';

// Merge demo data with live alerts for complete data
const ALL_ALERTS = DEMO_ALERTS;
const ALL_REPLAYS: Record<string, typeof DEMO_REPLAY_SESSION> = {
  'alert-001': DEMO_REPLAY_SESSION,
  'demo-alert-1': DEMO_REPLAY_SESSION,
};

function AttackerProfilePanel({
  profile,
}: {
  profile: typeof DEMO_REPLAY_SESSION.attacker_profile;
}) {
  const sophisticationMap: Record<string, number> = {
    'Script kiddie': 15,
    'Low': 25,
    'Moderate': 50,
    'Advanced': 75,
    'Nation-state': 95,
  };
  const sophLevel = sophisticationMap[profile.sophistication] ?? 70;

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted">
          Threat Actor Profile
        </div>

        {/* Classification */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
            style={{ background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.3)' }}>
            <User className="h-8 w-8 text-red-400" />
          </div>
          <div className="text-xl font-bold text-text-primary">{profile.classification}</div>
          <div className="mt-1 text-sm text-text-muted">{profile.origin}</div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-text-muted flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Country</span>
            <span className="font-semibold text-text-primary">{profile.origin}</span>
          </div>
          <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-text-muted flex items-center gap-2"><Target className="h-3.5 w-3.5" /> Motivation</span>
            <span className="font-semibold text-text-primary text-right max-w-[120px] text-xs">{profile.motivation}</span>
          </div>
          <div className="py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-text-muted flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> Sophistication</span>
              <span className="font-semibold text-text-primary text-xs">{profile.sophistication}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${sophLevel}%`,
                  background: sophLevel >= 75 ? 'linear-gradient(90deg, #EF4444, #DC2626)' : 'linear-gradient(90deg, #F59E0B, #D97706)',
                }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Confidence gauge */}
      <GlassCard className="p-5 text-center">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted">
          Attribution Confidence
        </div>
        <div className="flex justify-center">
          <CircularGauge value={profile.confidence} size={120} strokeWidth={10} label="confident" />
        </div>
      </GlassCard>

      {/* Known TTPs */}
      {profile.ttps && (
        <GlassCard className="p-4">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted">
            MITRE ATT&CK TTPs
          </div>
          <div className="space-y-2">
            {profile.ttps.map((ttp) => (
              <div key={ttp} className="flex items-center gap-2 text-xs">
                <ChevronRight className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                <span className="font-mono text-text-secondary">{ttp}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Predicted next moves */}
      <GlassCard glow="red" className="p-4">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-red-400 flex items-center gap-2">
          <Brain className="h-3.5 w-3.5" /> AI: Predicted Next Moves
        </div>
        <div className="space-y-2">
          {DEMO_REPLAY_SESSION.predicted_next_moves.slice(0, 3).map((move, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
              <span className="flex-shrink-0 mt-0.5 font-mono text-red-400">{i + 1}.</span>
              <span>{move}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10px] text-text-muted italic">Real systems are protected — predictions inform containment.</div>
      </GlassCard>
    </div>
  );
}

export function ReplayPage() {
  usePageTitle('MirrorTrap — Attack Replay');
  const { alertId } = useParams<{ alertId: string }>();
  const { alerts } = useApp();

  // Find from live alerts or demo data
  const liveAlert = alerts.find((a) => a.id === alertId);
  const demoAlert = ALL_ALERTS.find((a) => a.id === alertId);
  const alert = liveAlert ?? demoAlert ?? ALL_ALERTS[0]; // fallback to first demo alert

  const replay = ALL_REPLAYS[alertId ?? ''] ?? DEMO_REPLAY_SESSION;
  const [activeStep, setActiveStep] = useState(3); // Start at the "trap triggered" step

  if (!alert) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Shield className="h-12 w-12 text-text-muted opacity-40 mb-4" />
        <div className="text-lg font-semibold text-text-primary">Replay not found</div>
        <Link to="/alerts" className="mt-4 btn-ghost">← Back to Alerts</Link>
      </div>
    );
  }

  const confidence = Math.round((replay.confidence_score ?? 0.94) * 100);

  return (
    <div className="noise-texture min-h-screen animate-fade-in" style={{ background: '#05080F' }}>
      <div className="relative z-10 space-y-0">
        {/* Top bar */}
        <div
          className="sticky top-0 z-20 flex items-center gap-3 px-6 py-3"
          style={{ background: 'rgba(5,8,15,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
        >
          <Link to="/alerts" className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Alerts
          </Link>
          <span className="text-text-muted">/</span>
          <span className="font-mono text-xs text-text-muted">{alertId}</span>
          <div className="ml-auto flex items-center gap-3">
            <Badge variant={severityVariant(alert.severity)} pulse={alert.severity === 'CRITICAL'}>
              {alert.severity}
            </Badge>
            <div className="text-xs text-text-muted">
              <span className="font-mono font-bold text-indigo-400">{confidence}%</span> confidence
            </div>
            <button className="btn-ghost !py-1.5 !text-xs !px-3">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div className="flex min-h-screen">
          {/* Left panel — Attacker profile */}
          <aside className="hidden lg:block w-[380px] shrink-0 border-r overflow-y-auto p-5 space-y-4"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(8,11,20,0.8)', position: 'sticky', top: '3.5rem', height: 'calc(100vh - 3.5rem)' }}>
            <AttackerProfilePanel profile={replay.attacker_profile} />
          </aside>

          {/* Right panel — Timeline */}
          <main className="flex-1 p-6 space-y-6 min-w-0">
            {/* Alert summary */}
            <div>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-red-400 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" /> ATTACK REPLAY — FULL SESSION RECONSTRUCTION
              </div>
              <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.02em' }}>
                {replay.attacker_profile.classification} Attack on {alert.asset_used}
              </h1>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-text-muted">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="font-mono text-amber-400">{alert.ip}</span>
                  <span>— {alert.country_flag} {alert.country}</span>
                </span>
                <span>·</span>
                <span>{replay.attacker_profile.motivation}</span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <LivePulseDot color="green" size="sm" />
                  <span className="text-emerald-400 font-semibold">Attacker Contained</span>
                </span>
              </div>
            </div>

            {/* Mobile attacker profile card */}
            <div className="lg:hidden">
              <GlassCard glow="red" className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/12 border border-red-500/3 flex-shrink-0">
                    <User className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <div className="font-bold text-text-primary">{replay.attacker_profile.classification}</div>
                    <div className="text-sm text-text-muted">{replay.attacker_profile.origin} · {replay.attacker_profile.sophistication}</div>
                    <div className="mt-1 text-xs text-text-muted">{replay.attacker_profile.motivation}</div>
                  </div>
                  <div className="ml-auto">
                    <CircularGauge value={replay.attacker_profile.confidence} size={72} strokeWidth={8} />
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Step navigation hint */}
            <div className="text-xs text-text-muted flex items-center gap-2">
              <Play className="h-3.5 w-3.5 text-indigo-400" />
              Click any step to expand its details
            </div>

            {/* Timeline */}
            <GlassCard className="p-5">
              <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted">
                Attack Timeline — {replay.steps.length} steps reconstructed
              </div>
              <Timeline
                steps={replay.steps}
                activeStep={activeStep}
                onStepClick={setActiveStep}
              />
            </GlassCard>

            {/* Predicted next moves */}
            <GlassCard glow="red" className="p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                <Brain className="h-4 w-4" /> AI-Predicted Next Moves
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {replay.predicted_next_moves.map((move, i) => (
                  <div key={i} className="rounded-xl border p-3 text-sm" style={{ borderColor: 'rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.04)' }}>
                    <div className="mb-1 text-[10px] font-bold text-red-400">STEP {replay.steps.length + i + 1}</div>
                    <div className="text-text-secondary">{move}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-text-muted italic">
                These are predicted actions based on known APT29 playbooks. Your real systems are fully isolated — the attacker is interacting with the honeypot environment only.
              </div>
            </GlassCard>

            {/* Evidence summary */}
            <GlassCard className="p-5">
              <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted">
                Evidence Collected
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Browser Fingerprint', value: 'Collected', color: 'text-emerald-400' },
                  { label: 'Canvas Fingerprint', value: 'Collected', color: 'text-emerald-400' },
                  { label: 'Full Session Replay', value: 'Recorded', color: 'text-emerald-400' },
                  { label: 'TLS Certificate', value: 'Pinned', color: 'text-emerald-400' },
                ].map((e) => (
                  <div key={e.label} className="rounded-xl border p-3" style={{ borderColor: 'rgba(16,185,129,0.15)', background: 'rgba(16,185,129,0.04)' }}>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">{e.label}</div>
                    <div className={cn('text-sm font-semibold', e.color)}>{e.value}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </main>
        </div>
      </div>
    </div>
  );
}
