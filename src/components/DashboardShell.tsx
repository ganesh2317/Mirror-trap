import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  Eye,
  FileSearch,
  Keyboard,
  LayoutDashboard,
  LogOut,
  Menu,
  Radar,
  Settings,
  ShieldCheck,
  ShieldHalf,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '@/lib/useApp';
import { cn } from '@/lib/utils';
import { LivePulseDot } from './ui/LivePulseDot';
import { useEffect, useRef, useState } from 'react';

const NAV = [
  { to: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard, enterprise: false },
  { to: '/hackers-eye',   label: "Hacker's Eye",  icon: Eye,             enterprise: false },
  { to: '/scan',          label: 'Scan',           icon: Radar,           enterprise: false },
  { to: '/phantomshield', label: 'PhantomShield',  icon: ShieldHalf,      enterprise: false },
  { to: '/alerts',        label: 'Alerts',         icon: Bell,            enterprise: false },
  { to: '/protect',       label: 'Protect',        icon: ShieldCheck,     enterprise: true  },
  { to: '/reports',       label: 'Reports',        icon: FileSearch,      enterprise: false },
  { to: '/settings',      label: 'Settings',       icon: Settings,        enterprise: false },
];

const SHORTCUTS: Array<[string, string]> = [
  ['D', 'Toggle Demo Mode'],
  ['?', 'Show keyboard shortcuts'],
  ['Esc', 'Close modal'],
  ['/', 'Focus quick-scan bar'],
  ['Ctrl + S', 'Go to Scan'],
  ['Ctrl + A', 'Go to Alerts'],
];

