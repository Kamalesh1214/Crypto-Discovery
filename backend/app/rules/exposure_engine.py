from typing import Dict, Any, List
from app.detectors.base import DetectedArtefact
from app.config import DISCLAIMER_EXPOSURE

class ExposureEngine:
    """
    Evaluates Potential Data Exposure based strictly on scan evidence and deterministic rules.
    Does not produce probabilistic predictions or claim guaranteed leak rates.
    """

    @classmethod
    def evaluate(cls, artefact: DetectedArtefact, severity: str) -> Dict[str, Any]:
        algo = artefact.algorithm.upper()
        mode = artefact.mode.upper() if artefact.mode else ""
        key_size = artefact.key_size

        factors: List[str] = []
        level = "UNKNOWN"
        reason = "Insufficient contextual evidence to determine potential data exposure level."

        # Factor 1: Known broken symmetric ciphers
        if algo in ["DES", "RC4"]:
            level = "HIGH"
            factors.extend([
                f"Broken symmetric cipher ({algo}) with known mathematical or keyspace compromises.",
                "Inability to preserve confidentiality under moderate cryptanalytic effort.",
                "Lack of integrity verification (unauthenticated ciphertext)."
            ])
            reason = f"Use of {algo} exposes encrypted payload data to direct decryption attacks by adversaries."

        elif algo == "3DES":
            level = "HIGH"
            factors.extend([
                "Short 64-bit block size susceptible to Sweet32 collision attacks.",
                "Deprecated cryptographic standard unsuitable for protecting confidential data.",
                "Lack of built-in authenticated encryption."
            ])
            reason = "3DES 64-bit block size risks birthday-bound collisions that can leak session plaintext."

        # Factor 2: Weak Asymmetric Cryptography (RSA-1024, etc.)
        elif "1024" in algo or "1024" in key_size or (algo == "RSA" and "1024" in key_size):
            level = "VERY HIGH"
            factors.extend([
                "1024-bit RSA key provides inadequate ~80-bit equivalent security.",
                "Vulnerable to practical distributed factorization (classical Fermat / Number Field Sieve).",
                "Completely vulnerable to Harvest Now Decrypt Later (HNDL) quantum intelligence collection.",
                "Public-key compromise compromises all past session keys or digital signatures created with it."
            ])
            reason = "RSA with 1024-bit key size risks complete exposure of private key and encrypted traffic."

        elif algo in ["RSA", "ECC", "ECDSA", "ED25519"]:
            if severity == "HIGH":
                level = "HIGH"
                reason = "Asymmetric algorithm configured with weak parameters risks private key recovery."
                factors.append("Sub-standard key length or parameter configuration.")
            else:
                level = "LOW"
                reason = "Strong classical key length detected; long-term confidentiality exposure is primarily post-quantum related."
                factors.extend([
                    "Classically secure key parameters currently in place.",
                    "Public-key ciphertext subject to potential future store-now-decrypt-later exposure."
                ])

        # Factor 3: Broken Hashes (MD5, SHA-1)
        elif algo in ["MD5", "SHA-1"]:
            level = "MEDIUM" if algo == "SHA-1" else "HIGH"
            factors.extend([
                f"Collision resistance for {algo} is cryptographically broken.",
                "Fast rainbow table precomputations and chosen-prefix collision attacks exist.",
                "If used for password storage or digital signatures, data or credentials may be forged or reversed."
            ])
            reason = f"{algo} hash digest collisions undermine integrity verification and credential security."

        # Factor 4: Modern Symmetric & Hashes
        elif "AES" in algo:
            if "ECB" in mode:
                level = "HIGH"
                factors.extend([
                    "Electronic Codebook (ECB) mode preserves plaintext pixel and pattern structures.",
                    "Identical plaintext blocks produce identical ciphertext blocks.",
                    "Ciphertext manipulation without detection due to lack of MAC/tag."
                ])
                reason = "AES in ECB mode directly leaks repetitive data patterns and structural information."
            else:
                level = "LOW"
                factors.extend([
                    "Modern NIST-standard symmetric encryption.",
                    "Adequate keyspace resisting known classical cryptanalytic techniques."
                ])
                reason = "Robust symmetric cipher parameters provide strong confidentiality."

        elif algo in ["SHA-256", "SHA-384", "SHA-512", "SHA-3", "HMAC"]:
            level = "LOW"
            factors.extend([
                "Cryptographically secure modern hash or MAC standard.",
                "No practical collision or preimage vulnerabilities identified."
            ])
            reason = "Modern cryptographic primitives maintain data integrity and authenticity."

        elif artefact.type == "Library Dependency":
            if severity == "HIGH":
                level = "HIGH"
                factors.append("Unmaintained library dependency with unpatched public CVEs.")
                reason = "Outdated cryptographic library introduces remote vulnerabilities into the application."
            else:
                level = "LOW"
                factors.append("Standard cryptographic library.")
                reason = "Library dependency maintains modern implementations."

        return {
            "potential_exposure": level,
            "exposure_reason": reason,
            "exposure_factors": factors,
            "disclaimer": DISCLAIMER_EXPOSURE
        }

    @classmethod
    def aggregate_exposure(cls, levels: List[str]) -> str:
        """Determines the overall project potential exposure from individual findings."""
        if not levels:
            return "LOW"
        if "VERY HIGH" in levels:
            return "VERY HIGH"
        if "HIGH" in levels:
            return "HIGH"
        if "MEDIUM" in levels:
            return "MEDIUM"
        if "LOW" in levels:
            return "LOW"
        return "UNKNOWN"
