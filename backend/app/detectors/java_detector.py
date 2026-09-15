import re
from typing import List
from app.detectors.base import BaseDetector, DetectedArtefact
from app.detectors.pattern_registry import ALGORITHM_METADATA

class JavaDetector(BaseDetector):
    def scan_file(self, file_path: str, relative_path: str) -> List[DetectedArtefact]:
        artefacts: List[DetectedArtefact] = []
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                lines = f.readlines()
        except Exception:
            return artefacts

        # Multi-line inspection context for key initialization
        content = "".join(lines)
        has_1024_init = bool(re.search(r'\.initialize\s*\(\s*1024\b', content))
        has_2048_init = bool(re.search(r'\.initialize\s*\(\s*2048\b', content))

        # Patterns for Java Cryptography Architecture (JCA / JCE)
        cipher_pattern = re.compile(
            r'Cipher\.getInstance\s*\(\s*["\']([^"\']+)["\']',
            re.IGNORECASE
        )
        digest_pattern = re.compile(
            r'MessageDigest\.getInstance\s*\(\s*["\']([^"\']+)["\']',
            re.IGNORECASE
        )
        keypair_pattern = re.compile(
            r'KeyPairGenerator\.getInstance\s*\(\s*["\']([^"\']+)["\']',
            re.IGNORECASE
        )
        mac_pattern = re.compile(
            r'Mac\.getInstance\s*\(\s*["\']([^"\']+)["\']',
            re.IGNORECASE
        )
        key_pattern = re.compile(
            r'(?:SecretKeySpec|KeyGenerator\.getInstance)\s*\([^,]+,\s*["\']([^"\']+)["\']',
            re.IGNORECASE
        )

        for idx, line in enumerate(lines):
            line_num = idx + 1
            line_strip = line.strip()
            if not line_strip or line_strip.startswith("//") or line_strip.startswith("/*"):
                continue

            # 1. Cipher.getInstance("...")
            m_cipher = cipher_pattern.search(line)
            if m_cipher:
                transform = m_cipher.group(1).upper()
                algo, mode = self._parse_transformation(transform)
                meta = ALGORITHM_METADATA.get(algo, {})
                artefacts.append(DetectedArtefact(
                    algorithm=algo,
                    file=relative_path,
                    line=line_num,
                    evidence=line_strip,
                    type=meta.get("type", "Symmetric Encryption"),
                    mode=mode,
                    key_size=meta.get("default_key_size", "Unknown / Not Determined"),
                    library="Java JCA/JCE",
                    confidence="HIGH"
                ))

            # 2. MessageDigest.getInstance("...")
            m_digest = digest_pattern.search(line)
            if m_digest:
                algo_raw = m_digest.group(1).upper().replace("-", "")
                algo = self._normalize_hash_algorithm(algo_raw)
                meta = ALGORITHM_METADATA.get(algo, {})
                artefacts.append(DetectedArtefact(
                    algorithm=algo,
                    file=relative_path,
                    line=line_num,
                    evidence=line_strip,
                    type=meta.get("type", "Hash Function"),
                    mode="Digest",
                    key_size=meta.get("default_key_size", "Unknown / Not Determined"),
                    library="Java JCA/JCE",
                    confidence="HIGH"
                ))

            # 3. KeyPairGenerator.getInstance("...")
            m_keypair = keypair_pattern.search(line)
            if m_keypair:
                algo_raw = m_keypair.group(1).upper()
                algo = algo_raw
                key_size = "Unknown / Not Determined"
                
                # Check for nearby or file-level initialization
                if algo_raw == "RSA":
                    if has_1024_init or "1024" in line:
                        algo = "RSA-1024"
                        key_size = "1024-bit"
                    elif has_2048_init or "2048" in line:
                        key_size = "2048-bit"
                elif algo_raw in ["EC", "ECDSA"]:
                    algo = "ECC"
                    key_size = "256-bit"

                meta = ALGORITHM_METADATA.get(algo, {})
                artefacts.append(DetectedArtefact(
                    algorithm=algo,
                    file=relative_path,
                    line=line_num,
                    evidence=line_strip,
                    type=meta.get("type", "Asymmetric Cryptography"),
                    mode="Public-Key",
                    key_size=key_size if key_size != "Unknown / Not Determined" else meta.get("default_key_size", "Unknown / Not Determined"),
                    library="Java JCA/JCE",
                    confidence="HIGH"
                ))

            # 4. Mac.getInstance("...")
            m_mac = mac_pattern.search(line)
            if m_mac:
                mac_algo = m_mac.group(1)
                meta = ALGORITHM_METADATA.get("HMAC", {})
                artefacts.append(DetectedArtefact(
                    algorithm="HMAC",
                    file=relative_path,
                    line=line_num,
                    evidence=line_strip,
                    type=meta.get("type", "Message Authentication Code (MAC)"),
                    mode=f"HMAC ({mac_algo})",
                    key_size="Variable",
                    library="Java JCA/JCE",
                    confidence="HIGH"
                ))

            # 5. SecretKeySpec / KeyGenerator
            m_key = key_pattern.search(line)
            if m_key and not m_cipher: # avoid duplicate if both on same line
                algo_raw = m_key.group(1).upper()
                algo, mode = self._parse_transformation(algo_raw)
                meta = ALGORITHM_METADATA.get(algo, {})
                artefacts.append(DetectedArtefact(
                    algorithm=algo,
                    file=relative_path,
                    line=line_num,
                    evidence=line_strip,
                    type=meta.get("type", "Symmetric Encryption"),
                    mode=mode,
                    key_size=meta.get("default_key_size", "Unknown / Not Determined"),
                    library="Java JCA/JCE",
                    confidence="HIGH"
                ))

        # Deduplicate
        seen = set()
        unique_artefacts = []
        for a in artefacts:
            key = (a.algorithm, a.line)
            if key not in seen:
                seen.add(key)
                unique_artefacts.append(a)

        return unique_artefacts

    def _parse_transformation(self, transform: str) -> tuple[str, str]:
        parts = transform.split("/")
        algo_raw = parts[0]
        mode = parts[1] if len(parts) > 1 else "Unknown / Not Determined"

        if "DESEDE" in algo_raw or "TRIPLEDES" in algo_raw or "3DES" in algo_raw:
            algo = "3DES"
        elif "DES" in algo_raw:
            algo = "DES"
        elif "RC4" in algo_raw or "ARCFOUR" in algo_raw:
            algo = "RC4"
            mode = "Stream"
        elif "AES" in algo_raw:
            algo = "AES-256" if "256" in algo_raw else "AES"
        elif "RSA" in algo_raw:
            algo = "RSA"
        else:
            algo = algo_raw

        return algo, mode

    def _normalize_hash_algorithm(self, name: str) -> str:
        if "MD5" in name:
            return "MD5"
        if "SHA1" in name:
            return "SHA-1"
        if "SHA256" in name:
            return "SHA-256"
        if "SHA384" in name:
            return "SHA-384"
        if "SHA512" in name:
            return "SHA-512"
        if "SHA3" in name:
            return "SHA-3"
        return name
