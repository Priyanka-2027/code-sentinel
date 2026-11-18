import uuid
import re
from typing import List, Dict, Set
from app.analyzers.ir import IRRepository, IREndpoint
from app.models.entities import Finding

class MissingnessAgent:
    @staticmethod
    def run(ir_repo: IRRepository, scan_id: str) -> List[Finding]:
        findings: List[Finding] = []

        # 1. Missing Authentication / Authorization on Sensitive Endpoints
        sensitive_keywords = ["admin", "transfer", "payout", "payment", "delete", "destroy", "account", "settings", "password", "reset", "secret", "billing"]

        for ep in ir_repo.all_endpoints:
            is_sensitive_path = any(k in ep.path.lower() for k in sensitive_keywords)
            is_write_method = ep.http_method in ["POST", "PUT", "DELETE", "PATCH"]

            if (is_sensitive_path or is_write_method) and not ep.has_auth:
                severity = "critical" if is_sensitive_path and ep.http_method in ["POST", "DELETE"] else "high"
                label = "Confirmed gap" if is_sensitive_path else "Potential gap"

                findings.append(Finding(
                    id=f"GAP-{uuid.uuid4().hex[:8]}",
                    scan_id=scan_id,
                    repository_id=ir_repo.id,
                    category="missingness",
                    rule_id="missing_endpoint_authentication",
                    title=f"Missing Authentication Guard on {ep.http_method} {ep.path}",
                    severity=severity,
                    confidence=0.94 if is_sensitive_path else 0.86,
                    gap_type="missing_auth",
                    gap_label=label,
                    file_path=ep.file_path,
                    line_start=ep.line_number,
                    line_end=ep.line_number + 3,
                    code_snippet=f"@{ep.http_method.lower()}('{ep.path}')\ndef {ep.handler_name}(...):",
                    description=f"Endpoint '{ep.http_method} {ep.path}' performs state-changing or privileged operations without requiring authentication or token validation.",
                    why_it_matters="Unauthenticated endpoints allow arbitrary external callers to trigger sensitive business operations, mutate financial or user records, or access restricted data.",
                    evidence=f"Endpoint handler '{ep.handler_name}' at {ep.file_path}:{ep.line_number} lacks security dependencies, auth decorators, or middleware checks.",
                    recommendation=f"Add authentication middleware (e.g., Depends(get_current_user) or @login_required) to enforce identity verification before execution.",
                    cwe_id="CWE-306",
                    status="open",
                    verification_status="unverified"
                ))

        # 2. Missing Input Validation on User-Controlled Parameters
        for ep in ir_repo.all_endpoints:
            if ep.http_method in ["POST", "PUT", "PATCH"]:
                if not ep.has_input_validation:
                    findings.append(Finding(
                        id=f"GAP-{uuid.uuid4().hex[:8]}",
                        scan_id=scan_id,
                        repository_id=ir_repo.id,
                        category="missingness",
                        rule_id="missing_input_validation",
                        title=f"Missing Input Validation Schema for {ep.http_method} {ep.path}",
                        severity="high",
                        confidence=0.89,
                        gap_type="missing_validation",
                        gap_label="Confirmed gap",
                        file_path=ep.file_path,
                        line_start=ep.line_number,
                        line_end=ep.line_number + 2,
                        code_snippet=f"def {ep.handler_name}({', '.join(ep.parameters)}):",
                        description=f"Route '{ep.http_method} {ep.path}' accepts incoming request parameters without schema validation, bounds checking, or type enforcement.",
                        why_it_matters="Accepting untrusted input without schema constraints exposes the backend to injection, malformed data corruption, type errors, and unexpected state changes.",
                        evidence=f"Parameters ({', '.join(ep.parameters)}) in handler '{ep.handler_name}' lack schema validation models (such as Pydantic, Zod, or Joi).",
                        recommendation="Define a strict Pydantic/Zod request schema with explicit field constraints (e.g. gt=0, max_length, regex) and inject it into the route handler.",
                        cwe_id="CWE-20",
                        status="open",
                        verification_status="unverified"
                    ))

        # 3. Missing Error Handling Around Database / External Ops
        for ep in ir_repo.all_endpoints:
            if ep.sensitive_operations and not ep.has_error_handling:
                findings.append(Finding(
                    id=f"GAP-{uuid.uuid4().hex[:8]}",
                    scan_id=scan_id,
                    repository_id=ir_repo.id,
                    category="missingness",
                    rule_id="missing_error_handling",
                    title=f"Missing Error Handling around Database Operations in '{ep.handler_name}'",
                    severity="medium",
                    confidence=0.88,
                    gap_type="missing_error_handling",
                    gap_label="Confirmed gap",
                    file_path=ep.file_path,
                    line_start=ep.line_number,
                    line_end=ep.line_number + 5,
                    code_snippet=f"{ep.handler_name} executes {', '.join(ep.sensitive_operations)} without try/catch block",
                    description=f"Handler '{ep.handler_name}' executes operations ({', '.join(ep.sensitive_operations)}) with no exception handling or rollback safeguards.",
                    why_it_matters="Database or network disconnects will bubble uncaught exceptions to clients, leaking internal stack traces and leaving partial transactions uncommitted.",
                    evidence=f"AST analysis shows zero Try/Except blocks surrounding sensitive operations {ep.sensitive_operations} in {ep.file_path}:{ep.line_number}.",
                    recommendation="Wrap external and database operations in a try-except block, log errors safely, execute rollbacks on failure, and return standard RFC-7807 error responses.",
                    cwe_id="CWE-755",
                    status="open",
                    verification_status="unverified"
                ))

        # 4. Missing Tests for Discovered Endpoints and Critical Workflows
        tested_paths: Set[str] = set()
        for test in ir_repo.all_tests:
            if not test.is_empty_or_trivial:
                tested_paths.add(test.test_name.lower())

        for ep in ir_repo.all_endpoints:
            normalized_ep = ep.path.strip("/").replace("/", "_").replace("{", "").replace("}", "").lower()
            matching_test = any(normalized_ep in t or ep.handler_name.lower() in t for t in tested_paths)

            if not matching_test:
                severity = "high" if any(k in ep.path.lower() for k in sensitive_keywords) else "medium"
                findings.append(Finding(
                    id=f"GAP-{uuid.uuid4().hex[:8]}",
                    scan_id=scan_id,
                    repository_id=ir_repo.id,
                    category="missingness",
                    rule_id="missing_automated_tests",
                    title=f"Missing Automated Test Coverage for {ep.http_method} {ep.path}",
                    severity=severity,
                    confidence=0.91,
                    gap_type="missing_test",
                    gap_label="Confirmed gap",
                    file_path=ep.file_path,
                    line_start=ep.line_number,
                    line_end=ep.line_number,
                    code_snippet=f"Endpoint: {ep.http_method} {ep.path} -> Handler: {ep.handler_name}",
                    description=f"No automated unit or integration tests were detected in the repository covering the workflow of {ep.http_method} {ep.path}.",
                    why_it_matters="Uncovered business workflows are susceptible to undetected regressions, silent bugs, and unverified edge cases during refactoring.",
                    evidence=f"Test directory search found 0 test cases asserting against endpoint '{ep.path}' or function '{ep.handler_name}'.",
                    recommendation=f"Add unit and integration tests under tests/ verifying success cases, invalid inputs, and error states for {ep.path}.",
                    status="open",
                    verification_status="unverified"
                ))

        # 5. Documentation-to-Implementation Mismatches
        for doc in ir_repo.all_docs:
            if doc.documented_endpoint:
                # Find corresponding endpoint
                matching_ep = next((e for e in ir_repo.all_endpoints if e.path.lower() == doc.documented_endpoint.lower()), None)
                if matching_ep:
                    for promise in doc.promised_behaviors:
                        if "rate limit" in promise.lower():
                            # Check if code has rate limiting
                            file_content = ir_repo.files.get(matching_ep.file_path, None)
                            if file_content and "ratelimit" not in file_content.content.lower() and "limiter" not in file_content.content.lower():
                                findings.append(Finding(
                                    id=f"GAP-{uuid.uuid4().hex[:8]}",
                                    scan_id=scan_id,
                                    repository_id=ir_repo.id,
                                    category="missingness",
                                    rule_id="doc_implementation_mismatch",
                                    title=f"Documentation Mismatch: Promised Rate Limiting Missing on {matching_ep.path}",
                                    severity="medium",
                                    confidence=0.92,
                                    gap_type="doc_mismatch",
                                    gap_label="Confirmed gap",
                                    file_path=matching_ep.file_path,
                                    line_start=matching_ep.line_number,
                                    line_end=matching_ep.line_number,
                                    code_snippet=f"Doc ({doc.source_file}:{doc.line_number}): '{doc.title}' promises '{promise}'",
                                    description=f"Documentation in {doc.source_file} explicitly specifies that '{matching_ep.path}' enforces rate limiting, but no rate limiting middleware or throttle check exists in code.",
                                    why_it_matters="Discrepancies between documentation and implementation undermine engineering trust, break client expectations, and leave services vulnerable to abuse.",
                                    evidence=f"Documentation at {doc.source_file}:{doc.line_number} promises rate limiting; code at {matching_ep.file_path} contains zero rate-limiting logic.",
                                    recommendation="Implement rate limiting decorators (e.g. slowapi / Limiter) on the endpoint or update documentation to reflect actual behavior.",
                                    status="open",
                                    verification_status="unverified"
                                ))

        # 6. Missing Safeguards: Rate Limiting / Idempotency on payment or transfer routes
        for ep in ir_repo.all_endpoints:
            if any(k in ep.path.lower() for k in ["transfer", "charge", "payment", "payout"]):
                file_obj = ir_repo.files.get(ep.file_path)
                if file_obj and "idempotency" not in file_obj.content.lower() and "idempotent" not in file_obj.content.lower():
                    findings.append(Finding(
                        id=f"GAP-{uuid.uuid4().hex[:8]}",
                        scan_id=scan_id,
                        repository_id=ir_repo.id,
                        category="missingness",
                        rule_id="missing_idempotency_safeguard",
                        title=f"Missing Idempotency Safeguard on Financial Route {ep.http_method} {ep.path}",
                        severity="high",
                        confidence=0.88,
                        gap_type="missing_safeguard",
                        gap_label="Needs human review",
                        file_path=ep.file_path,
                        line_start=ep.line_number,
                        line_end=ep.line_number,
                        code_snippet=f"Handler {ep.handler_name} processes transactions without idempotency headers",
                        description=f"Endpoint '{ep.http_method} {ep.path}' performs financial transactions but lacks idempotency key verification.",
                        why_it_matters="Network retries by clients or payment gateways can result in duplicate debits or credit transactions.",
                        evidence=f"No Idempotency-Key header extraction or transaction deduplication table lookup found in {ep.file_path}.",
                        recommendation="Require an 'Idempotency-Key' request header and verify it against an idempotent operation store before executing the transfer.",
                        status="open",
                        verification_status="unverified"
                    ))

        return findings
