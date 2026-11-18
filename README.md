# CODE SENTINEL
### Architecture-Agnostic Autonomous Engineering Auditor
> *"Find what is wrong. Discover what is missing. Prove the fix works."*

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6.svg)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg)](https://sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Signature Feature: Missingness Intelligence](#2-signature-feature-missingness-intelligence)
3. [Visual Design & Brand Identity](#3-visual-design--brand-identity)
4. [The 11 Core Pages & Views](#4-the-11-core-pages--views)
5. [Architecture & Pipeline](#5-architecture--pipeline)
6. [Technology Stack](#6-technology-stack)
7. [Project Folder Structure](#7-project-folder-structure)
8. [Database Schema](#8-database-schema)
9. [API Reference](#9-api-reference)
10. [The 5 Specialist Agents](#10-the-5-specialist-agents)
11. [Health Score Engine](#11-health-score-engine)
12. [Proof Before Fix — Sandbox Verifier](#12-proof-before-fix--sandbox-verifier)
13. [Demo Repositories](#13-demo-repositories)
14. [Installation & Quick Start](#14-installation--quick-start)
15. [Configuration](#15-configuration)
16. [Running Tests](#16-running-tests)
17. [Known Limitations](#17-known-limitations)

---

## 1. Executive Summary

**CODE SENTINEL** is an architecture-agnostic autonomous engineering auditor that analyzes software repositories to discover security vulnerabilities, code slop, technical debt, and compound operational risks — all without requiring any external AI API keys.

It goes far beyond traditional SAST tools by investigating not just what is **wrong** in code, but crucially, what **should exist but does not exist**. Every finding is backed by deterministic AST/regex evidence, file and line references, CWE identifiers, and confidence ratings.

**Core Capabilities at a Glance:**

| Capability | What it does |
|:---|:---|
| 🔐 Security Scanning | Hardcoded secrets, SQL injection, command injection, unsafe eval, CVE dependencies |
| 🕳️ Missingness Intelligence | Missing auth guards, missing validation, missing tests, missing error handling |
| 🧹 Code Slop Detection | Unused imports, high cyclomatic complexity, empty placeholder stubs |
| 🔗 Loose-End Analysis | Unresolved TODO/FIXME markers, swallowed exceptions, trivial test mocks |
| 🕸️ Risk Correlation | Cross-issue compound attack surface graph with narrative synthesis |
| 🧪 Proof Before Fix | Unified diff proposals verified in an isolated ephemeral sandbox |
| 📊 Audit Reports | Standalone HTML + downloadable JSON executive audit artifacts |

---
## Output Screenshots:
<img width="2736" height="1518" alt="image" src="https://github.com/user-attachments/assets/fd7a5427-8453-4648-aa51-947e97b85e86" />
<img width="2860" height="1516" alt="image" src="https://github.com/user-attachments/assets/5be98bcd-7020-442b-a161-ffd1e2094fdc" />


## 2. Signature Feature: Missingness Intelligence

Traditional code scanners only flag syntax that **already exists** in source files. CODE SENTINEL's defining innovation is investigating what **SHOULD exist but DOES NOT exist**:

| Gap Type | What It Checks |
|:---|:---|
| **Missing Authentication** | Mutating API routes (`POST`, `DELETE`, `PUT`, `PATCH`) on sensitive paths lacking token dependencies or auth guards |
| **Missing Input Validation** | Endpoints processing unconstrained payloads without schema models (Pydantic/Zod/Joi) |
| **Missing Error Handling** | Database and financial operations executed with zero `try/except` recovery blocks |
| **Missing Test Coverage** | API endpoints with 0 automated tests matched in the test suite |
| **Documentation Mismatch** | OpenAPI or README specs promising security safeguards (e.g., rate limiting) that the code lacks |
| **Missing Idempotency** | Financial transfer handlers lacking idempotency key verification |

Each gap finding includes:
- **Gap label**: `Confirmed gap` / `Potential gap` / `Needs human review`
- **CWE ID**: e.g., `CWE-306` (Missing Authentication), `CWE-20` (Input Validation), `CWE-755` (Missing Error Handling)
- **Confidence score**: 0.0 – 1.0 (e.g., 0.94 for sensitive-path auth gaps)
- **Evidence**: Exact file path, line number, handler name, and AST-verified justification
- **Recommendation**: Actionable fix with specific framework APIs (e.g., `Depends(get_current_user)`)

---

## 3. Visual Design & Brand Identity

Designed with a premium SaaS engineering aesthetic:

- **Predominantly Light Palette**: `#F7F9FC` background, pure white surfaces, `#172033` high-contrast typography, `#315EF5` primary accent, `#16A085` teal
- **Signature 3D Connected Dotted Network Background**: Rendered on an interactive HTML5 canvas (`DottedNetworkBackground.tsx`) with perspective projection, depth-scaled particles, and gentle mouse-reactive physics
- **Color-Coded Severity Meaning**:
  - 🔴 **Red** (`critical`): Hardcoded secrets, SQL injection, missing auth on payment routes
  - 🟠 **Orange** (`high`): Missing validation, unauthenticated write endpoints, CVE dependencies
  - 🟡 **Yellow** (`medium`): Missing error handling, documentation mismatches, TODO markers
  - 🔵 **Blue** (`low` / informational): Unused imports, minor code quality items
  - 🟢 **Green**: Sandbox-verified fixes, clean health scores

---

## 4. The 11 Core Pages & Views

| # | Page | Route | Capability |
|:--|:-----|:-------|:-----------|
| 1 | **Landing Page** | `/` | Hero with interactive 3D dotted network, 5 core pillars, 3-step workflow, and language compatibility showcase |
| 2 | **Repository Connection** | `/connect` | Public GitHub URL cloning (shallow `--depth 1`), safe ZIP upload with ZipSlip prevention, 1-click Demo mode |
| 3 | **Scanning Interface** | `/scan/:scanId` | 10 distinct live pipeline stages with actual duration metrics (ms), LOC counts, and real-time progress bar |
| 4 | **Engineering Dashboard** | `/dashboard/:scanId` | 0–100 Engineering Health Score gauge, severity distribution, category breakdown, language metrics |
| 5 | **Missingness Intelligence** | `/missingness/:scanId` | Master-detail inspection of all missing engineering requirements with gap labels and CWE references |
| 6 | **Security Intelligence** | `/security/:scanId` | Deterministic scanner results with auto-masked secrets, SQL injection, command injection, CVE dependency alerts |
| 7 | **Code Quality (Slop)** | `/quality/:scanId` | AST-based detection of unused imports, high cyclomatic complexity (>10), and empty placeholder stubs |
| 8 | **Loose-End Detector** | `/loose-ends/:scanId` | Critical FIXME/HACK/TODO markers, swallowed exceptions (`except: pass`), trivial test mockery |
| 9 | **Risk Correlation** | `/risk/:scanId` | Interactive node-link graph connecting multi-issue attack surfaces with narrative synthesis of compound risks |
| 10 | **Proof Before Fix** | `/proof/:scanId` | Unified diff generator, isolated workspace sandbox execution, syntax check, and regression test runner |
| 11 | **Audit Reports** | `/reports/:scanId` | Standalone printable HTML report and downloadable structured JSON export |

---

## 5. Architecture & Pipeline

```
  Source Repository (GitHub URL / ZIP Upload / Demo)
                    │
                    ▼
  ┌─────────────────────────────────────────────┐
  │   Normalized Intermediate Representation (IR) │
  │   ├── IRFile       (raw content, LOC, comments)│
  │   ├── IRSymbol     (AST: classes, functions,   │
  │   │                 complexity, unused imports) │
  │   ├── IREndpoint   (HTTP method, route, auth,  │
  │   │                 validation, error handling) │
  │   ├── IRDependency (package manifests, CVE DB) │
  │   ├── IRTest       (unit tests, assert counts, │
  │   │                 trivial mock detection)     │
  │   └── IRDocRef     (README / OpenAPI promises  │
  │                     vs. implementation)         │
  └─────────────────────────────────────────────┘
                    │
                    ▼
     ┌──────────────────────────────┐
     │  10-Stage Scan Orchestrator  │
     │  Stage 1:  Repository Ingestion          │
     │  Stage 2:  Language Detection            │
     │  Stage 3:  Architecture Discovery        │
     │  Stage 4:  Dependency Analysis (CVE)     │
     │  Stage 5:  Security Agent                │
     │  Stage 6:  Code Slop Agent               │
     │  Stage 7:  Missingness Agent             │
     │  Stage 8:  Loose-End Agent               │
     │  Stage 9:  Risk Correlation Agent        │
     │  Stage 10: Report Generation             │
     └──────────────────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────────┐
     │   Proof Before Fix & Verification    │
     │   ├── Unified Diff Proposal          │
     │   ├── Ephemeral Sandbox Replication  │
     │   ├── Syntax & AST Re-check          │
     │   ├── Security & Missingness Re-scan │
     │   └── Automated Regression (pytest)  │
     └──────────────────────────────────────┘
                    │
                    ▼
  Engineering Health Score (0–100) & Audit Reports
```

---

## 6. Technology Stack

### Backend

| Component | Technology | Version |
|:----------|:-----------|:--------|
| Web Framework | FastAPI | ≥ 0.110 |
| ASGI Server | Uvicorn | ≥ 0.28 |
| ORM | SQLAlchemy | ≥ 2.0 |
| Database | SQLite (file-based, no setup required) | — |
| Schema Validation | Pydantic v2 | ≥ 2.6 |
| File Upload | python-multipart | ≥ 0.0.9 |
| HTML Reports | Jinja2 | ≥ 3.1 |
| HTTP Client (tests) | httpx / httpx2 | ≥ 0.27 |
| Test Runner | pytest | ≥ 8.0 |

### Frontend

| Component | Technology | Version |
|:----------|:-----------|:--------|
| UI Framework | React | 19 |
| Language | TypeScript | ~7.0 |
| Build Tool | Vite | 8 |
| Styling | TailwindCSS | 3.4 |
| Icons | lucide-react | 1.74 |
| Animations | canvas-confetti | 1.9 |
| CSS Utilities | clsx, tailwind-merge | — |

---

## 7. Project Folder Structure

```
priyanka/
├── backend/
│   ├── app/
│   │   ├── main.py                      # FastAPI app entry point, SPA mount, demo seeding
│   │   ├── core/
│   │   │   └── config.py                # Settings, paths, health score weights
│   │   ├── database/
│   │   │   └── session.py               # SQLAlchemy SQLite engine & session factory
│   │   ├── models/
│   │   │   └── entities.py              # DB models: Repository, Scan, Finding,
│   │   │                                #   RiskRelationship, PatchProposal, AuditReport
│   │   ├── schemas/
│   │   │   └── pydantic_models.py       # Pydantic request/response schemas
│   │   ├── api/
│   │   │   ├── repositories.py          # GET/POST /repositories, /upload, /connect, /demo
│   │   │   ├── scans.py                 # POST /scans, GET /scans/:id, /progress, /findings
│   │   │   ├── findings.py              # PATCH /findings/:id/status, POST /:id/patch
│   │   │   ├── relationships.py         # GET /scans/:id/relationships
│   │   │   ├── patches.py               # GET /scans/:id/patches, POST /patches/:id/verify
│   │   │   └── reports.py               # GET /reports/:scanId, /html, /download
│   │   ├── analyzers/
│   │   │   ├── ir.py                    # Intermediate Representation data classes
│   │   │   ├── language_detector.py     # File extension → language mapping
│   │   │   ├── ast_analyzer.py          # Python AST → IRSymbol, IREndpoint extraction
│   │   │   ├── dependency_analyzer.py   # requirements.txt/package.json → CVE lookup
│   │   │   └── repository_analyzer.py  # Orchestrates IR build from repo path
│   │   ├── agents/
│   │   │   ├── security_agent.py        # Secrets, SQL injection, command injection, CVE
│   │   │   ├── gap_agent.py             # Missing auth, validation, tests, docs, idempotency
│   │   │   ├── slop_agent.py            # Unused imports, high complexity, empty stubs
│   │   │   ├── loose_end_agent.py       # TODO/FIXME markers, swallowed exceptions, trivial tests
│   │   │   └── correlation_agent.py     # Cross-issue risk cluster graph builder
│   │   ├── orchestration/
│   │   │   └── scan_orchestrator.py     # 10-stage pipeline coordinator & health score engine
│   │   ├── verification/
│   │   │   └── sandbox.py               # Patch diff generator, ephemeral sandbox runner
│   │   ├── reports/
│   │   │   └── generator.py             # Standalone HTML & JSON audit report generator
│   │   └── demo_repos/
│   │       ├── omnibank_microservices/  # Vulnerable demo: payment router (29 findings)
│   │       │   ├── services/
│   │       │   │   ├── transfer_service.py
│   │       │   │   ├── billing_service.py
│   │       │   │   └── admin_service.py
│   │       │   └── tests/test_health.py
│   │       └── clean_core/              # Hardened demo: zero-trust reference (health ~98/100)
│   │           ├── services/
│   │           │   └── account_service.py
│   │           └── tests/test_account_service.py
│   ├── tests/
│   │   └── test_audit_engine.py         # 8 pytest suites covering all agents + orchestration
│   ├── data/                            # Auto-created: SQLite DB, uploads, sandbox, reports
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── main.tsx                     # React app entry point
│   │   ├── App.tsx                      # Root state orchestrator & router
│   │   ├── index.css                    # Tailwind CSS tokens & global styles
│   │   ├── components/
│   │   │   ├── DottedNetworkBackground.tsx  # Interactive 3D canvas particle system
│   │   │   └── common/
│   │   │       ├── Navbar.tsx           # Top navigation bar
│   │   │       ├── Sidebar.tsx          # Scan results sidebar navigation
│   │   │       ├── HealthScoreGauge.tsx # SVG arc gauge (0–100)
│   │   │       └── SeverityBadge.tsx    # Color-coded severity chips
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── ConnectRepoPage.tsx
│   │   │   ├── ScanningPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── MissingnessPage.tsx
│   │   │   ├── SecurityPage.tsx
│   │   │   ├── CodeQualityPage.tsx
│   │   │   ├── LooseEndsPage.tsx
│   │   │   ├── RiskCorrelationPage.tsx
│   │   │   ├── ProofBeforeFixPage.tsx
│   │   │   └── ReportsPage.tsx
│   │   ├── services/
│   │   │   └── api.ts                   # Typed REST API client
│   │   └── types/
│   │       └── index.ts                 # TypeScript interfaces for all entities
│   ├── dist/                            # Pre-compiled production bundle (served by FastAPI)
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docs/
│   ├── api.md                           # Full REST API documentation
│   ├── architecture.md                  # Detailed architecture notes
│   ├── setup.md                         # Extended setup guide
│   └── testing.md                       # Test suite documentation
├── .env.example                         # Sample environment variables
├── .gitignore
└── README.md
```

---

## 8. Database Schema

Code Sentinel uses **SQLite** by default (no external database required). All tables are auto-created on first startup via SQLAlchemy.

```
┌──────────────────────┐       ┌───────────────────────────────┐
│     repositories     │       │            scans              │
│──────────────────────│       │───────────────────────────────│
│ id (PK)              │──┐    │ id (PK)                       │
│ name                 │  └───►│ repository_id (FK)            │
│ description          │       │ status (queued/running/done)  │
│ source_type          │       │ progress (0–100)              │
│ source_path          │       │ current_stage                 │
│ branch               │       │ stages_data (JSON)            │
│ created_at           │       │ health_score (0.0–100.0)      │
│ updated_at           │       │ files_analyzed                │
└──────────────────────┘       │ lines_of_code                 │
                                │ languages_data (JSON)         │
                                │ issues_summary (JSON)         │
                                │ started_at / completed_at    │
                                └───────────────────────────────┘
                                           │
              ┌────────────────────────────┼──────────────────────┐
              ▼                            ▼                      ▼
┌───────────────────────┐  ┌────────────────────────┐  ┌───────────────────────┐
│       findings        │  │   risk_relationships   │  │    patch_proposals    │
│───────────────────────│  │────────────────────────│  │───────────────────────│
│ id (PK)               │  │ id (PK)                │  │ id (PK)               │
│ scan_id (FK)          │  │ scan_id (FK)           │  │ finding_id (FK)       │
│ repository_id (FK)    │  │ cluster_name           │  │ scan_id (FK)          │
│ category              │  │ severity               │  │ file_path             │
│ rule_id               │  │ affected_workflow      │  │ original_code         │
│ title                 │  │ narrative              │  │ proposed_code         │
│ severity              │  │ node_ids_data (JSON)   │  │ diff_unified          │
│ confidence            │  │ graph_data (JSON)      │  │ explanation           │
│ gap_type / gap_label  │  └────────────────────────┘  │ status                │
│ file_path             │                               │ sandbox_log           │
│ line_start / line_end │                               │ before/after_metrics  │
│ code_snippet          │                               │ verified_at           │
│ description           │                               └───────────────────────┘
│ why_it_matters        │
│ evidence              │          ┌───────────────────────┐
│ recommendation        │          │     audit_reports     │
│ cwe_id                │          │───────────────────────│
│ masked_secret         │          │ id (PK)               │
│ status                │          │ scan_id               │
│ verification_status   │          │ repository_id         │
└───────────────────────┘          │ title                 │
                                    │ health_score          │
                                    │ summary_data (JSON)   │
                                    │ html_content          │
                                    │ generated_at          │
                                    └───────────────────────┘
```

---

## 9. API Reference

All endpoints are prefixed with `/api`. Interactive docs available at **http://localhost:8000/docs**.

### Repositories

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/repositories` | List all repositories |
| `GET` | `/api/repositories/{repo_id}` | Get repository by ID |
| `POST` | `/api/repositories/upload` | Upload a ZIP archive (multipart, max 50 MB) |
| `POST` | `/api/repositories/connect` | Clone a public GitHub repository |
| `POST` | `/api/repositories/demo/{demo_type}` | Load a pre-seeded demo (`omnibank` or `clean`) |

### Scans

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/scans` | Start a new scan (`{ repository_id }`) |
| `GET` | `/api/scans/{scan_id}` | Get scan details |
| `GET` | `/api/scans/{scan_id}/progress` | Poll scan progress (stage, %, LOC, health score) |
| `GET` | `/api/scans/{scan_id}/findings` | Get findings (filterable by `category`, `severity`, `gap_type`, `search`) |
| `GET` | `/api/scans/{scan_id}/relationships` | Get risk correlation clusters |
| `GET` | `/api/scans/{scan_id}/patches` | Get patch proposals |

### Findings

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `PATCH` | `/api/findings/{finding_id}/status` | Update status (`open` / `resolved` / `dismissed`) |
| `POST` | `/api/findings/{finding_id}/patch` | Generate a patch proposal for a finding |

### Patches

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/patches/{patch_id}/verify` | Execute patch in isolated sandbox |

### Reports

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/reports/{scan_id}` | Get full JSON audit report |
| `GET` | `/api/reports/{scan_id}/html` | Serve standalone HTML report |
| `GET` | `/api/reports/{scan_id}/download?format=html\|json` | Download report file |

### Health & Info

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/info` | Platform name, version, tagline |

---

## 10. The 5 Specialist Agents

### 🔐 Security Agent (`security_agent.py`)

Runs deterministic pattern-matching across the full IR for:

| Rule ID | Severity | CWE | What It Detects |
|:--------|:---------|:----|:----------------|
| `hardcoded_secret` | Critical | CWE-798 | API keys, AWS keys, Stripe keys, DB passwords, JWT tokens in source |
| `sql_injection` | Critical | CWE-89 | f-string / `%` / `.format()` interpolation in SQL `execute()` calls |
| `command_injection` | Critical | CWE-78 | `os.system()`, `subprocess.Popen()` with dynamic strings |
| `unsafe_eval` | High | CWE-95 | `eval()`, `pickle.loads()`, `yaml.load()` without `safe_load` |
| `vulnerable_dependency` | Varies | Varies | Package versions matched against internal CVE database |

Secrets are **automatically masked** in evidence output (e.g., `sk_...key` → `sk_...key`).

---

### 🕳️ Missingness Agent (`gap_agent.py`)

Identifies engineering requirements that are absent:

| Rule ID | Severity | CWE | Gap Type |
|:--------|:---------|:----|:---------|
| `missing_endpoint_authentication` | Critical/High | CWE-306 | Sensitive/mutating routes with no auth dependency |
| `missing_input_validation` | High | CWE-20 | POST/PUT/PATCH routes without Pydantic/Zod schema |
| `missing_error_handling` | Medium | CWE-755 | DB/external ops with no try/except block |
| `missing_automated_tests` | High/Medium | — | Endpoints with 0 matching test cases |
| `doc_implementation_mismatch` | Medium | — | README/OpenAPI promises rate limiting; code lacks it |
| `missing_idempotency_safeguard` | High | — | Financial routes without idempotency key logic |

---

### 🧹 Code Slop Agent (`slop_agent.py`)

Static AST analysis for code quality issues:

| Rule ID | Severity | What It Detects |
|:--------|:---------|:----------------|
| `unused_import` | Low | Imported symbols never referenced in the module |
| `empty_function_stub` | Medium | Functions containing only `pass` or no body |
| `high_complexity` | Medium | Functions with cyclomatic complexity > 10 |

---

### 🔗 Loose-End Agent (`loose_end_agent.py`)

Detects technical debt signals:

| Rule ID | Severity | What It Detects |
|:--------|:---------|:----------------|
| `unfinished_todo_comment` | Low–High | TODO markers (high severity if security-related keywords present) |
| `unfinished_fixme_comment` | High | FIXME, HACK, XXX markers |
| `swallowed_exception` | High | `except: pass` or empty catch blocks |
| `trivial_test_mockery` | Medium | Tests with only `assert True` or placeholder mocks |

---

### 🕸️ Risk Correlation Agent (`correlation_agent.py`)

Groups findings from multiple agents into compound risk clusters with:
- **Node-link graph** (nodes: findings, files, endpoints; edges: shared workflow, data dependency, security risk)
- **Narrative synthesis**: human-readable compound risk description (e.g., *"POST /api/v1/transfer has no auth, no idempotency, and SQL injection — full payment hijack surface"*)
- **Graph data** serialized as JSON for the interactive React visualization

---

## 11. Health Score Engine

The Engineering Health Score starts at **100** and deducts weighted penalties per finding:

| Category | Severity | Penalty |
|:---------|:---------|:--------|
| Security | Critical | −18.0 pts |
| Security | High | −10.0 pts |
| Security | Medium | −4.0 pts |
| Security | Low | −1.0 pts |
| Missingness | Critical | −14.0 pts |
| Missingness | High | −8.0 pts |
| Missingness | Medium | −3.0 pts |
| Missingness | Low | −1.0 pts |
| Loose-End | Critical | −6.0 pts |
| Loose-End | High | −3.0 pts |
| Loose-End | Medium | −1.0 pts |
| Code Slop | Any | −1.5 pts |

Score is clamped to `[0, 100]`. The OmniBank demo consistently scores **< 70**. The CleanCore reference scores **~98/100**.

---

## 12. Proof Before Fix — Sandbox Verifier

The `SandboxVerifier` (`verification/sandbox.py`) generates **unified diffs** and verifies fixes in an ephemeral isolated workspace:

**Supported rule-specific patch templates:**

| Rule ID | Patch Action |
|:--------|:-------------|
| `sql_injection` | Replaces dynamic f-string SQL with parameterized `%s` bound query |
| `missing_endpoint_authentication` | Injects authentication guard comment and enforcement block |
| `missing_input_validation` | Adds bounds check (`if float(amount) <= 0: raise HTTPException(400)`) |
| `hardcoded_secret` | Replaces literal secret with `os.getenv('KEY', 'default')` |
| `swallowed_exception` | Replaces `except: pass` with structured `except Exception as e: logger.error(e)` |

**Sandbox verification steps:**
1. Copy repository into ephemeral workspace (`backend/data/sandbox/`)
2. Apply unified diff patch
3. Run Python syntax check (`py_compile`)
4. Re-run security and missingness agents on patched code
5. Execute `pytest` regression suite (30-second timeout)
6. Report `sandbox_verified` or `failed` with full sandbox log

---

## 13. Demo Repositories

Two pre-seeded repositories are bundled and require **zero external setup**:

### OmniBank Microservices (Vulnerable)
Located at `backend/app/demo_repos/omnibank_microservices/`

| File | Intentional Issues |
|:-----|:-------------------|
| `services/transfer_service.py` | Hardcoded Stripe key, SQL injection, no auth, no idempotency |
| `services/billing_service.py` | Missing input validation, swallowed exceptions |
| `services/admin_service.py` | Unauthenticated admin DELETE endpoint, TODO security bypass |
| `tests/test_health.py` | Trivial test with only `assert True` |

**Expected output**: ~29 findings, Health Score < 70, multiple compound risk clusters.

### CleanCore Reference Service (Hardened)
Located at `backend/app/demo_repos/clean_core/`

- JWT authentication on all mutating endpoints
- Full Pydantic schema validation
- Complete `try/except` with rollback on all DB operations
- 100% test coverage with meaningful assertions

**Expected output**: 0 critical findings, Health Score ~98/100.

---

## 14. Installation & Quick Start

### Prerequisites

- Python 3.11+ (tested through 3.14)
- Node.js 18+ and npm (only needed to rebuild frontend; pre-built `dist/` is included)
- Git (required for GitHub URL cloning feature)

### Quick Start — Single Server Mode (Recommended)

The pre-built frontend is already compiled inside `frontend/dist/` and served automatically by FastAPI.

**Step 1 — Activate the virtual environment:**
```powershell
cd C:\Users\venky\Downloads\priyanka\priyanka
.\venv\Scripts\activate
```

**Step 2 — Set PYTHONPATH and start the server:**
```powershell
$env:PYTHONPATH = "C:\Users\venky\Downloads\priyanka\priyanka\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

**Step 3 — Open in browser:**
```
http://localhost:8000
```

> **Tip:** Combine both commands into one line to avoid forgetting PYTHONPATH:
> ```powershell
> $env:PYTHONPATH="C:\Users\venky\Downloads\priyanka\priyanka\backend"; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
> ```

On first startup, CODE SENTINEL will:
- Auto-create the SQLite database at `backend/data/code_sentinel.db`
- Auto-seed the OmniBank and CleanCore demo repositories
- Serve the React SPA from `frontend/dist/`

---

### Developer Mode — Separate Frontend & Backend

Use this if you want hot-reload on both frontend and backend simultaneously.

**Terminal 1 — Backend (with auto-reload):**
```powershell
cd C:\Users\venky\Downloads\priyanka\priyanka
.\venv\Scripts\activate
$env:PYTHONPATH="C:\Users\venky\Downloads\priyanka\priyanka\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend (Vite dev server):**
```powershell
cd C:\Users\venky\Downloads\priyanka\priyanka\frontend
npm run dev
```

Then open **http://localhost:5173** (the Vite dev server proxies API calls to `localhost:8000`).

---

### Installing Dependencies (if venv is missing)

```powershell
# Backend
cd C:\Users\venky\Downloads\priyanka\priyanka
python -m venv venv
.\venv\Scripts\activate
pip install -r backend/requirements.txt

# Frontend (only needed to rebuild the dist/)
cd frontend
npm install
npm run build
```

---

## 15. Configuration

Copy `.env.example` to `.env` and edit as needed. All settings have safe defaults — no `.env` file is required for local development.

```env
# Application
PROJECT_NAME="CODE SENTINEL"
VERSION="1.0.0"
API_V1_PREFIX="/api"
HOST="127.0.0.1"
PORT=8000

# Database (defaults to local SQLite — no setup required)
DATABASE_URL="sqlite:///./data/code_sentinel.db"
# Uncomment for PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/code_sentinel"

# Security & Upload Limits
MAX_UPLOAD_SIZE_MB=50          # Maximum ZIP upload size
SANDBOX_TIMEOUT_SECONDS=30    # Sandbox pytest execution timeout

# Optional LLM Key for contextual reasoning
# Without these keys, CODE SENTINEL runs fully deterministically via AST analysis.
# OPENAI_API_KEY="sk-..."
# GEMINI_API_KEY="..."
```

---

## 16. Running Tests

CODE SENTINEL ships with **8 comprehensive pytest test suites** covering all agents, the full orchestration pipeline, and correctness of the demo repositories.

```powershell
# From the project root
.\venv\Scripts\activate
$env:PYTHONPATH="C:\Users\venky\Downloads\priyanka\priyanka\backend"
python -m pytest backend/tests/test_audit_engine.py -v
```

### Test Suite Breakdown

| Test | What It Verifies |
|:-----|:----------------|
| `test_language_detection` | IR correctly detects Python, counts LOC, extracts ≥2 endpoints and ≥3 dependencies |
| `test_security_agent` | Finds `hardcoded_secret` and `sql_injection` in OmniBank; confirms secret masking |
| `test_missingness_agent` | Finds `missing_endpoint_authentication`, `missing_input_validation`, `missing_automated_tests`, `doc_implementation_mismatch` |
| `test_loose_end_agent` | Finds `unfinished_*_comment`, `swallowed_exception`, `trivial_test_mockery` |
| `test_code_slop_agent` | Finds `unused_import`, `empty_function_stub` in OmniBank |
| `test_risk_correlation` | Produces ≥1 cluster with non-empty graph nodes and edges |
| `test_clean_repo_high_score` | Verifies CleanCore has **0 critical security findings** |
| `test_full_orchestration` | End-to-end: creates repo + scan, runs all 10 stages, asserts `status=completed`, `progress=100`, `health_score < 70`, `findings > 5`, risk clusters, and patch proposals exist |

**Expected result: 8/8 tests pass.**

---

## 17. Known Limitations

- **Dynamic cloud runtime behaviors** (e.g., AWS IAM role permissions at runtime) require deployed infrastructure probing — static analysis cannot detect these.
- **Compiled closed-source binaries** (C/C++ without debug symbols) rely on heuristic symbol table analysis only.
- **Third-party API rate limits** apply to unauthenticated public GitHub clone operations via the GitHub API.
- **Language coverage**: Full AST analysis is currently implemented for **Python**. JavaScript/TypeScript, Go, Java, and other languages are detected and indexed but rely on regex-based endpoint and pattern extraction rather than full AST parsing.
- **No LLM dependency**: CODE SENTINEL operates fully deterministically. The optional `OPENAI_API_KEY` / `GEMINI_API_KEY` configuration is reserved for future contextual reasoning features.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Run the test suite to confirm all 8 tests pass
4. Submit a pull request with a description of the change

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*CODE SENTINEL — Find what is wrong. Discover what is missing. Prove the fix works.*
