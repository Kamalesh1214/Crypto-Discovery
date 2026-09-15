import pytest
from app.detectors.base import DetectedArtefact
from app.rules.risk_engine import RiskEngine, RULE_ENGINE_LABEL

def test_risk_severities():
    des_art = DetectedArtefact(algorithm="DES", file="test.py", line=1, evidence="DES.new()")
    assert RiskEngine.evaluate_artefact(des_art)["severity"] == "CRITICAL"

    rc4_art = DetectedArtefact(algorithm="RC4", file="test.py", line=1, evidence="ARC4.new()")
    assert RiskEngine.evaluate_artefact(rc4_art)["severity"] == "CRITICAL"

    des3_art = DetectedArtefact(algorithm="3DES", file="test.py", line=1, evidence="DES3.new()")
    assert RiskEngine.evaluate_artefact(des3_art)["severity"] == "HIGH"

    md5_art = DetectedArtefact(algorithm="MD5", file="test.py", line=1, evidence="hashlib.md5()")
    assert RiskEngine.evaluate_artefact(md5_art)["severity"] == "HIGH"

    sha1_art = DetectedArtefact(algorithm="SHA-1", file="test.py", line=1, evidence="hashlib.sha1()")
    assert RiskEngine.evaluate_artefact(sha1_art)["severity"] == "HIGH"

    rsa1024_art = DetectedArtefact(algorithm="RSA-1024", key_size="1024-bit", file="test.py", line=1, evidence="key_size=1024")
    assert RiskEngine.evaluate_artefact(rsa1024_art)["severity"] == "HIGH"

    aes256_art = DetectedArtefact(algorithm="AES-256", mode="GCM", key_size="256-bit", file="test.py", line=1, evidence="AES.new()")
    assert RiskEngine.evaluate_artefact(aes256_art)["severity"] == "LOW"

    aes_ecb_art = DetectedArtefact(algorithm="AES", mode="ECB", file="test.py", line=1, evidence="MODE_ECB")
    assert RiskEngine.evaluate_artefact(aes_ecb_art)["severity"] == "HIGH"

    unknown_art = DetectedArtefact(algorithm="CustomCipherX", file="test.py", line=1, evidence="CustomCipherX()")
    assert RiskEngine.evaluate_artefact(unknown_art)["severity"] == "WARNING"

def test_risk_score_calculation():
    # Base score 100 with no issues
    assert RiskEngine.calculate_risk_score([]) == 100

    # 1 critical (-25) -> 75
    assert RiskEngine.calculate_risk_score(["CRITICAL"]) == 75

    # 1 critical (-25) + 1 high (-15) -> 60
    assert RiskEngine.calculate_risk_score(["CRITICAL", "HIGH"]) == 60

    # Multiple findings clamped to 0 minimum
    assert RiskEngine.calculate_risk_score(["CRITICAL"] * 5) == 0

    # Only low findings (-1 each)
    assert RiskEngine.calculate_risk_score(["LOW", "LOW"]) == 98
