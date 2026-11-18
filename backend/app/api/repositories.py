import os
import shutil
import zipfile
import uuid
import subprocess
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import get_db
from app.models.entities import Repository, Scan
from app.schemas.pydantic_models import RepositoryResponse, RepositoryCreate

router = APIRouter(prefix="/repositories", tags=["Repositories"])

def is_safe_path(base_dir: Path, path: Path) -> bool:
    try:
        resolved_base = base_dir.resolve()
        resolved_path = path.resolve()
        return str(resolved_path).startswith(str(resolved_base))
    except Exception:
        return False

@router.get("", response_model=list[RepositoryResponse])
def list_repositories(db: Session = Depends(get_db)):
    repos = db.query(Repository).order_by(Repository.created_at.desc()).all()
    results = []
    for r in repos:
        latest_scan = db.query(Scan).filter(Scan.repository_id == r.id).order_by(Scan.started_at.desc()).first()
        results.append(RepositoryResponse(
            id=r.id,
            name=r.name,
            description=r.description,
            source_type=r.source_type,
            source_path=r.source_path,
            branch=r.branch,
            created_at=r.created_at,
            updated_at=r.updated_at,
            total_scans=len(r.scans),
            latest_scan_id=latest_scan.id if latest_scan else None,
            latest_health_score=latest_scan.health_score if latest_scan else None
        ))
    return results

