import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { DottedNetworkBackground } from './components/DottedNetworkBackground';
import { LandingPage } from './pages/LandingPage';
import { ConnectRepoPage } from './pages/ConnectRepoPage';
import { ScanningPage } from './pages/ScanningPage';
import { DashboardPage } from './pages/DashboardPage';
import { MissingnessPage } from './pages/MissingnessPage';
import { SecurityPage } from './pages/SecurityPage';
import { CodeQualityPage } from './pages/CodeQualityPage';
import { LooseEndsPage } from './pages/LooseEndsPage';
import { RiskCorrelationPage } from './pages/RiskCorrelationPage';
import { ProofBeforeFixPage } from './pages/ProofBeforeFixPage';
import { ReportsPage } from './pages/ReportsPage';
import { api } from './services/api';
import { Repository, Scan, Finding, RiskRelationship } from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [relationships, setRelationships] = useState<RiskRelationship[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch initial repositories
  const fetchRepositories = async () => {
    try {
      const repos = await api.getRepositories();
      setRepositories(repos);

      if (repos.length > 0 && !selectedRepo) {
        const first = repos[0];
        setSelectedRepo(first);
        if (first.latest_scan_id) {
          loadScanData(first.latest_scan_id);
        }
      }
    } catch (err) {
      console.error('Failed to load repositories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  // Load a scan and its findings & risk relationships
  const loadScanData = async (scanId: string) => {
    try {
      const scanData = await api.getScan(scanId);
      setCurrentScan(scanData);

      const findingsData = await api.getScanFindings(scanId);
      setFindings(findingsData);

      const relsData = await api.getScanRelationships(scanId);
      setRelationships(relsData);
    } catch (err) {
      console.error('Failed to load scan data', err);
    }
  };

  // Start new scan on repository
  const handleStartScan = async (repo: Repository) => {
    try {
      setSelectedRepo(repo);
      setCurrentView('scanning');
      const newScan = await api.startScan(repo.id);
      setCurrentScan(newScan);
    } catch (err) {
      console.error('Failed to start scan', err);
    }
  };

  // Repository Connected Handler
  const handleRepoConnected = (repo: Repository, autoScan = true) => {
    setRepositories((prev) => [repo, ...prev.filter((r) => r.id !== repo.id)]);
    setSelectedRepo(repo);

    if (autoScan) {
      handleStartScan(repo);
    } else {
      if (repo.latest_scan_id) {
        loadScanData(repo.latest_scan_id);
        setCurrentView('dashboard');
      } else {
        handleStartScan(repo);
      }
    }
  };

  // Scan Completed Handler
  const handleScanComplete = (scan: Scan) => {
    setCurrentScan(scan);
    loadScanData(scan.id);
    fetchRepositories();
    setCurrentView('dashboard');
  };

  // Navigate to Patch Proposal
  const handleNavigateToPatch = (finding: Finding) => {
    setSelectedFinding(finding);
    setCurrentView('patches');
  };

  // Category counts for sidebar badges
  const counts = {
    missingness: findings.filter((f) => f.category === 'missingness').length,
    security: findings.filter((f) => f.category === 'security').length,
    quality: findings.filter((f) => f.category === 'quality').length,
    loose_ends: findings.filter((f) => f.category === 'loose_end').length,
    risks: relationships.length,
    verified: findings.filter((f) => f.verification_status === 'sandbox_verified' || f.verification_status === 'verified').length,
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans relative overflow-x-hidden">
      {/* Living 3D Connected Dotted Network Animation */}
      <DottedNetworkBackground interactive={true} />

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        selectedRepo={selectedRepo}
        repositories={repositories}
        onSelectRepo={(r) => {
          setSelectedRepo(r);
          if (r.latest_scan_id) {
            loadScanData(r.latest_scan_id);
          } else {
            handleStartScan(r);
          }
        }}
      />

      {/* Main View Area */}
      {currentView === 'landing' ? (
        <LandingPage
          onStart={() => setCurrentView('connect')}
          onExploreDemo={async () => {
            const omni = repositories.find((r) => r.name.includes('OmniBank'));
            if (omni) {
              setSelectedRepo(omni);
              if (omni.latest_scan_id) {
                await loadScanData(omni.latest_scan_id);
                setCurrentView('dashboard');
              } else {
                handleStartScan(omni);
              }
            } else {
              const demo = await api.loadDemoRepo('omnibank');
              handleRepoConnected(demo, true);
            }
          }}
        />
      ) : currentView === 'connect' ? (
        <div className="flex-1 bg-sentinel-bg">
          <ConnectRepoPage
            onRepoConnected={handleRepoConnected}
            repositories={repositories}
          />
        </div>
      ) : currentView === 'scanning' && currentScan ? (
        <ScanningPage
          scanId={currentScan.id}
          onScanComplete={handleScanComplete}
          onRetry={() => {
            if (selectedRepo) handleStartScan(selectedRepo);
          }}
        />
      ) : (
        <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
          {/* Dashboard Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={(view) => setCurrentView(view)}
            counts={counts}
          />

          {/* View Content */}
          <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden">
            {selectedRepo && currentScan ? (
              <>
                {currentView === 'dashboard' && (
                  <DashboardPage
                    repo={selectedRepo}
                    scan={currentScan}
                    findings={findings}
                    relationships={relationships}
                    onNavigate={(v) => setCurrentView(v)}
                    onRescan={() => handleStartScan(selectedRepo)}
                    onSelectFinding={(f) => setSelectedFinding(f)}
                  />
                )}

                {currentView === 'missingness' && (
                  <MissingnessPage
                    findings={findings}
                    onSelectFinding={(f) => setSelectedFinding(f)}
                    onNavigateToPatch={handleNavigateToPatch}
                  />
                )}

                {currentView === 'security' && (
                  <SecurityPage
                    findings={findings}
                    onSelectFinding={(f) => setSelectedFinding(f)}
                    onNavigateToPatch={handleNavigateToPatch}
                  />
                )}

                {currentView === 'quality' && (
                  <CodeQualityPage
                    findings={findings}
                    onSelectFinding={(f) => setSelectedFinding(f)}
                    onNavigateToPatch={handleNavigateToPatch}
                  />
                )}

                {currentView === 'loose_ends' && (
                  <LooseEndsPage
                    findings={findings}
                    onSelectFinding={(f) => setSelectedFinding(f)}
                    onNavigateToPatch={handleNavigateToPatch}
                  />
                )}

                {currentView === 'risks' && (
                  <RiskCorrelationPage
                    relationships={relationships}
                    findings={findings}
                    onSelectFinding={(f) => setSelectedFinding(f)}
                    onNavigateToPatch={handleNavigateToPatch}
                  />
                )}

                {currentView === 'patches' && (
                  <ProofBeforeFixPage
                    scan={currentScan}
                    findings={findings}
                    initialFinding={selectedFinding}
                    onRefreshData={() => {
                      if (currentScan) loadScanData(currentScan.id);
                    }}
                  />
                )}

                {currentView === 'reports' && (
                  <ReportsPage
                    scan={currentScan}
                    repo={selectedRepo}
                  />
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-sentinel-border p-12 text-center">
                <h3 className="text-base font-bold text-sentinel-text">No Active Repository Selected</h3>
                <p className="text-xs text-sentinel-secondary mt-1">
                  Connect or select a repository to view analysis findings.
                </p>
                <button
                  onClick={() => setCurrentView('connect')}
                  className="mt-4 px-4 py-2 rounded-xl bg-sentinel-accent text-white text-xs font-semibold"
                >
                  Connect Repository
                </button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
export default App;
