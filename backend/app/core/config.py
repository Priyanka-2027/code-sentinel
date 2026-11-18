import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
SANDBOX_DIR = DATA_DIR / "sandbox"
REPORTS_DIR = DATA_DIR / "reports"
DEMO_REPOS_DIR = BASE_DIR / "app" / "demo_repos"
DATABASE_URL = f"sqlite:///{DATA_DIR / 'code_sentinel.db'}"

for path in [DATA_DIR, UPLOADS_DIR, SANDBOX_DIR, REPORTS_DIR]:
    path.mkdir(parents=True, exist_ok=True)

class HealthScoreWeights(BaseModel):
    # Penalty weights deducted from 100 for each issue severity
    critical_security: float = 18.0
    high_security: float = 10.0
    medium_security: float = 4.0
    low_security: float = 1.0

    critical_missingness: float = 14.0
    high_missingness: float = 8.0
    medium_missingness: float = 3.0
    low_missingness: float = 1.0

    critical_loose_end: float = 6.0
    high_loose_end: float = 3.0
    medium_loose_end: float = 1.0

    code_slop_penalty: float = 1.5

    # Maximum score cap is 100, minimum is 0

class Settings:
    PROJECT_NAME: str = "CODE SENTINEL"
    PROJECT_TAGLINE: str = "Find what is wrong. Discover what is missing. Prove the fix works."
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    DATABASE_URL: str = DATABASE_URL
    DATA_DIR: Path = DATA_DIR
    UPLOADS_DIR: Path = UPLOADS_DIR
    SANDBOX_DIR: Path = SANDBOX_DIR
    REPORTS_DIR: Path = REPORTS_DIR
    DEMO_REPOS_DIR: Path = DEMO_REPOS_DIR
    HEALTH_WEIGHTS: HealthScoreWeights = HealthScoreWeights()
    MAX_UPLOAD_SIZE_MB: int = 50
    SANDBOX_TIMEOUT_SECONDS: int = 30
    DEFAULT_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
