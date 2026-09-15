import pytest
from app.detectors.base import DetectedArtefact
from app.rules.pqc_engine import PQCEngine

def test_quantum_risk_and_pqc_candidate():
    # RSA -> HIGH quantum risk, Candidate
    rsa_art = DetectedArtefact(algorithm="RSA-1024", key_size="1024-bit", file="test.py", line=1, evidence="")
    eval_rsa = PQCEngine.evaluate(rsa_art, total_pqc_count_in_project=1, files_affected_count=1)
    assert eval_rsa["quantum_risk"] == "HIGH"
    assert eval_rsa["pqc_migration_candidate"] == "Candidate"
    assert eval_rsa["migration_effort"] == "MEDIUM"
    assert eval_rsa["migration_time_estimate"] == "2–6 weeks"

    # ECC -> HIGH quantum risk, Candidate
    ecc_art = DetectedArtefact(algorithm="ECC", file="test.py", line=1, evidence="")
    eval_ecc = PQCEngine.evaluate(ecc_art, total_pqc_count_in_project=1, files_affected_count=1)
    assert eval_ecc["quantum_risk"] == "HIGH"
    assert eval_ecc["pqc_migration_candidate"] == "Candidate"

    # AES-128 -> MEDIUM quantum risk, Not Immediate, LOW effort (1-2 weeks)
    aes128_art = DetectedArtefact(algorithm="AES-128", file="test.py", line=1, evidence="")
    eval_aes128 = PQCEngine.evaluate(aes128_art)
    assert eval_aes128["quantum_risk"] == "MEDIUM"
    assert eval_aes128["pqc_migration_candidate"] == "Not Immediate"
    assert eval_aes128["migration_effort"] == "LOW"
    assert eval_aes128["migration_time_estimate"] == "1–2 weeks"

    # AES-256 -> LOW quantum risk, Not Required
    aes256_art = DetectedArtefact(algorithm="AES-256", file="test.py", line=1, evidence="")
    eval_aes256 = PQCEngine.evaluate(aes256_art)
    assert eval_aes256["quantum_risk"] == "LOW"
    assert eval_aes256["pqc_migration_candidate"] == "Not Required"
    assert eval_aes256["migration_effort"] == "NOT REQUIRED"

    # SHA-256 -> LOW quantum risk, Not Required
    sha256_art = DetectedArtefact(algorithm="SHA-256", file="test.py", line=1, evidence="")
    eval_sha256 = PQCEngine.evaluate(sha256_art)
    assert eval_sha256["quantum_risk"] == "LOW"
    assert eval_sha256["pqc_migration_candidate"] == "Not Required"

def test_migration_effort_scaling():
    # If many asymmetric usages across multiple files, effort scales to HIGH (6+ weeks)
    rsa_art = DetectedArtefact(algorithm="RSA", file="test.py", line=1, evidence="")
    eval_scaled = PQCEngine.evaluate(rsa_art, total_pqc_count_in_project=5, files_affected_count=4)
    assert eval_scaled["migration_effort"] == "HIGH"
    assert eval_scaled["migration_time_estimate"] == "6+ weeks"

def test_pqc_aggregation_summary():
    results = [
        {"algorithm": "RSA-1024", "pqc_migration_candidate": "Candidate", "migration_effort": "HIGH"},
        {"algorithm": "ECC", "pqc_migration_candidate": "Candidate", "migration_effort": "MEDIUM"},
        {"algorithm": "AES-256", "pqc_migration_candidate": "Not Required", "migration_effort": "NOT REQUIRED"}
    ]
    summary = PQCEngine.aggregate_migration_summary(results)
    assert summary["pqc_candidate_count"] == 2
    assert summary["overall_migration_effort"] == "HIGH"
    assert summary["highest_priority_candidate"] == "RSA-1024"