function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="card w-full max-w-md p-5 shadow-glow" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
            <Keyboard className="h-3.5 w-3.5" /> Keyboard shortcuts
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="space-y-1">
          {SHORTCUTS.map(([k, l]) => (
            <li key={k} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm">
              <span className="text-text-secondary">{l}</span>
              <kbd className="rounded-md border px-2 py-0.5 font-mono text-xs text-text-primary" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                {k}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DemoBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-3 px-5 py-2 text-xs font-semibold uppercase tracking-widest animate-slide-up"
      style={{ borderBottom: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}>
      <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="flex-1">
        ⚡ DEMO MODE — acmecorp.io dataset loaded — Press{' '}
        <kbd className="rounded border px-1 py-px font-mono text-[10px]" style={{ borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(0,0,0,0.2)' }}>D</kbd>
        {' '}to toggle
      </span>
      <button onClick={onDismiss} className="hover:text-white transition-colors" aria-label="Dismiss demo mode">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut, demoMode, setDemoMode, alerts } = useApp();
  const navigate = useNavigate();
  const unread = alerts.filter((a) => a.status === 'open').length;

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col shadow-2xl animate-slide-in-right"
        style={{ background: '#0D1117', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        role="dialog"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Logo />
          <button onClick={onClose} className="text-text-muted hover:text-text-primary" aria-label="Close navigation drawer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Main Navigation">

          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                  : 'text-text-secondary hover:bg-white/4 hover:text-text-primary',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {to === '/alerts' && unread > 0 && (
                <span className="ml-auto rounded-full bg-red-500/30 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={cn(
              'w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
              demoMode
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                : 'bg-white/4 text-text-secondary hover:text-text-primary',
            )}
          >
            <Sparkles className="h-4 w-4" />
            Demo Mode: {demoMode ? 'ON' : 'OFF'}
          </button>
          <div className="text-xs text-text-muted px-1">{user?.email ?? 'guest'}</div>
          <button
            onClick={() => { void signOut(); navigate('/'); onClose(); }}
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </>
  );
}

export function DashboardShell() {
  const { user, signOut, demoMode, setDemoMode, alerts, simulateAttack, isEnterprise } = useApp();
  const navigate = useNavigate();
  const [quickDomain, setQuickDomain] = useState('');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const unread = alerts.filter((a) => a.status === 'open').length;
  const inputRef = useRef<HTMLInputElement>(null);

  // Track scroll for backdrop blur enhancement
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (e.key === 'Escape') { setShortcutsOpen(false); setMobileOpen(false); return; }
      if (typing) return;
      if (e.key === 'd' || e.key === 'D') { e.preventDefault(); setDemoMode(!demoMode); }
      if (e.key === '?') { e.preventDefault(); setShortcutsOpen((v) => !v); }
      if (e.key === '/') { e.preventDefault(); inputRef.current?.focus(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); navigate('/scan'); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) { e.preventDefault(); navigate('/alerts'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [demoMode, setDemoMode, navigate]);

  const onQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    const d = quickDomain.trim();
    if (!d) return;
    navigate(`/scan?domain=${encodeURIComponent(d)}&auto=1`);
  };

  return (
    <div className="min-h-screen">
      {demoMode && <DemoBanner key="demo-banner" onDismiss={() => setDemoMode(false)} />}

      {/* Top navbar */}
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-150',
          scrolled
            ? 'shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl'
            : 'backdrop-blur-md',
        )}
        style={{ background: scrolled ? 'rgba(8,11,20,0.95)' : 'rgba(8,11,20,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex h-14 items-center gap-3 px-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-text-muted hover:text-text-primary"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Logo />

          {/* Desktop quick scan */}
          <form onSubmit={onQuickScan} className="relative hidden max-w-[240px] flex-1 md:flex ml-2">
            <Radar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              ref={inputRef}
              value={quickDomain}
              onChange={(e) => setQuickDomain(e.target.value)}
              placeholder="Quick scan..."
              className="input-dark !py-1.5 pl-9 pr-10 text-sm"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 font-mono text-[10px] text-text-muted" style={{ background: 'rgba(255,255,255,0.06)' }}>
              /
            </kbd>
          </form>

          <div className="ml-auto flex items-center gap-2">
            {/* Demo mode toggle */}
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={cn(
                'hidden md:flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-150',
                demoMode
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                  : 'btn-ghost !text-xs !py-1.5',
              )}
              title="Press D to toggle"
            >
              {demoMode ? <LivePulseDot color="amber" size="sm" /> : <Sparkles className="h-3 w-3" />}
              Demo {demoMode ? 'ON' : 'OFF'}
            </button>

            {/* Simulate attack */}
            <button
              onClick={simulateAttack}
              className="hidden md:flex btn-danger !py-1.5 !text-xs !px-3"
              title="Generate a fake attack alert"
            >
              <Zap className="h-3.5 w-3.5" /> Simulate
            </button>

            {/* Alerts bell */}
            <NavLink to="/alerts" className="relative p-2 text-text-muted hover:text-text-primary transition-colors">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </NavLink>

            {/* Keyboard shortcuts */}
            <button
              onClick={() => setShortcutsOpen(true)}
              className="hidden md:block p-2 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Keyboard shortcuts"
            >
              <Keyboard className="h-4 w-4" />
            </button>

            {/* User avatar */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-indigo-400 cursor-pointer"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
              title={user?.email ?? 'guest'}
            >
              {(user?.email?.[0] ?? 'G').toUpperCase()}
            </div>

            {/* Sign out */}
            <button
              onClick={() => { void signOut(); navigate('/'); }}
              className="p-2 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <aside
          className="hidden w-56 shrink-0 md:flex flex-col"
          style={{ background: 'rgba(8,11,20,0.6)', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: '3.5rem', height: 'calc(100vh - 3.5rem)', overflowY: 'auto' }}
        >
          <nav className="flex flex-col gap-1 p-3 pt-4">
            {NAV.map(({ to, label, icon: Icon, enterprise }) => {
              const gated = enterprise && !isEnterprise;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => cn(
                    'group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : 'text-text-secondary hover:bg-white/4 hover:text-text-primary',
                    gated && 'opacity-60',
                  )}
                  style={({ isActive }) => isActive ? { border: '1px solid rgba(99,102,241,0.2)' } : {}}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{label}</span>
                  {enterprise && (
                    <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-400">
                      ENT
                    </span>
                  )}
                  {to === '/alerts' && unread > 0 && (
                    <span className="rounded-full bg-red-500/25 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                      {unread}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom status card */}
          <div className="mt-auto p-3">
            <div
              className="rounded-xl p-3 text-xs"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <LivePulseDot color="green" size="sm" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Shield Active</span>
              </div>
              <div className="mt-1.5 text-text-muted leading-relaxed">
                Decoys deployed. Any attacker touching trap assets surfaces in Alerts instantly.
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 animate-fade-in p-6 min-w-0">
          <Outlet />
        </main>
      </div>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
