import json
from datetime import datetime, timezone
from typing import Dict, Any, List
from app.models.entities import Scan, Repository, Finding, RiskRelationship, PatchProposal

class ReportGenerator:
    @staticmethod
    def generate_json_report(
        scan: Scan,
        repo: Repository,
        findings: List[Finding],
        relationships: List[RiskRelationship],
        patches: List[PatchProposal]
    ) -> Dict[str, Any]:
        return {
            "meta": {
                "platform": "CODE SENTINEL",
                "tagline": "Find what is wrong. Discover what is missing. Prove the fix works.",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "scan_id": scan.id,
                "version": "1.0.0"
            },
            "repository": {
                "id": repo.id,
                "name": repo.name,
                "source_type": repo.source_type,
                "branch": repo.branch,
                "created_at": repo.created_at.isoformat() if repo.created_at else None
            },
            "audit_summary": {
                "health_score": scan.health_score,
                "files_analyzed": scan.files_analyzed,
                "lines_of_code": scan.lines_of_code,
                "languages": scan.get_languages(),
                "total_findings": len(findings),
                "severity_counts": {
                    "critical": sum(1 for f in findings if f.severity == "critical"),
                    "high": sum(1 for f in findings if f.severity == "high"),
                    "medium": sum(1 for f in findings if f.severity == "medium"),
                    "low": sum(1 for f in findings if f.severity == "low"),
                    "informational": sum(1 for f in findings if f.severity == "informational")
                },
                "category_counts": {
                    "security": sum(1 for f in findings if f.category == "security"),
                    "missingness": sum(1 for f in findings if f.category == "missingness"),
                    "quality": sum(1 for f in findings if f.category == "quality"),
                    "loose_end": sum(1 for f in findings if f.category == "loose_end")
                }
            },
            "missingness_intelligence": [
                {
                    "id": f.id,
                    "title": f.title,
                    "gap_type": f.gap_type,
                    "gap_label": f.gap_label,
                    "file_path": f.file_path,
                    "line": f.line_start,
                    "severity": f.severity,
                    "confidence": f.confidence,
                    "description": f.description,
                    "why_it_matters": f.why_it_matters,
                    "evidence": f.evidence,
                    "recommendation": f.recommendation
                }
                for f in findings if f.category == "missingness"
            ],
            "security_findings": [
                {
                    "id": f.id,
                    "title": f.title,
                    "rule_id": f.rule_id,
                    "severity": f.severity,
                    "cwe_id": f.cwe_id,
                    "file_path": f.file_path,
                    "line": f.line_start,
                    "description": f.description,
                    "evidence": f.evidence,
                    "recommendation": f.recommendation,
                    "masked_secret": f.masked_secret,
                    "verification_status": f.verification_status
                }
                for f in findings if f.category == "security"
            ],
            "correlated_risks": [
                {
                    "id": r.id,
                    "cluster_name": r.cluster_name,
                    "severity": r.severity,
                    "affected_workflow": r.affected_workflow,
                    "narrative": r.narrative,
                    "nodes_count": len(r.get_graph().get("nodes", []))
                }
                for r in relationships
            ],
            "verified_patches": [
                {
                    "id": p.id,
                    "finding_id": p.finding_id,
                    "file_path": p.file_path,
                    "status": p.status,
                    "explanation": p.explanation,
                    "diff": p.diff_unified
                }
                for p in patches
            ],
            "analysis_limitations": [
                "Dynamic runtime behaviors dependent on external cloud providers cannot be proven without deployed execution.",
                "Third-party compiled binaries without symbols receive heuristic structural analysis.",
                "Code coverage metrics require execution of unit test suites with coverage tracing enabled."
            ]
        }

    @staticmethod
    def generate_html_report(data: Dict[str, Any]) -> str:
        summary = data["audit_summary"]
        repo = data["repository"]
        score = summary["health_score"]

        score_color = "#16A085" if score >= 80 else ("#F59E0B" if score >= 55 else "#E11D48")

        missingness_rows = ""
        for item in data.get("missingness_intelligence", []):
            sev_badge = f"<span class='badge badge-{item['severity']}'>{item['severity'].upper()}</span>"
            missingness_rows += f"""
            <tr>
                <td><strong>{item['title']}</strong><br><small style='color:#697586'>{item['file_path']}:{item['line']}</small></td>
                <td>{sev_badge}<br><small style='color:#315EF5'>{item['gap_label']}</small></td>
                <td>{item['why_it_matters']}</td>
                <td><code>{item['evidence']}</code></td>
            </tr>
            """

        security_rows = ""
        for item in data.get("security_findings", []):
            sev_badge = f"<span class='badge badge-{item['severity']}'>{item['severity'].upper()}</span>"
            cwe_tag = f"<span class='cwe-tag'>{item['cwe_id']}</span>" if item.get('cwe_id') else ""
            security_rows += f"""
            <tr>
                <td><strong>{item['title']}</strong> {cwe_tag}<br><small style='color:#697586'>{item['file_path']}:{item['line']}</small></td>
                <td>{sev_badge}</td>
                <td>{item['description']}</td>
                <td>{item['recommendation']}</td>
            </tr>
            """

        risks_cards = ""
        for item in data.get("correlated_risks", []):
            risks_cards += f"""
            <div class='card risk-card'>
                <h4>{item['cluster_name']}</h4>
                <p><strong>Affected Workflow:</strong> {item['affected_workflow']}</p>
                <p style='white-space: pre-line; color: #374151;'>{item['narrative']}</p>
            </div>
            """

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CODE SENTINEL Engineering Audit - {repo['name']}</title>
<style>
    body {{
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #F7F9FC;
        color: #172033;
        margin: 0;
        padding: 40px;
        line-height: 1.5;
    }}
    .container {{
        max-width: 1000px;
        margin: 0 auto;
        background: #FFFFFF;
        padding: 40px;
        border-radius: 16px;
        border: 1px solid #E5EAF1;
        box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }}
    .header {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #E5EAF1;
        padding-bottom: 24px;
        margin-bottom: 30px;
    }}
    .logo {{
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: #172033;
    }}
    .logo span {{ color: #315EF5; }}
    .score-badge {{
        font-size: 36px;
        font-weight: 800;
        color: {score_color};
        text-align: right;
    }}
    .grid-4 {{
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 30px;
    }}
    .metric-card {{
        background: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 16px;
        text-align: center;
    }}
    .metric-val {{
        font-size: 24px;
        font-weight: 700;
        color: #172033;
    }}
    .metric-lbl {{
        font-size: 13px;
        color: #697586;
        text-transform: uppercase;
        margin-top: 4px;
    }}
    h2 {{
        font-size: 20px;
        color: #172033;
        margin-top: 36px;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #E5EAF1;
    }}
    table {{
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
        font-size: 14px;
    }}
    th, td {{
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #E5EAF1;
        vertical-align: top;
    }}
    th {{
        background: #F8FAFC;
        font-weight: 600;
        color: #475569;
    }}
    .badge {{
        display: inline-block;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
    }}
    .badge-critical {{ background: #FDECEC; color: #E11D48; }}
    .badge-high {{ background: #FFF3E5; color: #D97706; }}
    .badge-medium {{ background: #FEF3C7; color: #B45309; }}
    .badge-low {{ background: #EAF0FF; color: #315EF5; }}
    .cwe-tag {{
        background: #F1F5F9;
        color: #475569;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-family: monospace;
    }}
    .risk-card {{
        background: #F8FAFC;
        border-left: 4px solid #315EF5;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
    }}
    .footer {{
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #E5EAF1;
        color: #94A3B8;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
    }}
    @media print {{
        body {{ padding: 0; background: #FFF; }}
        .container {{ border: none; box-shadow: none; padding: 0; }}
    }}
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <div>
            <div class="logo">CODE <span>SENTINEL</span></div>
            <div style="color: #697586; font-size: 14px; margin-top: 4px;">Architecture-Agnostic Autonomous Engineering Auditor</div>
            <div style="color: #172033; font-weight: 600; margin-top: 8px;">Target: {repo['name']} ({repo['branch']})</div>
        </div>
        <div class="score-badge">
            {score}<span style="font-size: 18px; color: #697586;">/100</span>
            <div style="font-size: 13px; color: #697586; font-weight: 500;">Health Score</div>
        </div>
    </div>

    <div class="grid-4">
        <div class="metric-card">
            <div class="metric-val" style="color: #E11D48;">{summary['severity_counts']['critical']}</div>
            <div class="metric-lbl">Critical Risks</div>
        </div>
        <div class="metric-card">
            <div class="metric-val" style="color: #D97706;">{summary['category_counts']['missingness']}</div>
            <div class="metric-lbl">Missing Safeguards</div>
        </div>
        <div class="metric-card">
            <div class="metric-val">{summary['files_analyzed']}</div>
            <div class="metric-lbl">Files Scanned</div>
        </div>
        <div class="metric-card">
            <div class="metric-val">{summary['lines_of_code']}</div>
            <div class="metric-lbl">Lines of Code</div>
        </div>
    </div>

    <h2>Signature Analysis: Missingness Intelligence</h2>
    <p style="color: #697586; font-size: 14px; margin-top: -8px; margin-bottom: 16px;">
        Investigating absent engineering requirements, omitted authentication barriers, missing input validation, and lack of test coverage.
    </p>
    <table>
        <thead>
            <tr>
                <th style="width: 28%;">Missing Requirement</th>
                <th style="width: 14%;">Severity</th>
                <th style="width: 30%;">Impact & Rationale</th>
                <th style="width: 28%;">Code Evidence</th>
            </tr>
        </thead>
        <tbody>
            {missingness_rows if missingness_rows else "<tr><td colspan='4'>No missing requirements detected.</td></tr>"}
        </tbody>
    </table>

    <h2>Security Findings & Vulnerabilities</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 28%;">Vulnerability Title</th>
                <th style="width: 14%;">Severity</th>
                <th style="width: 30%;">Description</th>
                <th style="width: 28%;">Remediation Guidance</th>
            </tr>
        </thead>
        <tbody>
            {security_rows if security_rows else "<tr><td colspan='4'>No security vulnerabilities detected.</td></tr>"}
        </tbody>
    </table>

    <h2>Cross-Issue Correlated Risk Clusters</h2>
    <p style="color: #697586; font-size: 14px; margin-top: -8px; margin-bottom: 16px;">
        Connected engineering risks where individual security, missingness, and loose-end findings compound on the same business workflow.
    </p>
    {risks_cards if risks_cards else "<p>No compound risk clusters detected.</p>"}

    <div class="footer">
        <div>Generated by CODE SENTINEL &bull; {data['meta']['generated_at']}</div>
        <div>Verified via Deterministic AST & Symbolic Analysis</div>
    </div>
</div>
</body>
</html>
        """
        return html
