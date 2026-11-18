import json
import uuid
from typing import List, Dict, Any
from app.analyzers.ir import IRRepository
from app.models.entities import Finding, RiskRelationship

class RiskCorrelationAgent:
    @staticmethod
    def run(ir_repo: IRRepository, findings: List[Finding], scan_id: str) -> List[RiskRelationship]:
        relationships: List[RiskRelationship] = []

        # Group findings by file and by endpoint
        by_file: Dict[str, List[Finding]] = {}
        by_endpoint: Dict[str, List[Finding]] = {}

        for f in findings:
            by_file.setdefault(f.file_path, []).append(f)
            # Check if finding mentions an endpoint path
            for ep in ir_repo.all_endpoints:
                if ep.path.lower() in f.title.lower() or ep.path.lower() in f.description.lower() or ep.handler_name.lower() in f.description.lower() or ep.file_path == f.file_path:
                    by_endpoint.setdefault(ep.path, []).append(f)

        # 1. Cluster: Endpoint Compound Risk (e.g. transfer, admin, payment)
        for ep_path, ep_findings in by_endpoint.items():
            # Deduplicate findings
            unique_findings = {f.id: f for f in ep_findings}.values()
            if len(unique_findings) >= 2:
                # Check categories present
                categories = {f.category for f in unique_findings}
                has_sec = "security" in categories
                has_gap = "missingness" in categories
                has_loose = "loose_end" in categories

                if has_sec or (has_gap and len(unique_findings) >= 2):
                    cluster_id = f"REL-{uuid.uuid4().hex[:8]}"
                    ep_obj = next((e for e in ir_repo.all_endpoints if e.path == ep_path), None)
                    ep_name = ep_obj.path if ep_obj else ep_path

                    # Narrative synthesis
                    narrative_parts = []
                    narrative_parts.append(f"Multiple interrelated engineering flaws converge directly on endpoint '{ep_name}'.")

                    finding_titles = [f"• {f.title} ({f.severity.upper()})" for f in unique_findings]
                    narrative_parts.append("\n".join(finding_titles))

                    if has_sec and has_gap:
                        narrative_parts.append(
                            f"Compounded Risk: An active vulnerability exists in this workflow alongside missing defensive controls (such as authentication or input validation) and zero automated test coverage. An attacker can exploit this endpoint without tripping access controls or regression detection."
                        )
                    else:
                        narrative_parts.append(
                            f"Engineering Fragility: Multiple missing safeguards and unhandled edge cases leave '{ep_name}' vulnerable to unexpected runtime degradation and data corruption."
                        )

                    # Build graph nodes and edges
                    nodes = []
                    edges = []

                    # Endpoint node
                    ep_node_id = f"endpoint_{abs(hash(ep_name)) % 10000}"
                    nodes.append({
                        "id": ep_node_id,
                        "label": f"API: {ep_name}",
                        "type": "endpoint",
                        "severity": "critical" if has_sec else "high",
                        "category": "api",
                        "details": {"method": ep_obj.http_method if ep_obj else "HTTP", "path": ep_name}
                    })

                    # File node
                    file_node_id = f"file_{abs(hash(ep_obj.file_path if ep_obj else ep_name)) % 10000}"
                    nodes.append({
                        "id": file_node_id,
                        "label": f"File: {ep_obj.file_path if ep_obj else 'source'}",
                        "type": "file",
                        "category": "source_code"
                    })

                    edges.append({
                        "source": ep_node_id,
                        "target": file_node_id,
                        "label": "defined_in",
                        "relationship": "shared_component"
                    })

                    finding_ids = []
                    for idx, f in enumerate(unique_findings):
                        finding_ids.append(f.id)
                        f_node_id = f"f_{f.id}"
                        nodes.append({
                            "id": f_node_id,
                            "label": f.title[:35] + "...",
                            "type": "finding",
                            "severity": f.severity,
                            "category": f.category,
                            "details": {"rule": f.rule_id, "file": f.file_path, "line": f.line_start}
                        })

                        rel_type = "same_workflow"
                        if f.category == "security":
                            rel_type = "security_risk"
                        elif f.gap_type == "missing_test":
                            rel_type = "missing_test_coverage"
                        elif f.gap_type == "missing_validation":
                            rel_type = "data_dependency"

                        edges.append({
                            "source": f_node_id,
                            "target": ep_node_id,
                            "label": rel_type.replace("_", " "),
                            "relationship": rel_type
                        })

                    # Cross-link findings with each other
                    for f in unique_findings:
                        current_related = set(f.get_related_findings())
                        for other in unique_findings:
                            if other.id != f.id:
                                current_related.add(other.id)
                        f.related_findings_data = json.dumps(list(current_related))

                    rel = RiskRelationship(
                        id=cluster_id,
                        scan_id=scan_id,
                        cluster_name=f"Compound Risk Cluster: {ep_name}",
                        severity="critical" if has_sec else "high",
                        affected_workflow=f"API Workflow: {ep_name}",
                        narrative="\n\n".join(narrative_parts),
                        node_ids_data=json.dumps(finding_ids),
                        graph_data=json.dumps({"nodes": nodes, "edges": edges})
                    )
                    relationships.append(rel)

        # 2. General Technical Debt / Silent Failure Cluster if multiple loose ends exist in the same file
        for file_path, file_findings in by_file.items():
            loose_findings = [f for f in file_findings if f.category in ["loose_end", "quality"]]
            if len(loose_findings) >= 3:
                cluster_id = f"REL-{uuid.uuid4().hex[:8]}"
                nodes = [{
                    "id": f"file_{abs(hash(file_path)) % 10000}",
                    "label": f"File: {file_path}",
                    "type": "file",
                    "category": "source_code"
                }]
                edges = []
                f_ids = []
                for f in loose_findings:
                    f_ids.append(f.id)
                    nodes.append({
                        "id": f"f_{f.id}",
                        "label": f.title[:35] + "...",
                        "type": "finding",
                        "severity": f.severity,
                        "category": f.category
                    })
                    edges.append({
                        "source": f"f_{f.id}",
                        "target": f"file_{abs(hash(file_path)) % 10000}",
                        "label": "co_located_in",
                        "relationship": "shared_component"
                    })

                narrative = f"File '{file_path}' exhibits a high density of unresolved technical debt ({len(loose_findings)} findings including swallowed exceptions, TODO stubs, or code bloat). This component has high maintenance overhead and elevated regression risk."

                relationships.append(RiskRelationship(
                    id=cluster_id,
                    scan_id=scan_id,
                    cluster_name=f"High Technical Debt Density: {file_path}",
                    severity="medium",
                    affected_workflow=f"Component: {file_path}",
                    narrative=narrative,
                    node_ids_data=json.dumps(f_ids),
                    graph_data=json.dumps({"nodes": nodes, "edges": edges})
                ))

        return relationships
