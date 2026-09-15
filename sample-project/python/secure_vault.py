"""
CryptoLens Test Fixture: Secure Vault Component
DEMO DATA ONLY - Illustrates modern authenticated cryptography best practices.
"""

import hmac
import hashlib
from Crypto.Cipher import AES

def encrypt_vault_payload(plaintext: bytes, key: bytes, nonce: bytes) -> tuple[bytes, bytes]:
    # Modern AES-256 with GCM authenticated encryption mode
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    return ciphertext, tag

def generate_file_checksum(file_bytes: bytes) -> str:
    # Modern SHA-256 hash function
    return hashlib.sha256(file_bytes).hexdigest()

def compute_message_mac(secret_key: bytes, message: bytes) -> bytes:
    # Authenticated MAC using HMAC-SHA256
    return hmac.new(secret_key, message, hashlib.sha256).digest()
