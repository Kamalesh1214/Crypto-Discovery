import os
import re
from typing import List
from app.detectors.base import BaseDetector, DetectedArtefact

class ConfigDetector(BaseDetector):
    def scan_file(self, file_path: str, relative_path: str) -> List[DetectedArtefact]:
        artefacts: List[DetectedArtefact] = []
        fname = os.path.basename(file_path).lower()

        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                lines = f.readlines()
        except Exception:
            return artefacts

        # 1. requirements.txt
        if fname == "requirements.txt":
            for idx, line in enumerate(lines):
                line_strip = line.strip().lower()
                if not line_strip or line_strip.startswith("#"):
                    continue

                if re.search(r'\bpycrypto\b', line_strip) and not re.search(r'\bpycryptodome\b', line_strip):
                    artefacts.append(DetectedArtefact(
                        algorithm="pycrypto",
                        file=relative_path,
                        line=idx + 1,
                        evidence=line.strip(),
                        type="Library Dependency",
                        mode="Dependency",
                        key_size="N/A",
                        library="PyCrypto",
                        confidence="HIGH"
                    ))
                elif re.search(r'\bpycryptodome\b', line_strip):
                    artefacts.append(DetectedArtefact(
                        algorithm="pycryptodome",
                        file=relative_path,
                        line=idx + 1,
                        evidence=line.strip(),
                        type="Library Dependency",
                        mode="Dependency",
                        key_size="N/A",
                        library="PyCryptodome",
                        confidence="HIGH"
                    ))
                elif re.search(r'\bcryptography\b', line_strip):
                    artefacts.append(DetectedArtefact(
                        algorithm="cryptography",
                        file=relative_path,
                        line=idx + 1,
                        evidence=line.strip(),
                        type="Library Dependency",
                        mode="Dependency",
                        key_size="N/A",
                        library="python-cryptography",
                        confidence="HIGH"
                    ))

        # 2. package.json
        elif fname == "package.json":
            content = "".join(lines)
            if "crypto-js" in content:
                for idx, line in enumerate(lines):
                    if "crypto-js" in line:
                        artefacts.append(DetectedArtefact(
                            algorithm="crypto-js",
                            file=relative_path,
                            line=idx + 1,
                            evidence=line.strip(),
                            type="Library Dependency",
                            mode="JavaScript Library",
                            key_size="N/A",
                            library="crypto-js",
                            confidence="HIGH"
                        ))
                        break

        # 3. pom.xml (Java Maven dependencies)
        elif fname == "pom.xml":
            for idx, line in enumerate(lines):
                line_strip = line.strip()
                if "bcprov" in line_strip or "bouncycastle" in line_strip:
                    artefacts.append(DetectedArtefact(
                        algorithm="bouncycastle",
                        file=relative_path,
                        line=idx + 1,
                        evidence=line_strip,
                        type="Library Dependency",
                        mode="JCA Security Provider",
                        key_size="N/A",
                        library="BouncyCastle",
                        confidence="HIGH"
                    ))
                    break

        # 4. YAML / JSON / Conf files for SSL / TLS protocols
        elif any(file_path.lower().endswith(ext) for ext in [".yaml", ".yml", ".json", ".conf", ".ini"]):
            for idx, line in enumerate(lines):
                line_strip = line.strip()
                if re.search(r'(?:ssl_protocols|tls_version|ssl_version)\s*[:=]\s*.*(?:tlsv1\b|tlsv1\.1|sslv3|sslv2)', line_strip, re.IGNORECASE):
                    artefacts.append(DetectedArtefact(
                        algorithm="TLS",
                        file=relative_path,
                        line=idx + 1,
                        evidence=line_strip,
                        type="Transport Layer Security",
                        mode="Deprecated Protocol Config",
                        key_size="N/A",
                        library="Config / Server",
                        confidence="HIGH"
                    ))

        return artefacts
