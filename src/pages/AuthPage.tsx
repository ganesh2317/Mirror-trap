import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '@/lib/useApp';
import { Logo } from '@/components/Logo';
import { ArrowRight, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react';
import { supabaseEnabled } from '@/lib/supabase';
import { usePageTitle } from '@/lib/usePageTitle';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  usePageTitle(mode === 'login' ? 'MirrorTrap — Sign in' : 'MirrorTrap — Sign up');
  const { user, signIn, signUp } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErr('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErr('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') await signIn(cleanEmail, password);
      else await signUp(cleanEmail, password);
      const redirect = (location.state as { from?: string } | null)?.from ?? '/dashboard';
      navigate(redirect, { replace: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Authentication failed';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen animate-fade-in">
      <header className="mx-auto flex max-w-6xl items-center px-6 py-4">
        <Logo />
      </header>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-2">
        <div className="hidden md:block">
          <div className="pill border-brand-purple/40 text-brand-purple">
            <ShieldCheck className="h-3 w-3" /> MirrorTrap
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white md:text-4xl">
            {mode === 'login' ? 'Welcome back.' : 'Create your command center.'}
          </h1>
          <p className="mt-2 max-w-sm text-slate-400">
            {mode === 'login'
              ? 'Sign in to view your attack surface, alerts, and PhantomShield deployments.'
              : 'One account. Unlimited scans, decoy deployments, and attacker dossiers.'}
          </p>
          <div className="mt-8 grid gap-3">
            {[
              'ARS score tracked across scans',
              'PhantomShield — AI honey assets',
              'Real-time tripwire alerts',
              'Executive-ready threat reports',
            ].map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 rounded-lg border border-border bg-bg-surface/60 px-3 py-2 text-sm text-slate-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-purple" />
                {t}
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={onSubmit} className="card mx-auto w-full max-w-md p-6 shadow-glow">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h2>
            <KeyRound className="h-5 w-5 text-brand-purple" />
          </div>
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
            Email
          </label>
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-terminal py-2 pl-9 pr-3 text-sm font-mono focus:border-brand-purple focus:outline-none"
              placeholder="you@company.com"
            />
          </div>
          <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-slate-400">
            Password
          </label>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-terminal py-2 pl-9 pr-3 text-sm font-mono focus:border-brand-purple focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          {err ? (
            <div className="mt-3 rounded-md border border-brand-danger/40 bg-brand-danger/10 px-3 py-2 text-xs text-brand-danger">
              {err}
            </div>
          ) : null}
          <button disabled={loading} type="submit" className="btn-primary mt-5 w-full !py-2.5">
            {loading ? 'Signing in…' : mode === 'login' ? 'Sign in' : 'Create account'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
          {!supabaseEnabled ? (
            <div className="mt-3 rounded-md border border-border bg-white/5 px-3 py-2 text-[11px] text-slate-400">
              Demo mode: no Supabase keys configured. Auth is local to this browser — any email +
              password works.
            </div>
          ) : null}
          <div className="mt-5 text-center text-sm text-slate-400">
            {mode === 'login' ? (
              <>
                New to MirrorTrap?{' '}
                <Link to="/signup" className="text-brand-purple hover:underline">
                  Create account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="text-brand-purple hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
