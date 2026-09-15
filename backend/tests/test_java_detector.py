import pytest
from app.detectors.java_detector import JavaDetector

@pytest.fixture
def detector():
    return JavaDetector()

def test_detect_java_ciphers(detector, tmp_path):
    java_file = tmp_path / "CryptoSample.java"
    java_file.write_text("""
package test;
import javax.crypto.Cipher;

public class CryptoSample {
    public void test() throws Exception {
        Cipher c1 = Cipher.getInstance("DESede/CBC/PKCS5Padding");
        Cipher c2 = Cipher.getInstance("RC4");
        Cipher c3 = Cipher.getInstance("AES/GCM/NoPadding");
    }
}
""", encoding="utf-8")

    results = detector.scan_file(str(java_file), "CryptoSample.java")
    algos = [r.algorithm for r in results]
    assert "3DES" in algos
    assert "RC4" in algos
    assert any("AES" in a for a in algos)

def test_detect_java_digests(detector, tmp_path):
    java_file = tmp_path / "HashSample.java"
    java_file.write_text("""
package test;
import java.security.MessageDigest;

public class HashSample {
    public void test() throws Exception {
        MessageDigest md5 = MessageDigest.getInstance("MD5");
        MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
        MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
    }
}
""", encoding="utf-8")

    results = detector.scan_file(str(java_file), "HashSample.java")
    algos = [r.algorithm for r in results]
    assert "MD5" in algos
    assert "SHA-1" in algos
    assert "SHA-256" in algos

def test_detect_java_rsa_keypair(detector, tmp_path):
    java_file = tmp_path / "RsaSample.java"
    java_file.write_text("""
package test;
import java.security.KeyPairGenerator;

public class RsaSample {
    public void test() throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(1024);
    }
}
""", encoding="utf-8")

    results = detector.scan_file(str(java_file), "RsaSample.java")
    algos = [r.algorithm for r in results]
    assert "RSA-1024" in algos or any("1024" in r.key_size for r in results)

def test_detect_java_mac(detector, tmp_path):
    java_file = tmp_path / "MacSample.java"
    java_file.write_text("""
package test;
import javax.crypto.Mac;

public class MacSample {
    public void test() throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
    }
}
""", encoding="utf-8")

    results = detector.scan_file(str(java_file), "MacSample.java")
    algos = [r.algorithm for r in results]
    assert "HMAC" in algos
