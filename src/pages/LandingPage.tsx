import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Check,
  Eye,
  FileBarChart,
  Ghost,
  Radar,
  ShieldHalf,
  Sparkles,
  Zap,
} from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';
import { Logo } from '@/components/Logo';
import { ChatAssistant } from '@/components/ChatAssistant';
import { useEffect, useState } from 'react';

const HERO_TERMINAL_LINES: Array<{ text: string; tone: 'dim' | 'ok' | 'warn' | 'err' | 'cmd' }> = [
  { text: '$ mirrortrap scan targetcompany.com', tone: 'cmd' },
  { text: '[SCANNING] HaveIBeenPwned API...', tone: 'dim' },
  { text: '[✓] 3 leaked emails found', tone: 'err' },
  { text: '[SCANNING] Shodan.io...', tone: 'dim' },
  { text: '[✓] 2 exposed services found', tone: 'warn' },
  { text: '[SCANNING] crt.sh subdomains...', tone: 'dim' },
  { text: '[✓] 8 subdomains enumerated', tone: 'ok' },
  { text: '[SCANNING] GitHub public search...', tone: 'dim' },
  { text: '[✓] 1 credential pattern found', tone: 'err' },
  { text: '[SCANNING] DNS records...', tone: 'dim' },
  { text: '[✓] Tech stack identified: AWS + MySQL', tone: 'ok' },
  { text: '', tone: 'dim' },
  { text: '>>> ARS SCORE: 84 / 100  CRITICAL', tone: 'err' },
  { text: '>>> Estimated time-to-exploit: 2.4h', tone: 'warn' },
  { text: '>>> Primary entry: leaked AWS key → S3', tone: 'warn' },
];

const toneColor = {
  cmd: 'text-brand-purple',
  dim: 'text-slate-500',
  ok: 'text-brand-success',
  warn: 'text-brand-amber',
  err: 'text-brand-danger',
} as const;

