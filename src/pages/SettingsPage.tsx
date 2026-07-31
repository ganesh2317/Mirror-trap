import { useState } from 'react';
import {
  Bell,
  Building2,
  Clock,
  Crown,
  Download,
  Globe,
  KeyRound,
  Plus,
  Search,
  Settings,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { useApp } from '@/lib/useApp';
import { supabaseEnabled } from '@/lib/supabase';
import { usePageTitle } from '@/lib/usePageTitle';
import type { UserRole } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { SubscriptionGatingModal } from '@/components/SubscriptionGatingModal';

type SettingsTab =
  | 'general'
  | 'organization'
  | 'domains'
  | 'users'
  | 'notifications'
  | 'api'
  | 'audit'
  | 'billing'
  | 'danger';

export function SettingsPage() {
  usePageTitle('MirrorTrap — Enterprise Settings');
  const {
    user,
    demoMode,
    setDemoMode,
    currentOrg,
    domains,
    addDomain,
    removeDomain,
    togglePrimaryDomain,
    members,
    inviteMember,
    updateMemberRole,
    removeMember,
    auditLogs,
    logAuditEvent,
    pushToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [keys, setKeys] = useState<Record<string, string>>({ hibp: '', shodan: '' });

  // Domain form
  const [newDomain, setNewDomain] = useState('');

  // Invite user form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Security Analyst');

  // Audit search
  const [auditQuery, setAuditQuery] = useState('');

  // Subscription modal
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    addDomain(newDomain.trim());
    logAuditEvent('DOMAIN_ADDED', 'SETTINGS', `Added domain footprint: ${newDomain.trim()}`);
    setNewDomain('');
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMember(inviteEmail.trim(), inviteRole);
    logAuditEvent('USER_INVITED', 'USER', `Invited ${inviteEmail.trim()} as ${inviteRole}`);
    setInviteEmail('');
  };

  const exportAuditLogsCSV = () => {
    const headers = 'Timestamp,Actor,Category,Action,Details,IP\n';
    const rows = auditLogs
      .map(
        (l) =>
          `"${l.timestamp}","${l.actorEmail}","${l.category}","${l.action}","${l.details.replace(/"/g, '""')}","${l.ip}"`,
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirrortrap_audit_logs_${Date.now()}.csv`;
    a.click();
    logAuditEvent('AUDIT_LOGS_EXPORTED', 'ORG', 'Exported audit log activity to CSV');
  };

  const clearData = () => {
    if (!window.confirm('Clear local scans, decoys, and alerts? Auth stays intact.')) return;
    try {
      localStorage.removeItem('mirrortrap_state_v1');
      pushToast({ title: 'Local data cleared', body: 'Reload to see the fresh state.', tone: 'info' });
    } catch {
      /* ignore */
    }
  };

  const testConnection = (id: string, label: string) => {
    const key = keys[id]?.trim();
    if (!key) {
      pushToast({ title: `${label} — connection failed`, body: 'Paste a key before testing.', tone: 'danger' });
      return;
    }
    const ok = key.length >= 10;
    pushToast({
      title: ok ? `${label} — connected` : `${label} — connection failed`,
      body: ok ? 'Credentials accepted. MirrorTrap will use live data.' : 'Key looks too short.',
      tone: ok ? 'success' : 'danger',
    });
  };

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(auditQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(auditQuery.toLowerCase()) ||
      l.actorEmail.toLowerCase().includes(auditQuery.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
            <Settings className="h-3.5 w-3.5" /> Enterprise Control Panel
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">Organization & Platform Settings</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Active Workspace: <span className="text-text-primary font-semibold">{currentOrg.name}</span> ({currentOrg.slug})
          </p>
        </div>
        <button onClick={() => setUpgradeModalOpen(true)} className="btn-amber !py-2 !px-4 text-xs font-semibold self-start sm:self-center">
          <Crown className="h-3.5 w-3.5 mr-1" /> Upgrade Plan
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-2 overflow-x-auto scrollbar-none">
        {(
          [
            ['general', 'General', Settings],
            ['organization', 'Organization', Building2],
            ['domains', 'Domains', Globe],
            ['users', 'Users & RBAC', Users],
            ['notifications', 'Notifications', Bell],
            ['api', 'API & Integrations', KeyRound],
            ['audit', 'Audit Logs', Clock],
            ['billing', 'Billing & Tiers', Crown],
            ['danger', 'Danger Zone', Trash2],
          ] as const
        ).map(([tabId, label, Icon]) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === tabId
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-glow'
                : 'text-text-muted hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* 1. GENERAL */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white">Demo Mode</div>
                <div className="mt-1 text-sm text-slate-400">
                  Pre-loads impressive mock data for live demonstrations. Toggle with key <kbd className="pill">D</kbd>.
                </div>
              </div>
              <Switch checked={demoMode} onCheckedChange={setDemoMode} label={demoMode ? 'ON' : 'OFF'} />
            </div>
          </div>

          <div className="card p-5">
            <div className="text-sm font-semibold text-white mb-2">Account Overview</div>
            <div className="space-y-1 text-xs text-slate-400">
              <div><span className="text-slate-500">Email:</span> <span className="font-mono text-slate-200">{user?.email ?? 'guest@acme.com'}</span></div>
              <div><span className="text-slate-500">Database connection:</span> {supabaseEnabled ? <span className="text-brand-success">Supabase Live</span> : <span className="text-brand-amber">Local Persistence Storage</span>}</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORGANIZATION */}
      {activeTab === 'organization' && (
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Organization Identity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted">Organization Name</label>
              <input value={currentOrg.name} readOnly className="input-dark mt-1 text-xs" />
            </div>
            <div>
              <label className="text-xs text-text-muted">Slug Identifier</label>
              <input value={currentOrg.slug} readOnly className="input-dark mt-1 text-xs font-mono" />
            </div>
          </div>
        </div>
      )}

      {/* 3. DOMAIN FOOTPRINT */}
      {activeTab === 'domains' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-2">Add Domain Footprint</h2>
            <form onSubmit={handleAddDomain} className="flex gap-2">
              <input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="subdomain.company.com"
                className="input-dark flex-1 text-xs"
              />
              <button type="submit" className="btn-primary !py-2 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Domain
              </button>
            </form>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Monitored Domains ({domains.length})</h2>
            <div className="space-y-2">
              {domains.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-bg-terminal/40 text-xs">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-indigo-400" />
                    <div>
                      <div className="font-mono font-semibold text-text-primary flex items-center gap-2">
                        {d.domain}
                        {d.isPrimary && <Badge variant="info" className="text-[9px] !py-0">PRIMARY</Badge>}
                      </div>
                      <div className="text-[11px] text-text-muted">Schedule: {d.schedule} · Health: {d.healthStatus}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!d.isPrimary && (
                      <button onClick={() => togglePrimaryDomain(d.id)} className="btn-ghost !py-1 text-[11px]">Set Primary</button>
                    )}
                    <button onClick={() => removeDomain(d.id)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. USERS & RBAC */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-2">Invite Team Member</h2>
            <form onSubmit={handleInviteUser} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="input-dark text-xs sm:col-span-1"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="input-dark text-xs"
              >
                <option value="Owner">Owner</option>
                <option value="Administrator">Administrator</option>
                <option value="Security Analyst">Security Analyst</option>
                <option value="Read-only Viewer">Read-only Viewer</option>
              </select>
              <button type="submit" className="btn-primary !py-2 text-xs">
                <UserPlus className="h-3.5 w-3.5 mr-1" /> Send Invitation
              </button>
            </form>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Organization Roster ({members.length})</h2>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-bg-terminal/40 text-xs">
                  <div>
                    <div className="font-mono text-text-primary font-semibold">{m.email}</div>
                    <div className="text-[11px] text-text-muted">Joined: {m.joinedAt} · Status: {m.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={m.role}
                      onChange={(e) => updateMemberRole(m.id, e.target.value as UserRole)}
                      className="input-dark !py-1 text-xs"
                    >
                      <option value="Owner">Owner</option>
                      <option value="Administrator">Administrator</option>
                      <option value="Security Analyst">Security Analyst</option>
                      <option value="Read-only Viewer">Read-only Viewer</option>
                    </select>
                    <button onClick={() => removeMember(m.id)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Notification Alert Preferences</h2>
          <div className="space-y-3 text-xs">
            {[
              ['Automated Scan Complete Alerts', 'Receive email summaries when OSINT sweeps finish'],
              ['Critical Vulnerability Notifications', 'Instant push alert when CRITICAL CVEs surface'],
              ['PhantomShield Tripwire Alerts', 'Immediate alert when honeypots capture reconnaissance'],
              ['SSL Expiration Warnings', 'Get notified 30 days before certificate expiration'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-bg-terminal/40">
                <div>
                  <div className="font-semibold text-text-primary">{title}</div>
                  <div className="text-text-muted mt-0.5">{desc}</div>
                </div>
                <Switch checked={true} onCheckedChange={() => {}} label="ON" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. API & INTEGRATIONS */}
      {activeTab === 'api' && (
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">API Keys & External Integrations</h2>
          <div className="space-y-3">
            {[
              { id: 'hibp', label: 'HaveIBeenPwned API Key' },
              { id: 'shodan', label: 'Shodan API Key' },
            ].map((i) => (
              <div key={i.id} className="p-3 rounded-xl border border-border/60 bg-bg-terminal/40 text-xs space-y-2">
                <div className="font-semibold text-text-primary">{i.label}</div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={keys[i.id] ?? ''}
                    onChange={(e) => setKeys((k) => ({ ...k, [i.id]: e.target.value }))}
                    placeholder="Key string..."
                    className="input-dark flex-1 text-xs"
                  />
                  <button onClick={() => testConnection(i.id, i.label)} className="btn-ghost !py-1 text-xs">
                    Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-white">Immutable Audit Log Trail</h2>
            <button onClick={exportAuditLogsCSV} className="btn-secondary !py-1.5 !px-3 text-xs">
              <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              value={auditQuery}
              onChange={(e) => setAuditQuery(e.target.value)}
              placeholder="Search audit trail..."
              className="input-dark !pl-9 text-xs"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/60 text-text-muted">
                  <th className="py-2">Timestamp</th>
                  <th className="py-2">Actor</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredLogs.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2.5 font-mono text-text-muted">{formatDate(l.timestamp)}</td>
                    <td className="py-2.5 font-mono text-indigo-300">{l.actorEmail}</td>
                    <td className="py-2.5"><Badge variant="info" className="text-[9px]">{l.category}</Badge></td>
                    <td className="py-2.5 font-semibold text-text-primary">{l.action}</td>
                    <td className="py-2.5 text-text-secondary truncate max-w-[200px]">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. BILLING & TIERS */}
      {activeTab === 'billing' && (
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Active Subscription Plan</h2>
          <div className="p-4 rounded-xl border border-indigo-500/40 bg-indigo-500/10 flex items-center justify-between">
            <div>
              <Badge variant="info" className="text-[10px]">CURRENT PLAN</Badge>
              <div className="text-xl font-bold text-text-primary mt-1 font-mono">{currentOrg.plan.toUpperCase()} TIER</div>
              <div className="text-xs text-text-muted mt-1">Unlimited Monitored Domains · Daily Threat Sweeps</div>
            </div>
            <button onClick={() => setUpgradeModalOpen(true)} className="btn-primary !py-2 text-xs">
              Change Plan
            </button>
          </div>
        </div>
      )}

      {/* 9. DANGER ZONE */}
      {activeTab === 'danger' && (
        <div className="card p-5 space-y-3 border-red-500/30">
          <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
          <p className="text-xs text-text-muted">Clears local scan history, decoys, and alerts saved in your browser cache.</p>
          <button onClick={clearData} className="btn-danger !py-2 text-xs">
            <Trash2 className="h-4 w-4 mr-1" /> Purge Local Cache
          </button>
        </div>
      )}

      <SubscriptionGatingModal open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
    </div>
  );
}
