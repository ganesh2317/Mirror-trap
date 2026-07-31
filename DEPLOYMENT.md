# MirrorTrap Enterprise SaaS — Production Deployment Guide

Guide for deploying **MirrorTrap** in enterprise environments via Docker, Vercel, or AWS ECS/CloudFront.

---

## 1. Environment Variables

Create `.env.production`:

```env
# Supabase Live Auth & Storage (Optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-string

# Production API Endpoints
VITE_APP_URL=https://mirrortrap.app
```

---

## 2. Docker Deployment

Build and run container:

```bash
docker build -t mirrortrap:latest .
docker run -d -p 8080:80 --name mirrortrap mirrortrap:latest
```

---

## 3. Production Validation Checklist

- [x] All routes split into lazy chunks (`React.lazy`).
- [x] Global Error Boundary isolates runtime component faults (`ErrorBoundary.tsx`).
- [x] Security headers enforced (`X-Frame-Options: DENY`, `HSTS`, `CSP`).
- [x] Gzip compression enabled.
- [x] Immutable Audit Trail enabled (`AuditLogEntry`).
- [x] Multi-tenant organization isolation configured.
