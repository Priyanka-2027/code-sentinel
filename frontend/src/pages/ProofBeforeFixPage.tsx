import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  FileCode,
  ShieldCheck,
  AlertCircle,
  Play,
  RotateCcw,
  Terminal,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SeverityBadge, VerificationStatusBadge } from '../components/common/SeverityBadge';
import { api } from '../services/api';
import { PatchProposal, Finding, Scan } from '../types';

interface ProofBeforeFixPageProps {
  scan: Scan;
  findings: Finding[];
  initialFinding?: Finding | null;
  onRefreshData: () => void;
}

export const ProofBeforeFixPage: React.FC<ProofBeforeFixPageProps> = ({
  scan,
  findings,
  initialFinding,
  onRefreshData,
}) => {
  const [patches, setPatches] = useState<PatchProposal[]>([]);
  const [selectedPatch, setSelectedPatch] = useState<PatchProposal | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load patches for this scan
  const loadPatches = async () => {
    try {
      setLoading(true);
      const data = await api.getScanPatches(scan.id);
      setPatches(data);

      if (initialFinding) {
        const matching = data.find((p) => p.finding_id === initialFinding.id);
        if (matching) {
          setSelectedPatch(matching);
        } else {
          // Generate on demand
          const newPatch = await api.generatePatch(initialFinding.id);
          setPatches((prev) => [newPatch, ...prev]);
          setSelectedPatch(newPatch);
        }
      } else if (data.length > 0 && !selectedPatch) {
        setSelectedPatch(data[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load patches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatches();
  }, [scan.id]);

  // Execute Sandbox Verification
  const handleVerifyInSandbox = async () => {
    if (!selectedPatch) return;

    try {
      setVerifying(true);
      setError(null);
      const updated = await api.verifyPatchInSandbox(selectedPatch.id, true);

      setSelectedPatch(updated);
      setPatches((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      onRefreshData();

      if (updated.status === 'verified') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#16A085', '#315EF5', '#10B981']
        });
      }
    } catch (err: any) {
      setError(err.message || 'Verification execution failed');
    } finally {
      setVerifying(false);
    }
  };

  const currentFinding = findings.find((f) => f.id === selectedPatch?.finding_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-sentinel-border p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Isolated Sandbox Execution Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-sentinel-text">
            Proof Before Fix — Verification Pipeline
          </h1>
          <p className="text-xs text-sentinel-secondary mt-1">
            Zero speculation. We generate contextual patch proposals, apply them in isolated workspaces, compile, and re-run test suites.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-extrabold text-emerald-600">
            {patches.filter((p) => p.status === 'verified').length} / {patches.length}
          </div>
          <span className="text-[11px] text-sentinel-secondary font-semibold uppercase tracking-wider">
            Verified In Sandbox
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Layout: Master Patches List & Detailed Diff Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Proposals Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-sentinel-secondary uppercase tracking-wider px-1">
            Available Patch Proposals ({patches.length})
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {patches.map((patch) => {
              const f = findings.find((x) => x.id === patch.finding_id);
              const isSelected = selectedPatch?.id === patch.id;

              return (
                <div
                  key={patch.id}
                  onClick={() => setSelectedPatch(patch)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-sentinel-accent shadow-elevated ring-2 ring-blue-100'
                      : 'bg-white border-sentinel-border hover:border-slate-300 shadow-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    {f?.severity && <SeverityBadge severity={f.severity} size="sm" />}
                    <VerificationStatusBadge status={patch.status} />
                  </div>

                  <h4 className="text-xs font-bold text-sentinel-text">
                    {f?.title || `Patch for ${patch.file_path}`}
                  </h4>

                  <div className="text-[11px] text-sentinel-secondary font-mono mt-1.5 truncate">
                    {patch.file_path}
                  </div>
                </div>
              );
            })}

            {patches.length === 0 && !loading && (
              <div className="p-8 text-center bg-white rounded-xl border border-sentinel-border text-xs text-sentinel-secondary">
                No patches proposed yet. Select an issue from Missingness or Security to generate one.
              </div>
            )}
          </div>
        </div>

        {/* Right: Code Diff & Verification Execution */}
        <div className="lg:col-span-8">
          {selectedPatch ? (
            <div className="bg-white rounded-2xl border border-sentinel-border shadow-subtle p-6 space-y-6">
              {/* Target Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sentinel-border gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-0.5 rounded text-slate-700">
                      Target: {selectedPatch.file_path}
                    </span>
                    <VerificationStatusBadge status={selectedPatch.status} />
                  </div>
                  <h3 className="text-base font-bold text-sentinel-text">
                    {currentFinding?.title || 'Proposed Remediation Patch'}
                  </h3>
                </div>

                <button
                  disabled={verifying}
                  onClick={handleVerifyInSandbox}
                  className="px-5 py-2.5 rounded-xl bg-sentinel-accent hover:bg-sentinel-accentHover disabled:opacity-50 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Running Sandbox Tests...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Apply & Verify in Sandbox</span>
                    </>
                  )}
                </button>
              </div>

              {/* Rationale Explanation */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-800 leading-relaxed">
                <span className="font-bold text-sentinel-accent block mb-1">Patch Rationale:</span>
                {selectedPatch.explanation}
              </div>

              {/* Unified Diff View */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-sentinel-secondary mb-2">
                  <span>Unified Patch Diff</span>
                  <span className="text-[11px] font-mono text-slate-400">Isolated Workspace Replica</span>
                </div>

                <div className="rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto p-4 max-h-80 leading-relaxed">
                  {selectedPatch.diff_unified ? (
                    selectedPatch.diff_unified.split('\n').map((line, idx) => {
                      const isAdd = line.startsWith('+') && !line.startsWith('+++');
                      const isDel = line.startsWith('-') && !line.startsWith('---');
                      const isHunk = line.startsWith('@@');

                      return (
                        <div
                          key={idx}
                          className={`${
                            isAdd
                              ? 'bg-emerald-950/70 text-emerald-300'
                              : isDel
                              ? 'bg-rose-950/70 text-rose-300'
                              : isHunk
                              ? 'text-cyan-400 font-bold'
                              : 'text-slate-300'
                          }`}
                        >
                          {line || ' '}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-slate-400">
                      Original: {selectedPatch.original_code} <br />
                      Proposed: {selectedPatch.proposed_code}
                    </div>
                  )}
                </div>
              </div>

              {/* Before vs After Verification Matrix */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-red-50/50 border border-red-100">
                  <div className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">
                    Before Fix (Production Code)
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-700">
                    <li className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>Security/Missingness Violation Active</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>Untested / Open Attack Surface</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                    After Sandbox Execution
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-700">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>AST Syntax & Compilation Clean</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Security & Missingness Re-check Passed</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Sandbox Logs Terminal */}
              {selectedPatch.sandbox_log && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sentinel-secondary uppercase tracking-wider mb-2">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Isolated Sandbox Execution Log</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {selectedPatch.sandbox_log}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-sentinel-border p-12 text-center">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-sentinel-text">Select a Proposed Patch</h3>
              <p className="text-xs text-sentinel-secondary mt-1">
                Choose an item on the left to review unified diffs and execute isolated sandbox testing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
