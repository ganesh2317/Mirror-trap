import { useState } from 'react';
import { Bell, CheckCheck, FileText, Lock, Radar, ShieldAlert, Zap } from 'lucide-react';
import { useApp } from '@/lib/useApp';
import type { NotificationCategory } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Badge } from './ui/Badge';

export function NotificationCenter() {
  const { notifications, unreadNotificationsCount, markNotificationRead, markAllNotificationsRead } = useApp();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'all'>('all');

  const filtered = notifications.filter((n) => (activeCategory === 'all' ? true : n.category === activeCategory));

  const getCategoryIcon = (c: NotificationCategory) => {
    switch (c) {
      case 'scan':
        return <Radar className="h-4 w-4 text-indigo-400" />;
      case 'ssl':
        return <Lock className="h-4 w-4 text-emerald-400" />;
      case 'tripwire':
        return <Zap className="h-4 w-4 text-amber-400" />;
      case 'critical':
        return <ShieldAlert className="h-4 w-4 text-red-400" />;
      case 'report':
        return <FileText className="h-4 w-4 text-cyan-400" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-all active:scale-95"
        aria-label="Notification Center"
      >
        <Bell className="h-5 w-5" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold font-mono text-white animate-pulse">
            {unreadNotificationsCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-border/80 bg-bg-surface/95 backdrop-blur-xl p-4 shadow-glow animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-bold text-text-primary">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <Badge variant="info" className="text-[10px] !py-0">
                    {unreadNotificationsCount} new
                  </Badge>
                )}
              </div>

              {unreadNotificationsCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] font-medium text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-2 scrollbar-none">
              {(['all', 'scan', 'tripwire', 'ssl', 'critical'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                    activeCategory === cat
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-xs text-text-muted">No notifications found.</div>
              ) : (
                filtered.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      !n.read
                        ? 'border-indigo-500/30 bg-indigo-500/10'
                        : 'border-border/40 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getCategoryIcon(n.category)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-text-primary truncate">{n.title}</span>
                        <span className="text-[10px] font-mono text-text-muted shrink-0">{formatDate(n.timestamp)}</span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
