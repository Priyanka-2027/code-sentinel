import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.entities import Repository, Scan

client = TestClient(app)

def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["platform"] == "CODE SENTINEL"

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_repositories_list():
    res = client.get("/api/repositories")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 2  # The two seeded demo repos (OmniBank and CleanCore)

def test_load_demo_endpoint():
    res = client.post("/api/repositories/demo/omnibank")
    assert res.status_code == 200
    data = res.json()
    assert "OmniBank" in data["name"]
    repo_id = data["id"]

    # Start scan
    scan_res = client.post("/api/scans", json={"repository_id": repo_id})
    assert scan_res.status_code == 200
    scan_data = scan_res.json()
    assert scan_data["status"] in ["running", "completed"]

def test_reports_and_patches():
    # Query repositories to get one
    repos_res = client.get("/api/repositories")
    repo = repos_res.json()[0]

    # Run scan synchronously using orchestrator
    from app.orchestration.scan_orchestrator import ScanOrchestrator
    db = SessionLocal()
    scan = Scan(id="test_api_sync_scan", repository_id=repo["id"], status="running")
    db.add(scan)
    db.commit()

    ScanOrchestrator.execute_scan(scan.id, db)
    db.close()

    # Get findings
    findings_res = client.get(f"/api/scans/{scan.id}/findings")
    assert findings_res.status_code == 200
    findings = findings_res.json()
    assert len(findings) > 0

    # Get relationships
    rels_res = client.get(f"/api/scans/{scan.id}/relationships")
    assert rels_res.status_code == 200
    rels = rels_res.json()
    assert len(rels) > 0

    # Get report JSON
    report_res = client.get(f"/api/reports/{scan.id}")
    assert report_res.status_code == 200
    report_data = report_res.json()
    assert "audit_summary" in report_data

    # Get report HTML
    html_res = client.get(f"/api/reports/{scan.id}/html")
    assert html_res.status_code == 200
    assert "CODE SENTINEL" in html_res.text
