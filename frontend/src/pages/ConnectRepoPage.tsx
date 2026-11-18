import React, { useState } from 'react';
import {
  GitBranch,
  UploadCloud,
  FileCode,
  ArrowRight,
  AlertCircle,
  Cpu,
  CheckCircle,
  FolderArchive,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Repository } from '../types';

interface ConnectRepoPageProps {
  onRepoConnected: (repo: Repository, autoScan?: boolean) => void;
  repositories: Repository[];
}

export const ConnectRepoPage: React.FC<ConnectRepoPageProps> = ({
  onRepoConnected,
  repositories,
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'github' | 'zip'>('demo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GitHub Form
  const [repoName, setRepoName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [branch, setBranch] = useState('main');

  // ZIP Form
  const [zipName, setZipName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle Demo Load
  const handleLoadDemo = async (demoType: 'omnibank' | 'clean') => {
    try {
      setLoading(true);
      setError(null);
      const repo = await api.loadDemoRepo(demoType);
      onRepoConnected(repo, true);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo repository');
    } finally {
      setLoading(false);
    }
  };

  // Handle GitHub Connect
  const handleConnectGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      setError('Please provide a valid GitHub repository URL.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const repo = await api.connectGithub(repoName.trim(), githubUrl.trim(), branch.trim());
      onRepoConnected(repo, true);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to GitHub repository.');
    } finally {
      setLoading(false);
    }
  };

  // Handle ZIP Upload
  const handleUploadZip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a .zip archive to upload.');
      return;
    }
    const name = zipName.trim() || selectedFile.name.replace('.zip', '');

    try {
      setLoading(true);
      setError(null);
      const repo = await api.uploadZip(name, 'Uploaded ZIP repository', selectedFile);
      onRepoConnected(repo, true);
    } catch (err: any) {
      setError(err.message || 'Failed to upload and extract ZIP repository.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-sentinel-text">
          Connect Your Codebase
        </h2>
        <p className="mt-2 text-sm text-sentinel-secondary max-w-xl mx-auto">
          Choose a repository ingestion source to run the autonomous engineering audit.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Connection Error</div>
            <p className="mt-0.5 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-sentinel-border mb-8">
        <button
          onClick={() => { setActiveTab('demo'); setError(null); }}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === 'demo'
              ? 'border-sentinel-accent text-sentinel-accent'
              : 'border-transparent text-sentinel-secondary hover:text-sentinel-text'
          }`}
        >
          <Cpu className="w-4 h-4 text-sentinel-teal" />
          <span>Instant Demo Repositories (Judge Recommended)</span>
        </button>

        <button
          onClick={() => { setActiveTab('github'); setError(null); }}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === 'github'
              ? 'border-sentinel-accent text-sentinel-accent'
              : 'border-transparent text-sentinel-secondary hover:text-sentinel-text'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Public Git / GitHub URL</span>
        </button>

        <button
          onClick={() => { setActiveTab('zip'); setError(null); }}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === 'zip'
              ? 'border-sentinel-accent text-sentinel-accent'
              : 'border-transparent text-sentinel-secondary hover:text-sentinel-text'
          }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>ZIP Archive Upload</span>
        </button>
      </div>

      {/* TAB 1: Instant Demo Mode */}
      {activeTab === 'demo' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-sentinel-border shadow-subtle hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                <span>Vulnerable Microservice</span>
                <span>&bull; Full Flaw Suite</span>
              </div>
              <h3 className="text-base font-bold text-sentinel-text">
                OmniBank Microservices Platform
              </h3>
              <p className="text-xs text-sentinel-secondary max-w-lg leading-relaxed">
                Contains authentic Python/FastAPI payment router code with hardcoded live stripe secrets, unauthenticated admin deletes, SQL injection via concatenation, swallowed errors, and missing tests.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">POST /api/v1/transfer</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">DELETE /api/v1/admin/users</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">cve-2023-32681</span>
              </div>
            </div>

            <button
              disabled={loading}
              onClick={() => handleLoadDemo('omnibank')}
              className="flex-shrink-0 px-5 py-3 rounded-xl bg-sentinel-accent hover:bg-sentinel-accentHover disabled:opacity-50 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Load & Audit OmniBank</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-sentinel-border shadow-subtle hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <span>Hardened Reference Service</span>
                <span>&bull; Clean Architecture</span>
              </div>
              <h3 className="text-base font-bold text-sentinel-text">
                CleanCore Reference Service
              </h3>
              <p className="text-xs text-sentinel-secondary max-w-lg leading-relaxed">
                Hardened microservice implementing Pydantic schema validation, JWT auth dependencies, parameterized SQL, and complete automated tests. Score rating ~98/100.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">Zero Critical CVEs</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">100% Tested Routes</span>
              </div>
            </div>

            <button
              disabled={loading}
              onClick={() => handleLoadDemo('clean')}
              className="flex-shrink-0 px-5 py-3 rounded-xl bg-sentinel-teal hover:bg-sentinel-tealHover disabled:opacity-50 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Load & Audit CleanCore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: GitHub URL */}
      {activeTab === 'github' && (
        <form onSubmit={handleConnectGithub} className="bg-white p-6 sm:p-8 rounded-2xl border border-sentinel-border shadow-subtle space-y-5">
          <div>
            <label className="block text-xs font-bold text-sentinel-text uppercase tracking-wider mb-1.5">
              Repository URL (Public GitHub)
            </label>
            <input
              type="url"
              placeholder="https://github.com/username/repository"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-sentinel-border text-xs text-sentinel-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sentinel-accent"
            />
            <p className="text-[11px] text-sentinel-secondary mt-1">
              Public repositories are ingested with shallow depth without requiring personal access tokens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-sentinel-text uppercase tracking-wider mb-1.5">
                Display Name (Optional)
              </label>
              <input
                type="text"
                placeholder="My Project"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sentinel-border text-xs text-sentinel-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sentinel-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-sentinel-text uppercase tracking-wider mb-1.5">
                Target Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sentinel-border text-xs text-sentinel-text focus:outline-none focus:ring-2 focus:ring-sentinel-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-sentinel-accent hover:bg-sentinel-accentHover disabled:opacity-50 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Clone & Ingest Repository</span>}
          </button>
        </form>
      )}

      {/* TAB 3: ZIP Upload */}
      {activeTab === 'zip' && (
        <form onSubmit={handleUploadZip} className="bg-white p-6 sm:p-8 rounded-2xl border border-sentinel-border shadow-subtle space-y-5">
          <div>
            <label className="block text-xs font-bold text-sentinel-text uppercase tracking-wider mb-1.5">
              Repository Name
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Backend Services"
              value={zipName}
              onChange={(e) => setZipName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-sentinel-border text-xs text-sentinel-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sentinel-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sentinel-text uppercase tracking-wider mb-1.5">
              Select ZIP Archive (Max 50MB)
            </label>
            <div className="border-2 border-dashed border-sentinel-border hover:border-sentinel-accent rounded-2xl p-8 text-center transition-colors">
              <UploadCloud className="w-10 h-10 text-sentinel-secondary mx-auto mb-2" />
              <input
                type="file"
                accept=".zip"
                id="zip-upload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              <label
                htmlFor="zip-upload"
                className="inline-block px-4 py-2 rounded-lg bg-sentinel-softBlue text-sentinel-accent font-semibold text-xs cursor-pointer hover:bg-blue-100"
              >
                Choose File
              </label>
              {selectedFile ? (
                <p className="text-xs font-bold text-sentinel-text mt-2">
                  Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                </p>
              ) : (
                <p className="text-xs text-sentinel-secondary mt-2">
                  ZipSlip protected. Archives are decompressed in restricted temporary workspaces.
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full py-3 rounded-xl bg-sentinel-accent hover:bg-sentinel-accentHover disabled:opacity-50 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Upload & Ingest Repository</span>}
          </button>
        </form>
      )}

      {/* Previously Connected Repositories */}
      {repositories.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xs font-bold text-sentinel-secondary uppercase tracking-wider mb-3">
            Existing Connected Repositories ({repositories.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {repositories.map((r) => (
              <div
                key={r.id}
                onClick={() => onRepoConnected(r, false)}
                className="p-4 rounded-xl bg-white border border-sentinel-border shadow-subtle hover:border-blue-300 cursor-pointer flex items-center justify-between transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-sentinel-text">{r.name}</h4>
                  <p className="text-[11px] text-sentinel-secondary mt-0.5">
                    Source: {r.source_type} &bull; {r.branch}
                  </p>
                </div>
                {r.latest_health_score !== undefined && r.latest_health_score !== null && (
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                    r.latest_health_score >= 80 ? 'bg-emerald-50 text-emerald-700' :
                    r.latest_health_score >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {Math.round(r.latest_health_score)}/100
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
