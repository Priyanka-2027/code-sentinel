import { Repository, Scan, Finding, RiskRelationship, PatchProposal } from '../types';

const API_BASE = '/api';

export const api = {
  // Repositories
  async getRepositories(): Promise<Repository[]> {
    const res = await fetch(`${API_BASE}/repositories`);
    if (!res.ok) throw new Error('Failed to fetch repositories');
    return res.json();
  },

  async getRepository(id: string): Promise<Repository> {
    const res = await fetch(`${API_BASE}/repositories/${id}`);
    if (!res.ok) throw new Error('Failed to fetch repository');
    return res.json();
  },

  async uploadZip(name: string, description: string, file: File): Promise<Repository> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/repositories/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async connectGithub(name: string, githubUrl: string, branch = 'main'): Promise<Repository> {
    const res = await fetch(`${API_BASE}/repositories/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, github_url: githubUrl, branch, source_type: 'github' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Connection failed' }));
      throw new Error(err.detail || 'Connection failed');
    }
    return res.json();
  },

  async loadDemoRepo(demoType: 'omnibank' | 'clean'): Promise<Repository> {
    const res = await fetch(`${API_BASE}/repositories/demo/${demoType}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to load demo repository');
    return res.json();
  },

  // Scans
  async startScan(repositoryId: string): Promise<Scan> {
    const res = await fetch(`${API_BASE}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repository_id: repositoryId }),
    });
    if (!res.ok) throw new Error('Failed to start scan');
    return res.json();
  },

  async getScan(scanId: string): Promise<Scan> {
    const res = await fetch(`${API_BASE}/scans/${scanId}`);
    if (!res.ok) throw new Error('Failed to fetch scan');
    return res.json();
  },

  async getScanProgress(scanId: string): Promise<{
    id: string;
    status: string;
    progress: number;
    current_stage: string;
    stages: any[];
    files_analyzed: number;
    lines_of_code: number;
    health_score: number;
    error_message?: string;
  }> {
    const res = await fetch(`${API_BASE}/scans/${scanId}/progress`);
    if (!res.ok) throw new Error('Failed to fetch scan progress');
    return res.json();
  },

  async getScanFindings(
    scanId: string,
    filters?: { category?: string; severity?: string; gap_type?: string; search?: string }
  ): Promise<Finding[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.gap_type) params.append('gap_type', filters.gap_type);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/scans/${scanId}/findings${query}`);
    if (!res.ok) throw new Error('Failed to fetch scan findings');
    return res.json();
  },

  async updateFindingStatus(findingId: string, status: 'open' | 'resolved' | 'dismissed'): Promise<Finding> {
    const res = await fetch(`${API_BASE}/findings/${findingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update finding status');
    return res.json();
  },

  // Risk Relationships
  async getScanRelationships(scanId: string): Promise<RiskRelationship[]> {
    const res = await fetch(`${API_BASE}/scans/${scanId}/relationships`);
    if (!res.ok) throw new Error('Failed to fetch relationships');
    return res.json();
  },

  // Patches & Proof Before Fix
  async getScanPatches(scanId: string): Promise<PatchProposal[]> {
    const res = await fetch(`${API_BASE}/scans/${scanId}/patches`);
    if (!res.ok) throw new Error('Failed to fetch patches');
    return res.json();
  },

  async generatePatch(findingId: string): Promise<PatchProposal> {
    const res = await fetch(`${API_BASE}/findings/${findingId}/patch`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to generate patch');
    return res.json();
  },

  async verifyPatchInSandbox(patchId: string, approved = true): Promise<PatchProposal> {
    const res = await fetch(`${API_BASE}/patches/${patchId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    if (!res.ok) throw new Error('Sandbox verification failed');
    return res.json();
  },

  // Reports
  async getReport(scanId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/${scanId}`);
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
  },

  getReportHtmlUrl(scanId: string): string {
    return `${API_BASE}/reports/${scanId}/html`;
  },

  getReportDownloadUrl(scanId: string, format: 'html' | 'json'): string {
    return `${API_BASE}/reports/${scanId}/download?format=${format}`;
  }
};
