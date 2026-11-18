export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type FindingCategory = 'security' | 'quality' | 'missingness' | 'loose_end';
export type GapLabel = 'Confirmed gap' | 'Potential gap' | 'Needs human review';
export type VerificationStatus = 'unverified' | 'proposed' | 'awaiting_approval' | 'applied_in_sandbox' | 'sandbox_verified' | 'verified' | 'failed' | 'needs_manual_review';

export interface Repository {
  id: string;
  name: string;
  description?: string;
  source_type: 'github' | 'zip' | 'demo';
  source_path: string;
  branch: string;
  created_at: string;
  updated_at: string;
  total_scans: number;
  latest_scan_id?: string;
  latest_health_score?: number;
}

export interface StageProgress {
  step: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration_ms: number;
  details: string;
}

export interface Scan {
  id: string;
  repository_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  current_stage: string;
  stages: StageProgress[];
  health_score: number;
  files_analyzed: number;
  lines_of_code: number;
  languages: Record<string, number>;
  issues_summary: {
    total?: number;
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
    categories?: {
      security?: number;
      missingness?: number;
      quality?: number;
      loose_end?: number;
    };
  };
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface Finding {
  id: string;
  scan_id: string;
  repository_id: string;
  category: FindingCategory;
  rule_id: string;
  title: string;
  severity: Severity;
  confidence: number;
  gap_type?: string;
  gap_label: GapLabel;
  file_path: string;
  line_start: number;
  line_end: number;
  code_snippet?: string;
  description: string;
  why_it_matters?: string;
  evidence?: string;
  recommendation?: string;
  cwe_id?: string;
  masked_secret?: string;
  status: 'open' | 'resolved' | 'dismissed';
  verification_status: VerificationStatus;
  related_findings: string[];
  created_at: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'finding' | 'file' | 'endpoint' | 'component';
  severity?: Severity;
  category?: string;
  details?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  relationship: 'same_workflow' | 'data_dependency' | 'shared_component' | 'security_risk' | 'missing_test_coverage';
}

export interface RiskRelationship {
  id: string;
  scan_id: string;
  cluster_name: string;
  severity: Severity;
  affected_workflow: string;
  narrative: string;
  node_ids: string[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  created_at: string;
}

export interface PatchProposal {
  id: string;
  finding_id: string;
  scan_id: string;
  file_path: string;
  original_code: string;
  proposed_code: string;
  diff_unified: string;
  explanation: string;
  status: VerificationStatus;
  sandbox_log?: string;
  before_metrics?: Record<string, any>;
  after_metrics?: Record<string, any>;
  created_at: string;
  verified_at?: string;
}
