import uuid
import re
from typing import List
from app.analyzers.ir import IRRepository
from app.models.entities import Finding

CRITICAL_KEYWORDS = ["security", "auth", "bypass", "sanitize", "leak", "vulnerability", "password", "production", "fixme", "hack", "danger"]

class LooseEndAgent:
    @staticmethod
    def run(ir_repo: IRRepository, scan_id: str) -> List[Finding]:
        findings: List[Finding] = []

        # 1. Unfinished comments (TODO, FIXME, HACK, XXX)
        for rel_path, ir_file in ir_repo.files.items():
            for c in ir_file.comments:
                tag = c["tag"]
                text = c["text"]
                line = c["line"]

                is_critical = any(k in text.lower() for k in CRITICAL_KEYWORDS) or tag in ["FIXME", "HACK", "XXX"]
                severity = "high" if is_critical else ("medium" if tag == "TODO" and len(text) > 10 else "low")
                confidence = 0.95

                findings.append(Finding(
                    id=f"LSE-{uuid.uuid4().hex[:8]}",
                    scan_id=scan_id,
                    repository_id=ir_repo.id,
                    category="loose_end",
                    rule_id=f"unfinished_{tag.lower()}_comment",
                    title=f"Unresolved {tag} Marker: '{text[:60]}...'",
                    severity=severity,
                    confidence=confidence,
                    gap_type="unfinished_work",
                    gap_label="Confirmed gap",
                    file_path=rel_path,
                    line_start=line,
                    line_end=line,
                    code_snippet=c["raw"],
                    description=f"Identified {tag} comment denoting unfinished engineering work: \"{text}\".",
                    why_it_matters="Forgotten TODO and FIXME markers often represent technical debt, disabled security checks, or unhandled edge cases left before release.",
                    evidence=f"{rel_path}:{line}: {c['raw']}",
                    recommendation=f"Resolve the technical debt outlined in this {tag} comment or track it formally in the issue backlog.",
                    status="open",
                    verification_status="unverified"
                ))

        # 2. Empty Exception Handlers (except: pass or catch(e) {})
        for rel_path, ir_file in ir_repo.files.items():
            lines = ir_file.content.splitlines()
            for idx, line in enumerate(lines, start=1):
                if re.search(r"except(?:\s+[\w\.]+)?\s*:", line):
                    # Check next 4 lines for only comments or pass
                    has_swallowed_pass = False
                    sub_idx = idx
                    while sub_idx < len(lines) and sub_idx < idx + 4:
                        sub_line = lines[sub_idx].strip()
                        if sub_line == "pass" or sub_line == "...":
                            has_swallowed_pass = True
                            break
                        elif sub_line.startswith("#") or not sub_line:
                            sub_idx += 1
                            continue
                        else:
                            break

                    if has_swallowed_pass or re.search(r"except\s*(?:Exception)?\s*:\s*(?:pass|\.\.\.)", line):
                        findings.append(Finding(
                            id=f"LSE-{uuid.uuid4().hex[:8]}",
                            scan_id=scan_id,
                            repository_id=ir_repo.id,
                            category="loose_end",
                            rule_id="swallowed_exception",
                            title="Swallowed Exception Handler (Silent Failure)",
                            severity="high",
                            confidence=0.96,
                            gap_type="silent_failure",
                            gap_label="Confirmed gap",
                            file_path=rel_path,
                            line_start=idx,
                            line_end=idx + 2,
                            code_snippet=line.strip(),
                            description="An exception block silently catches exceptions and executes 'pass' without logging or recovery.",
                            why_it_matters="Silently suppressing exceptions disguises catastrophic bugs, corrupts data structures, and makes runtime debugging virtually impossible.",
                            evidence=f"{rel_path} Line {idx}: 'except: pass' without logging.",
                            recommendation="Log the caught exception using a structured logger (logger.exception) and re-raise or return a meaningful failure response.",
                            cwe_id="CWE-390",
                            status="open",
                            verification_status="unverified"
                        ))

                # JavaScript catch (e) {}
                if re.search(r"catch\s*\([^)]*\)\s*\{\s*\}", line):
                    findings.append(Finding(
                        id=f"LSE-{uuid.uuid4().hex[:8]}",
                        scan_id=scan_id,
                        repository_id=ir_repo.id,
                        category="loose_end",
                        rule_id="swallowed_exception_js",
                        title="Empty Catch Block Swallowing Errors",
                        severity="high",
                        confidence=0.96,
                        gap_type="silent_failure",
                        gap_label="Confirmed gap",
                        file_path=rel_path,
                        line_start=idx,
                        line_end=idx,
                        code_snippet=line.strip(),
                        description="Empty catch block discards error objects with zero action or telemetry.",
                        why_it_matters="Errors are silently dropped, preventing detection of critical client or API failures.",
                        evidence=f"{rel_path}:{idx}: empty catch block 'catch (err) {{}}'.",
                        recommendation="Log or handle error appropriately.",
                        cwe_id="CWE-390",
                        status="open",
                        verification_status="unverified"
                    ))

        # 3. Trivial or Incomplete Tests
        for test in ir_repo.all_tests:
            if test.is_empty_or_trivial:
                findings.append(Finding(
                    id=f"LSE-{uuid.uuid4().hex[:8]}",
                    scan_id=scan_id,
                    repository_id=ir_repo.id,
                    category="loose_end",
                    rule_id="trivial_test_mockery",
                    title=f"Incomplete/Trivial Test: '{test.test_name}'",
                    severity="medium",
                    confidence=0.94,
                    gap_type="fake_coverage",
                    gap_label="Confirmed gap",
                    file_path=test.file_path,
                    line_start=test.line_number,
                    line_end=test.line_number,
                    code_snippet=f"def {test.test_name}(): assert True",
                    description=f"Test '{test.test_name}' asserts a constant True value without exercising actual business logic.",
                    why_it_matters="Creates an illusion of test coverage in CI/CD pipelines while testing nothing, letting regressions slip through.",
                    evidence=f"Test in {test.file_path}:{test.line_number} contains only tautological assertions (e.g. assert True).",
                    recommendation="Replace dummy assertion with actual system calls asserting real outputs and side-effects.",
                    status="open",
                    verification_status="unverified"
                ))

        return findings
