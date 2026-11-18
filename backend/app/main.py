from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.database.session import init_db, SessionLocal
from app.models.entities import Repository
from app.api import repositories, scans, findings, relationships, patches, reports
import shutil
import uuid

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    init_db()

    # Pre-seed demo repositories if database is brand new
    db = SessionLocal()
    try:
        existing = db.query(Repository).first()
        if not existing:
            # Seed OmniBank Microservices Demo
            omnibank_id = "demo_omnibank_default"
            omnibank_target = settings.UPLOADS_DIR / omnibank_id
            omnibank_src = settings.DEMO_REPOS_DIR / "omnibank_microservices"
            if omnibank_src.exists() and not omnibank_target.exists():
                shutil.copytree(omnibank_src, omnibank_target)

            repo1 = Repository(
                id=omnibank_id,
                name="OmniBank Microservices (Live Demo)",
                description="Cloud financial payments platform with authentic missingness, security, slop, and loose-end examples.",
                source_type="demo",
                source_path=str(omnibank_target),
                branch="main"
            )
            db.add(repo1)

            # Seed CleanCore Hardened Reference Demo
            cleancore_id = "demo_cleancore_default"
            cleancore_target = settings.UPLOADS_DIR / cleancore_id
            cleancore_src = settings.DEMO_REPOS_DIR / "clean_core"
            if cleancore_src.exists() and not cleancore_target.exists():
                shutil.copytree(cleancore_src, cleancore_target)

            repo2 = Repository(
                id=cleancore_id,
                name="CleanCore Reference Service (Hardened)",
                description="Zero-trust reference microservice with typed schemas, JWT authentication, and automated test coverage.",
                source_type="demo",
                source_path=str(cleancore_target),
                branch="main"
            )
            db.add(repo2)
            db.commit()
    except Exception as e:
        print(f"Error seeding demo repositories: {e}")
    finally:
        db.close()

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Architecture-Agnostic Autonomous Engineering Auditor. Find what is wrong. Discover what is missing. Prove the fix works.",
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(repositories.router, prefix=settings.API_V1_PREFIX)
app.include_router(scans.router, prefix=settings.API_V1_PREFIX)
app.include_router(findings.router, prefix=settings.API_V1_PREFIX)
app.include_router(relationships.router, prefix=settings.API_V1_PREFIX)
app.include_router(patches.router, prefix=settings.API_V1_PREFIX)
app.include_router(reports.router, prefix=settings.API_V1_PREFIX)

@app.get("/api/info")
def root_info():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CODE SENTINEL API",
        "version": settings.VERSION
    }

# Mount frontend dist static files if built
FRONTEND_DIST = settings.DATA_DIR.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/")
    def serve_frontend_root():
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def fallback_root():
        return {
            "platform": settings.PROJECT_NAME,
            "tagline": settings.PROJECT_TAGLINE,
            "version": settings.VERSION,
            "status": "operational",
            "docs_url": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
