import React from 'react';
import { Shield, Sparkles, Plus, Terminal, GitBranch, BookOpen } from 'lucide-react';
import { Repository } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  selectedRepo: Repository | null;
  repositories: Repository[];
  onSelectRepo: (repo: Repository) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  selectedRepo,
  repositories,
  onSelectRepo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sentinel-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-sentinel-softBlue border border-blue-200/60 flex items-center justify-center text-sentinel-accent shadow-sm group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 fill-sentinel-accent/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-sentinel-text">
                CODE <span className="text-sentinel-accent">SENTINEL</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sentinel-softBlue text-sentinel-accent border border-blue-200">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-sentinel-secondary hidden sm:block">
              Architecture-Agnostic Autonomous Engineering Auditor
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              currentView === 'landing'
                ? 'text-sentinel-accent bg-sentinel-softBlue'
                : 'text-sentinel-secondary hover:text-sentinel-text hover:bg-slate-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              currentView !== 'landing' && currentView !== 'connect'
                ? 'text-sentinel-accent bg-sentinel-softBlue'
                : 'text-sentinel-secondary hover:text-sentinel-text hover:bg-slate-50'
            }`}
          >
            Audit Workspace
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Active Repo Selector */}
          {repositories.length > 0 && (
            <div className="relative">
              <select
                value={selectedRepo?.id || ''}
                onChange={(e) => {
                  const r = repositories.find((x) => x.id === e.target.value);
                  if (r) {
                    onSelectRepo(r);
                    onNavigate('dashboard');
                  }
                }}
                className="text-xs bg-slate-50 hover:bg-slate-100 border border-sentinel-border rounded-lg px-2.5 py-1.5 pr-8 font-medium text-sentinel-text cursor-pointer focus:outline-none focus:ring-2 focus:ring-sentinel-accent"
              >
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.name.length > 24 ? repo.name.substring(0, 24) + '...' : repo.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* New Scan CTA */}
          <button
            onClick={() => onNavigate('connect')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-sentinel-accent hover:bg-sentinel-accentHover text-white shadow-sm transition-all hover:shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Repository</span>
          </button>
        </div>
      </div>
    </header>
  );
};
