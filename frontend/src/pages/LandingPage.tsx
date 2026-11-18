import React from 'react';
import {
  Shield,
  ArrowRight,
  SearchCode,
  Sparkles,
  Network,
  CheckCircle2,
  FileCheck,
  Terminal,
  Cpu,
  Layers,
  Lock,
  ExternalLink
} from 'lucide-react';
import { DottedNetworkBackground } from '../components/DottedNetworkBackground';

interface LandingPageProps {
  onStart: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onExploreDemo }) => {
  return (
    <div className="relative min-h-screen bg-transparent overflow-hidden flex flex-col justify-between">
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        {/* Top Tag */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-sentinel-border shadow-subtle backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-sentinel-accent animate-pulse" />
            <span className="text-xs font-semibold text-sentinel-text">
              Architecture-Agnostic Engineering Intelligence
            </span>
            <span className="text-xs text-sentinel-secondary">&bull; Hackathon Edition</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mt-8 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-sentinel-text leading-[1.15]">
            Your Codebase Has Problems <br className="hidden sm:inline" />
            <span className="text-sentinel-accent underline decoration-blue-200 decoration-wavy decoration-2">
              You Haven't Discovered Yet.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-sentinel-secondary max-w-2xl mx-auto leading-relaxed">
            An architecture-agnostic engineering intelligence platform that detects security risks, unnecessary code, missing implementation, and unfinished engineering work.
          </p>

          {/* Tagline */}
          <div className="mt-4 text-sm font-semibold text-sentinel-teal tracking-wide">
            "Find what is wrong. Discover what is missing. Prove the fix works."
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-sentinel-accent hover:bg-sentinel-accentHover text-white font-semibold text-sm shadow-subtle hover:shadow-elevated transition-all flex items-center justify-center gap-2 group"
            >
              <span>Analyze Your Repository</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-sentinel-text font-semibold text-sm border border-sentinel-border shadow-subtle transition-all flex items-center justify-center gap-2"
            >
              <Cpu className="w-4 h-4 text-sentinel-teal" />
              <span>Launch Live OmniBank Demo</span>
            </button>
          </div>
        </div>

        {/* Floating Software Analysis Preview Card */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-sentinel-border shadow-elevated p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sentinel-border gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sentinel-softBlue flex items-center justify-center text-sentinel-accent font-bold">
                  CS
                </div>
                <div>
                  <h3 className="text-sm font-bold text-sentinel-text">Live Audit Stream</h3>
                  <p className="text-xs text-sentinel-secondary">Multi-agent symbolic code auditor</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  Missingness Intelligence Active
                </span>
                <span className="px-2.5 py-1 rounded-md bg-sentinel-softBlue text-sentinel-accent border border-blue-200 text-xs font-semibold">
                  Zero False Fluff
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-sentinel-bg border border-sentinel-border">
                <div className="flex items-center gap-2 text-xs font-bold text-sentinel-accent mb-1">
                  <SearchCode className="w-4 h-4" />
                  <span>Missingness Intelligence</span>
                </div>
                <div className="text-sm font-bold text-sentinel-text mt-2">
                  Unauthenticated Sensitive Endpoint
                </div>
                <p className="text-xs text-sentinel-secondary mt-1">
                  Discovered <code className="text-rose-600 bg-red-50 px-1 py-0.5 rounded">POST /api/v1/transfer</code> mutating funds with zero identity check.
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                  <span>Confidence: 94%</span>
                  <span>Confirmed Gap</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sentinel-bg border border-sentinel-border">
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
                  <Lock className="w-4 h-4" />
                  <span>Security Intelligence</span>
                </div>
                <div className="text-sm font-bold text-sentinel-text mt-2">
                  SQL Injection & Secret Exposure
                </div>
                <p className="text-xs text-sentinel-secondary mt-1">
                  Detected raw dynamic string execution & masked API key <code className="text-slate-700 font-mono">sk_live_***847</code>.
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded">
                  <span>CWE-89 & CWE-798</span>
                  <span>Critical Risk</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sentinel-bg border border-sentinel-border">
                <div className="flex items-center gap-2 text-xs font-bold text-sentinel-teal mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proof Before Fix</span>
                </div>
                <div className="text-sm font-bold text-sentinel-text mt-2">
                  Automated Sandbox Verification
                </div>
                <p className="text-xs text-sentinel-secondary mt-1">
                  Proposed patch verified in isolated workspace: compilation clean, regression tests passed.
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-sentinel-teal bg-teal-50 px-2.5 py-1 rounded">
                  <span>Re-check Passed</span>
                  <span>Verified Safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Core Pillars Section */}
        <div className="mt-24">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sentinel-accent">
              Core Capabilities
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-sentinel-text">
              Engineering Intelligence, Not Just Pattern Matching
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-sentinel-border shadow-subtle hover:shadow-elevated transition-all">
              <div className="w-10 h-10 rounded-xl bg-sentinel-softBlue text-sentinel-accent flex items-center justify-center mb-4">
                <SearchCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-sentinel-text">Missingness Intelligence</h3>
              <p className="text-xs text-sentinel-secondary mt-2 leading-relaxed">
                Investigates what SHOULD exist but DOES NOT exist: omitted authentication, missing input validation schemas, absent error handling, missing unit tests, and documentation mismatches.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sentinel-border shadow-subtle hover:shadow-elevated transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-sentinel-text">Deterministic Security</h3>
              <p className="text-xs text-sentinel-secondary mt-2 leading-relaxed">
                AST-backed discovery of SQL injection, shell commands, vulnerable dependencies, and hardcoded secrets with mandatory automated value masking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sentinel-border shadow-subtle hover:shadow-elevated transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-sentinel-text">Cross-Issue Risk Correlation</h3>
              <p className="text-xs text-sentinel-secondary mt-2 leading-relaxed">
                Connects related issues into interactive workflow graphs. Identifies compounded vulnerabilities when an endpoint lacks validation, uses dynamic SQL, and has zero tests.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sentinel-border shadow-subtle hover:shadow-elevated transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-sentinel-text">Code Slop Detection</h3>
              <p className="text-xs text-sentinel-secondary mt-2 leading-relaxed">
                Identifies unused imports, empty placeholder functions, circular couplings, and excessive cyclomatic complexity that inflate cognitive load.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sentinel-border shadow-subtle hover:shadow-elevated transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-sentinel-text">Proof Before Fix</h3>
              <p className="text-xs text-sentinel-secondary mt-2 leading-relaxed">
                Generates context-aware unified diff patches and executes safe isolated sandbox verification. Runs compilation, re-scans, and regression tests before approving.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sentinel-border shadow-subtle hover:shadow-elevated transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-sentinel-text">Actionable Audit Reports</h3>
              <p className="text-xs text-sentinel-secondary mt-2 leading-relaxed">
                Generates downloadable structured JSON and printable executive HTML audit reports containing health ratings, risk matrices, and remediation logs.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Step Workflow */}
        <div className="mt-24 p-8 rounded-2xl bg-white border border-sentinel-border shadow-subtle">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-xl font-bold text-sentinel-text">Autonomous 3-Step Workflow</h3>
            <p className="text-xs text-sentinel-secondary mt-1">From code ingestion to verified engineering resolution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-sentinel-softBlue text-sentinel-accent font-extrabold flex items-center justify-center text-lg mb-3">
                1
              </div>
              <h4 className="text-sm font-bold text-sentinel-text">Connect Repository</h4>
              <p className="text-xs text-sentinel-secondary mt-1">
                Provide a GitHub repository URL, upload a ZIP archive, or launch our pre-seeded OmniBank demo.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-sentinel-softBlue text-sentinel-accent font-extrabold flex items-center justify-center text-lg mb-3">
                2
              </div>
              <h4 className="text-sm font-bold text-sentinel-text">Autonomous Multi-Agent Audit</h4>
              <p className="text-xs text-sentinel-secondary mt-1">
                Watch 10 distinct audit stages execute live, discovering security vulnerabilities, missing safeguards, and slop.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-sentinel-softBlue text-sentinel-accent font-extrabold flex items-center justify-center text-lg mb-3">
                3
              </div>
              <h4 className="text-sm font-bold text-sentinel-text">Verify Proof & Export Report</h4>
              <p className="text-xs text-sentinel-secondary mt-1">
                Review correlated risk graphs, verify proposed code patches in sandbox test runners, and export audit artifacts.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Compatibility */}
        <div className="mt-20 text-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sentinel-secondary mb-6">
            Supported Languages & Architecture Adapters
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'C++'].map((lang) => (
              <span
                key={lang}
                className="px-4 py-2 rounded-xl bg-white border border-sentinel-border text-xs font-semibold text-sentinel-text shadow-subtle hover:border-blue-300 transition-colors"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-center">
          <h3 className="text-2xl font-bold text-sentinel-text">Ready to Audit Your Engineering Health?</h3>
          <p className="text-sm text-sentinel-secondary mt-2 max-w-xl mx-auto">
            Run Code Sentinel on your repository or launch the demo microservice instantly without external credentials.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={onStart}
              className="px-6 py-3 rounded-xl bg-sentinel-accent hover:bg-sentinel-accentHover text-white font-semibold text-sm shadow-subtle transition-all"
            >
              Start Analysis Now
            </button>
            <button
              onClick={onExploreDemo}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-sentinel-text font-semibold text-sm border border-sentinel-border shadow-subtle transition-all"
            >
              Try Demo Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
