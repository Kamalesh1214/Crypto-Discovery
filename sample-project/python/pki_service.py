"""
CryptoLens Test Fixture: PKI and Asymmetric Key Management
DEMO DATA ONLY - Illustrates classical vs quantum-vulnerable public key cryptography.
"""

from cryptography.hazmat.primitives.asymmetric import rsa, ec, ed25519

# Legacy: Weak 1024-bit RSA key generation (classical factor + quantum Shor's)
def generate_legacy_rsa_key():
    # 1024-bit RSA is deprecated by NIST
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=1024
    )
    return private_key

# Standard: 2048-bit RSA key generation (classically acceptable, quantum candidate)
def generate_standard_rsa_key():
    # 2048-bit RSA is classically valid, but vulnerable to CRQC Shor's algorithm
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )
    return private_key

# Modern Classical: Elliptic Curve Cryptography (SECP256R1)
def generate_ecc_key():
    # Classically strong, but ECDLP broken by Shor's algorithm
    private_key = ec.generate_private_key(ec.SECP256R1())
    return private_key

# Modern Classical: Edwards-curve Digital Signature (Ed25519)
def generate_ed25519_key():
    # Classically strong signature scheme; requires PQC migration
    private_key = ed25519.Ed25519PrivateKey.generate()
    return private_key
