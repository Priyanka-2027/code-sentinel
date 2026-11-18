import React from 'react';
import { Severity, GapLabel, VerificationStatus } from '../../types';

export const SeverityBadge: React.FC<{ severity: Severity; size?: 'sm' | 'md' }> = ({
  severity,
  size = 'md',
}) => {
  const styles: Record<Severity, string> = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    low: 'bg-blue-50 text-blue-700 border-blue-200',
    informational: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center rounded-md border uppercase tracking-wider ${sizeClass} ${styles[severity] || styles.informational}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        severity === 'critical' ? 'bg-red-600' :
        severity === 'high' ? 'bg-amber-600' :
        severity === 'medium' ? 'bg-yellow-600' :
        severity === 'low' ? 'bg-blue-600' : 'bg-slate-600'
      }`} />
      {severity}
    </span>
  );
};

export const GapLabelBadge: React.FC<{ label: GapLabel }> = ({ label }) => {
  const styles: Record<GapLabel, string> = {
    'Confirmed gap': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Potential gap': 'bg-amber-50 text-amber-700 border-amber-200',
    'Needs human review': 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[label] || styles['Needs human review']}`}>
      {label}
    </span>
  );
};

export const VerificationStatusBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  const config: Record<string, { label: string; style: string }> = {
    unverified: { label: 'Unverified', style: 'bg-slate-100 text-slate-600 border-slate-200' },
    proposed: { label: 'Patch Proposed', style: 'bg-blue-50 text-blue-700 border-blue-200' },
    awaiting_approval: { label: 'Awaiting Approval', style: 'bg-amber-50 text-amber-700 border-amber-200' },
    applied_in_sandbox: { label: 'Applied in Sandbox', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    sandbox_verified: { label: 'Verified in Sandbox', style: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    verified: { label: 'Verified & Safe', style: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    failed: { label: 'Verification Failed', style: 'bg-rose-50 text-rose-700 border-rose-200' },
    needs_manual_review: { label: 'Needs Manual Review', style: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  };

  const item = config[status] || config.unverified;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {item.label}
    </span>
  );
};
