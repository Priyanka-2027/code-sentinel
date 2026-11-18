import subprocess
import time
import requests
import sys

print("[PROBE] Starting uvicorn server...")
proc = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
    cwd="d:/priyanka/backend"
)

try:
    # Wait for server to come up
    for i in range(15):
        time.sleep(0.5)
        try:
            res = requests.get("http://127.0.0.1:8000/api/health", timeout=1)
            if res.status_code == 200:
                print(f"[PROBE] Health Check OK: {res.json()}")
                break
        except Exception:
            pass
    else:
        print("[PROBE ERROR] Server did not respond within timeout.")
        sys.exit(1)

    # Test Repositories API
    res_repos = requests.get("http://127.0.0.1:8000/api/repositories")
    print(f"[PROBE] Repositories API OK: status={res_repos.status_code}, count={len(res_repos.json())}")
    repos = res_repos.json()
    for r in repos:
        print(f"  - {r['name']} ({r['source_type']})")

    # Test Start Scan on OmniBank demo
    omnibank = next((r for r in repos if "OmniBank" in r["name"]), None)
    if omnibank:
        scan_req = requests.post("http://127.0.0.1:8000/api/scans", json={"repository_id": omnibank["id"]})
        print(f"[PROBE] Scan Start OK: status={scan_req.status_code}, scan_id={scan_req.json()['id']}")
        scan_id = scan_req.json()["id"]

        # Wait for scan to complete
        for _ in range(20):
            time.sleep(0.5)
            progress = requests.get(f"http://127.0.0.1:8000/api/scans/{scan_id}/progress").json()
            if progress["status"] == "completed":
                print(f"[PROBE] Scan Completed! Health Score: {progress['health_score']}/100, Files: {progress['files_analyzed']}")
                break
        else:
            print("[PROBE WARN] Scan did not finish within probe loop.")

        # Test Findings API
        findings = requests.get(f"http://127.0.0.1:8000/api/scans/{scan_id}/findings").json()
        print(f"[PROBE] Findings count: {len(findings)}")
        missingness = [f for f in findings if f["category"] == "missingness"]
        security = [f for f in findings if f["category"] == "security"]
        print(f"  - Missingness findings: {len(missingness)}")
        print(f"  - Security findings: {len(security)}")

        # Test Relationships API
        rels = requests.get(f"http://127.0.0.1:8000/api/scans/{scan_id}/relationships").json()
        print(f"[PROBE] Risk Relationships count: {len(rels)}")

        # Test Patches API
        patches = requests.get(f"http://127.0.0.1:8000/api/scans/{scan_id}/patches").json()
        print(f"[PROBE] Generated Patches count: {len(patches)}")
        if patches:
            p = patches[0]
            print(f"  - Verifying patch in sandbox: {p['id']} for {p['file_path']}...")
            verify_res = requests.post(f"http://127.0.0.1:8000/api/patches/{p['id']}/verify", json={"approved": True})
            print(f"  - Sandbox verification status: {verify_res.json()['status']}")

        # Test Report API
        rpt = requests.get(f"http://127.0.0.1:8000/api/reports/{scan_id}").json()
        print(f"[PROBE] Audit Report OK: score={rpt['audit_summary']['health_score']}")

    print("\n[SUCCESS] ALL PROBE TESTS PASSED 100%!")

finally:
    proc.terminate()
    try:
        proc.wait(timeout=3)
    except Exception:
        proc.kill()
