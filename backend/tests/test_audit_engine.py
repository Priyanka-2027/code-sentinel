import pytest
import os
from pathlib import Path
from app.core.config import settings
from app.database.session import SessionLocal, init_db
from app.models.entities import Repository, Scan, Finding
from app.analyzers.repository_analyzer import RepositoryAnalyzer
from app.agents.security_agent import SecurityAgent
from app.agents.slop_agent import CodeSlopAgent
from app.agents.gap_agent import MissingnessAgent
from app.agents.loose_end_agent import LooseEndAgent
from app.agents.correlation_agent import RiskCorrelationAgent
from app.verification.sandbox import SandboxVerifier
from app.orchestration.scan_orchestrator import ScanOrchestrator

@pytest.fixture(scope="module")
def setup_database():
    init_db()
    db = SessionLocal()
    yield db
    db.close()

def test_language_detection():
    demo_path = settings.DEMO_REPOS_DIR / "omnibank_microservices"
    ir_repo = RepositoryAnalyzer.build_ir("test_repo", demo_path)

    assert "Python" in ir_repo.detected_languages
    assert ir_repo.total_loc > 0
    assert len(ir_repo.all_endpoints) >= 2
    assert len(ir_repo.all_dependencies) >= 3

def test_security_agent():
    demo_path = settings.DEMO_REPOS_DIR / "omnibank_microservices"
    ir_repo = RepositoryAnalyzer.build_ir("test_repo", demo_path)
    findings = SecurityAgent.run(ir_repo, "test_scan")

    rule_ids = [f.rule_id for f in findings]
    assert "hardcoded_secret" in rule_ids
    assert "sql_injection" in rule_ids
    # Verify secret is masked in evidence
    secret_findings = [f for f in findings if f.rule_id == "hardcoded_secret"]
    assert len(secret_findings) > 0
    assert "..." in secret_findings[0].masked_secret

def test_missingness_agent():
    demo_path = settings.DEMO_REPOS_DIR / "omnibank_microservices"
    ir_repo = RepositoryAnalyzer.build_ir("test_repo", demo_path)
    findings = MissingnessAgent.run(ir_repo, "test_scan")

    rule_ids = [f.rule_id for f in findings]
    assert "missing_endpoint_authentication" in rule_ids
    assert "missing_input_validation" in rule_ids
    assert "missing_automated_tests" in rule_ids
    assert "doc_implementation_mismatch" in rule_ids

    # Verify labels
    labels = [f.gap_label for f in findings]
    assert "Confirmed gap" in labels

def test_loose_end_agent():
    demo_path = settings.DEMO_REPOS_DIR / "omnibank_microservices"
    ir_repo = RepositoryAnalyzer.build_ir("test_repo", demo_path)
    findings = LooseEndAgent.run(ir_repo, "test_scan")

    rule_ids = [f.rule_id for f in findings]
    assert any("unfinished_" in r for r in rule_ids)
    assert "swallowed_exception" in rule_ids
    assert "trivial_test_mockery" in rule_ids

def test_code_slop_agent():
    demo_path = settings.DEMO_REPOS_DIR / "omnibank_microservices"
    ir_repo = RepositoryAnalyzer.build_ir("test_repo", demo_path)
    findings = CodeSlopAgent.run(ir_repo, "test_scan")

    rule_ids = [f.rule_id for f in findings]
    assert "unused_import" in rule_ids
    assert "empty_function_stub" in rule_ids

def test_risk_correlation():
    demo_path = settings.DEMO_REPOS_DIR / "omnibank_microservices"
    ir_repo = RepositoryAnalyzer.build_ir("test_repo", demo_path)
    sec = SecurityAgent.run(ir_repo, "test_scan")
    gap = MissingnessAgent.run(ir_repo, "test_scan")
    loose = LooseEndAgent.run(ir_repo, "test_scan")
    slop = CodeSlopAgent.run(ir_repo, "test_scan")

    all_findings = sec + gap + loose + slop
    clusters = RiskCorrelationAgent.run(ir_repo, all_findings, "test_scan")

    assert len(clusters) > 0
    # Must have graph with nodes and edges
    graph = clusters[0].get_graph()
    assert len(graph["nodes"]) > 0
    assert len(graph["edges"]) > 0

def test_clean_repo_high_score():
    clean_path = settings.DEMO_REPOS_DIR / "clean_core"
    ir_repo = RepositoryAnalyzer.build_ir("clean_repo", clean_path)
    sec = SecurityAgent.run(ir_repo, "clean_scan")
    # Clean repo should have zero critical security findings
    crit_sec = [f for f in sec if f.severity == "critical"]
    assert len(crit_sec) == 0

def test_full_orchestration(setup_database):
    import uuid
    db = setup_database
    # Create test repo with unique id
    unique_id = uuid.uuid4().hex[:8]
    demo_path = settings.DEMO_REPOS_DIR / "omnibank_microservices"
    repo = Repository(
        id=f"test_repo_{unique_id}",
        name="OmniBank Orchestration Test",
        source_type="demo",
        source_path=str(demo_path),
        branch="main"
    )
    db.add(repo)
    db.commit()

    scan = Scan(
        id=f"test_scan_{unique_id}",
        repository_id=repo.id,
        status="running"
    )
    db.add(scan)
    db.commit()

    # Execute scan synchronously
    ScanOrchestrator.execute_scan(scan.id, db)

    db.refresh(scan)
    assert scan.status == "completed"
    assert scan.progress == 100
    assert scan.health_score < 70  # Vulnerable repo should have lower health score
    assert len(scan.findings) > 5
    assert len(scan.risk_relationships) > 0
    assert len(scan.patch_proposals) > 0
