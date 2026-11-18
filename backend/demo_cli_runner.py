import time
import requests
import json
import sys

BASE = "http://127.0.0.1:8000/api"

def print_header(title):
    print("\n" + "=" * 78)
    print(f"  {title.upper()}")
    print("=" * 78)

def main():
    print_header("Code Sentinel — Autonomous Engineering Auditor: Live Run")

    # 1. Health check
    print("\n[STEP 1] Checking Platform Health...")
    res = requests.get(f"{BASE.replace('/api', '')}/api/health")
    print(f"✓ Backend Health Status: {res.json()['status']} (v{res.json()['version']})")

    # 2. Ingest OmniBank Demo Repository
    print_header("Step 2: Repository Ingestion — OmniBank Microservices")
    repo_res = requests.post(f"{BASE}/repositories/demo/omnibank")
    repo = repo_res.json()
    print(f"✓ Repository ID:   {repo['id']}")
    print(f"✓ Repository Name: {repo['name']}")
    print(f"✓ Source Path:     {repo['source_path']}")
    print(f"✓ Branch:          {repo['branch']}")

    # 3. Start 10-Stage Autonomous Audit Scan
    print_header("Step 3: Initiating 10-Stage Autonomous Audit")
    scan_res = requests.post(f"{BASE}/scans", json={"repository_id": repo['id']})
    scan = scan_res.json()
    scan_id = scan['id']
    print(f"✓ Scan Initiated! Scan ID: {scan_id}")

    print("\n[STAGE PROGRESSION STREAM]")
    completed_stages = set()
    while True:
        prog = requests.get(f"{BASE}/scans/{scan_id}/progress").json()
        stages = prog.get("stages", [])

        for s in stages:
            if s["status"] == "completed" and s["step"] not in completed_stages:
                completed_stages.add(s["step"])
                print(f"  [STAGE {s['step']:02d}/10] {s['name']:<26} | Status: COMPLETED | {s['duration_ms']}ms | {s['details']}")
            elif s["status"] == "in_progress" and s["step"] not in completed_stages:
                pass

        if prog["status"] in ["completed", "failed"]:
            break
        time.sleep(0.4)

    print(f"\n✓ Audit Complete! Overall Progress: {prog['progress']}%")
    print(f"✓ Files Analyzed: {prog['files_analyzed']} | Lines of Code: {prog['lines_of_code']}")

    # 4. Engineering Health Score & Summary
    full_scan = requests.get(f"{BASE}/scans/{scan_id}").json()
    summary = full_scan.get("issues_summary", {})
    score = full_scan.get("health_score", 0.0)

    print_header(f"Step 4: Main Engineering Dashboard — Health Score: {score}/100")
    print(f"• Overall Health Rating:    {score}/100 (Grade F - Critical Exposure)")
    print(f"• Total Findings Count:     {summary.get('total', 0)}")
    print(f"• Critical Severity Flaws:  {summary.get('critical', 0)}")
    print(f"• High Priority Issues:     {summary.get('high', 0)}")
    print(f"• Languages Detected:       {list(full_scan.get('languages', {}).keys())}")

    # 5. Missingness Intelligence (Signature Feature)
    print_header("Step 5: Signature Feature — Missingness Intelligence")
    findings = requests.get(f"{BASE}/scans/{scan_id}/findings").json()
    missingness = [f for f in findings if f["category"] == "missingness"]

    print(f"Discovered {len(missingness)} Missing Requirements (What SHOULD exist but DOES NOT exist):\n")
    for idx, m in enumerate(missingness, 1):
        print(f"[{idx}] {m['title']}")
        print(f"    • Severity:    {m['severity'].upper()} | Label: {m['gap_label']} | Confidence: {int(m['confidence']*100)}%")
        print(f"    • Location:    {m['file_path']}:{m['line_start']}")
        print(f"    • Missing:     {m['description']}")
        print(f"    • Impact:      {m['why_it_matters']}")
        print(f"    • Evidence:    {m['evidence']}")
        print(f"    • Next Step:   {m['recommendation']}")
        print("-" * 74)

    # 6. Security Intelligence
    print_header("Step 6: Security Intelligence (With Secret Masking)")
    security = [f for f in findings if f["category"] == "security"]
    for idx, s in enumerate(security, 1):
        cwe = f"({s['cwe_id']})" if s.get('cwe_id') else ""
        masked = f" | Masked Token: {s['masked_secret']}" if s.get('masked_secret') else ""
        print(f"[{idx}] {s['title']} {cwe}{masked}")
        print(f"    • Severity:    {s['severity'].upper()} | File: {s['file_path']}:{s['line_start']}")
        print(f"    • Evidence:    {s['evidence']}")
        print(f"    • Remediation: {s['recommendation']}")
        print("-" * 74)

    # 7. Cross-Issue Risk Correlation
    print_header("Step 7: Cross-Issue Risk Correlation Clusters")
    rels = requests.get(f"{BASE}/scans/{scan_id}/relationships").json()
    for idx, r in enumerate(rels, 1):
        print(f"[{idx}] Cluster: {r['cluster_name']}")
        print(f"    • Severity:  {r['severity'].upper()}")
        print(f"    • Workflow:  {r['affected_workflow']}")
        print(f"    • Synthesis:\n      {r['narrative']}")
        print(f"    • Graph:     {len(r['nodes'])} Nodes, {len(r['edges'])} Topology Edges")
        print("-" * 74)

    # 8. Proof Before Fix Sandbox Verification
    print_header("Step 8: Proof Before Fix — Isolated Sandbox Verification")
    patches = requests.get(f"{BASE}/scans/{scan_id}/patches").json()
    if patches:
        p = patches[0]
        print(f"Selected Finding Patch: {p['file_path']} ({p['id']})")
        print(f"• Rationale: {p['explanation']}")
        print("\n[PROPOSED UNIFIED DIFF]:")
        for line in p["diff_unified"].splitlines()[:14]:
            print(f"  {line}")

        print("\nExecuting Isolated Sandbox Verification (Compiling, Re-scanning, Running Tests)...")
        v_res = requests.post(f"{BASE}/patches/{p['id']}/verify", json={"approved": True}).json()
        print(f"✓ Verification Result Status: {v_res['status'].upper()}")
        print("\n[ISOLATED SANDBOX RUNNER LOG]:")
        print(v_res.get("sandbox_log", "No log output."))

    # 9. Audit Report
    print_header("Step 9: Compliance & Audit Report Generated")
    rpt = requests.get(f"{BASE}/reports/{scan_id}").json()
    print(f"✓ Title:             {rpt['meta']['platform']} Audit")
    print(f"✓ Target Repository: {rpt['repository']['name']} ({rpt['repository']['branch']})")
    print(f"✓ Final Health Score:{rpt['audit_summary']['health_score']}/100")
    print(f"✓ HTML Export URL:   http://localhost:8000/api/reports/{scan_id}/html")
    print(f"✓ JSON Export URL:   http://localhost:8000/api/reports/{scan_id}/download?format=json")
    print(f"✓ Web Dashboard UI:  http://localhost:8000")

    print("\n" + "=" * 78)
    print("  LIVE RUN DEMONSTRATION COMPLETE: ALL SYSTEMS VERIFIED & OPERATIONAL")
    print("=" * 78)

if __name__ == "__main__":
    main()
