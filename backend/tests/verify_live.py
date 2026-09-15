import time
import httpx

def main():
    client = httpx.Client(base_url="http://127.0.0.1:8000")
    
    # 1. Health check
    h = client.get("/api/health")
    print("Backend Health:", h.status_code, h.json())
    assert h.status_code == 200

    # 2. Frontend check
    r_front = httpx.get("http://127.0.0.1:5173/")
    print("Frontend Status:", r_front.status_code, "Cryptographic Discovery" in r_front.text)
    assert r_front.status_code == 200

    # 3. Dynamic background upload and scan
    files = {"file": ("sample-project.zip", open("../sample-project.zip", "rb"), "application/zip")}
    res = client.post("/api/scan?background=true", files=files, data={"project_name": "Live Verification Repo"})
    assert res.status_code == 200, res.text
    scan_id = res.json()["scan_id"]
    print("Started Scan ID:", scan_id)

    # 4. Poll live status
    completed = False
    for attempt in range(50):
        st = client.get(f"/api/scan/{scan_id}/status").json()
        print(f"Poll #{attempt+1}: Stage={st.get('stage_name')} ({st.get('stage')}) | Progress={st.get('progress')}% | File={st.get('current_file')} | Algo={st.get('current_algorithm')} | Found={st.get('crypto_artifacts')}")
        if st.get("status") == "completed":
            completed = True
            break
        time.sleep(0.25)

    assert completed, "Scan did not complete in time"

    # 5. Fetch final scan details
    r_scan = client.get(f"/api/scan/{scan_id}")
    scan_data = r_scan.json()
    print("\n--- COMPLETED SCAN VERIFICATION ---")
    print("Project:", scan_data["project_name"])
    print("Files Scanned:", scan_data["files_scanned"])
    print("Crypto Artefacts:", scan_data["total_artefacts"])
    print("Critical Findings:", scan_data["critical_count"])
    print("Risk Score:", scan_data["risk_score"])
    print("Potential Exposure:", scan_data["potential_exposure"])
    print("PQC Migration Effort:", scan_data["pqc_migration_effort"])

    # 6. Verify Inventory
    r_inv = client.get(f"/api/scan/{scan_id}/inventory")
    assert r_inv.status_code == 200
    inv = r_inv.json()
    print("Inventory verified:", len(inv), "items")
    assert len(inv) == 26

    # 7. Verify Findings
    r_find = client.get(f"/api/scan/{scan_id}/findings")
    assert r_find.status_code == 200
    find = r_find.json()
    print("Findings verified:", len(find), "items")

    # 8. Verify JSON Report
    r_json = client.get(f"/api/scan/{scan_id}/report/json")
    assert r_json.status_code == 200
    print("JSON Report verified:", len(r_json.content), "bytes")

    # 9. Verify CSV Report
    r_csv = client.get(f"/api/scan/{scan_id}/report/csv")
    assert r_csv.status_code == 200
    print("CSV Report verified:", len(r_csv.content), "bytes")

    print("\n=== ALL DYNAMIC SCANNING & REPOSITORY VERIFICATIONS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