function HeroTerminal() {
  const [visible, setVisible] = useState(1);
  useEffect(() => {
    const int = setInterval(() => {
      setVisible((v) => (v >= HERO_TERMINAL_LINES.length ? 1 : v + 1));
    }, 520);
    return () => clearInterval(int);
  }, []);
  return (
    <div className="terminal relative h-[280px] overflow-hidden shadow-glow">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-danger/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-brand-amber/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-brand-success/80" />
        <span className="ml-2 text-[11px] text-slate-500">mirrortrap — live scan</span>
      </div>
      <div className="space-y-0.5">
        {HERO_TERMINAL_LINES.slice(0, visible).map((line, i) => (
          <div key={i} className={toneColor[line.tone]}>
            {line.text}
            {i === visible - 1 ? (
              <span className="ml-1 inline-block h-3.5 w-2 bg-current align-middle animate-caret-blink" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCallout({ value, label }: { value: string; label: string }) {
  return (
    <div className="card card-hover p-5">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  );
}

const FEATURES = [
  {
    icon: Radar,
    title: 'OSINT Scanner',
    body: '5-source attack-surface sweep: HIBP, Shodan, crt.sh, GitHub, DNS. See yourself through a hacker\'s eyes.',
  },
  {
    icon: Ghost,
    title: 'PhantomShield Decoys',
    body: 'Deploy AI-generated honey assets — fake AWS keys, decoy admins, tracking URLs — that trip the moment they\'re touched.',
  },
  {
    icon: Eye,
    title: 'Attacker Intelligence',
    body: 'Every tripwire is enriched with IP origin, behavior analysis, and a predicted attack path. No more raw logs — actual narratives.',
  },
  {
    icon: FileBarChart,
    title: 'Threat Reports',
    body: 'Executive-ready dossiers with ARS trend, findings, and remediation. Generated in a click.',
  },
];

const PRICING = [
  {
    name: 'Free',
    price: '₹0',
    tagline: 'Single-shot OSINT scan',
    features: [
      '1 domain / month',
      'Findings summary + ARS score',
      'Static report export',
      'Community support',
    ],
    cta: 'Start free',
    href: '/scan',
    featured: false,
  },
  {
    name: 'Pro',
    price: '₹999',
    suffix: '/mo',
    tagline: 'Full platform — recommended',
    features: [
      'Unlimited scans + historical trend',
      'PhantomShield — all 4 decoys',
      'Real-time alerts + attacker dossiers',
      'AI-generated remediation playbooks',
    ],
    cta: 'Go Pro',
    href: '/signup',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '₹9,999',
    suffix: '/mo',
    tagline: 'Teams + SSO + custom assets',
    features: [
      'Unlimited users + SSO',
      'Custom decoy asset engineering',
      'Incident response integrations',
      'Dedicated analyst',
    ],
    cta: 'Talk to sales',
    href: '/signup',
    featured: false,
  },
];

const HOW_IT_WORKS = [
  {
    icon: Radar,
    tone: 'text-brand-purple bg-brand-purple/10 border-brand-purple/40',
    title: '1. Scan',
    body: 'We analyze 5 public sources and score your exposure in 60 seconds.',
  },
  {
    icon: Ghost,
    tone: 'text-brand-amber bg-brand-amber/10 border-brand-amber/40',
    title: '2. Trap',
    body: 'Deploy AI honey tokens that look real to attackers but alert you instantly.',
  },
  {
    icon: Zap,
    tone: 'text-brand-danger bg-brand-danger/10 border-brand-danger/40',
    title: '3. Catch',
    body: "When a tripwire fires, get the attacker's IP, behavior profile, and attack path.",
  },
];

export function LandingPage() {
  usePageTitle('MirrorTrap — See yourself through a hacker\u2019s eyes');
  return (
    <div className="animate-fade-in">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-[#0D0B1A]/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-6">
          <Logo />
          <nav className="ml-auto flex items-center gap-6 text-sm text-slate-300">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
            <Link to="/login" className="hover:text-white">
              Sign in
            </Link>
            <Link to="/scan" className="btn-primary">
              Scan Your Domain Free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(600px 320px at 20% 10%, rgba(127,119,221,0.25), transparent 60%), radial-gradient(500px 240px at 85% 20%, rgba(239,159,39,0.12), transparent 60%)',
          }}
        />
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pt-16 pb-10 lg:grid-cols-2 lg:gap-14 lg:pt-24 lg:pb-16">
          <div>
            <span className="pill border-brand-purple/40 text-brand-purple">
              <Sparkles className="h-3 w-3" /> See yourself through a hacker&apos;s eyes
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-[56px]">
              Hackers Study You <span className="text-brand-purple">Before Striking.</span>
              <br />
              MirrorTrap Shows You <span className="text-brand-amber">What They See.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-400 md:text-lg">
              Scan your company&apos;s public attack surface. Deploy AI-generated decoy traps. Catch
              attackers before they reach your real systems.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/hackers-eye"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-3 text-[15px] font-bold text-white shadow-[0_0_0_2px_rgba(239,68,68,0.2),0_0_30px_-8px_rgba(239,68,68,0.8)] transition hover:bg-red-400"
              >
                <Eye className="h-4 w-4" />
                Try Hacker&apos;s Eye View
              </Link>
              <Link to="/scan" className="btn-primary !px-5 !py-3 !text-[15px]">
                Scan Your Domain Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-ghost !px-5 !py-3 !text-[15px]">
                See a live demo
              </Link>
            </div>
            <div className="mt-3 text-[11px] uppercase tracking-widest text-slate-500">
              No credit card · 1-minute scan · Data never stored without consent
            </div>
          </div>
          <div className="relative">
            <HeroTerminal />
          </div>
        </div>

        {/* Stat callouts */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-16 md:grid-cols-3">
          <StatCallout value="91%" label="of breaches start with reconnaissance" />
          <StatCallout value="4.2hrs" label="average time from recon to breach" />
          <StatCallout value="$4.9M" label="average breach cost in 2024" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 max-w-2xl">
            <div className="pill">Platform</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Reconnaissance, weaponized for the defender.
            </h2>
            <p className="mt-2 text-slate-400">
              Four modules. One mission: watch yourself the way a nation-state would — then set traps.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card card-hover flex gap-4 p-5">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-purple/15 text-brand-purple">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">{title}</div>
                  <div className="mt-1 text-sm text-slate-400">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 max-w-2xl">
            <div className="pill">How it works</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Three steps. One hour. No SIEM required.
            </h2>
            <p className="mt-2 text-slate-400">
              From the attacker's OSINT window to the moment a tripwire fires — every layer
              captured in a single workflow.
            </p>
          </div>
          <div className="relative grid grid-cols-1 gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="card card-hover h-full p-5">
                  <div
                    className={
                      'inline-flex h-11 w-11 items-center justify-center rounded-lg border ' +
                      s.tone
                    }
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 text-lg font-semibold text-white">{s.title}</div>
                  <div className="mt-1 text-sm text-slate-400">{s.body}</div>
                </div>
                {i < HOW_IT_WORKS.length - 1 ? (
                  <div className="pointer-events-none absolute right-[-18px] top-1/2 hidden -translate-y-1/2 md:block">
                    <ArrowRight className="h-5 w-5 text-brand-purple/70" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 max-w-2xl">
            <div className="pill">Pricing</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Built for hackathon-stage teams and seed-stage security leads.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={
                  'card p-6 ' +
                  (p.featured ? 'border-brand-purple/60 shadow-glow' : 'card-hover')
                }
              >
                {p.featured ? (
                  <div className="mb-3 inline-block rounded-md bg-brand-purple/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-purple">
                    Most Popular
                  </div>
                ) : null}
                <div className="text-sm uppercase tracking-widest text-slate-400">{p.name}</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{p.price}</span>
                  {p.suffix ? <span className="text-sm text-slate-400">{p.suffix}</span> : null}
                </div>
                <div className="mt-1 text-sm text-slate-400">{p.tagline}</div>
                <ul className="mt-5 space-y-2 text-sm text-slate-300">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-brand-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={p.href}
                  className={'mt-6 w-full ' + (p.featured ? 'btn-primary' : 'btn-ghost')}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-border/50">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <div className="mb-10 text-center">
            <div className="pill">FAQ</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-slate-400">
              Everything you need to know about MirrorTrap OSINT scanning and PhantomShield tripwires.
            </p>
          </div>
          <div className="space-y-3">
            {[
              {
                q: 'Does MirrorTrap perform intrusive penetration testing on my network?',
                a: 'No. MirrorTrap operates purely via passive, public OSINT intelligence sources (HIBP, Shodan, crt.sh, GitHub public search, DNS). We never send intrusive exploit payloads or breach attempts.',
              },
              {
                q: 'How quickly do PhantomShield decoys trigger alerts?',
                a: 'Tripwires trigger in real time. The moment an attacker attempts authentication or accesses a decoy bucket, an alert is generated with IP geolocation, user agent, and threat severity.',
              },
              {
                q: 'Do I need a dedicated SOC or SIEM integration to use MirrorTrap?',
                a: 'No. MirrorTrap is designed to be fully self-contained. It correlates signals automatically, computes your ARS score, and generates executive-ready PDF threat reports.',
              },
              {
                q: 'Can I export threat reports for compliance or executive briefings?',
                a: 'Yes. Every scan report can be exported as a clean, printable executive summary HTML document complete with remediation roadmaps and financial exposure metrics.',
              },
            ].map((faq, idx) => (
              <details key={idx} className="group rounded-xl border border-border/60 bg-bg-surface/50 p-4 transition-colors hover:border-brand-purple/40">
                <summary className="flex cursor-pointer select-none items-center justify-between text-base font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded">
                  <span>{faq.q}</span>
                  <span className="ml-2 font-mono text-brand-purple transition-transform group-open:rotate-180">↓</span>
                </summary>
                <div className="mt-3 text-sm leading-relaxed text-slate-400 border-t border-border/40 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 py-16 md:grid-cols-2">
          <div>
            <div className="pill border-brand-amber/40 text-brand-amber">
              <ShieldHalf className="h-3 w-3" /> PhantomShield
            </div>
            <h3 className="mt-3 text-2xl font-bold text-white md:text-3xl">
              The decoy layer your SOC didn&apos;t know it was missing.
            </h3>
            <p className="mt-2 text-slate-400">
              Fake AWS keys, honey admin portals, tracking URLs. If anyone touches them, you know —
              with the IP, timing, and inferred intent. No SIEM required.
            </p>
            <Link to="/signup" className="btn-amber mt-5 active:scale-95 transition-transform inline-flex items-center">
              Deploy PhantomShield <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </div>
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-brand-amber">
              <Bot className="h-3.5 w-3.5" /> Live tripwire feed
            </div>
            <div className="terminal">
              <div className="text-brand-danger">
                [14:32:07] Honey token accessed — IP 185.220.101.47 — 🇷🇴 Romania
              </div>
              <div className="text-brand-amber">
                [14:33:22] Fake AWS key validation attempt — python-requests/2.31
              </div>
              <div className="text-brand-danger">
                [14:35:49] Decoy login /admin — 3 password attempts — Tor exit
              </div>
            </div>
          </div>
        </div>
      </section>


      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-slate-500 md:flex-row">
          <div className="flex items-center gap-2">
            <Logo size={16} />
            <span>© {new Date().getFullYear()} MirrorTrap. Built for defenders.</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-slate-200">
              Sign in
            </Link>
            <Link to="/signup" className="hover:text-slate-200">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
      <ChatAssistant />
    </div>
  );
}
