from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class StageProgress(BaseModel):
    step: int
    name: str
    status: str  # pending, in_progress, completed, failed
    duration_ms: int = 0
    details: str = ""

class FindingBase(BaseModel):
    category: str  # security, quality, missingness, loose_end
    rule_id: str
    title: str
    severity: str  # critical, high, medium, low, informational
    confidence: float = 0.90
    gap_type: Optional[str] = None
    gap_label: str = "Confirmed gap"
    file_path: str
    line_start: int = 1
    line_end: int = 1
    code_snippet: Optional[str] = None
    description: str
    why_it_matters: Optional[str] = None
    evidence: Optional[str] = None
    recommendation: Optional[str] = None
    cwe_id: Optional[str] = None
    masked_secret: Optional[str] = None
    status: str = "open"
    verification_status: str = "unverified"
    related_findings: List[str] = []

class FindingResponse(FindingBase):
    id: str
    scan_id: str
    repository_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class RepositoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    source_type: str  # github, zip, demo
    branch: Optional[str] = "main"

class RepositoryCreate(RepositoryBase):
    github_url: Optional[str] = None

class RepositoryResponse(RepositoryBase):
    id: str
    source_path: str
    created_at: datetime
    updated_at: datetime
    total_scans: int = 0
    latest_scan_id: Optional[str] = None
    latest_health_score: Optional[float] = None

    class Config:
        from_attributes = True

class ScanCreateRequest(BaseModel):
    repository_id: str

class ScanResponse(BaseModel):
    id: str
    repository_id: str
    status: str
    progress: int
    current_stage: str
    stages: List[StageProgress] = []
    health_score: float
    files_analyzed: int
    lines_of_code: int
    languages: Dict[str, float] = {}
    issues_summary: Dict[str, Any] = {}
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # finding, file, endpoint, component
    severity: Optional[str] = None
    category: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class GraphEdge(BaseModel):
    source: str
    target: str
    label: str
    relationship: str  # same_workflow, data_dependency, shared_component, security_risk, missing_test_coverage

class RiskRelationshipResponse(BaseModel):
    id: str
    scan_id: str
    cluster_name: str
    severity: str
    affected_workflow: str
    narrative: str
    node_ids: List[str] = []
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []
    created_at: datetime

    class Config:
        from_attributes = True

class PatchProposalResponse(BaseModel):
    id: str
    finding_id: str
    scan_id: str
    file_path: str
    original_code: str
    proposed_code: str
    diff_unified: str
    explanation: str
    status: str  # proposed, awaiting_approval, applied_in_sandbox, verified, failed, needs_manual_review
    sandbox_log: Optional[str] = None
    before_metrics: Optional[Dict[str, Any]] = None
    after_metrics: Optional[Dict[str, Any]] = None
    created_at: datetime
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PatchVerificationRequest(BaseModel):
    approved: bool = True

class FindingStatusUpdate(BaseModel):
    status: str  # open, resolved, dismissed

class HealthBreakdown(BaseModel):
    base_score: float = 100.0
    deductions: Dict[str, float] = {}
    final_score: float = 100.0
    grade: str = "A"
    summary: str = ""
