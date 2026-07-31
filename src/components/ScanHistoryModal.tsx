import { useState } from 'react';
import { ArrowRight, Clock, GitCompare, History, Radar, X } from 'lucide-react';
import type { ScanResult } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Badge } from './ui/Badge';
import { GlassCard } from './ui/GlassCard';

interface ScanHistoryModalProps {
  open: boolean;
  onClose: () => void;
  scans: ScanResult[];
  onSelectScan: (s: ScanResult) => void;
}

export function ScanHistoryModal({ open, onClose, scans, onSelectScan }: ScanHistoryModalProps) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedScanA, setSelectedScanA] = useState<ScanResult | null>(null);
  const [selectedScanB, setSelectedScanB] = useState<ScanResult | null>(null);

  if (!open) return null;

  const sortedScans = [...scans].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));

  const toggleSelectForCompare = (s: ScanResult) => {
    if (!selectedScanA) {
      setSelectedScanA(s);
    } else if (selectedScanA.id === s.id) {
      setSelectedScanA(null);
    } else if (!selectedScanB) {
      setSelectedScanB(s);
    } else if (selectedScanB.id === s.id) {
      setSelectedScanB(null);
    } else {
      setSelectedScanB(s);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-4xl max-h-[85vh] flex flex-col p-6 shadow-glow overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Scan History & Comparison"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary tracking-tight">Scan History & Comparison</h2>
              <p className="text-xs text-text-muted">
                {scans.length} scan{scans.length === 1 ? '' : 's'} recorded · Select scans to compare posture evolution
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                setSelectedScanA(null);
                setSelectedScanB(null);
              }}
              className={`btn-secondary !py-1.5 !px-3 text-xs ${compareMode ? '!bg-indigo-500/20 !text-indigo-400 !border-indigo-500/40' : ''}`}
            >
              <GitCompare className="h-3.5 w-3.5 mr-1" />
              {compareMode ? 'Exit Comparison Mode' : 'Compare Scans'}
            </button>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1" aria-label="Close modal">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {compareMode ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-300">
              Select two scans from the list below to run side-by-side threat posture comparison.
            </div>

            {selectedScanA && selectedScanB ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[selectedScanA, selectedScanB].map((scan, idx) => {
                  const isA = idx === 0;
                  const other = isA ? selectedScanB : selectedScanA;
                  const delta = scan.ars_score - other.ars_score;
                  return (
                    <GlassCard key={scan.id} className="p-4 space-y-3 border-indigo-500/30">
                      <div className="flex items-center justify-between">
                        <Badge variant="info">Scan {isA ? 'Baseline A' : 'Comparison B'}</Badge>
                        <span className="text-xs font-mono text-text-muted">{formatDate(scan.timestamp)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary font-mono">{scan.domain}</div>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-3xl font-bold font-mono text-amber-400">ARS {scan.ars_score}</span>
                          {delta !== 0 && (
                            <span className={`text-xs font-bold font-mono ${delta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                              ({delta > 0 ? '+' : ''}{delta} vs {isA ? 'B' : 'A'})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-text-muted space-y-1">
                        <div>Primary entry: <span className="text-text-secondary">{scan.primary_entry_path}</span></div>
                        <div>Total findings: <span className="text-text-primary">{scan.findings.length}</span></div>
                      </div>
                      <button
                        onClick={() => {
                          onSelectScan(scan);
                          onClose();
                        }}
                        className="btn-primary w-full !py-1.5 text-xs"
                      >
                        Re-open Report <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </button>
                    </GlassCard>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-text-muted">
                Selected: {selectedScanA ? '1 / 2 scans' : '0 / 2 scans'}. Click items in the scan list below.
              </div>
            )}
          </div>
        ) : null}

        {/* Scan List */}
        <div className="flex-1 overflow-y-auto space-y-2 mt-2 pr-1">
          {sortedScans.length === 0 ? (
            <div className="text-center py-12 text-sm text-text-muted">
              <Radar className="h-8 w-8 mx-auto mb-2 opacity-40 text-indigo-400" />
              No historical scans found.
            </div>
          ) : (
            sortedScans.map((s) => {
              const isSelectedA = selectedScanA?.id === s.id;
              const isSelectedB = selectedScanB?.id === s.id;
              const isSelected = isSelectedA || isSelectedB;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (compareMode) toggleSelectForCompare(s);
                    else {
                      onSelectScan(s);
                      onClose();
                    }
                  }}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/15 shadow-glow'
                      : 'border-border/60 bg-bg-surface/50 hover:bg-white/5 hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-terminal border border-border/50 text-indigo-400 font-mono text-xs font-bold">
                      {s.ars_score}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-primary font-mono flex items-center gap-2">
                        {s.domain}
                        {s.real_sources_used?.length ? (
                          <Badge variant="active" className="text-[9px] !py-0">LIVE OSINT</Badge>
                        ) : (
                          <Badge variant="inactive" className="text-[9px] !py-0">DEMO</Badge>
                        )}
                      </div>
                      <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {formatDate(s.timestamp)} · {s.findings.length} findings
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {compareMode ? (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                        isSelectedA ? 'bg-indigo-500/30 text-indigo-300 border-indigo-400' :
                        isSelectedB ? 'bg-amber-500/30 text-amber-300 border-amber-400' :
                        'bg-white/5 text-text-muted border-border/40'
                      }`}>
                        {isSelectedA ? 'Selected (A)' : isSelectedB ? 'Selected (B)' : 'Select'}
                      </span>
                    ) : (
                      <span className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium">
                        View Report <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
