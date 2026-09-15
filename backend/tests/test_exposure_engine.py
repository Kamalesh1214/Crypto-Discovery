import pytest
from app.detectors.base import DetectedArtefact
from app.rules.exposure_engine import ExposureEngine

def test_exposure_levels():
    # RSA-1024 -> VERY HIGH
    rsa1024 = DetectedArtefact(algorithm="RSA-1024", key_size="1024-bit", file="test.py", line=1, evidence="")
    eval_rsa = ExposureEngine.evaluate(rsa1024, severity="HIGH")
    assert eval_rsa["potential_exposure"] == "VERY HIGH"
    assert len(eval_rsa["exposure_factors"]) > 0
    assert "disclaimer" in eval_rsa

    # DES -> HIGH
    des = DetectedArtefact(algorithm="DES", file="test.py", line=1, evidence="")
    eval_des = ExposureEngine.evaluate(des, severity="CRITICAL")
    assert eval_des["potential_exposure"] == "HIGH"

    # MD5 -> HIGH
    md5 = DetectedArtefact(algorithm="MD5", file="test.py", line=1, evidence="")
    eval_md5 = ExposureEngine.evaluate(md5, severity="HIGH")
    assert eval_md5["potential_exposure"] == "HIGH"

    # SHA-1 -> MEDIUM
    sha1 = DetectedArtefact(algorithm="SHA-1", file="test.py", line=1, evidence="")
    eval_sha1 = ExposureEngine.evaluate(sha1, severity="HIGH")
    assert eval_sha1["potential_exposure"] == "MEDIUM"

    # AES-256-GCM -> LOW
    aes_gcm = DetectedArtefact(algorithm="AES-256", mode="GCM", file="test.py", line=1, evidence="")
    eval_aes = ExposureEngine.evaluate(aes_gcm, severity="LOW")
    assert eval_aes["potential_exposure"] == "LOW"

    # Unknown primitive -> UNKNOWN
    unknown = DetectedArtefact(algorithm="ObscureAlgo", file="test.py", line=1, evidence="")
    eval_unknown = ExposureEngine.evaluate(unknown, severity="WARNING")
    assert eval_unknown["potential_exposure"] == "UNKNOWN"

def test_exposure_aggregation():
    assert ExposureEngine.aggregate_exposure([]) == "LOW"
    assert ExposureEngine.aggregate_exposure(["LOW", "MEDIUM"]) == "MEDIUM"
    assert ExposureEngine.aggregate_exposure(["LOW", "HIGH", "MEDIUM"]) == "HIGH"
    assert ExposureEngine.aggregate_exposure(["LOW", "HIGH", "VERY HIGH"]) == "VERY HIGH"
