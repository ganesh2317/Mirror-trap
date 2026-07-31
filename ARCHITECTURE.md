# MirrorTrap Enterprise SaaS — Platform Architecture

Technical architecture specification for **MirrorTrap** threat intelligence and active deception platform.

---

## Architecture Blueprint

```
+-----------------------------------------------------------------------------------+
|                                 MIRRORTRAP UI                                     |
|   Dashboard | Hacker's Eye | Scan Engine | PhantomShield | Alerts | Reports | RBAC |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        REACT CONTEXT & STATE MANAGER                              |
|   Organizations | Managed Domains | RBAC Roster | Notification Center | Audit Log |
+-----------------------------------------------------------------------------------+
                                         |
    +------------------------------------+------------------------------------+
    |                                    |                                    |
    v                                    v                                    v
+-----------------------+    +-----------------------+    +-----------------------+
|  OSINT SCAN ENGINE    |    |  PHANTOMSHIELD DECOY  |    |  TRANSACTIONAL EMAIL  |
|  DNS / SSL / Headers  |    |  Honey-Keys / Login   |    |  Templates & Alerts   |
+-----------------------+    +-----------------------+    +-----------------------+
```

---

## Core Systems & Layers

### 1. Multi-Tenant Organization Layer
- **Workspaces**: Multi-org context isolation with seamless workspace switching (`switchOrg`).
- **Domain Footprint**: Domain management with daily/weekly scan schedules and health checks (`DomainItem`).

### 2. User Management & Role-Based Access Control (RBAC)
- **Roles**: `Owner`, `Administrator`, `Security Analyst`, `Read-only Viewer`.
- **Invitations**: Email invitation workflow for adding security team members.

### 3. Notification & Audit Log Subsystems
- **Notification Center**: Real-time notifications for scans, SSL warnings, tripwires, and system updates (`NotificationCenter.tsx`).
- **Immutable Audit Trail**: Structured event logging capturing timestamp, actor, category, action, and details (`AuditLogEntry`).

### 4. Code Splitting & Observability
- **Route Chunking**: `React.lazy` chunking for zero main-thread block time.
- **Crash Isolation**: Global `ErrorBoundary` to intercept component faults without state corruption.
