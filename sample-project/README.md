# CryptoLens Safe Test Fixture Repository

This directory contains synthetic, self-contained test files designed specifically to validate the discovery, risk scoring, potential exposure analysis, and post-quantum migration estimation capabilities of CryptoLens.

> [!IMPORTANT]
> **Zero Real Secrets Disclaimer**: This fixture contains NO production secrets, real private keys, authentication passwords, or live certificates. All instances are synthetic demonstration patterns for static security testing.

## Cryptographic Artefacts Matrix

| Language / File | Cryptographic Artefact | Classification | Classical Severity | Exposure Level | Quantum Risk | PQC Effort |
|-----------------|------------------------|----------------|--------------------|----------------|--------------|------------|
| `python/legacy_auth.py` | MD5 (`hashlib.md5`) | Hash Function | HIGH | HIGH | LOW | Not Required |
| `python/legacy_auth.py` | DES ECB (`DES.new`) | Symmetric Cipher | CRITICAL | HIGH | LOW | Not Required |
| `python/legacy_auth.py` | RC4 (`ARC4.new`) | Stream Cipher | CRITICAL | HIGH | LOW | Not Required |
| `python/secure_vault.py`| AES-256 GCM (`AES.new`)| Symmetric Authenticated | LOW | LOW | LOW | Not Required |
| `python/secure_vault.py`| SHA-256 (`hashlib.sha256`)| Hash Function | LOW | LOW | LOW | Not Required |
| `python/secure_vault.py`| HMAC-SHA256 (`hmac.new`)| MAC | LOW | LOW | LOW | Not Required |
| `python/pki_service.py` | RSA-1024 (`key_size=1024`)| Asymmetric Key Gen | HIGH | VERY HIGH | HIGH | 2–6 weeks |
| `python/pki_service.py` | RSA-2048 (`key_size=2048`)| Asymmetric Key Gen | LOW | LOW | HIGH | 2–6 weeks |
| `python/pki_service.py` | ECC (`SECP256R1`) | Key Exchange / Curve | LOW | LOW | HIGH | 2–6 weeks |
| `python/pki_service.py` | Ed25519 (`Ed25519PrivateKey`)| Digital Signature | LOW | LOW | HIGH | 2–6 weeks |
| `java/PaymentCrypto.java`| 3DES (`DESede/CBC`) | Symmetric Cipher | HIGH | HIGH | LOW | Not Required |
| `java/PaymentCrypto.java`| RC4 (`RC4`) | Stream Cipher | CRITICAL | HIGH | LOW | Not Required |
| `java/PaymentCrypto.java`| SHA-1 (`MessageDigest`)| Broken Hash | HIGH | MEDIUM | LOW | Not Required |
| `java/TokenService.java`| RSA-1024 (`initialize(1024)`)| Asymmetric Key Gen | HIGH | VERY HIGH | HIGH | 2–6 weeks |
| `java/TokenService.java`| HMAC-SHA256 (`HmacSHA256`)| MAC | LOW | LOW | LOW | Not Required |
