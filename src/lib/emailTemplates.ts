import type { ScanResult, Alert } from './types';

function escapeHtml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const EMAIL_BASE_STYLE = `
body { font-family: Inter, system-ui, -apple-system, sans-serif; background-color: #0D0B1A; color: #E6E4F2; margin: 0; padding: 24px; }
.container { max-width: 600px; margin: 0 auto; background: #15132A; border: 1px solid rgba(167, 139, 250, 0.25); border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.brand { color: #A78BFA; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 24px; display: inline-block; }
h1 { font-size: 20px; font-weight: 700; color: #FFFFFF; margin-top: 0; margin-bottom: 12px; }
p { font-size: 14px; line-height: 1.6; color: #94A3B8; margin-top: 0; margin-bottom: 16px; }
.button { display: inline-block; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 16px; margin-bottom: 16px; }
.card { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 16px; margin: 16px 0; }
.footer { border-top: 1px solid rgba(255, 255, 255, 0.08); margin-top: 32px; padding-top: 16px; font-size: 12px; color: #64748B; text-align: center; }
`;

export function generateWelcomeEmail(recipientEmail: string): string {
  const safeEmail = escapeHtml(recipientEmail);
  return `<!doctype html><html><head><style>${EMAIL_BASE_STYLE}</style></head><body>
<div class="container">
  <div class="brand">🛡️ MirrorTrap</div>
  <h1>Welcome to Enterprise Threat Intelligence</h1>
  <p>Hello <b>${safeEmail}</b>,</p>
  <p>Your MirrorTrap workspace has been initialized. You now have automated external reconnaissance, DNS/SSL attack surface tracking, and PhantomShield deception tripwires active.</p>
  <div class="card">
    <div style="font-weight:600;color:#FFF;margin-bottom:6px">Quick Start Checklist:</div>
    <ul style="margin:0;padding-left:20px;color:#94A3B8;font-size:13px">
      <li>Add your primary domain to automated daily monitoring</li>
      <li>Deploy PhantomShield honeypots on exposed endpoints</li>
      <li>Invite security team members with role-based access</li>
    </ul>
  </div>
  <a href="https://mirrortrap.app/dashboard" class="button">Access Console →</a>
  <div class="footer">MirrorTrap Inc. · Active Threat Intelligence & Deception Platform</div>
</div></body></html>`;
}

export function generateInvitationEmail(inviteeEmail: string, inviterName: string, orgName: string, role: string): string {
  const safeEmail = escapeHtml(inviteeEmail);
  const safeInviter = escapeHtml(inviterName);
  const safeOrg = escapeHtml(orgName);
  const safeRole = escapeHtml(role);

  return `<!doctype html><html><head><style>${EMAIL_BASE_STYLE}</style></head><body>
<div class="container">
  <div class="brand">🛡️ MirrorTrap</div>
  <h1>You've been invited to join ${safeOrg}</h1>
  <p>Hello <b>${safeEmail}</b>,</p>
  <p><b>${safeInviter}</b> has invited you to join the <b>${safeOrg}</b> security team on MirrorTrap with the role of <b>${safeRole}</b>.</p>
  <a href="https://mirrortrap.app/auth?invite=1" class="button">Accept Invitation →</a>
  <div class="footer">MirrorTrap Inc. · Role-Based Access Control</div>
</div></body></html>`;
}

export function generateScanCompletedEmail(recipientEmail: string, scan: ScanResult): string {
  const safeEmail = escapeHtml(recipientEmail);
  const safeDomain = escapeHtml(scan.domain);

  return `<!doctype html><html><head><style>${EMAIL_BASE_STYLE}</style></head><body>
<div class="container">
  <div class="brand">🛡️ MirrorTrap</div>
  <h1>Automated Scan Completed — ${safeDomain}</h1>
  <p>Hello <b>${safeEmail}</b>,</p>
  <p>External OSINT sweep completed for <b>${safeDomain}</b>.</p>
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:13px;color:#94A3B8">Attack Readiness Score:</span>
      <span style="font-size:20px;font-weight:800;color:#F59E0B">ARS ${scan.ars_score} / 100</span>
    </div>
    <div style="font-size:13px;color:#94A3B8">Findings Correlated: <b>${scan.findings.length}</b></div>
    <div style="font-size:13px;color:#94A3B8">Primary Entry: <b>${escapeHtml(scan.primary_entry_path)}</b></div>
  </div>
  <a href="https://mirrortrap.app/reports" class="button">View Threat Report →</a>
  <div class="footer">MirrorTrap Inc. · Continuous Surface Monitoring</div>
</div></body></html>`;
}

export function generateCriticalAlertEmail(recipientEmail: string, alert: Alert): string {
  const safeEmail = escapeHtml(recipientEmail);
  const safeIp = escapeHtml(alert.ip);
  const safeAsset = escapeHtml(alert.asset_used);

  return `<!doctype html><html><head><style>${EMAIL_BASE_STYLE}</style></head><body>
<div class="container" style="border-color: rgba(239, 68, 68, 0.4);">
  <div class="brand" style="color:#EF4444">🚨 PhantomShield Alert</div>
  <h1>Critical Tripwire Intercepted</h1>
  <p>Hello <b>${safeEmail}</b>,</p>
  <p>A high-severity reconnaissance tripwire was triggered on your deception footprint.</p>
  <div class="card" style="border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.08);">
    <div style="font-weight:700;color:#FCA5A5;margin-bottom:4px">Target Asset: ${safeAsset}</div>
    <div style="font-size:13px;color:#94A3B8">Attacker IP: <b>${safeIp}</b> (${escapeHtml(alert.country)})</div>
    <div style="font-size:13px;color:#94A3B8">Classification: <b>${escapeHtml(alert.classification.label)}</b> (${alert.classification.confidence}% confidence)</div>
  </div>
  <a href="https://mirrortrap.app/alerts" class="button" style="background: linear-gradient(135deg, #DC2626, #EF4444);">Investigate Intercept →</a>
  <div class="footer">MirrorTrap Inc. · Active Honeypot Defense</div>
</div></body></html>`;
}
