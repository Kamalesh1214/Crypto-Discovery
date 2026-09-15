from typing import Dict, Any, List
from app.detectors.base import DetectedArtefact
from app.config import DISCLAIMER_MIGRATION, DISCLAIMER_PQC

class PQCEngine:
    """
    Evaluates Quantum Risk and Estimates Post-Quantum Migration Effort.
    Produces approximate prototype estimates based strictly on code structure and algorithm traits.
    """

    @classmethod
    def evaluate(
        cls,
        artefact: DetectedArtefact,
        total_pqc_count_in_project: int = 1,
        files_affected_count: int = 1
    ) -> Dict[str, Any]:
        algo = artefact.algorithm.upper()
        key_size = artefact.key_size

        # 1. Quantum Risk & PQC Candidate determination
        quantum_risk = "UNKNOWN"
        pqc_candidate = "Unknown"
        effort = "UNKNOWN"
        time_estimate = "Unknown"
        reason = "Unable to determine post-quantum relevance from available artefact data."
        factors: List[str] = []

        # Public-Key Cryptography is directly vulnerable to Shor's Algorithm
        if any(pk in algo for pk in ["RSA", "ECC", "ECDSA", "ED25519", "DIFFIE-HELLMAN"]):
            quantum_risk = "HIGH"
            pqc_candidate = "Candidate"
            factors.extend([
                f"Asymmetric primitive ({algo}) vulnerable to polynomial-time solving via Shor's Algorithm.",
                "Subject to 'Harvest Now, Decrypt Later' (HNDL) data retention risks.",
                "Requires transition to NIST-standardized PQC algorithms (e.g. ML-KEM / ML-DSA) or hybrid schemes."
            ])

            # Effort scaling based on project-wide scope
            if files_affected_count >= 3 or total_pqc_count_in_project >= 3:
                effort = "HIGH"
                time_estimate = "6+ weeks"
                reason = (
                    f"Multiple asymmetric cryptographic usages ({total_pqc_count_in_project} across {files_affected_count} files) "
                    "increase the scope of migration, protocol negotiation, and regression testing."
                )
                factors.append("Multiple codebase touchpoints require coordinated cryptographic agility upgrades.")
            elif total_pqc_count_in_project >= 1:
                effort = "MEDIUM"
                time_estimate = "2–6 weeks"
                reason = (
                    f"Migration of {algo} requires updating public-key dependencies, key management lifecycle, "
                    "and compatibility testing with communicating endpoints."
                )
                factors.append("Single/few touchpoints, but involves protocol and certificate lifecycle updates.")
            else:
                effort = "LOW"
                time_estimate = "1–2 weeks"
                reason = "Isolated asymmetric key generation or signature routine with localized impact."

        # AES-128
        elif algo == "AES-128":
            quantum_risk = "MEDIUM"
            pqc_candidate = "Not Immediate"
            effort = "LOW"
            time_estimate = "1–2 weeks"
            reason = "Grover's algorithm reduces effective security from 128 to 64 bits. Upgrade to AES-256 is recommended."
            factors.extend([
                "Symmetric cipher security halved under Grover's algorithm.",
                "Low refactoring complexity: upgrading key generation to 256 bits within existing library."
            ])

        # Modern Symmetric & Hash (AES-256, SHA-256/384/512, SHA-3, HMAC)
        elif algo in ["AES-256", "AES", "SHA-256", "SHA-384", "SHA-512", "SHA-3", "HMAC"]:
            quantum_risk = "LOW"
            pqc_candidate = "Not Required"
            effort = "NOT REQUIRED"
            time_estimate = "Not Required"
            reason = f"Modern primitive ({algo}) maintains sufficient security margin under quantum attacks; no immediate PQC migration needed."
            factors.extend([
                "Grover's algorithm leaves 128-bit quantum security margin for 256-bit symmetric keys.",
                "Hash collision resistance under quantum attacks remains computationally infeasible."
            ])

        # Obsolete classical algorithms (DES, 3DES, RC4, MD5, SHA-1)
        elif algo in ["DES", "3DES", "RC4", "MD5", "SHA-1"]:
            quantum_risk = "LOW"
            pqc_candidate = "Not Required"
            effort = "NOT REQUIRED"
            time_estimate = "Not Required"
            reason = f"{algo} is critically weak under classical computing; immediate classical remediation is required rather than PQC migration."
            factors.append("Classical vulnerability takes precedence over post-quantum considerations.")

        elif artefact.type == "Library Dependency":
            quantum_risk = "LOW"
            pqc_candidate = "Not Immediate"
            effort = "NOT REQUIRED"
            time_estimate = "Not Required"
            reason = "Library dependency; upgrade to version supporting PQC algorithms when available."

        return {
            "quantum_risk": quantum_risk,
            "pqc_migration_candidate": pqc_candidate,
            "migration_effort": effort,
            "migration_time_estimate": time_estimate,
            "migration_reason": reason,
            "migration_factors": factors,
            "disclaimer_migration": DISCLAIMER_MIGRATION,
            "disclaimer_pqc": DISCLAIMER_PQC
        }

    @classmethod
    def aggregate_migration_summary(cls, pqc_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculates project-wide PQC migration metrics."""
        candidates = [r for r in pqc_results if r.get("pqc_migration_candidate") == "Candidate"]
        candidate_count = len(candidates)

        efforts = [r.get("migration_effort") for r in candidates if r.get("migration_effort") in ["HIGH", "MEDIUM", "LOW"]]
        
        if "HIGH" in efforts:
            overall_effort = "HIGH"
            overall_time = "6+ weeks"
        elif "MEDIUM" in efforts:
            overall_effort = "MEDIUM"
            overall_time = "2–6 weeks"
        elif "LOW" in efforts:
            overall_effort = "LOW"
            overall_time = "1–2 weeks"
        elif candidate_count > 0:
            overall_effort = "MEDIUM"
            overall_time = "2–6 weeks"
        else:
            overall_effort = "NOT REQUIRED"
            overall_time = "Not Required"

        # Determine highest priority candidate
        highest_candidate = "None"
        for c in candidates:
            algo = c.get("algorithm", "")
            if "1024" in algo:
                highest_candidate = algo
                break
            elif "RSA" in algo:
                highest_candidate = algo
            elif highest_candidate == "None" and ("ECC" in algo or "ECDSA" in algo or "ED25519" in algo):
                highest_candidate = algo

        return {
            "pqc_candidate_count": candidate_count,
            "overall_migration_effort": overall_effort,
            "overall_time_estimate": overall_time,
            "highest_priority_candidate": highest_candidate
        }
