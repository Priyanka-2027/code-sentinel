import re
import uuid
from typing import List
from app.analyzers.ir import IRRepository
from app.models.entities import Finding

SECRET_PATTERNS = [
    (r"(?:api[_-]?key|apikey|secret|token|auth[_-]?token|password|passwd|pwd)[\s]*[=:][\s]*['\"]([a-zA-Z0-9_\-\.]{12,})['\"]", "High-entropy API key or secret token", "CWE-798"),
    (r"sec_live_[0-9a-zA-Z]{24,}", "Simulated live secret key", "CWE-798"),
    (r"AKIA[0-9A-Z]{16}", "AWS Access Key ID", "CWE-798"),
    (r"(?:postgres|mysql|mongodb|redis)://[^:]+:([^@]+)@", "Database connection credential", "CWE-798"),
    (r"eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*", "Hardcoded JWT Token", "CWE-798"),
]

def mask_secret(val: str) -> str:
    if len(val) <= 6:
        return "***"
    return f"{val[:3]}...{val[-3:]}"

class SecurityAgent:
    @staticmethod
    def run(ir_repo: IRRepository, scan_id: str) -> List[Finding]:
        findings: List[Finding] = []

        # 1. Secret Scanning
        for rel_path, ir_file in ir_repo.files.items():
            lines = ir_file.content.splitlines()
            for idx, line in enumerate(lines, start=1):
                for pattern, desc, cwe in SECRET_PATTERNS:
                    match = re.search(pattern, line, re.IGNORECASE)
                    if match:
                        secret_val = match.group(1) if match.groups() else match.group(0)
                        # Skip dummy placeholders
                        if any(k in secret_val.lower() for k in ["example", "placeholder", "changeme", "test", "demo", "xxx"]):
                            continue
                        masked = mask_secret(secret_val)
                        safe_evidence = line.replace(secret_val, masked).strip()
                        findings.append(Finding(
                            id=f"SEC-{uuid.uuid4().hex[:8]}",
                            scan_id=scan_id,
                            repository_id=ir_repo.id,
                            category="security",
                            rule_id="hardcoded_secret",
                            title=f"Hardcoded Secret Detected: {desc}",
                            severity="critical",
                            confidence=0.96,
                            gap_type="secret_leak",
                            gap_label="Confirmed gap",
                            file_path=rel_path,
                            line_start=idx,
                            line_end=idx,
                            code_snippet=safe_evidence,
                            description=f"Identified hardcoded credential matching pattern '{desc}'. Hardcoded secrets can be extracted by unauthorized users.",
                            why_it_matters="Credentials committed to source control lead directly to unauthorized system access, data theft, or infrastructure takeover.",
                            evidence=f"Line {idx}: {safe_evidence}",
                            recommendation="Extract this secret into a secure environment variable (e.g. os.getenv or .env) or an external secrets vault.",
                            cwe_id=cwe,
                            masked_secret=masked,
                            status="open",
                            verification_status="unverified"
                        ))

        # 2. Injection Flaws (SQL injection, Command injection, Path traversal)
        for rel_path, ir_file in ir_repo.files.items():
            lines = ir_file.content.splitlines()
            for idx, line in enumerate(lines, start=1):
                # SQL Injection via dynamic string interpolation (f-strings, format, % or concatenation with SQL keywords)
                is_sql_interpolation = bool(
                    re.search(r"(?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\s+.*?(?:WHERE|SET|FROM|INTO)", line, re.IGNORECASE) and
                    (re.search(r"f['\"].*?\{", line) or re.search(r"['\"].*?%\s*\(", line) or re.search(r"['\"].*?\+\s*[a-zA-Z_]", line) or ".format(" in line)
                ) or bool(
                    re.search(r"(?:execute|raw)\s*\(\s*f['\"]", line, re.IGNORECASE) or
                    re.search(r"(?:execute|raw)\s*\(\s*query\b", line, re.IGNORECASE) and any(
                        "UPDATE " in l or "SELECT " in l or "INSERT " in l for l in lines[max(0, idx-5):idx]
                    )
                )

                if is_sql_interpolation:
                    findings.append(Finding(
                        id=f"SEC-{uuid.uuid4().hex[:8]}",
                        scan_id=scan_id,
                        repository_id=ir_repo.id,
                        category="security",
                        rule_id="sql_injection",
                        title="Potential SQL Injection via Dynamic Query Construction",
                        severity="critical",
                        confidence=0.92,
                        gap_type="insecure_query",
                        gap_label="Confirmed gap",
                        file_path=rel_path,
                        line_start=idx,
                        line_end=idx,
                        code_snippet=line.strip(),
                        description="Unsanitized dynamic string interpolation detected in SQL query execution.",
                        why_it_matters="Permits malicious actors to manipulate SQL syntax, bypass authentication, and access or delete sensitive database records.",
                        evidence=f"Line {idx}: {line.strip()}",
                        recommendation="Use parameterized queries with bound variables (e.g. cursor.execute(query, (param,))) or an ORM.",
                        cwe_id="CWE-89",
                        status="open",
                        verification_status="unverified"
                    ))

                # Command injection
                if re.search(r"(?:os\.system|subprocess\.Popen|subprocess\.call|child_process\.exec)\s*\([^)]*[\+f]", line):
                    findings.append(Finding(
                        id=f"SEC-{uuid.uuid4().hex[:8]}",
                        scan_id=scan_id,
                        repository_id=ir_repo.id,
                        category="security",
                        rule_id="command_injection",
                        title="Command Injection via Shell Execution",
                        severity="critical",
                        confidence=0.94,
                        gap_type="unsafe_exec",
                        gap_label="Confirmed gap",
                        file_path=rel_path,
                        line_start=idx,
                        line_end=idx,
                        code_snippet=line.strip(),
                        description="External or dynamically constructed string passed directly to system shell execution.",
                        why_it_matters="Allows attackers to execute arbitrary system commands on the host server.",
                        evidence=f"Line {idx}: {line.strip()}",
                        recommendation="Avoid shell execution. Pass command arguments as an array without shell=True.",
                        cwe_id="CWE-78",
                        status="open",
                        verification_status="unverified"
                    ))

                # Unsafe eval / deserialization
                if re.search(r"\b(?:eval|pickle\.loads|yaml\.load\([^,)]+\))\b", line):
                    if "yaml.safe_load" not in line:
                        findings.append(Finding(
                            id=f"SEC-{uuid.uuid4().hex[:8]}",
                            scan_id=scan_id,
                            repository_id=ir_repo.id,
                            category="security",
                            rule_id="unsafe_eval",
                            title="Unsafe Code Evaluation or Insecure Deserialization",
                            severity="high",
                            confidence=0.88,
                            gap_type="insecure_execution",
                            gap_label="Confirmed gap",
                            file_path=rel_path,
                            line_start=idx,
                            line_end=idx,
                            code_snippet=line.strip(),
                            description="Use of dangerous functions such as eval() or unsafe deserializers.",
                            why_it_matters="Execution of untrusted input can lead to arbitrary code execution within the application process.",
                            evidence=f"Line {idx}: {line.strip()}",
                            recommendation="Use safe parsing alternatives such as json.loads, yaml.safe_load, or ast.literal_eval.",
                            cwe_id="CWE-95",
                            status="open",
                            verification_status="unverified"
                        ))

        # 3. Vulnerable Dependencies
        for dep in ir_repo.all_dependencies:
            for vuln in dep.known_vulnerabilities:
                findings.append(Finding(
                    id=f"SEC-{uuid.uuid4().hex[:8]}",
                    scan_id=scan_id,
                    repository_id=ir_repo.id,
                    category="security",
                    rule_id="vulnerable_dependency",
                    title=f"Vulnerable Dependency: {dep.name} ({vuln['cve']})",
                    severity=vuln["severity"],
                    confidence=0.98,
                    gap_type="known_cve",
                    gap_label="Confirmed gap",
                    file_path=dep.manifest_file,
                    line_start=1,
                    line_end=1,
                    code_snippet=f"{dep.name}=={dep.version or 'unpinned'}",
                    description=vuln["title"],
                    why_it_matters=f"Package {dep.name} contains known vulnerability {vuln['cve']} with severity {vuln['severity']}.",
                    evidence=f"Manifest: {dep.manifest_file}, Installed: {dep.name}@{dep.version or 'latest'}",
                    recommendation=f"Upgrade {dep.name} to version {vuln['fixed_version']} or higher.",
                    cwe_id=vuln["cwe"],
                    status="open",
                    verification_status="unverified"
                ))

        return findings
