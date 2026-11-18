import os
import sys
from pathlib import Path

# Treat this module as a package pointing to backend/app
backend_dir = Path(__file__).resolve().parent / "backend"
backend_app_dir = backend_dir / "app"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

__path__ = [str(backend_app_dir)]

if __name__ == "__main__":
    import uvicorn
    from app.main import app as application
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(application, host="0.0.0.0", port=port)
