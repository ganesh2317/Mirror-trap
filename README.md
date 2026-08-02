# MirrorTrap Enterprise Cybersecurity Platform

**See yourself through a hacker's eyes.**

MirrorTrap is an enterprise-grade cybersecurity platform that performs real external attack surface management (EASM), scans public OSINT infrastructure (DNS, SSL, CT logs, headers, tech stack), deploys AI-generated active deception honeypots (PhantomShield), and captures attackers in real time.

![MirrorTrap](./public/favicon.svg)

---

## 🎬 4-Minute Walkthrough Video — **▶ [Watch on YouTube](https://youtu.be/_gOj0ZJIpw4)**

[![Watch the MirrorTrap walkthrough on YouTube](https://img.youtube.com/vi/_gOj0ZJIpw4/maxresdefault.jpg)](https://youtu.be/_gOj0ZJIpw4)

> 🎥 **Primary watch link:** **https://youtu.be/_gOj0ZJIpw4**  
> Backup MP4 in this repo: [`walkthrough/MirrorTrap_Walkthrough.mp4`](./walkthrough/MirrorTrap_Walkthrough.mp4) (9.7 MB · plays inline on the GitHub blob page)

| Resource | Details |
|---|---|
| 📺 **YouTube Video** | **https://youtu.be/_gOj0ZJIpw4** |
| 🎥 **Video File** | [`walkthrough/MirrorTrap_Walkthrough.mp4`](./walkthrough/MirrorTrap_Walkthrough.mp4) — 224 s · 1280×800 · 9.7 MB |
| 🎙️ **Voice-Over** | [`walkthrough/audio/voiceover.mp3`](./walkthrough/audio/voiceover.mp3) — Sarvam `bulbul:v3`, speaker `shubh` |
| 📜 **Script** | [`docs/WALKTHROUGH_SCRIPT.md`](./docs/WALKTHROUGH_SCRIPT.md) — 11 time-coded segments |
| 🤖 **Automated Pipeline** | [`walkthrough/walkthrough.py`](./walkthrough/walkthrough.py) — Playwright + ffmpeg pipeline |

---

## 🚀 Key Modules & Capabilities

- **Landing Page**: Cinematic hero section, live attack surface preview terminal, feature breakdown, interactive pricing tiers.
- **OSINT Reconnaissance Engine**: Animated 5-source OSINT sweep (DNS, SSL/TLS certificate inspector, CT log subdomains, HSTS/CSP security headers, tech stack fingerprinting).
- **PhantomShield Active Deception**: Honeypot decoy deployment (`honey-admin`, `fake-aws-key`, `decoy-login`, `honey-token`) with tripwire interceptors and active attack path timelines.
- **Alerts & Replay**: Tripwire-fired alert dashboard, severity filters, attack behavior analysis, step-by-step incident replay timeline, and one-click "Simulate Attack" trigger.
- **Multi-Tenant SaaS Workspaces**: Header workspace switcher dropdown (`OrgSwitcher`), domain footprint manager, 4-tier Role-Based Access Control (`Owner`, `Administrator`, `Security Analyst`, `Read-only Viewer`).
- **Notification Center & Audit Trail**: Real-time header notifications with unread counter badges and category filters (`scan`, `ssl`, `tripwire`, `critical`) alongside an immutable audit trail with CSV export.
- **Executive AI Threat Reports**: Interactive posture reports with ARS trend charts, scan history comparison, and printable C-suite HTML downloads.
- **9-Tab Control Panel**: Comprehensive organization administration panel in Settings.
- **Demo Mode**: Pre-loaded `acmecorp.io` dataset across the platform. Toggle with the navbar button or press <kbd>D</kbd> anywhere.

---

## 🛠️ Tech Stack

- **Core**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS 3 + Vanilla CSS tokens
- **Routing**: React Router v6 (Lazy loaded with Suspense fallbacks)
- **State & Storage**: React Context + Custom LocalStorage Persistence Store + Supabase Client SDK
- **Data Visualization**: Recharts (ARS trend charts, radar charts, pie distributions)
- **Icons & UI Primitives**: Lucide React + Radix UI Switch + Custom Glassmorphism UI Components

---

## 📁 Repository Structure

```
c:\projects\MirrorTrap\
├── src/
│   ├── components/         # Reusable UI components (NotificationCenter, OrgSwitcher, GlassCard, etc.)
│   ├── lib/                # Core libraries (scanApi.ts, store.tsx, logger.ts, emailTemplates.ts)
│   ├── pages/              # Lazy-loaded page components (DashboardHome, ScanPage, SettingsPage, etc.)
│   ├── routes/             # Route guards and protected layouts (ProtectedRoute.tsx)
│   ├── App.tsx             # Route definitions, ErrorBoundary, and Suspense fallback
│   └── main.tsx            # Application entrypoint
├── docs/                   # Developer documentation and walkthrough scripts
├── public/                 # Static assets, favicon, and brand SVGs
├── Dockerfile              # Production multi-stage Docker container build
├── nginx.conf              # Production Nginx reverse proxy and security headers config
├── vercel.json             # Production Vercel single-page application rewrite config
├── DEPLOYMENT.md           # Deployment instructions for Vercel, Docker, and AWS
├── ARCHITECTURE.md         # System architecture specification and module diagrams
└── CHANGELOG.md            # Release version history and feature changelog
```

---

## 💻 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher

### Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/ganesh2317/Mirror-trap.git
cd Mirror-trap

# 2. Install dependencies
npm install

# 3. Launch local development server
npm run dev
# → http://localhost:5173
```

---

## ⚙️ Environment Configuration

MirrorTrap runs out of the box in **Offline / Persistence Mode** using browser `localStorage`. To enable optional live Supabase authentication and remote database sync, create a `.env.local` file:

```env
# Optional: Supabase Live Authentication & Database Sync
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-string
```

### Database Schema (Optional Supabase Tables)

```sql
create table scans (
  id text primary key,
  user_id uuid references auth.users not null,
  domain text not null,
  ars_score int not null,
  findings_json jsonb not null,
  created_at timestamptz not null default now()
);

create table alerts (
  id text primary key,
  user_id uuid references auth.users not null,
  severity text not null,
  ip text not null,
  asset_used text not null,
  payload_json jsonb not null,
  created_at timestamptz not null default now()
);

create table decoys (
  id text primary key,
  user_id uuid references auth.users not null,
  active boolean not null default false,
  meta_json jsonb,
  updated_at timestamptz not null default now()
);
```

---

## 🎹 Keyboard Shortcuts

| Key | Action |
|---|---|
| <kbd>D</kbd> | Toggle Demo Mode on/off |
| <kbd>?</kbd> | Show keyboard shortcuts modal |
| <kbd>/</kbd> | Focus header quick-scan bar |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | Navigate to Scan Page |
| <kbd>Ctrl</kbd> + <kbd>A</kbd> | Navigate to Alerts Page |
| <kbd>Esc</kbd> | Close active modal or drawer |

---

## 📜 Available NPM Scripts

- `npm run dev` — Launch Vite local development server (`http://localhost:5173`)
- `npm run build` — Run TypeScript type checking (`tsc -b`) and build production assets with Vite
- `npm run lint` — Execute ESLint static code analysis across the repository
- `npm run preview` — Serve production build output locally for verification

---

## ❓ Troubleshooting & FAQs

<details>
<summary><strong>1. Build error or missing modules during <code>npm install</code></strong></summary>
Ensure you are using Node.js v18 or v20+. If issues persist, clear node_modules and clean npm cache:
<code>rm -rf node_modules package-lock.json && npm install</code>
</details>

<details>
<summary><strong>2. CORS errors when executing OSINT domain scans</strong></summary>
MirrorTrap uses Google Public DNS API and public CT log endpoints (`crt.sh`) which support browser CORS. If a corporate firewall or proxy blocks outgoing API calls, the engine automatically falls back to clean, synthetic OSINT data.
</details>

<details>
<summary><strong>3. Deep page refresh returns 404 on custom server deployments</strong></summary>
Ensure your web server redirects all single-page application routes to <code>index.html</code>. MirrorTrap includes pre-configured rewrite rules for Vercel (<code>vercel.json</code>) and Nginx (<code>nginx.conf</code>).
</details>

---

## 📄 License & Ownership

Built for cybersecurity demonstration and threat intelligence research. All rights reserved.
