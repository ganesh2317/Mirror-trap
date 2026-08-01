# MirrorTrap Enterprise SaaS — Production Deployment Guide

Production deployment guide for **MirrorTrap v1.0 Beta** across Vercel, Docker, and Nginx.

---

## 1. Vercel Deployment (Recommended Frontend Platform)

MirrorTrap is pre-configured with `vercel.json` for single-page application (SPA) routing.

### Option A: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B: Deploy via GitHub Integration
1. Connect repository `https://github.com/ganesh2317/Mirror-trap` to Vercel.
2. Select Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Add Environment Variables (optional for Supabase Live Auth):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## 2. Docker Container Deployment

MirrorTrap includes a multi-stage Docker build (`Node 20 Alpine` -> `Nginx Alpine`) with Gzip compression and security headers (`X-Frame-Options: DENY`, `HSTS`, `CSP`).

```bash
# Build image
docker build -t mirrortrap:v1.0.0-beta .

# Run container on port 8080
docker run -d -p 8080:80 --name mirrortrap mirrortrap:v1.0.0-beta
```

---

## 3. Production Validation Checklist

- [x] SPA Rewrites configured in `vercel.json`.
- [x] Multi-stage build configured in `Dockerfile`.
- [x] Security headers and Gzip enabled in `nginx.conf`.
- [x] Route-based code splitting configured via `React.lazy` in `App.tsx`.
- [x] Global React fault isolation configured via `ErrorBoundary.tsx`.
- [x] Network requests guarded with 8-second timeouts (`AbortSignal.timeout(8000)`).
- [x] Immutable Audit Trail and RBAC state persistence enabled.
