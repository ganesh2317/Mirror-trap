# Changelog — MirrorTrap

All notable changes to the MirrorTrap threat intelligence and active deception platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.0.0-beta] - 2026-08-01

### 🚀 Added
- **Real OSINT Reconnaissance Engine**:
  - Google Public DNS record resolution (`A`, `AAAA`, `MX`, `TXT`, `NS`, `CNAME`).
  - SSL / TLS certificate inspector with expiration tracking and grade assignment.
  - Live Certificate Transparency log subdomain extraction via `crt.sh`.
  - Security header audit (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
  - Tech stack fingerprinting with confidence scoring (React, Next.js, Nginx, Stripe, Salesforce, Google Workspace).
- **PhantomShield Active Deception**:
  - Honeypot decoy deployment (`honey-admin`, `fake-aws-key`, `decoy-login`, `honey-token`).
  - Tripwire alert interceptor capturing attacker IP, location, user agent, and payload.
- **Multi-Tenant Enterprise Workspaces**:
  - Organization switcher dropdown (`OrgSwitcher`) supporting workspace creation and switching.
  - Domain Footprint Manager supporting primary domain tagging, scan schedules, and health status.
  - Four-tier Role-Based Access Control (RBAC: `Owner`, `Administrator`, `Security Analyst`, `Read-only Viewer`) with team invitation system.
  - Header Notification Center with unread counter badges and category filters (`scan`, `ssl`, `tripwire`, `critical`).
  - Immutable Audit Logs with CSV export.
  - 9-Tab Administration Control Panel in Settings.
- **Production Containerization**:
  - Multi-stage Node 20 / Nginx `Dockerfile`.
  - Production `nginx.conf` with security headers and gzip compression.
  - Comprehensive `DEPLOYMENT.md`, `ARCHITECTURE.md`, and `RELEASE_NOTES.md`.

### 🛡️ Fixed & Hardened
- Added an 8-second fetch timeout (`AbortSignal.timeout(8000)`) to guard network requests against slow/offline connections.
- Hardened `loadPersisted()` to prevent crashes from corrupted browser `localStorage`.
- Sanitized HTML output across printable threat reports to eliminate XSS risks.
- Enforced `:focus-visible` focus rings and ARIA dialog/feed roles across all pages.
