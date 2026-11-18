import React, { useState } from 'react';
import {
  SearchCode,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  Info,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { SeverityBadge, GapLabelBadge, VerificationStatusBadge } from '../components/common/SeverityBadge';
import { Finding, GapLabel, Severity } from '../types';

interface MissingnessPageProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
  onNavigateToPatch: (finding: Finding) => void;
}

export const MissingnessPage: React.FC<MissingnessPageProps> = ({
  findings,
  onSelectFinding,
  onNavigateToPatch,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLabel, setSelectedLabel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFinding, setActiveFinding] = useState<Finding | null>(
    findings.find((f) => f.category === 'missingness') || null
  );

  const missingnessFindings = findings.filter((f) => f.category === 'missingness');

  const filteredFindings = missingnessFindings.filter((f) => {
    if (selectedType !== 'all' && f.gap_type !== selectedType) return false;
    if (selectedLabel !== 'all' && f.gap_label !== selectedLabel) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.file_path.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const gapTypes = [
    { id: 'all', label: 'All Missing Safeguards' },
    { id: 'missing_auth', label: 'Missing Authentication' },
    { id: 'missing_validation', label: 'Missing Input Validation' },
    { id: 'missing_error_handling', label: 'Missing Error Handling' },
    { id: 'missing_test', label: 'Missing Automated Tests' },
    { id: 'doc_mismatch', label: 'Doc vs Code Mismatch' },
    { id: 'missing_safeguard', label: 'Missing Safeguards' },
  ];

  return (
    <div className="space-y-6">
      {/* Signature Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white rounded-2xl border-2 border-sentinel-softBlue p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sentinel-softBlue text-sentinel-accent border border-blue-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Signature Innovation</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-sentinel-text">
              Missingness Intelligence Engine
            </h1>
            <p className="text-xs text-sentinel-secondary max-w-2xl leading-relaxed">
              Traditional code scanners detect existing mistakes. Code Sentinel investigates what <strong>SHOULD exist but DOES NOT</strong> — detecting absent authentication guards, missing validation boundaries, unhandled failures, and test voids.
            </p>
          </div>

          <div className="text-right flex-shrink-0 bg-white px-4 py-3 rounded-xl border border-sentinel-border shadow-sm">
            <div className="text-2xl font-extrabold text-sentinel-accent">
              {missingnessFindings.length}
            </div>
            <span className="text-[11px] text-sentinel-secondary font-semibold uppercase tracking-wider">
              Missing Engineering Requirements
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-sentinel-border shadow-subtle p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {gapTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedType === t.id
                  ? 'bg-sentinel-accent text-white shadow-sm'
                  : 'bg-slate-50 text-sentinel-secondary hover:text-sentinel-text hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            className="text-xs bg-slate-50 border border-sentinel-border rounded-xl px-3 py-1.5 font-medium text-sentinel-text focus:outline-none focus:ring-2 focus:ring-sentinel-accent"
          >
            <option value="all">All Evidence Labels</option>
            <option value="Confirmed gap">Confirmed gap</option>
            <option value="Potential gap">Potential gap</option>
            <option value="Needs human review">Needs human review</option>
          </select>

          <input
            type="text"
            placeholder="Search missing requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs bg-slate-50 border border-sentinel-border rounded-xl px-3.5 py-1.5 text-sentinel-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sentinel-accent w-full md:w-56"
          />
        </div>
      </div>

      {/* Main Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-sentinel-secondary uppercase tracking-wider px-1">
            Detected Missing Requirements ({filteredFindings.length})
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredFindings.map((finding) => {
              const isSelected = activeFinding?.id === finding.id;
              return (
                <div
                  key={finding.id}
                  onClick={() => setActiveFinding(finding)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-sentinel-accent shadow-elevated ring-2 ring-blue-100'
                      : 'bg-white border-sentinel-border hover:border-slate-300 shadow-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <SeverityBadge severity={finding.severity} size="sm" />
                    <GapLabelBadge label={finding.gap_label} />
                  </div>

                  <h4 className="text-xs font-bold text-sentinel-text hover:text-sentinel-accent">
                    {finding.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-sentinel-secondary font-mono mt-2">
                    <span className="truncate max-w-[200px]">{finding.file_path}:{finding.line_start}</span>
                    <span className="font-sans font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {Math.round(finding.confidence * 100)}% Conf
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredFindings.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-sentinel-border">
                <SearchCode className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-sentinel-secondary">No missing requirements match your filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-7">
          {activeFinding ? (
            <div className="bg-white rounded-2xl border border-sentinel-border shadow-subtle p-6 space-y-6 sticky top-24">
              {/* Finding Title & Badges */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <SeverityBadge severity={activeFinding.severity} />
                  <GapLabelBadge label={activeFinding.gap_label} />
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    Rule: {activeFinding.rule_id}
                  </span>
                  <VerificationStatusBadge status={activeFinding.verification_status} />
                </div>
                <h2 className="text-lg font-extrabold text-sentinel-text mt-2">
                  {activeFinding.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-sentinel-secondary font-mono mt-1">
                  <FileCode className="w-3.5 h-3.5 text-sentinel-accent" />
                  <span>{activeFinding.file_path}:{activeFinding.line_start}-{activeFinding.line_end}</span>
                </div>
              </div>

              {/* What is Missing */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="text-xs font-bold text-sentinel-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <SearchCode className="w-3.5 h-3.5" />
                  <span>What is Missing</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {activeFinding.description}
                </p>
              </div>

              {/* Why It Matters */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Why It Matters & Engineering Impact</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {activeFinding.why_it_matters || 'Exposes application logic to untracked failures and architectural divergence.'}
                </p>
              </div>

              {/* Supporting Evidence */}
              <div>
                <div className="text-xs font-bold text-sentinel-secondary uppercase tracking-wider mb-2">
                  Deterministic Code Evidence
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                  {activeFinding.evidence || activeFinding.code_snippet || 'AST inspection confirmed absence of required constructs.'}
                </div>
              </div>

              {/* Suggested Next Step / Remediation */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Suggested Next Step</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {activeFinding.recommendation || 'Implement the required defensive controls and validation boundaries.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-sentinel-border flex items-center justify-between">
                <div className="text-xs text-sentinel-secondary">
                  Confidence Rating: <strong>{Math.round(activeFinding.confidence * 100)}%</strong>
                </div>

                <button
                  onClick={() => onNavigateToPatch(activeFinding)}
                  className="px-4 py-2.5 rounded-xl bg-sentinel-accent hover:bg-sentinel-accentHover text-white text-xs font-semibold shadow-sm flex items-center gap-2"
                >
                  <span>Generate & Verify Fix</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-sentinel-border p-12 text-center">
              <Info className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-sentinel-text">Select a Missingness Finding</h3>
              <p className="text-xs text-sentinel-secondary mt-1">
                Choose an item from the left column to inspect evidence, impact, and proposed remediations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
