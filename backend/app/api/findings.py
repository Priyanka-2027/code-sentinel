from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Finding
from app.schemas.pydantic_models import FindingResponse, FindingStatusUpdate

router = APIRouter(prefix="/findings", tags=["Findings"])

@router.get("/{finding_id}", response_model=FindingResponse)
def get_finding(finding_id: str, db: Session = Depends(get_db)):
    f = db.query(Finding).filter(Finding.id == finding_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Finding not found")

    return FindingResponse(
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
    )

@router.patch("/{finding_id}/status", response_model=FindingResponse)
def update_finding_status(finding_id: str, payload: FindingStatusUpdate, db: Session = Depends(get_db)):
    f = db.query(Finding).filter(Finding.id == finding_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Finding not found")

    if payload.status not in ["open", "resolved", "dismissed"]:
        raise HTTPException(status_code=400, detail="Status must be 'open', 'resolved', or 'dismissed'")

    f.status = payload.status
    db.commit()
    db.refresh(f)

    return FindingResponse(
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
    )
