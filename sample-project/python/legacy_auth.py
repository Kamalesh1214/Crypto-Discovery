"""
CryptoLens Test Fixture: Legacy Authentication Component
DEMO DATA ONLY - Contains intentional cryptographic weaknesses for analyzer testing.
DO NOT USE IN PRODUCTION.
"""

import hashlib
from Crypto.Cipher import DES, ARC4

# Weakness 1: Obsolete MD5 hash for password verification
def verify_password_legacy(password: str, expected_hash: str) -> bool:
    # MD5 is broken: collision attacks and fast cracking
    digest = hashlib.md5(password.encode('utf-8')).hexdigest()
    return digest == expected_hash

# Weakness 2: DES encryption in ECB mode
def encrypt_session_cookie(cookie_data: bytes, key: bytes) -> bytes:
    # 56-bit key and ECB mode (preserves patterns)
    cipher = DES.new(key[:8], DES.MODE_ECB)
    # Pad to 8 bytes
    pad_len = 8 - (len(cookie_data) % 8)
    padded = cookie_data + bytes([pad_len] * pad_len)
    return cipher.encrypt(padded)

# Weakness 3: RC4 stream cipher for legacy payload encryption
def encrypt_rc4_payload(data: bytes, key: bytes) -> bytes:
    # RC4 stream cipher exhibits statistical keystream biases
    cipher = ARC4.new(key)
    return cipher.encrypt(data)
