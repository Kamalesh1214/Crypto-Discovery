import pytest
from app.detectors.python_detector import PythonDetector

@pytest.fixture
def detector():
    return PythonDetector()

def test_detect_des_ecb(detector, tmp_path):
    py_file = tmp_path / "des_test.py"
    py_file.write_text("""
from Crypto.Cipher import DES
cipher = DES.new(key, DES.MODE_ECB)
""", encoding="utf-8")

    results = detector.scan_file(str(py_file), "des_test.py")
    algos = [r.algorithm for r in results]
    assert "DES" in algos
    des_artefact = next(r for r in results if r.algorithm == "DES")
    assert des_artefact.mode == "ECB"
    assert des_artefact.type == "Symmetric Encryption"

def test_detect_aes_gcm(detector, tmp_path):
    py_file = tmp_path / "aes_test.py"
    py_file.write_text("""
from Crypto.Cipher import AES
cipher = AES.new(secret_key, AES.MODE_GCM, nonce=nonce)
""", encoding="utf-8")

    results = detector.scan_file(str(py_file), "aes_test.py")
    algos = [r.algorithm for r in results]
    assert any("AES" in a for a in algos)
    aes_art = next(r for r in results if "AES" in r.algorithm)
    assert aes_art.mode == "GCM"

def test_detect_3des_rc4(detector, tmp_path):
    py_file = tmp_path / "legacy.py"
    py_file.write_text("""
from Crypto.Cipher import DES3, ARC4
c1 = DES3.new(key, DES3.MODE_CBC)
c2 = ARC4.new(key)
""", encoding="utf-8")

    results = detector.scan_file(str(py_file), "legacy.py")
    algos = [r.algorithm for r in results]
    assert "3DES" in algos
    assert "RC4" in algos

def test_detect_hashes(detector, tmp_path):
    py_file = tmp_path / "hashes.py"
    py_file.write_text("""
import hashlib
h1 = hashlib.md5(b"password").hexdigest()
h2 = hashlib.sha1(b"data").digest()
h3 = hashlib.sha256(b"secure").hexdigest()
""", encoding="utf-8")

    results = detector.scan_file(str(py_file), "hashes.py")
    algos = [r.algorithm for r in results]
    assert "MD5" in algos
    assert "SHA-1" in algos
    assert "SHA-256" in algos

def test_detect_rsa_key_sizes(detector, tmp_path):
    py_file = tmp_path / "pki.py"
    py_file.write_text("""
from cryptography.hazmat.primitives.asymmetric import rsa
k1 = rsa.generate_private_key(public_exponent=65537, key_size=1024)
k2 = rsa.generate_private_key(public_exponent=65537, key_size=2048)
""", encoding="utf-8")

    results = detector.scan_file(str(py_file), "pki.py")
    algos = [r.algorithm for r in results]
    assert "RSA-1024" in algos or any("1024" in r.key_size for r in results)
    assert any("2048" in r.key_size for r in results)

def test_detect_ecc_ed25519(detector, tmp_path):
    py_file = tmp_path / "modern_curves.py"
    py_file.write_text("""
from cryptography.hazmat.primitives.asymmetric import ec, ed25519
k_ec = ec.generate_private_key(ec.SECP256R1())
k_ed = ed25519.Ed25519PrivateKey.generate()
""", encoding="utf-8")

    results = detector.scan_file(str(py_file), "modern_curves.py")
    algos = [r.algorithm for r in results]
    assert "ECC" in algos
    assert "Ed25519" in algos

def test_detect_hmac(detector, tmp_path):
    py_file = tmp_path / "mac.py"
    py_file.write_text("""
import hmac, hashlib
sig = hmac.new(key, msg, hashlib.sha256).digest()
""", encoding="utf-8")

    results = detector.scan_file(str(py_file), "mac.py")
    algos = [r.algorithm for r in results]
    assert "HMAC" in algos
