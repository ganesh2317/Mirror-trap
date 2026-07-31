import { createContext } from 'react';
import type {
  Alert,
  AuditLogEntry,
  Decoy,
  DomainItem,
  NotificationItem,
  Organization,
  OrgMember,
  ScanResult,
  ThreatEvent,
  UserRole,
} from './types';

export interface Toast {
  id: string;
  title: string;
  body?: string;
  tone?: 'info' | 'success' | 'danger' | 'amber';
}

export interface AppCtx {
  user: { email: string; id: string } | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;

  demoMode: boolean;
  setDemoMode: (v: boolean) => void;

  /** Multi-Tenant Organizations */
  organizations: Organization[];
  currentOrg: Organization;
  switchOrg: (id: string) => void;
  createOrg: (name: string) => void;

  /** Domain Management Footprint */
  domains: DomainItem[];
  addDomain: (domainName: string) => void;
  removeDomain: (id: string) => void;
  togglePrimaryDomain: (id: string) => void;

  /** User Management & RBAC */
  members: OrgMember[];
  inviteMember: (email: string, role: UserRole) => void;
  updateMemberRole: (id: string, role: UserRole) => void;
  removeMember: (id: string) => void;

  /** Notification Center */
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  /** Immutable Audit Log */
  auditLogs: AuditLogEntry[];
  logAuditEvent: (action: string, category: AuditLogEntry['category'], details: string) => void;

  /** Plan flags. `isEnterprise` gates the /protect page. */
  isPro: boolean;
  isEnterprise: boolean;
  setPlan: (plan: 'free' | 'pro' | 'enterprise') => void;

  /** Autonomous defense toggle (only relevant on enterprise /protect page). */
  shieldActive: boolean;
  setShieldActive: (v: boolean) => void;

  /** Pre-seeded + live-generated threat events for the /protect page. */
  threatEvents: ThreatEvent[];

  scans: ScanResult[];
  latestScan: ScanResult | null;
  addScan: (s: ScanResult) => void;

  decoys: Decoy[];
  toggleDecoy: (id: Decoy['id']) => void;
  deployAll: () => void;

  alerts: Alert[];
  addAlert: (a: Alert) => void;
  simulateAttack: () => void;
  updateAlertStatus: (id: string, status: Alert['status']) => void;

  toasts: Toast[];
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const AppContext = createContext<AppCtx | null>(null);
