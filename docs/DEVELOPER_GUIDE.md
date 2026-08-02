# MirrorTrap Developer Architecture & Workflow Guide

A comprehensive technical reference for developers working on the **MirrorTrap** platform.

---

## 🏗️ Architecture Blueprint

MirrorTrap follows a modular React component architecture powered by custom Context providers and lazy-loaded page modules.

```
+-------------------------------------------------------------------+
|                        REACT APPLICATION ENGINE                   |
|  [App.tsx] -> ErrorBoundary -> AppProvider -> BrowserRouter       |
+-------------------------------------------------------------------+
                                  |
            +---------------------+---------------------+
            |                                           |
            v                                           v
+-----------------------+                   +-----------------------+
|    UI COMPONENT LAYER |                   |  STATE & RECON LAYER  |
|  - DashboardShell     |                   |  - store.tsx (Context)|
|  - NotificationCenter |                   |  - scanApi.ts (OSINT) |
|  - OrgSwitcher        |                   |  - logger.ts (Logs)   |
|  - SettingsPage       |                   |  - emailTemplates.ts  |
+-----------------------+                   +-----------------------+
```

---

## 🔑 Core State Subsystems (`src/lib/store.tsx`)

- **Organization Workspaces**: Manages active organization context (`switchOrg`, `createOrg`).
- **Domain Footprint**: Managed domain roster with daily/weekly schedules (`addDomain`, `removeDomain`, `togglePrimaryDomain`).
- **RBAC Roster**: Four-tier team role assignments (`inviteMember`, `updateMemberRole`, `removeMember`).
- **Notification Subsystem**: Unread counter badges and category filters (`markNotificationRead`, `markAllNotificationsRead`).
- **Immutable Audit Trail**: Append-only log recording operational actions (`logAuditEvent`).

---

## 🔒 Security Practices for Code Contributions

1. **HTML Output Sanitization**: Always pass dynamic strings or DNS outputs through `escapeHtml()` before rendering inline HTML.
2. **Fetch Timeouts**: Wrap async `fetch` network requests with an 8-second timeout (`AbortSignal.timeout(8000)`).
3. **Fault Isolation**: Ensure page components do not throw unhandled exceptions outside React Suspense/ErrorBoundary boundaries.
