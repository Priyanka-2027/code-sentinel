# CODE SENTINEL — Verification & Testing Protocol

## 1. Running the Automated Test Suite

Code Sentinel includes complete unit and integration test suites covering AST parsing, language detectors, all five specialist agents, risk correlation, and end-to-end orchestration:

```powershell
# Run all backend unit & integration tests
$env:PYTHONPATH="d:\priyanka\backend"
.\venv\Scripts\pytest backend/tests/test_audit_engine.py -v
```

### Verified Test Categories:
1. `test_language_detection`: Confirms multi-language file indexing and LOC calculation.
2. `test_security_agent`: Verifies deterministic discovery of hardcoded secrets, SQL injection vectors, and automatic secret masking.
3. `test_missingness_agent`: Verifies discovery of missing authentication on sensitive endpoints, missing validation schemas, missing test coverage, and documentation mismatches.
4. `test_loose_end_agent`: Tests extraction of FIXME/TODO comments, swallowed exceptions (`except: pass`), and incomplete tests.
5. `test_code_slop_agent`: Verifies detection of unused imports, cyclomatic complexity branches, and empty placeholder stubs.
6. `test_risk_correlation`: Verifies compound cluster formation with graph nodes and edges.
7. `test_clean_repo_high_score`: Confirms that the hardened reference repository receives zero critical flags.
8. `test_full_orchestration`: End-to-end execution of the 10-stage scan pipeline, database persistence, and patch proposal generation.

---

## 2. Testing Frontend Production Compilation

```powershell
cd frontend
npm run build
```
Confirms TypeScript strict type checking passes and generates the production bundle in `dist/`.
