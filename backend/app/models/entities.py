import json
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Text, DateTime, ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    source_type = Column(String(32), nullable=False)  # "github", "zip", "demo"
    source_path = Column(Text, nullable=False)
    branch = Column(String(128), default="main")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    scans = relationship("Scan", back_populates="repository", cascade="all, delete-orphan")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(64), primary_key=True, index=True)
    repository_id = Column(String(64), ForeignKey("repositories.id"), nullable=False)
    status = Column(String(32), default="queued")  # queued, running, completed, failed
    progress = Column(Integer, default=0)
    current_stage = Column(String(128), default="Repository Ingestion")
    stages_data = Column(Text, default="[]")  # JSON list of stages
    health_score = Column(Float, default=100.0)
    files_analyzed = Column(Integer, default=0)
    lines_of_code = Column(Integer, default=0)
    languages_data = Column(Text, default="{}")  # JSON dict of languages & percentages
    issues_summary = Column(Text, default="{}")  # JSON dict of counts by severity/category
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, nullable=True)

    repository = relationship("Repository", back_populates="scans")
    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")
    risk_relationships = relationship("RiskRelationship", back_populates="scan", cascade="all, delete-orphan")
    patch_proposals = relationship("PatchProposal", back_populates="scan", cascade="all, delete-orphan")

    def get_stages(self):
        try:
            return json.loads(self.stages_data or "[]")
        except Exception:
            return []

    def set_stages(self, stages):
        self.stages_data = json.dumps(stages)

    def get_languages(self):
        try:
            return json.loads(self.languages_data or "{}")
        except Exception:
            return {}

    def get_issues_summary(self):
        try:
            return json.loads(self.issues_summary or "{}")
        except Exception:
            return {}

class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(64), primary_key=True, index=True)
    scan_id = Column(String(64), ForeignKey("scans.id"), nullable=False)
    repository_id = Column(String(64), ForeignKey("repositories.id"), nullable=False)
    category = Column(String(32), nullable=False)  # security, quality, missingness, loose_end
    rule_id = Column(String(128), nullable=False)
    title = Column(String(255), nullable=False)
    severity = Column(String(32), nullable=False)  # critical, high, medium, low, informational
    confidence = Column(Float, default=0.9)
    gap_type = Column(String(64), nullable=True)  # missing_validation, missing_auth, missing_error_handling, missing_test, doc_mismatch, missing_safeguard
    gap_label = Column(String(64), default="Confirmed gap")  # "Confirmed gap", "Potential gap", "Needs human review"
    file_path = Column(String(512), nullable=False)
    line_start = Column(Integer, default=1)
    line_end = Column(Integer, default=1)
    code_snippet = Column(Text, nullable=True)
    description = Column(Text, nullable=False)
    why_it_matters = Column(Text, nullable=True)
    evidence = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    cwe_id = Column(String(64), nullable=True)
    masked_secret = Column(String(255), nullable=True)
    status = Column(String(32), default="open")  # open, resolved, dismissed
    verification_status = Column(String(64), default="unverified")  # unverified, proposed, sandbox_verified, failed, needs_manual_review
    related_findings_data = Column(Text, default="[]")  # JSON list of related finding IDs
    created_at = Column(DateTime, default=utc_now)

    scan = relationship("Scan", back_populates="findings")
    patch_proposal = relationship("PatchProposal", back_populates="finding", uselist=False, cascade="all, delete-orphan")

    def get_related_findings(self):
        try:
            return json.loads(self.related_findings_data or "[]")
        except Exception:
            return []

class RiskRelationship(Base):
    __tablename__ = "risk_relationships"

    id = Column(String(64), primary_key=True, index=True)
    scan_id = Column(String(64), ForeignKey("scans.id"), nullable=False)
    cluster_name = Column(String(255), nullable=False)
    severity = Column(String(32), default="high")
    affected_workflow = Column(String(255), nullable=False)
    narrative = Column(Text, nullable=False)
    node_ids_data = Column(Text, default="[]")  # JSON list of finding/file node IDs
    graph_data = Column(Text, default="{}")  # JSON with nodes and edges for React Flow / visual graph
    created_at = Column(DateTime, default=utc_now)

    scan = relationship("Scan", back_populates="risk_relationships")

    def get_graph(self):
        try:
            return json.loads(self.graph_data or "{}")
        except Exception:
            return {"nodes": [], "edges": []}

class PatchProposal(Base):
    __tablename__ = "patch_proposals"

    id = Column(String(64), primary_key=True, index=True)
    finding_id = Column(String(64), ForeignKey("findings.id"), nullable=False)
    scan_id = Column(String(64), ForeignKey("scans.id"), nullable=False)
    file_path = Column(String(512), nullable=False)
    original_code = Column(Text, nullable=False)
    proposed_code = Column(Text, nullable=False)
    diff_unified = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    status = Column(String(64), default="proposed")  # proposed, awaiting_approval, applied_in_sandbox, verified, failed, needs_manual_review
    sandbox_log = Column(Text, nullable=True)
    before_metrics = Column(Text, default="{}")
    after_metrics = Column(Text, default="{}")
    created_at = Column(DateTime, default=utc_now)
    verified_at = Column(DateTime, nullable=True)

    scan = relationship("Scan", back_populates="patch_proposals")
    finding = relationship("Finding", back_populates="patch_proposal")

class AuditReport(Base):
    __tablename__ = "audit_reports"

    id = Column(String(64), primary_key=True, index=True)
    scan_id = Column(String(64), nullable=False)
    repository_id = Column(String(64), nullable=False)
    title = Column(String(255), nullable=False)
    health_score = Column(Float, default=100.0)
    summary_data = Column(Text, default="{}")
    html_content = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=utc_now)
