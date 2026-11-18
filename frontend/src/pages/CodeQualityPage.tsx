import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Code2,
  Trash2,
  AlertTriangle,
  FileCode,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { Finding } from '../types';

interface CodeQualityPageProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
  onNavigateToPatch: (finding: Finding) => void;
}

export const CodeQualityPage: React.FC<CodeQualityPageProps> = ({
  findings,
  onSelectFinding,
  onNavigateToPatch,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const qualityFindings = findings.filter((f) => f.category === 'quality');

  const filtered = qualityFindings.filter((f) => {
    if (activeFilter === 'unused_import' && f.rule_id !== 'unused_import') return false;
    if (activeFilter === 'complexity' && f.rule_id !== 'excessive_complexity') return false;
    if (activeFilter === 'empty_stub' && f.rule_id !== 'empty_function_stub') return false;
    if (activeFilter === 'duplicate' && f.rule_id !== 'duplicate_function_logic') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-sentinel-border p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AST Code Slop & Bloat Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-sentinel-text">
            Code Slop & Technical Debt Detector
          </h1>
          <p className="text-xs text-sentinel-secondary mt-1">
            Static AST analysis identifying unused imports, high cyclomatic complexity, placeholder functions, and duplicate logic.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-extrabold text-amber-600">
            {qualityFindings.length}
          </div>
          <span className="text-[11px] text-sentinel-secondary font-semibold uppercase tracking-wider">
            Quality Gaps Identified
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-sentinel-border p-3 shadow-subtle flex flex-wrap gap-2">
        {[
          { id: 'all', label: `All Quality Items (${qualityFindings.length})` },
          { id: 'unused_import', label: 'Unused Imports' },
          { id: 'complexity', label: 'High Cyclomatic Complexity' },
          { id: 'empty_stub', label: 'Empty Placeholder Stubs' },
          { id: 'duplicate', label: 'Duplicate Code' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === tab.id
                ? 'bg-sentinel-accent text-white shadow-sm'
                : 'bg-slate-50 text-sentinel-secondary hover:text-sentinel-text hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Findings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((finding) => (
          <div
            key={finding.id}
            className="bg-white rounded-2xl border border-sentinel-border hover:border-slate-300 shadow-subtle p-5 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <SeverityBadge severity={finding.severity} size="sm" />
                <span className="text-xs text-sentinel-secondary font-mono">
                  {finding.file_path}:{finding.line_start}
                </span>
              </div>

              <h3 className="text-sm font-bold text-sentinel-text">
                {finding.title}
              </h3>
              <p className="text-xs text-sentinel-secondary mt-1.5 leading-relaxed">
                {finding.description}
              </p>

              <div className="mt-3 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                {finding.evidence || finding.code_snippet}
              </div>

              {finding.why_it_matters && (
                <div className="mt-3 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
                  <span className="font-bold">Impact:</span> {finding.why_it_matters}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-sentinel-border flex items-center justify-between">
              <span className="text-[11px] text-sentinel-secondary font-mono">
                {finding.rule_id}
              </span>
              <button
                onClick={() => onNavigateToPatch(finding)}
                className="px-3 py-1.5 rounded-lg bg-sentinel-softBlue hover:bg-blue-100 text-sentinel-accent text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Proof & Clean</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 bg-white p-12 text-center rounded-2xl border border-sentinel-border">
            <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-sentinel-text">No Code Slop Detected</h3>
            <p className="text-xs text-sentinel-secondary mt-1">
              Zero unused imports or empty stub implementations matched this filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
