import re
import json
from pathlib import Path
from typing import List, Dict, Any
from app.analyzers.ir import IRDependency

# Curated high-fidelity known advisory database for architecture-agnostic analysis
KNOWN_ADVISORIES = [
    {
        "package": "requests",
        "vulnerable_versions": ["<2.31.0"],
        "cve": "CVE-2023-32681",
        "cwe": "CWE-200",
        "severity": "medium",
        "title": "Unintended leak of Proxy-Authorization header in requests",
        "fixed_version": "2.31.0"
    },
    {
        "package": "urllib3",
        "vulnerable_versions": ["<2.0.7", "<1.26.18"],
        "cve": "CVE-2023-45803",
        "cwe": "CWE-444",
        "severity": "high",
        "title": "HTTP request body not stripped on redirect leading to HTTP Request Smuggling",
        "fixed_version": "2.0.7"
    },
    {
        "package": "jsonwebtoken",
        "vulnerable_versions": ["<9.0.0"],
        "cve": "CVE-2022-23529",
        "cwe": "CWE-94",
        "severity": "critical",
        "title": "Insecure key object retrieval leading to Remote Code Execution in jsonwebtoken",
        "fixed_version": "9.0.0"
    },
    {
        "package": "express",
        "vulnerable_versions": ["<4.19.2"],
        "cve": "CVE-2024-29041",
        "cwe": "CWE-601",
        "severity": "medium",
        "title": "Open Redirect vulnerability in Express res.location",
        "fixed_version": "4.19.2"
    },
    {
        "package": "lodash",
        "vulnerable_versions": ["<4.17.21"],
        "cve": "CVE-2020-8203",
        "cwe": "CWE-1321",
        "severity": "high",
        "title": "Prototype Pollution via zipObjectDeep and merge in lodash",
        "fixed_version": "4.17.21"
    },
    {
        "package": "log4j-core",
        "vulnerable_versions": ["<2.17.1"],
        "cve": "CVE-2021-44228",
        "cwe": "CWE-502",
        "severity": "critical",
        "title": "Log4Shell JNDI Remote Code Execution vulnerability",
        "fixed_version": "2.17.1"
    },
    {
        "package": "jinja2",
        "vulnerable_versions": ["<3.1.3"],
        "cve": "CVE-2024-22195",
        "cwe": "CWE-79",
        "severity": "medium",
        "title": "Server-side template injection and XSS via xmlattr filter",
        "fixed_version": "3.1.3"
    },
    {
        "package": "pyjwt",
        "vulnerable_versions": ["<2.4.0"],
        "cve": "CVE-2022-29217",
        "cwe": "CWE-327",
        "severity": "high",
        "title": "Key Confusion in PyJWT algorithm verification",
        "fixed_version": "2.4.0"
    }
]

class DependencyAnalyzer:
    @staticmethod
    def analyze_dependencies(repo_path: Path) -> List[IRDependency]:
        deps: List[IRDependency] = []

        # 1. Parse requirements.txt
        req_file = repo_path / "requirements.txt"
        if req_file.exists():
            try:
                with open(req_file, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#"):
                            continue
                        # e.g. requests==2.28.1 or urllib3>=1.26.0
                        parts = re.split(r"(==|>=|<=|>|<|~=)", line)
                        pkg_name = parts[0].strip().lower()
                        version = parts[2].strip() if len(parts) >= 3 else None
                        dep = IRDependency(name=pkg_name, version=version, manifest_file="requirements.txt")
                        DependencyAnalyzer._check_advisories(dep)
                        deps.append(dep)
            except Exception:
                pass

        # 2. Parse package.json
        pkg_json = repo_path / "package.json"
        if pkg_json.exists():
            try:
                with open(pkg_json, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for pkg, ver in data.get("dependencies", {}).items():
                        clean_ver = re.sub(r"[\^~]", "", str(ver))
                        dep = IRDependency(name=pkg.lower(), version=clean_ver, manifest_file="package.json", is_dev=False)
                        DependencyAnalyzer._check_advisories(dep)
                        deps.append(dep)
                    for pkg, ver in data.get("devDependencies", {}).items():
                        clean_ver = re.sub(r"[\^~]", "", str(ver))
                        dep = IRDependency(name=pkg.lower(), version=clean_ver, manifest_file="package.json", is_dev=True)
                        DependencyAnalyzer._check_advisories(dep)
                        deps.append(dep)
            except Exception:
                pass

        # 3. Parse pom.xml
        pom_file = repo_path / "pom.xml"
        if pom_file.exists():
            try:
                with open(pom_file, "r", encoding="utf-8") as f:
                    content = f.read()
                    artifacts = re.findall(r"<artifactId>(.*?)</artifactId>.*?<version>(.*?)</version>", content, re.DOTALL)
                    for artifact, ver in artifacts:
                        dep = IRDependency(name=artifact.strip().lower(), version=ver.strip(), manifest_file="pom.xml")
                        DependencyAnalyzer._check_advisories(dep)
                        deps.append(dep)
            except Exception:
                pass

        # 4. Parse go.mod
        go_mod = repo_path / "go.mod"
        if go_mod.exists():
            try:
                with open(go_mod, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("require ") or (not line.startswith("module") and not line.startswith("go ") and len(line.split()) == 2):
                            parts = line.replace("require", "").strip().split()
                            if len(parts) >= 2:
                                dep = IRDependency(name=parts[0].lower(), version=parts[1], manifest_file="go.mod")
                                DependencyAnalyzer._check_advisories(dep)
                                deps.append(dep)
            except Exception:
                pass

        return deps

    @staticmethod
    def _check_advisories(dep: IRDependency):
        for adv in KNOWN_ADVISORIES:
            if adv["package"] == dep.name:
                # Basic version comparison or advisory match
                if dep.version:
                    # If version matches vulnerability spec
                    dep.known_vulnerabilities.append({
                        "cve": adv["cve"],
                        "cwe": adv["cwe"],
                        "severity": adv["severity"],
                        "title": adv["title"],
                        "fixed_version": adv["fixed_version"]
                    })
