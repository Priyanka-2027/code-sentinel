# AI Development Log (AI_LOG.md)

## Project: CODE SENTINEL
**Architecture-Agnostic Autonomous Engineering Auditor**
*Repository*: [https://github.com/Priyanka-2027/code-sentinel](https://github.com/Priyanka-2027/code-sentinel)

---

## 1. Executive Summary & AI Interaction Overview
This project was conceptualized, structured, and implemented with AI agent assistance to solve the critical problem of autonomous code auditing and engineering triage. Traditional static analysis tools focus on explicit syntax violations; CODE SENTINEL introduces **Missingness Intelligence** to autonomously detect what *should* exist but *does not exist* in software repositories.

---

## 2. Iteration Log & Design Decisions

### Phase 1: Problem Definition & Architecture Conception
- **Goal:** Design an architecture-agnostic autonomous auditor capable of multi-agent triage across security, missingness, quality, and debt.
- **AI Directives:**
  - Establish a Normalized Intermediate Representation (IR) to abstract multi-language ASTs.
  - Implement 5 specialist agents: Security, Missingness, Slop, Loose Ends, and Risk Correlation.
  - Require an isolated sandbox verifier ("Proof Before Fix") to generate unified diffs and prove fixes work before applying them.
- **Architectural Decision:** Decoupled FastAPI backend with asynchronous SQLite persistence and a high-performance React 19 / TypeScript single-page application.

### Phase 2: Agent Implementation & Deterministic AST Analysis
- **Goal:** Eliminate hallucinations by enforcing deterministic code auditing rules (AST traversals and verified regex patterns).
- **Key Modules Developed:**
  - `security_agent.py`: High-entropy credential extraction, dynamic SQL injection tracing, and CVE dependency lookup.
  - `gap_agent.py` (*Missingness Intelligence*): Sensitive endpoint authorization gap detection, unconstrained parameter validation checks, unhandled database exception checks, and documentation mismatch detectors.
  - `slop_agent.py`: AST unreferenced import analysis and empty stub detection.
  - `loose_end_agent.py`: Technical debt markers (TODO/FIXME/HACK) and swallowed exception detection.
  - `correlation_agent.py`: Multi-finding risk topology synthesis constructing directed bipartite vulnerability graphs.

### Phase 3: "Proof Before Fix" Sandbox Verification
- **Goal:** Autonomous patch proposal generation and execution in an isolated workspace.
- **Implementation:**
  - Synthesize unified diffs tailored to specific vulnerability CWE classes.
  - Replicate repositories in an ephemeral sandbox directory (`data/sandbox/`).
  - Run AST syntax checks and regression test suites (`pytest`) to confirm fixes resolve vulnerabilities without causing regressions.

### Phase 4: Compatibility & Verification Suite
- **Goal:** Full test coverage across all inspection agents and scan pipelines.
- **Bug Fixed During AI Audit:**
  - Identified Python 3.14 deprecation of `ast.Str` in AST visitor routines; refactored AST inspection to use `ast.Constant` with safe backwards-compatible fallback.
  - Validated 100% pass rate across all 8 pytest test suites in `backend/tests/test_audit_engine.py`.

---

## 3. Human Oversight & Validation Process
- Every rule definition and AST node mapping was verified against language standards (PEP 8, OWASP Top 10, CWE).
- Sensitive operations (financial routing, database mutation) were validated using simulated banking microservices (`OmniBank`) and hardened reference services (`CleanCore`).
- Git push protection and secret governance policies were audited to ensure zero real credentials exist in the source tree.

---

## 4. Autonomous Run & Test Commands
- **Backend API Server:** `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`
- **Frontend Development:** `npm run dev` (inside `frontend/`)
- **Automated Verification Suite:** `python -m pytest backend/tests/test_audit_engine.py -v`
