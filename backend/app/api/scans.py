import threading
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.session import get_db, SessionLocal
from app.models.entities import Scan, Repository, Finding
from app.schemas.pydantic_models import ScanResponse, ScanCreateRequest, FindingResponse, StageProgress
from app.orchestration.scan_orchestrator import ScanOrchestrator

router = APIRouter(prefix="/scans", tags=["Scans"])

def run_scan_in_background(scan_id: str):
    db = SessionLocal()
    try:
        ScanOrchestrator.execute_scan(scan_id, db)
    finally:
        db.close()

@router.post("", response_model=ScanResponse)
def create_and_start_scan(payload: ScanCreateRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == payload.repository_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    scan_id = f"scn_{uuid.uuid4().hex[:12]}"
    scan = Scan(
        id=scan_id,
        repository_id=repo.id,
        status="running",
        progress=0,
        current_stage="Repository Ingestion",
        health_score=100.0,
        files_analyzed=0,
        lines_of_code=0
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    # Launch in background thread
    t = threading.Thread(target=run_scan_in_background, args=(scan_id,), daemon=True)
    t.start()

    return ScanResponse(
        id=scan.id,
        repository_id=scan.repository_id,
        status=scan.status,
        progress=scan.progress,
        current_stage=scan.current_stage,
        stages=[StageProgress(**s) for s in scan.get_stages()],
        health_score=scan.health_score,
        files_analyzed=scan.files_analyzed,
        lines_of_code=scan.lines_of_code,
        languages=scan.get_languages(),
        issues_summary=scan.get_issues_summary(),
        error_message=scan.error_message,
        started_at=scan.started_at,
        completed_at=scan.completed_at
    )

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return ScanResponse(
        id=scan.id,
        repository_id=scan.repository_id,
        status=scan.status,
        progress=scan.progress,
        current_stage=scan.current_stage,
        stages=[StageProgress(**s) for s in scan.get_stages()],
        health_score=scan.health_score,
        files_analyzed=scan.files_analyzed,
        lines_of_code=scan.lines_of_code,
        languages=scan.get_languages(),
        issues_summary=scan.get_issues_summary(),
        error_message=scan.error_message,
        started_at=scan.started_at,
        completed_at=scan.completed_at
    )

@router.get("/{scan_id}/progress")
def get_scan_progress(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return {
        "id": scan.id,
        "status": scan.status,
        "progress": scan.progress,
        "current_stage": scan.current_stage,
        "stages": scan.get_stages(),
        "files_analyzed": scan.files_analyzed,
        "lines_of_code": scan.lines_of_code,
        "health_score": scan.health_score,
        "error_message": scan.error_message
    }

@router.get("/{scan_id}/findings", response_model=List[FindingResponse])
def get_scan_findings(
    scan_id: str,
    category: Optional[str] = Query(None, description="security, quality, missingness, loose_end"),
    severity: Optional[str] = Query(None, description="critical, high, medium, low"),
    gap_type: Optional[str] = Query(None, description="Filter missingness gap types"),
    search: Optional[str] = Query(None, description="Search query across title, description, file"),
    db: Session = Depends(get_db)
):
    query = db.query(Finding).filter(Finding.scan_id == scan_id)

    if category:
        query = query.filter(Finding.category == category)
    if severity:
        query = query.filter(Finding.severity == severity)
    if gap_type:
        query = query.filter(Finding.gap_type == gap_type)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Finding.title.ilike(search_pattern)) |
            (Finding.description.ilike(search_pattern)) |
            (Finding.file_path.ilike(search_pattern))
        )

    findings = query.all()
    results = []
    for f in findings:
        results.append(FindingResponse(
            id=f.id,
            scan_id=f.scan_id,
            repository_id=f.repository_id,
            category=f.category,
            rule_id=f.rule_id,
            title=f.title,
            severity=f.severity,
            confidence=f.confidence,
            gap_type=f.gap_type,
            gap_label=f.gap_label,
            file_path=f.file_path,
            line_start=f.line_start,
            line_end=f.line_end,
            code_snippet=f.code_snippet,
            description=f.description,
            why_it_matters=f.why_it_matters,
            evidence=f.evidence,
            recommendation=f.recommendation,
            cwe_id=f.cwe_id,
            masked_secret=f.masked_secret,
            status=f.status,
            verification_status=f.verification_status,
            related_findings=f.get_related_findings(),
            created_at=f.created_at
        ))
    return results
