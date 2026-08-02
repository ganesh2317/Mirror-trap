# MirrorTrap Enterprise SaaS — Platform Architecture

Technical architecture specification for **MirrorTrap** threat intelligence and active deception platform.

For setup and deployment instructions, refer to [`DEPLOYMENT.md`](./DEPLOYMENT.md) and [`docs/DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md).

---

## 🏛️ Architecture Blueprint

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

## 🧱 Core Systems & Subsystems

### 1. Multi-Tenant Organization Layer
- **Workspaces**: Multi-org context isolation with seamless workspace switching (`switchOrg`).
- **Domain Footprint**: Domain management with daily/weekly scan schedules and health checks (`DomainItem`).

### 2. User Management & Role-Based Access Control (RBAC)
- **Roles**: `Owner`, `Administrator`, `Security Analyst`, `Read-only Viewer`.
- **Invitations**: Email invitation workflow for adding security team members.

### 3. Notification & Audit Log Subsystems
- **Notification Center**: Real-time notifications for scans, SSL warnings, tripwires, and system updates ([`NotificationCenter.tsx`](./src/components/NotificationCenter.tsx)).
- **Immutable Audit Trail**: Structured event logging capturing timestamp, actor, category, action, and details (`AuditLogEntry`).

### 4. Code Splitting & Observability
- **Route Chunking**: `React.lazy` chunking for zero main-thread block time.
- **Crash Isolation**: Global [`ErrorBoundary`](./src/components/ErrorBoundary.tsx) to intercept component faults without state corruption.
