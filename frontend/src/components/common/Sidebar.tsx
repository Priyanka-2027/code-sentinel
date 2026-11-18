import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  ShieldAlert,
  Sparkles,
  SearchCode,
  CheckCircle2,
  Network,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  counts?: {
    security?: number;
    missingness?: number;
    quality?: number;
    loose_ends?: number;
    risks?: number;
    verified?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  counts = {},
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'connect',
      label: 'Repositories',
      icon: FolderGit2,
    },
    {
      id: 'missingness',
      label: 'Missingness Intelligence',
      icon: SearchCode,
      badge: counts.missingness,
      badgeColor: 'bg-sentinel-softBlue text-sentinel-accent border-blue-200',
      isSignature: true,
    },
    {
      id: 'security',
      label: 'Security Intelligence',
      icon: ShieldAlert,
      badge: counts.security,
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
    },
    {
      id: 'quality',
      label: 'Code Quality & Slop',
      icon: Sparkles,
      badge: counts.quality,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'loose_ends',
      label: 'Loose-End Detector',
      icon: SlidersHorizontal,
      badge: counts.loose_ends,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      id: 'risks',
      label: 'Risk Relationships',
      icon: Network,
      badge: counts.risks,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'patches',
      label: 'Proof Before Fix',
      icon: CheckCircle2,
      badge: counts.verified,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'reports',
      label: 'Audit Reports',
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-sentinel-border min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-sentinel-secondary uppercase tracking-wider">
            Analysis Engines
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sentinel-softBlue text-sentinel-accent shadow-sm'
                      : 'text-sentinel-text hover:bg-slate-50 hover:text-sentinel-accent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sentinel-accent' : 'text-sentinel-secondary'}`} />
                    <span className={item.isSignature ? 'font-bold' : ''}>
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.isSignature && (
                      <span className="text-[9px] font-extrabold uppercase px-1 rounded bg-blue-100 text-sentinel-accent">
                        Signature
                      </span>
                    )}
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-sentinel-border">
        <div className="p-3 rounded-xl bg-sentinel-bg border border-sentinel-border text-xs text-sentinel-secondary">
          <div className="flex items-center gap-1.5 text-sentinel-text font-bold mb-1">
            <Cpu className="w-3.5 h-3.5 text-sentinel-accent" />
            <span>Deterministic Auditor</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            AST-level analysis verifying code evidence, missing safeguards, and proof of fix.
          </p>
        </div>
      </div>
    </aside>
  );
};
