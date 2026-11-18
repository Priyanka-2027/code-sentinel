import json
from pathlib import Path
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import PatchProposal, Finding, Scan, Repository
from app.schemas.pydantic_models import PatchProposalResponse, PatchVerificationRequest
from app.verification.sandbox import SandboxVerifier

router = APIRouter(tags=["Patches & Verification"])

@router.get("/scans/{scan_id}/patches", response_model=list[PatchProposalResponse])
def get_scan_patches(scan_id: str, db: Session = Depends(get_db)):
    patches = db.query(PatchProposal).filter(PatchProposal.scan_id == scan_id).all()
    results = []
    for p in patches:
        before = json.loads(p.before_metrics or "{}")
        after = json.loads(p.after_metrics or "{}")
        results.append(PatchProposalResponse(
            id=p.id,
            finding_id=p.finding_id,
            scan_id=p.scan_id,
            file_path=p.file_path,
            original_code=p.original_code,
            proposed_code=p.proposed_code,
            diff_unified=p.diff_unified,
            explanation=p.explanation,
            status=p.status,
            sandbox_log=p.sandbox_log,
            before_metrics=before,
            after_metrics=after,
            created_at=p.created_at,
            verified_at=p.verified_at
        ))
    return results

@router.get("/patches/{patch_id}", response_model=PatchProposalResponse)
def get_patch(patch_id: str, db: Session = Depends(get_db)):
    p = db.query(PatchProposal).filter(PatchProposal.id == patch_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patch proposal not found")

    before = json.loads(p.before_metrics or "{}")
    after = json.loads(p.after_metrics or "{}")
    return PatchProposalResponse(
        id=p.id,
        finding_id=p.finding_id,
        scan_id=p.scan_id,
        file_path=p.file_path,
        original_code=p.original_code,
        proposed_code=p.proposed_code,
        diff_unified=p.diff_unified,
        explanation=p.explanation,
        status=p.status,
        sandbox_log=p.sandbox_log,
        before_metrics=before,
        after_metrics=after,
        created_at=p.created_at,
        verified_at=p.verified_at
    )

@router.post("/findings/{finding_id}/patch", response_model=PatchProposalResponse)
def generate_patch_for_finding(finding_id: str, db: Session = Depends(get_db)):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    existing_patch = db.query(PatchProposal).filter(PatchProposal.finding_id == finding.id).first()
    if existing_patch:
        before = json.loads(existing_patch.before_metrics or "{}")
        after = json.loads(existing_patch.after_metrics or "{}")
        return PatchProposalResponse(
            id=existing_patch.id,
            finding_id=existing_patch.finding_id,
            scan_id=existing_patch.scan_id,
            file_path=existing_patch.file_path,
            original_code=existing_patch.original_code,
            proposed_code=existing_patch.proposed_code,
            diff_unified=existing_patch.diff_unified,
            explanation=existing_patch.explanation,
            status=existing_patch.status,
            sandbox_log=existing_patch.sandbox_log,
            before_metrics=before,
            after_metrics=after,
            created_at=existing_patch.created_at,
            verified_at=existing_patch.verified_at
        )

    scan = db.query(Scan).filter(Scan.id == finding.scan_id).first()
    repo = db.query(Repository).filter(Repository.id == finding.repository_id).first()

    target_file = Path(repo.source_path) / finding.file_path
    content = ""
    if target_file.exists():
        with open(target_file, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

    proposal = SandboxVerifier.generate_patch_for_finding(finding, content)
    db.add(proposal)
    finding.verification_status = "proposed"
    db.commit()
    db.refresh(proposal)

    return PatchProposalResponse(
        id=proposal.id,
        finding_id=proposal.finding_id,
        scan_id=proposal.scan_id,
        file_path=proposal.file_path,
        original_code=proposal.original_code,
        proposed_code=proposal.proposed_code,
        diff_unified=proposal.diff_unified,
        explanation=proposal.explanation,
        status=proposal.status,
        sandbox_log=proposal.sandbox_log,
        before_metrics={},
        after_metrics={},
        created_at=proposal.created_at,
        verified_at=proposal.verified_at
    )

@router.post("/patches/{patch_id}/verify", response_model=PatchProposalResponse)
def verify_patch_in_sandbox(patch_id: str, payload: PatchVerificationRequest, db: Session = Depends(get_db)):
    patch = db.query(PatchProposal).filter(PatchProposal.id == patch_id).first()
    if not patch:
        raise HTTPException(status_code=404, detail="Patch proposal not found")

    finding = db.query(Finding).filter(Finding.id == patch.finding_id).first()
    scan = db.query(Scan).filter(Scan.id == patch.scan_id).first()
    repo = db.query(Repository).filter(Repository.id == scan.repository_id).first()

    if not payload.approved:
        patch.status = "awaiting_approval"
        db.commit()
        return PatchProposalResponse(
            id=patch.id,
            finding_id=patch.finding_id,
            scan_id=patch.scan_id,
            file_path=patch.file_path,
            original_code=patch.original_code,
            proposed_code=patch.proposed_code,
            diff_unified=patch.diff_unified,
            explanation=patch.explanation,
            status=patch.status,
            sandbox_log=patch.sandbox_log,
            before_metrics=json.loads(patch.before_metrics or "{}"),
            after_metrics=json.loads(patch.after_metrics or "{}"),
            created_at=patch.created_at,
            verified_at=patch.verified_at
        )

    # Execute sandbox verification
    status_str, log_out, before_m, after_m = SandboxVerifier.verify_patch(
        patch, Path(repo.source_path), finding
    )

    patch.status = status_str
    patch.sandbox_log = log_out
    patch.before_metrics = json.dumps(before_m)
    patch.after_metrics = json.dumps(after_m)
    patch.verified_at = datetime.now(timezone.utc)

    if status_str == "verified":
        finding.verification_status = "sandbox_verified"
        finding.status = "resolved"
    else:
        finding.verification_status = status_str

    db.commit()
    db.refresh(patch)

    return PatchProposalResponse(
        id=patch.id,
        finding_id=patch.finding_id,
        scan_id=patch.scan_id,
        file_path=patch.file_path,
        original_code=patch.original_code,
        proposed_code=patch.proposed_code,
        diff_unified=patch.diff_unified,
        explanation=patch.explanation,
        status=patch.status,
        sandbox_log=patch.sandbox_log,
        before_metrics=before_m,
        after_metrics=after_m,
        created_at=patch.created_at,
        verified_at=patch.verified_at
    )