@router.get("/{repo_id}", response_model=RepositoryResponse)
def get_repository(repo_id: str, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    latest_scan = db.query(Scan).filter(Scan.repository_id == repo.id).order_by(Scan.started_at.desc()).first()
    return RepositoryResponse(
        id=repo.id,
        name=repo.name,
        description=repo.description,
        source_type=repo.source_type,
        source_path=repo.source_path,
        branch=repo.branch,
        created_at=repo.created_at,
        updated_at=repo.updated_at,
        total_scans=len(repo.scans),
        latest_scan_id=latest_scan.id if latest_scan else None,
        latest_health_score=latest_scan.health_score if latest_scan else None
    )

@router.post("/upload", response_model=RepositoryResponse)
async def upload_repository_zip(
    name: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip archives are supported.")

    repo_id = f"repo_{uuid.uuid4().hex[:12]}"
    extract_dir = settings.UPLOADS_DIR / repo_id
    extract_dir.mkdir(parents=True, exist_ok=True)

    zip_temp = extract_dir / "upload.zip"

    # Read and validate size
    total_bytes = 0
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    with open(zip_temp, "wb") as f_out:
        while chunk := await file.read(1024 * 1024):
            total_bytes += len(chunk)
            if total_bytes > max_bytes:
                shutil.rmtree(extract_dir, ignore_errors=True)
                raise HTTPException(status_code=413, detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB.")
            f_out.write(chunk)

    # Safe extraction (prevent Zip Slip)
    try:
        with zipfile.ZipFile(zip_temp, "r") as z:
            for member in z.infolist():
                target_path = (extract_dir / member.filename).resolve()
                if not is_safe_path(extract_dir, target_path):
                    shutil.rmtree(extract_dir, ignore_errors=True)
                    raise HTTPException(status_code=400, detail="Potentially malicious path traversal detected in ZIP archive.")
            z.extractall(extract_dir)
        zip_temp.unlink(missing_ok=True)
    except zipfile.BadZipFile:
        shutil.rmtree(extract_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail="Corrupted or invalid ZIP archive.")

    # If the zip extracted into a single root folder, use that as root
    extracted_items = [p for p in extract_dir.iterdir() if p.name not in ["__MACOSX"]]
    actual_source_path = extract_dir
    if len(extracted_items) == 1 and extracted_items[0].is_dir():
        actual_source_path = extracted_items[0]

    repo = Repository(
        id=repo_id,
        name=name.strip(),
        description=description.strip() if description else "Uploaded ZIP repository",
        source_type="zip",
        source_path=str(actual_source_path),
        branch="main"
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)

    return RepositoryResponse(
        id=repo.id,
        name=repo.name,
        description=repo.description,
        source_type=repo.source_type,
        source_path=repo.source_path,
        branch=repo.branch,
        created_at=repo.created_at,
        updated_at=repo.updated_at,
        total_scans=0
    )

@router.post("/connect", response_model=RepositoryResponse)
def connect_github_repo(payload: RepositoryCreate, db: Session = Depends(get_db)):
    if not payload.github_url or not (payload.github_url.startswith("http://") or payload.github_url.startswith("https://")):
        raise HTTPException(status_code=400, detail="Valid HTTP/HTTPS Git repository URL is required.")

    repo_id = f"repo_{uuid.uuid4().hex[:12]}"
    target_dir = settings.UPLOADS_DIR / repo_id
    branch = payload.branch or "main"

    try:
        # Clone with shallow depth
        cmd = ["git", "clone", "--depth", "1", "-b", branch, payload.github_url, str(target_dir)]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if res.returncode != 0:
            # Try without branch
            cmd_fallback = ["git", "clone", "--depth", "1", payload.github_url, str(target_dir)]
            res_fb = subprocess.run(cmd_fallback, capture_output=True, text=True, timeout=60)
            if res_fb.returncode != 0:
                raise HTTPException(status_code=400, detail=f"Failed to clone repository: {res_fb.stderr.strip() or res.stderr.strip()}")
    except subprocess.TimeoutExpired:
        shutil.rmtree(target_dir, ignore_errors=True)
        raise HTTPException(status_code=504, detail="Repository clone timed out.")

    repo_name = payload.name or payload.github_url.rstrip("/").split("/")[-1].replace(".git", "")

    repo = Repository(
        id=repo_id,
        name=repo_name,
        description=payload.description or f"Cloned from {payload.github_url}",
        source_type="github",
        source_path=str(target_dir),
        branch=branch
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)

    return RepositoryResponse(
        id=repo.id,
        name=repo.name,
        description=repo.description,
        source_type=repo.source_type,
        source_path=repo.source_path,
        branch=repo.branch,
        created_at=repo.created_at,
        updated_at=repo.updated_at,
        total_scans=0
    )

@router.post("/demo/{demo_type}", response_model=RepositoryResponse)
def load_demo_repository(demo_type: str, db: Session = Depends(get_db)):
    """
    Loads pre-seeded demo repositories with one click:
    - 'omnibank': Vulnerable microservice with authentic missingness, security, slop, and loose ends.
    - 'clean': Hardened reference microservice.
    """
    if demo_type not in ["omnibank", "clean"]:
        raise HTTPException(status_code=400, detail="demo_type must be 'omnibank' or 'clean'")

    repo_id = f"demo_{demo_type}_{uuid.uuid4().hex[:6]}"
    target_dir = settings.UPLOADS_DIR / repo_id

    source_dir = settings.DEMO_REPOS_DIR / ("omnibank_microservices" if demo_type == "omnibank" else "clean_core")
    if not source_dir.exists():
        raise HTTPException(status_code=500, detail="Demo repository source files not found.")

    shutil.copytree(source_dir, target_dir)

    name = "OmniBank Microservices (Live Demo)" if demo_type == "omnibank" else "CleanCore Reference (Hardened)"
    desc = "Full-stack payment router with authentic missingness, security, and loose-end examples." if demo_type == "omnibank" else "Reference service with zero-trust validation and complete test coverage."

    repo = Repository(
        id=repo_id,
        name=name,
        description=desc,
        source_type="demo",
        source_path=str(target_dir),
        branch="main"
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)

    return RepositoryResponse(
        id=repo.id,
        name=repo.name,
        description=repo.description,
        source_type=repo.source_type,
        source_path=repo.source_path,
        branch=repo.branch,
        created_at=repo.created_at,
        updated_at=repo.updated_at,
        total_scans=0
    )
