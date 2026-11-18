import json
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import AuditReport, Scan, Repository, Finding, RiskRelationship, PatchProposal
from app.reports.generator import ReportGenerator

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{scan_id}")
def get_report(scan_id: str, db: Session = Depends(get_db)):
    report = db.query(AuditReport).filter(AuditReport.scan_id == scan_id).first()
    if not report:
        # Generate on demand if missing
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
        repo = db.query(Repository).filter(Repository.id == scan.repository_id).first()
        findings = db.query(Finding).filter(Finding.scan_id == scan_id).all()
        relationships = db.query(RiskRelationship).filter(RiskRelationship.scan_id == scan_id).all()
        patches = db.query(PatchProposal).filter(PatchProposal.scan_id == scan_id).all()

        json_data = ReportGenerator.generate_json_report(scan, repo, findings, relationships, patches)
        html = ReportGenerator.generate_html_report(json_data)
        report = AuditReport(
            id=f"RPT-{scan_id}",
            scan_id=scan_id,
            repository_id=repo.id,
            title=f"Audit Report: {repo.name}",
            health_score=scan.health_score,
            summary_data=json.dumps(json_data),
            html_content=html
        )
        db.add(report)
        db.commit()
        db.refresh(report)

    return json.loads(report.summary_data or "{}")

@router.get("/{scan_id}/html", response_class=HTMLResponse)
def get_report_html(scan_id: str, db: Session = Depends(get_db)):
    report = db.query(AuditReport).filter(AuditReport.scan_id == scan_id).first()
    if not report or not report.html_content:
        get_report(scan_id, db)
        report = db.query(AuditReport).filter(AuditReport.scan_id == scan_id).first()

    return HTMLResponse(content=report.html_content)

@router.get("/{scan_id}/download")
def download_report(scan_id: str, format: str = "html", db: Session = Depends(get_db)):
    report = db.query(AuditReport).filter(AuditReport.scan_id == scan_id).first()
    if not report:
        get_report(scan_id, db)
        report = db.query(AuditReport).filter(AuditReport.scan_id == scan_id).first()

    if format == "json":
        return Response(
            content=report.summary_data,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=code_sentinel_audit_{scan_id}.json"}
        )
    else:
        return Response(
            content=report.html_content,
            media_type="text/html",
            headers={"Content-Disposition": f"attachment; filename=code_sentinel_audit_{scan_id}.html"}
        )
