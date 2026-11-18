# CODE SENTINEL — Setup & Installation Guide

## Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- Git

---

## 1. Quick Start (Single Command / Unified Mode)

Code Sentinel is pre-compiled and can be run directly from the FastAPI server:

```powershell
# 1. Activate virtual environment
.\venv\Scripts\activate

# 2. Start the unified server (serves API and compiled Frontend SPA)
$env:PYTHONPATH="d:\priyanka\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open your browser to:
- **Application Web UI**: [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 2. Developer Mode (Separate Frontend & Backend Dev Servers)

### Backend:
```powershell
cd backend
..\venv\Scripts\activate
$env:PYTHONPATH="."
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend:
```powershell
cd frontend
npm install
npm run dev
```

Open your browser to:
- **Vite Dev Server with HMR**: [http://localhost:5173](http://localhost:5173)

---

## 3. Environment Configuration
Copy the example environment file:
```powershell
cp .env.example .env
```
Default configuration uses persistent SQLite database at `./data/code_sentinel.db`.
