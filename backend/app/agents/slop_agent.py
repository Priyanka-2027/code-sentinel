import uuid
from typing import List, Dict
from app.analyzers.ir import IRRepository
from app.models.entities import Finding

class CodeSlopAgent:
    @staticmethod
    def run(ir_repo: IRRepository, scan_id: str) -> List[Finding]:
        findings: List[Finding] = []

        # 1. Unused imports & Empty stub functions
        for rel_path, ir_file in ir_repo.files.items():
            for sym in ir_file.symbols:
                if sym.kind == "unused_import":
                    findings.append(Finding(
                        id=f"SLP-{uuid.uuid4().hex[:8]}",
                        scan_id=scan_id,
                        repository_id=ir_repo.id,
                        category="quality",
                        rule_id="unused_import",
                        title=f"Unused Import: '{sym.name}'",
                        severity="low",
                        confidence=0.92,
                        gap_type="code_bloat",
                        gap_label="Confirmed gap",
                        file_path=rel_path,
                        line_start=sym.line_start,
                        line_end=sym.line_end,
                        code_snippet=f"import {sym.name}",
                        description=f"Module or symbol '{sym.name}' is imported but never referenced anywhere in this module.",
                        why_it_matters="Unused imports inflate startup time, introduce unnecessary coupling, and clutter namespaces.",
                        evidence=f"{rel_path} Line {sym.line_start}: '{sym.name}' is unreferenced in AST.",
                        recommendation=f"Remove the unused import '{sym.name}'.",
                        status="open",
                        verification_status="unverified"
                    ))
                elif sym.kind == "empty_stub":
                    findings.append(Finding(
                        id=f"SLP-{uuid.uuid4().hex[:8]}",
                        scan_id=scan_id,
                        repository_id=ir_repo.id,
                        category="quality",
                        rule_id="empty_function_stub",
                        title=f"Empty Placeholder Function: '{sym.name}'",
                        severity="medium",
                        confidence=0.95,
                        gap_type="placeholder_code",
                        gap_label="Confirmed gap",
                        file_path=rel_path,
                        line_start=sym.line_start,
                        line_end=sym.line_end,
                        code_snippet=f"def {sym.name}(...): pass",
                        description=f"Function '{sym.name}' contains only pass or an empty return with no operational logic.",
                        why_it_matters="Placeholder functions mislead callers into assuming functionality is implemented, causing silent failures.",
                        evidence=f"{rel_path} Lines {sym.line_start}-{sym.line_end}: function body contains only pass/return None.",
                        recommendation="Implement the required logic or remove the stub if deprecated.",
                        status="open",
                        verification_status="unverified"
                    ))

                # 2. Excessive Cyclomatic Complexity
                if sym.complexity > 10:
                    severity = "high" if sym.complexity > 18 else "medium"
                    findings.append(Finding(
                        id=f"SLP-{uuid.uuid4().hex[:8]}",
                        scan_id=scan_id,
                        repository_id=ir_repo.id,
                        category="quality",
                        rule_id="excessive_complexity",
                        title=f"High Cyclomatic Complexity ({sym.complexity}) in '{sym.name}'",
                        severity=severity,
                        confidence=0.94,
                        gap_type="maintainability_risk",
                        gap_label="Confirmed gap",
                        file_path=rel_path,
                        line_start=sym.line_start,
                        line_end=sym.line_end,
                        code_snippet=f"{sym.name}() with complexity {sym.complexity}",
                        description=f"Function '{sym.name}' has a cyclomatic complexity of {sym.complexity}, indicating deeply nested control flow.",
                        why_it_matters="High complexity makes functions error-prone, difficult to reason about, and almost impossible to test exhaustively.",
                        evidence=f"Branches count: {sym.complexity} detected across nested if/for/while/try blocks.",
                        recommendation="Refactor into smaller single-responsibility helper functions.",
                        status="open",
                        verification_status="unverified"
                    ))

        # 3. Duplicate code / Duplicate function signatures
        func_signatures: Dict[str, List[tuple]] = {}
        for rel_path, ir_file in ir_repo.files.items():
            for sym in ir_file.symbols:
                if sym.kind == "function":
                    func_signatures.setdefault(sym.name, []).append((rel_path, sym.line_start))

        for func_name, locations in func_signatures.items():
            if len(locations) > 1 and not func_name.startswith("__") and not func_name.startswith("test_"):
                loc_strings = [f"{loc[0]}:{loc[1]}" for loc in locations]
                findings.append(Finding(
                    id=f"SLP-{uuid.uuid4().hex[:8]}",
                    scan_id=scan_id,
                    repository_id=ir_repo.id,
                    category="quality",
                    rule_id="duplicate_function_logic",
                    title=f"Potential Duplicate Implementation: '{func_name}'",
                    severity="low",
                    confidence=0.82,
                    gap_type="redundant_logic",
                    gap_label="Potential gap",
                    file_path=locations[0][0],
                    line_start=locations[0][1],
                    line_end=locations[0][1],
                    code_snippet=f"Function {func_name} defined in multiple modules",
                    description=f"Function name '{func_name}' is declared redundantly across {len(locations)} locations: {', '.join(loc_strings)}.",
                    why_it_matters="Duplicated logic violates DRY principles, leading to divergent bug fixes and inconsistent system state.",
                    evidence=f"Identical symbol detected in {', '.join(loc_strings)}",
                    recommendation="Consolidate duplicate logic into a shared utility or service module.",
                    status="open",
                    verification_status="unverified"
                ))

        return findings
