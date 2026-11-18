import React from 'react';
import {
  ShieldAlert,
  SearchCode,
  Sparkles,
  SlidersHorizontal,
  Network,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  GitBranch,
  Calendar,
  AlertTriangle,
  Code2,
  FileText
} from 'lucide-react';
import { HealthScoreGauge } from '../components/common/HealthScoreGauge';
import { SeverityBadge, GapLabelBadge } from '../components/common/SeverityBadge';
import { Repository, Scan, Finding, RiskRelationship } from '../types';

interface DashboardPageProps {
  repo: Repository;
  scan: Scan;
  findings: Finding[];
  relationships: RiskRelationship[];
  onNavigate: (view: string) => void;
  onRescan: () => void;
  onSelectFinding: (finding: Finding) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  repo,
  scan,
  findings,
  relationships,
  onNavigate,
  onRescan,
  onSelectFinding,
}) => {
  const issuesSummary = scan.issues_summary || {};
  const categories = issuesSummary.categories || {};

  const criticalCount = findings.filter((f) => f.severity === 'critical').length;
  const highCount = findings.filter((f) => f.severity === 'high').length;
  const mediumCount = findings.filter((f) => f.severity === 'medium').length;
  const lowCount = findings.filter((f) => f.severity === 'low').length;

  const missingnessFindings = findings.filter((f) => f.category === 'missingness');
  const securityFindings = findings.filter((f) => f.category === 'security');

  const highestPriorityIssues = [...findings]
    .sort((a, b) => {
      const order: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1, informational: 0 };
      return (order[b.severity] || 0) - (order[a.severity] || 0);
    })
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-sentinel-border shadow-subtle p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-sentinel-text">
              {repo.name}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {repo.source_type}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-sentinel-secondary">
            <span className="flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5" />
              <span>{repo.branch}</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Scanned {scan.completed_at ? new Date(scan.completed_at).toLocaleTimeString() : 'Just now'}</span>
            </span>
            <span>&bull;</span>
            <span>{scan.files_analyzed} Files ({scan.lines_of_code} LOC)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2.5 rounded-xl border border-sentinel-border hover:bg-slate-50 text-sentinel-text text-xs font-semibold shadow-subtle transition-all flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5 text-sentinel-secondary" />
            <span>Export Audit</span>
          </button>
          <button
            onClick={onRescan}
            className="px-4 py-2.5 rounded-xl bg-sentinel-accent hover:bg-sentinel-accentHover text-white text-xs font-semibold shadow-subtle transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-scan Repository</span>
          </button>
        </div>
      </div>

      {/* Health Score & High Priority Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <div className="bg-white rounded-2xl border border-sentinel-border shadow-subtle p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-sentinel-secondary uppercase tracking-wider mb-4">
              Engineering Health Score
            </h3>
            <HealthScoreGauge score={scan.health_score} size="lg" />
          </div>

          <div className="mt-6 pt-4 border-t border-sentinel-border grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-sentinel-bg">
              <span className="text-sentinel-secondary text-[11px]">Critical Violations</span>
              <div className="text-sm font-bold text-red-600 mt-0.5">{criticalCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-sentinel-bg">
              <span className="text-sentinel-secondary text-[11px]">Compounded Risks</span>
              <div className="text-sm font-bold text-purple-600 mt-0.5">{relationships.length}</div>
            </div>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white rounded-2xl border border-sentinel-border shadow-subtle p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-sentinel-secondary uppercase tracking-wider mb-4">
              Severity Distribution
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-red-700">Critical ({criticalCount})</span>
                  <span className="text-slate-500 font-mono">
                    {findings.length > 0 ? Math.round((criticalCount / findings.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{ width: `${findings.length > 0 ? (criticalCount / findings.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700">High ({highCount})</span>
                  <span className="text-slate-500 font-mono">
                    {findings.length > 0 ? Math.round((highCount / findings.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${findings.length > 0 ? (highCount / findings.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-yellow-700">Medium ({mediumCount})</span>
                  <span className="text-slate-500 font-mono">
                    {findings.length > 0 ? Math.round((mediumCount / findings.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${findings.length > 0 ? (mediumCount / findings.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-blue-700">Low & Info ({lowCount})</span>
                  <span className="text-slate-500 font-mono">
                    {findings.length > 0 ? Math.round((lowCount / findings.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${findings.length > 0 ? (lowCount / findings.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-sentinel-border text-xs text-sentinel-secondary flex items-center justify-between">
            <span>Total Discovered Issues</span>
            <span className="font-bold text-sentinel-text text-sm">{findings.length} findings</span>
          </div>
        </div>

        {/* Languages Breakdown */}
        <div className="bg-white rounded-2xl border border-sentinel-border shadow-subtle p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-sentinel-secondary uppercase tracking-wider mb-4">
              Language Composition
            </h3>
            <div className="space-y-3">
              {Object.entries(scan.languages || {}).map(([lang, pct]) => (
                <div key={lang}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-sentinel-text">{lang}</span>
                    <span className="text-sentinel-secondary font-mono">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sentinel-accent rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-sentinel-border flex items-center justify-between text-xs">
            <span className="text-sentinel-secondary">Coverage</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              AST Symbolic IR Active
            </span>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Missingness Card - Signature! */}
        <div
          onClick={() => onNavigate('missingness')}
          className="p-5 rounded-2xl bg-white border-2 border-sentinel-softBlue hover:border-sentinel-accent cursor-pointer shadow-subtle transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-sentinel-softBlue text-sentinel-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <SearchCode className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-sentinel-accent">
              Signature
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-sentinel-text">
              {categories.missingness || missingnessFindings.length}
            </div>
            <h4 className="text-xs font-bold text-sentinel-text mt-0.5">Missing Safeguards</h4>
            <p className="text-[11px] text-sentinel-secondary mt-1">
              Omitted auth, input validation, tests & error handling
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-sentinel-accent gap-1 group-hover:translate-x-1 transition-transform">
            <span>Explore Missingness</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Security Card */}
        <div
          onClick={() => onNavigate('security')}
          className="p-5 rounded-2xl bg-white border border-sentinel-border hover:border-red-300 cursor-pointer shadow-subtle transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-sentinel-text">
              {categories.security || securityFindings.length}
            </div>
            <h4 className="text-xs font-bold text-sentinel-text mt-0.5">Security Vulnerabilities</h4>
            <p className="text-[11px] text-sentinel-secondary mt-1">
              Masked secrets, SQL injections, CVE advisories
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-red-600 gap-1 group-hover:translate-x-1 transition-transform">
            <span>View Security Findings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Code Quality Card */}
        <div
          onClick={() => onNavigate('quality')}
          className="p-5 rounded-2xl bg-white border border-sentinel-border hover:border-amber-300 cursor-pointer shadow-subtle transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-sentinel-text">
              {categories.quality || 0}
            </div>
            <h4 className="text-xs font-bold text-sentinel-text mt-0.5">Code Slop & Bloat</h4>
            <p className="text-[11px] text-sentinel-secondary mt-1">
              Unused imports, high complexity, empty stubs
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-600 gap-1 group-hover:translate-x-1 transition-transform">
            <span>View Quality Gaps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Loose Ends Card */}
        <div
          onClick={() => onNavigate('loose_ends')}
          className="p-5 rounded-2xl bg-white border border-sentinel-border hover:border-slate-400 cursor-pointer shadow-subtle transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-sentinel-text">
              {categories.loose_end || 0}
            </div>
            <h4 className="text-xs font-bold text-sentinel-text mt-0.5">Loose Ends & Debt</h4>
            <p className="text-[11px] text-sentinel-secondary mt-1">
              TODOs, FIXME markers, swallowed exceptions
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-slate-700 gap-1 group-hover:translate-x-1 transition-transform">
            <span>View Loose Ends</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Cross-Issue Risk Clusters & Top Priority Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Clusters */}
        <div className="bg-white rounded-2xl border border-sentinel-border shadow-subtle p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-sentinel-text">
                Correlated Risk Clusters ({relationships.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('risks')}
              className="text-xs text-sentinel-accent font-semibold hover:underline"
            >
              Open Interactive Graph &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {relationships.slice(0, 3).map((r) => (
              <div
                key={r.id}
                onClick={() => onNavigate('risks')}
                className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 hover:border-purple-300 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-900">{r.cluster_name}</span>
                  <SeverityBadge severity={r.severity} size="sm" />
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                  {r.narrative.split('\n')[0]}
                </p>
                <div className="mt-2 text-[10px] font-bold text-purple-700 uppercase tracking-wide">
                  Workflow: {r.affected_workflow}
                </div>
              </div>
            ))}

            {relationships.length === 0 && (
              <p className="text-xs text-sentinel-secondary py-4 text-center">
                No multi-issue risk clusters detected.
              </p>
            )}
          </div>
        </div>

        {/* Highest Priority Issues */}
        <div className="bg-white rounded-2xl border border-sentinel-border shadow-subtle p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-sentinel-text">
                Highest Priority Engineering Issues
              </h3>
            </div>
            <span className="text-xs text-sentinel-secondary font-mono">
              Top 5 Critical / High
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {highestPriorityIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => {
                  onSelectFinding(issue);
                  if (issue.category === 'missingness') onNavigate('missingness');
                  else if (issue.category === 'security') onNavigate('security');
                  else if (issue.category === 'quality') onNavigate('quality');
                  else onNavigate('loose_ends');
                }}
                className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/80 rounded-lg px-2 -mx-2 cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-sentinel-text hover:text-sentinel-accent">
                      {issue.title}
                    </span>
                    {issue.gap_label && <GapLabelBadge label={issue.gap_label} />}
                  </div>
                  <div className="text-[11px] text-sentinel-secondary font-mono mt-0.5">
                    {issue.file_path}:{issue.line_start}
                  </div>
                </div>
                <SeverityBadge severity={issue.severity} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
