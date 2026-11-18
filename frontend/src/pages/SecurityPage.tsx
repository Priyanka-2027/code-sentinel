import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  AlertOctagon,
  FileCode,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SeverityBadge, VerificationStatusBadge } from '../components/common/SeverityBadge';
import { Finding } from '../types';

interface SecurityPageProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
  onNavigateToPatch: (finding: Finding) => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({
  findings,
  onSelectFinding,
  onNavigateToPatch,
}) => {
  const [showUnmasked, setShowUnmasked] = useState<Record<string, boolean>>({});
  const [activeSeverity, setActiveSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const securityFindings = findings.filter((f) => f.category === 'security');

  const filtered = securityFindings.filter((f) => {
    if (activeSeverity !== 'all' && f.severity !== activeSeverity) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.file_path.toLowerCase().includes(q) ||
        (f.cwe_id && f.cwe_id.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const toggleMask = (id: string) => {
    setShowUnmasked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-sentinel-border p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Deterministic Security Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-sentinel-text">
            Security Intelligence & Vulnerabilities
          </h1>
          <p className="text-xs text-sentinel-secondary mt-1">
            Deterministic AST and pattern detection for secrets, SQL injections, command execution, and known CVE dependencies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-extrabold text-red-600">
              {securityFindings.filter((f) => f.severity === 'critical').length}
            </div>
            <span className="text-[11px] text-sentinel-secondary font-semibold uppercase tracking-wider">
              Critical CVEs / Flaws
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-sentinel-border p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setActiveSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeSeverity === sev
                  ? 'bg-sentinel-text text-white'
                  : 'bg-slate-50 text-sentinel-secondary hover:text-sentinel-text'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter by title, CWE, or file..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-xs bg-slate-50 border border-sentinel-border rounded-xl px-3.5 py-1.5 text-sentinel-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sentinel-accent w-full sm:w-64"
        />
      </div>

      {/* Security Findings Grid */}
      <div className="space-y-4">
        {filtered.map((finding) => (
          <div
            key={finding.id}
            className="bg-white rounded-2xl border border-sentinel-border hover:border-slate-300 shadow-subtle p-6 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sentinel-border">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={finding.severity} />
                {finding.cwe_id && (
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200">
                    {finding.cwe_id}
                  </span>
                )}
                <VerificationStatusBadge status={finding.verification_status} />
              </div>

              <div className="text-xs text-sentinel-secondary font-mono flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-sentinel-accent" />
                <span>{finding.file_path}:{finding.line_start}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-sentinel-text">
                {finding.title}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {finding.description}
              </p>

              {/* Code Evidence / Secret Masking */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                  <span>Evidence & Context</span>
                  {finding.masked_secret && (
                    <button
                      onClick={() => toggleMask(finding.id)}
                      className="flex items-center gap-1 text-slate-300 hover:text-white"
                    >
                      {showUnmasked[finding.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showUnmasked[finding.id] ? 'Mask Secret' : 'Preview Masked'}</span>
                    </button>
                  )}
                </div>

                <div className="pt-2 text-xs">
                  {finding.masked_secret && !showUnmasked[finding.id] ? (
                    <div>{finding.evidence || finding.code_snippet}</div>
                  ) : (
                    <div>{finding.evidence || finding.code_snippet}</div>
                  )}
                </div>
              </div>

              {/* Remediation Guidance */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    Remediation Guidance
                  </span>
                  <p className="text-xs text-slate-800 mt-0.5">
                    {finding.recommendation || 'Apply parameterized inputs and securely store credentials in external secret vaults.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-sentinel-border flex items-center justify-between">
              <span className="text-[11px] text-sentinel-secondary">
                Rule ID: <code className="font-mono">{finding.rule_id}</code>
              </span>

              <button
                onClick={() => onNavigateToPatch(finding)}
                className="px-4 py-2 rounded-xl bg-sentinel-accent hover:bg-sentinel-accentHover text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <span>Proof & Fix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl border border-sentinel-border">
            <Lock className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-sentinel-text">No Security Vulnerabilities Detected</h3>
            <p className="text-xs text-sentinel-secondary mt-1">
              Deterministic scanners found zero matching secret leaks, SQL injection vectors, or vulnerable dependencies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
