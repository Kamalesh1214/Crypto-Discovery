from typing import Dict, Any, List
from app.detectors.base import DetectedArtefact
from app.detectors.pattern_registry import ALGORITHM_METADATA

RULE_ENGINE_LABEL = "CryptoLens Prototype Rules"
RISK_SCORE_LABEL = "CryptoLens Prototype Risk Score"

class RiskEngine:
    """
    Centralized configurable rule engine for assessing classical cryptographic security risk.
    Clearly designated as 'CryptoLens Prototype Rules'.
    """

    @classmethod
    def evaluate_artefact(cls, artefact: DetectedArtefact) -> Dict[str, Any]:
        algo = artefact.algorithm.upper()
        mode = artefact.mode.upper() if artefact.mode else ""
        key_size = artefact.key_size

        # Default fallback values
        severity = "WARNING"
        reason = "Cryptographic implementation detected with unknown or unverified parameters."
        recommendation = "Review cryptographic usage with a security specialist to determine suitability."

        # Check in ALGORITHM_METADATA
        meta = ALGORITHM_METADATA.get(algo, {})
        if not meta:
            # Try sub-string or normalized lookup
            for candidate_key, data in ALGORITHM_METADATA.items():
                if candidate_key in algo or algo in candidate_key:
                    meta = data
                    break

        if meta:
            severity = meta.get("severity", "MEDIUM")
            reason = meta.get("reason", reason)
            recommendation = meta.get("recommendation", recommendation)

        # Contextual Overrides based on exact configuration
        # 1. DES / RC4 are always CRITICAL
        if algo in ["DES", "RC4"]:
            severity = "CRITICAL"
        
        # 2. 3DES, MD5, SHA-1 are HIGH
        elif algo in ["3DES", "MD5", "SHA-1"]:
            severity = "HIGH"

        # 3. RSA key size evaluation
        elif "RSA" in algo:
            if "1024" in key_size or "1024" in algo or (key_size.isdigit() and int(key_size) < 2048):
                severity = "HIGH"
                reason = "RSA key size is less than 2048 bits (e.g. 1024-bit), offering insufficient security against classical factorization."
                recommendation = "Upgrade to at least RSA-3072 or transition directly toward post-quantum hybrid KEM schemes."
            elif "2048" in key_size or "4096" in key_size:
                severity = "LOW"
                reason = "RSA key size meets current NIST classical minimums (>= 2048 bits), though it remains vulnerable to future quantum cryptanalysis."
                recommendation = "Maintain for classical requirements; prepare migration plan toward PQC standards."
            else:
                severity = "MEDIUM"

        # 4. Mode evaluations: AES with ECB mode is HIGH risk
        if "AES" in algo and "ECB" in mode:
            severity = "HIGH"
            reason = "AES used in Electronic Codebook (ECB) mode lacks ciphertext semantic security and exposes underlying data patterns."
            recommendation = "Replace ECB mode with an authenticated mode such as Galois/Counter Mode (GCM) or CBC with HMAC."

        # 5. Legacy library dependencies
        if algo.lower() == "pycrypto":
            severity = "HIGH"
            reason = "PyCrypto library is unmaintained since 2013 and contains known critical vulnerabilities (CVE-2013-7459)."
            recommendation = "Replace PyCrypto with modern 'cryptography' or 'pycryptodome'."
        elif algo.lower() in ["pycryptodome", "cryptography", "bouncycastle"]:
            severity = "INFORMATIONAL"
            reason = f"Standard cryptographic library dependency ({artefact.library}) detected."
            recommendation = "Keep dependency updated to the latest security patch releases."

        return {
            "rule_engine": RULE_ENGINE_LABEL,
            "severity": severity,
            "reason": reason,
            "recommendation": recommendation
        }

    @classmethod
    def calculate_risk_score(cls, severities: List[str]) -> int:
        """
        Calculates the CryptoLens Prototype Risk Score.
        Scale: 0 to 100, where 100 = optimal security posture.
        Score is reduced according to findings severity:
          - CRITICAL: -25 points
          - HIGH: -15 points
          - MEDIUM: -8 points
          - WARNING: -5 points
          - LOW / INFORMATIONAL: -1 point
        """
        score = 100
        deductions = {
            "CRITICAL": 25,
            "HIGH": 15,
            "MEDIUM": 8,
            "WARNING": 5,
            "LOW": 1,
            "INFORMATIONAL": 0
        }

        for sev in severities:
            sev_upper = sev.upper()
            score -= deductions.get(sev_upper, 2)

        return max(0, min(100, score))
