import React, { useState } from 'react';
import {
  SlidersHorizontal,
  AlertTriangle,
  AlertOctagon,
  FileCode,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { Finding, Severity } from '../types';

interface LooseEndsPageProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
  onNavigateToPatch: (finding: Finding) => void;
}

export const LooseEndsPage: React.FC<LooseEndsPageProps> = ({
  findings,
  onSelectFinding,
  onNavigateToPatch,
}) => {
  const [activeSeverity, setActiveSeverity] = useState<string>('all');
  const [activeType, setActiveType] = useState<string>('all');

  const looseEndFindings = findings.filter((f) => f.category === 'loose_end');

  const filtered = looseEndFindings.filter((f) => {
    if (activeSeverity !== 'all' && f.severity !== activeSeverity) return false;
    if (activeType === 'todo' && !f.rule_id.includes('todo')) return false;
    if (activeType === 'fixme' && !f.rule_id.includes('fixme') && !f.rule_id.includes('hack')) return false;
    if (activeType === 'swallowed' && !f.rule_id.includes('swallowed')) return false;
    if (activeType === 'test' && !f.rule_id.includes('test')) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-sentinel-border p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Technical Debt & Loose Ends</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-sentinel-text">
            Loose-End & Unfinished Work Detector
          </h1>
          <p className="text-xs text-sentinel-secondary mt-1">
            Differentiates harmless developer notes from critical security workarounds, forgotten TODO/FIXME markers, and silent error suppressions.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-extrabold text-slate-700">
            {looseEndFindings.length}
          </div>
          <span className="text-[11px] text-sentinel-secondary font-semibold uppercase tracking-wider">
            Unfinished Loose Ends
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-sentinel-border p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: `All (${looseEndFindings.length})` },
            { id: 'swallowed', label: 'Swallowed Exceptions' },
            { id: 'fixme', label: 'Critical FIXME / HACK' },
            { id: 'todo', label: 'Unfinished TODOs' },
            { id: 'test', label: 'Incomplete Test Assertions' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeType === t.id
                  ? 'bg-sentinel-accent text-white shadow-sm'
                  : 'bg-slate-50 text-sentinel-secondary hover:text-sentinel-text hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setActiveSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeSeverity === sev
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Loose Ends Cards */}
      <div className="space-y-4">
        {filtered.map((finding) => (
          <div
            key={finding.id}
            className="bg-white rounded-2xl border border-sentinel-border hover:border-slate-300 shadow-subtle p-6 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sentinel-border">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={finding.severity} />
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded">
                  {finding.gap_type || finding.rule_id}
                </span>
              </div>

              <div className="text-xs text-sentinel-secondary font-mono flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-sentinel-accent" />
                <span>{finding.file_path}:{finding.line_start}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-bold text-sentinel-text">
                {finding.title}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {finding.description}
              </p>

              {/* Code Evidence */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                {finding.evidence || finding.code_snippet}
              </div>

              {/* Why It Matters */}
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">Risk Rationale:</span> {finding.why_it_matters}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-sentinel-border flex items-center justify-between">
              <span className="text-xs text-sentinel-secondary">
                Recommendation: {finding.recommendation?.substring(0, 70)}...
              </span>

              <button
                onClick={() => onNavigateToPatch(finding)}
                className="px-4 py-2 rounded-xl bg-sentinel-accent hover:bg-sentinel-accentHover text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <span>Proof & Resolve</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl border border-sentinel-border">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-sentinel-text">No Loose Ends Found</h3>
            <p className="text-xs text-sentinel-secondary mt-1">
              Zero unfinished TODOs or swallowed exceptions match your active filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
