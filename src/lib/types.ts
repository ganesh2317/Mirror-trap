export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ScanSource =
  | 'HaveIBeenPwned'
  | 'Shodan'
  | 'crt.sh'
  | 'GitHub'
  | 'DNS'
  | 'Security Headers'
  | 'SSL'
  | 'Whois'
  | 'Tech Stack';

export interface Finding {
  id: string;
  severity: Severity;
  source: ScanSource;
  title: string;
  description: string;
  meaning: string;
  /** true when the finding was produced by a real public API (not mock). */
  isReal?: boolean;
  /** Arbitrary raw payload from the source (subdomains, ports, CVEs, repos, ...). */
  real_data?: unknown;
}

export interface DnsRecordItem {
  type: 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME';
  name: string;
  data: string;
  ttl?: number;
}

export interface DnsSummary {
  ips: string[];
  aaaa: string[];
  mailServers: string[];
  nameservers: string[];
  txtRecs: string[];
  cnames: string[];
  tech: string[];
}

export interface SslSummary {
  issuer: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  tlsVersion: string;
  warnings: string[];
  isReal: boolean;
}

export interface HeaderCheckItem {
  name: string;
  present: boolean;
  value?: string;
  recommended: string;
  severity: Severity;
}

export interface SecurityHeaderSummary {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  headers: HeaderCheckItem[];
  missingCount: number;
  isReal: boolean;
}

export interface TechnologyItem {
  name: string;
  category: 'Framework' | 'Web Server' | 'CDN/DNS' | 'SaaS/CRM' | 'Security' | 'Analytics';
  confidence: number;
  icon?: string;
}

export interface WhoisSummary {
  registrar?: string;
  createdDate?: string;
  expiresDate?: string;
  nameServers?: string[];
  status?: string;
  isReal: boolean;
}

export interface IntelData {
  dns?: DnsSummary;
  ssl?: SslSummary;
  headers?: SecurityHeaderSummary;
  tech?: TechnologyItem[];
  whois?: WhoisSummary;
  subdomains?: string[];
}

export interface ScanResult {
  id: string;
  domain: string;
  ars_score: number;
  findings: Finding[];
  timestamp: string;
  estimated_time_to_exploit_hours: number;
  primary_entry_path: string;
  confidence: number;
  /** Names of real-data sources that answered successfully. */
  real_sources_used?: ScanSource[];
  /** Wall-clock duration of the real OSINT sweep, in seconds. */
  scan_duration_s?: number;
  /** Structured intelligence data from DNS, SSL, Headers, Tech Stack, and WHOIS */
  intel_data?: IntelData;
}

export type DecoyType =
  | 'honey-admin'
  | 'fake-aws-key'
  | 'decoy-login'
  | 'honey-token';

export interface Decoy {
  id: DecoyType;
  name: string;
  active: boolean;
  meta: Record<string, string>;
  logs: DecoyLog[];
}

export interface DecoyLog {
  id: string;
  timestamp: string;
  ip: string;
  location: string;
  user_agent: string;
  action: string;
}

export type ThreatKind =
  | 'CREDENTIAL STUFFING'
  | 'PORT SCAN'
  | 'SQL INJECTION'
  | 'BRUTE FORCE'
  | 'OSINT SCRAPE'
  | 'API ABUSE'
  | 'SUBDOMAIN ENUM'
  | 'DIRECTORY BRUTE';

export type ThreatStatus = 'NEUTRALIZED' | 'BLOCKED' | 'DECEIVED' | 'TRACKED' | 'POISONED';

export interface ThreatEvent {
  id: string;
  timestamp: string;
  kind: ThreatKind;
  ip: string;
  country_flag: string;
  action: string;
  status: ThreatStatus;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export type AlertSeverity = 'CRITICAL' | 'HIGH';

export interface Alert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  ip: string;
  country_flag: string;
  country: string;
  network_tag: string;
  user_agent: string;
  asset_used: string;
  asset_value: string;
  behavior: {
    requests: string;
    pattern: string;
    fingerprint: string;
  };
  classification: {
    label: 'Automated Recon Bot' | 'Human Attacker';
    confidence: number;
  };
  attack_path: Array<{ step: number; label: string; triggered?: boolean; predicted?: boolean }>;
  status: 'open' | 'flagged' | 'dismissed';
}
