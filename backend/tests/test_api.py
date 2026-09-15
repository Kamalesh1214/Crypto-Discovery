import os
import io
import zipfile
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.db import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()

@pytest.fixture
def client():
    return TestClient(app)

def create_sample_zip_bytes() -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("auth.py", "import hashlib\ndef hash_pwd(p):\n    return hashlib.md5(p.encode()).hexdigest()\n")
        zf.writestr("crypto.py", "from Crypto.Cipher import DES\ncipher = DES.new(b'12345678', DES.MODE_ECB)\n")
    buf.seek(0)
    return buf.read()

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_full_scan_pipeline_and_reports(client):
    zip_bytes = create_sample_zip_bytes()

    # 1. Upload & Scan
    upload_resp = client.post(
        "/api/scan",
        files={"file": ("test_project.zip", zip_bytes, "application/zip")},
        data={"project_name": "API Test Project"}
    )
    assert upload_resp.status_code == 200
    scan_data = upload_resp.json()
    scan_id = scan_data["id"]
    assert scan_data["project_name"] == "API Test Project"
    assert scan_data["files_scanned"] >= 2
    assert scan_data["total_artefacts"] >= 2
    assert scan_data["critical_count"] >= 1  # DES is CRITICAL
    assert scan_data["risk_score"] < 100

    # 2. Get Scan Details
    get_resp = client.get(f"/api/scan/{scan_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == scan_id

    # 3. Get Inventory
    inv_resp = client.get(f"/api/scan/{scan_id}/inventory")
    assert inv_resp.status_code == 200
    inventory = inv_resp.json()
    assert len(inventory) >= 2
    algos = [item["algorithm"] for item in inventory]
    assert "MD5" in algos
    assert "DES" in algos

    # 4. Get Findings
    findings_resp = client.get(f"/api/scan/{scan_id}/findings")
    assert findings_resp.status_code == 200
    findings = findings_resp.json()
    assert len(findings) >= 2

    # 5. Export JSON Report
    json_resp = client.get(f"/api/scan/{scan_id}/report/json")
    assert json_resp.status_code == 200
    assert json_resp.headers["content-type"] == "application/json"
    json_report = json_resp.json()
    assert "report_name" in json_report
    assert "inventory" in json_report
    assert len(json_report["inventory"]) >= 2

    # 6. Export CSV Report
    csv_resp = client.get(f"/api/scan/{scan_id}/report/csv")
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]
    csv_text = csv_resp.text
    assert "Algorithm,Type,Mode,Key Size" in csv_text
    assert "DES" in csv_text
    assert "MD5" in csv_text

    # 7. Get Status
    status_resp = client.get(f"/api/scan/{scan_id}/status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data["status"] == "completed"
    assert status_data["progress"] == 100
    assert status_data["files_discovered"] >= 2

