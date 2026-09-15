import ast
import re
from typing import List, Optional
from app.detectors.base import BaseDetector, DetectedArtefact
from app.detectors.pattern_registry import ALGORITHM_METADATA

class PythonDetector(BaseDetector):
    def scan_file(self, file_path: str, relative_path: str) -> List[DetectedArtefact]:
        results: List[DetectedArtefact] = []
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
                lines = content.splitlines()
        except Exception:
            return results

        # 1. AST-based deterministic scanning
        ast_results = self._scan_ast(content, lines, relative_path)
        results.extend(ast_results)

        # 2. Contextual Regex scanning (catches imports, dynamic patterns, and fills in gaps)
        regex_results = self._scan_regex(lines, relative_path)
        
        # Deduplicate results based on (algorithm, line)
        seen = set()
        unique_results = []
        for r in results + regex_results:
            key = (r.algorithm, r.line)
            if key not in seen:
                seen.add(key)
                unique_results.append(r)

        return unique_results

    def _scan_ast(self, content: str, lines: List[str], relative_path: str) -> List[DetectedArtefact]:
        artefacts: List[DetectedArtefact] = []
        try:
            tree = ast.parse(content)
        except SyntaxError:
            return artefacts

        class CryptoVisitor(ast.NodeVisitor):
            def __init__(self, parent):
                self.parent = parent
                self.imported_modules = {}

            def visit_Import(self, node):
                for alias in node.names:
                    self.imported_modules[alias.asname or alias.name] = alias.name
                self.generic_visit(node)

            def visit_ImportFrom(self, node):
                mod = node.module or ""
                for alias in node.names:
                    self.imported_modules[alias.asname or alias.name] = f"{mod}.{alias.name}"
                self.generic_visit(node)

            def visit_Call(self, node):
                line = node.lineno
                evidence = lines[line - 1] if 0 < line <= len(lines) else ""
                call_str = ast.unparse(node) if hasattr(ast, "unparse") else ""

                # --- 1. hashlib detections ---
                # hashlib.md5(), hashlib.sha1(), hashlib.sha256(), etc.
                if isinstance(node.func, ast.Attribute):
                    attr_name = node.func.attr.lower()
                    val_id = getattr(node.func.value, "id", "")

                    if val_id == "hashlib" or "hashlib" in self.imported_modules.get(val_id, ""):
                        if attr_name in ["md5", "sha1", "sha256", "sha384", "sha512", "sha3_256", "sha3_512"]:
                            algo_map = {
                                "md5": "MD5", "sha1": "SHA-1", "sha256": "SHA-256",
                                "sha384": "SHA-384", "sha512": "SHA-512",
                                "sha3_256": "SHA-3", "sha3_512": "SHA-3"
                            }
                            algo = algo_map.get(attr_name, attr_name.upper())
                            meta = ALGORITHM_METADATA.get(algo, {})
                            artefacts.append(DetectedArtefact(
                                algorithm=algo,
                                file=relative_path,
                                line=line,
                                evidence=evidence,
                                type=meta.get("type", "Hash Function"),
                                mode="Digest",
                                key_size=meta.get("default_key_size", "Unknown / Not Determined"),
                                library="hashlib",
                                confidence="HIGH"
                            ))

                    # hashlib.new('md5'), hashlib.new('sha256')
                    if val_id == "hashlib" and attr_name == "new" and node.args:
                        arg0 = node.args[0]
                        if isinstance(arg0, ast.Constant) and isinstance(arg0.value, str):
                            algo_candidate = arg0.value.upper()
                            algo = self.parent._normalize_algorithm(algo_candidate)
                            if algo:
                                meta = ALGORITHM_METADATA.get(algo, {})
                                artefacts.append(DetectedArtefact(
                                    algorithm=algo,
                                    file=relative_path,
                                    line=line,
                                    evidence=evidence,
                                    type=meta.get("type", "Hash Function"),
                                    mode="Digest",
                                    key_size=meta.get("default_key_size", "Unknown / Not Determined"),
                                    library="hashlib",
                                    confidence="HIGH"
                                ))

                # --- 2. PyCryptodome / Crypto.Cipher detections ---
                # DES.new(...), AES.new(...), ARC4.new(...)
                if isinstance(node.func, ast.Attribute) and node.func.attr == "new":
                    val_id = getattr(node.func.value, "id", "")
                    algo_candidate = val_id.upper()
                    if algo_candidate in ["DES", "AES", "ARC4", "DES3", "BLOWFISH"]:
                        algo_map = {"ARC4": "RC4", "DES3": "3DES"}
                        algo = algo_map.get(algo_candidate, algo_candidate)
                        mode = "Unknown / Not Determined"
                        # Inspect mode in arguments
                        for arg in node.args[1:] + [kw.value for kw in node.keywords if kw.arg == "mode"]:
                            arg_text = ast.unparse(arg) if hasattr(ast, "unparse") else ""
                            if "MODE_ECB" in arg_text or "ECB" in arg_text:
                                mode = "ECB"
                            elif "MODE_CBC" in arg_text or "CBC" in arg_text:
                                mode = "CBC"
                            elif "MODE_GCM" in arg_text or "GCM" in arg_text:
                                mode = "GCM"
                            elif "MODE_CTR" in arg_text or "CTR" in arg_text:
                                mode = "CTR"

                        meta = ALGORITHM_METADATA.get(algo, {})
                        artefacts.append(DetectedArtefact(
                            algorithm=algo,
                            file=relative_path,
                            line=line,
                            evidence=evidence,
                            type=meta.get("type", "Symmetric Encryption"),
                            mode=mode,
                            key_size=meta.get("default_key_size", "Unknown / Not Determined"),
                            library="PyCryptodome",
                            confidence="HIGH"
                        ))

                # --- 3. cryptography.hazmat RSA key generation ---
                # rsa.generate_private_key(public_exponent=65537, key_size=1024)
                if "generate_private_key" in call_str or (isinstance(node.func, ast.Attribute) and node.func.attr == "generate_private_key"):
                    key_size = "Unknown / Not Determined"
                    for kw in node.keywords:
                        if kw.arg == "key_size" and isinstance(kw.value, ast.Constant):
                            key_size = f"{kw.value.value}-bit"

                    algo = "RSA"
                    if "1024" in key_size:
                        algo = "RSA-1024"
                    elif "2048" in key_size:
                        algo = "RSA"

                    # Check if ECC
                    func_text = ast.unparse(node.func) if hasattr(ast, "unparse") else ""
                    if "ec." in func_text or "ec." in call_str:
                        algo = "ECC"

                    meta = ALGORITHM_METADATA.get(algo, {})
                    artefacts.append(DetectedArtefact(
                        algorithm=algo,
                        file=relative_path,
                        line=line,
                        evidence=evidence,
                        type=meta.get("type", "Asymmetric Cryptography"),
                        mode=meta.get("default_mode", "Public-Key"),
                        key_size=key_size if key_size != "Unknown / Not Determined" else meta.get("default_key_size", "Unknown / Not Determined"),
                        library="cryptography",
                        confidence="HIGH"
                    ))

                # --- 4. cryptography Ed25519 ---
                if "Ed25519PrivateKey.generate" in call_str:
                    artefacts.append(DetectedArtefact(
                        algorithm="Ed25519",
                        file=relative_path,
                        line=line,
                        evidence=evidence,
                        type="Digital Signature",
                        mode="Signature",
                        key_size="256-bit",
                        library="cryptography",
                        confidence="HIGH"
                    ))

                # --- 5. HMAC detection ---
                # hmac.new(...)
                if (isinstance(node.func, ast.Attribute) and node.func.attr == "new" and getattr(node.func.value, "id", "") == "hmac") or \
                   ("hmac.new(" in call_str):
                    artefacts.append(DetectedArtefact(
                        algorithm="HMAC",
                        file=relative_path,
                        line=line,
                        evidence=evidence,
                        type="Message Authentication Code (MAC)",
                        mode="Authentication Tag",
                        key_size="Variable",
                        library="hmac",
                        confidence="HIGH"
                    ))

                self.generic_visit(node)

        visitor = CryptoVisitor(self)
        visitor.visit(tree)
        return artefacts

    def _scan_regex(self, lines: List[str], relative_path: str) -> List[DetectedArtefact]:
        artefacts: List[DetectedArtefact] = []

        patterns = [
            # DES in Crypto or hazmat
            (r'from\s+Crypto\.Cipher\s+import\s+DES\b|DES\.new\(', "DES", "PyCryptodome", "Symmetric Encryption"),
            # 3DES / TripleDES
            (r'from\s+Crypto\.Cipher\s+import\s+DES3\b|DES3\.new\(|algorithms\.TripleDES\(', "3DES", "PyCryptodome", "Symmetric Encryption"),
            # RC4 / ARC4
            (r'from\s+Crypto\.Cipher\s+import\s+ARC4\b|ARC4\.new\(|algorithms\.ARC4\(', "RC4", "PyCryptodome", "Symmetric Encryption (Stream Cipher)"),
            # AES
            (r'from\s+Crypto\.Cipher\s+import\s+AES\b|AES\.new\(|algorithms\.AES\(', "AES", "PyCryptodome", "Symmetric Encryption"),
            # hashlib functions
            (r'\bhashlib\.md5\(', "MD5", "hashlib", "Hash Function"),
            (r'\bhashlib\.sha1\(', "SHA-1", "hashlib", "Hash Function"),
            (r'\bhashlib\.sha256\(', "SHA-256", "hashlib", "Hash Function"),
            (r'\bhashlib\.sha384\(', "SHA-384", "hashlib", "Hash Function"),
            (r'\bhashlib\.sha512\(', "SHA-512", "hashlib", "Hash Function"),
            # RSA imports / usage
            (r'import\s+rsa\b|from\s+Crypto\.PublicKey\s+import\s+RSA\b|from\s+cryptography\.hazmat\.primitives\.asymmetric\s+import\s+rsa\b', "RSA", "cryptography", "Asymmetric Cryptography"),
            # ECC / ECDSA
            (r'from\s+cryptography\.hazmat\.primitives\.asymmetric\s+import\s+ec\b|ec\.generate_private_key|ec\.ECDSA\(', "ECC", "cryptography", "Asymmetric Cryptography"),
            # Ed25519
            (r'ed25519\.Ed25519PrivateKey', "Ed25519", "cryptography", "Digital Signature"),
            # SSL / TLS
            (r'ssl\.wrap_socket|ssl\.PROTOCOL_TLS|ssl\.PROTOCOL_SSLv23', "TLS", "ssl", "Transport Layer Security")
        ]

        for idx, line in enumerate(lines):
            line_num = idx + 1
            line_strip = line.strip()
            if not line_strip or line_strip.startswith("#"):
                continue

            for regex, algo_name, default_lib, default_type in patterns:
                if re.search(regex, line):
                    # Check for mode indicators on same line
                    mode = "Unknown / Not Determined"
                    if "MODE_ECB" in line or "ECB" in line:
                        mode = "ECB"
                    elif "MODE_CBC" in line or "CBC" in line:
                        mode = "CBC"
                    elif "MODE_GCM" in line or "GCM" in line:
                        mode = "GCM"

                    # Check key size indicators
                    key_size = "Unknown / Not Determined"
                    if "1024" in line:
                        key_size = "1024-bit"
                        if algo_name == "RSA":
                            algo_name = "RSA-1024"
                    elif "2048" in line:
                        key_size = "2048-bit"
                    elif "256" in line and "AES" in algo_name:
                        algo_name = "AES-256"
                        key_size = "256-bit"

                    meta = ALGORITHM_METADATA.get(algo_name, {})
                    artefacts.append(DetectedArtefact(
                        algorithm=algo_name,
                        file=relative_path,
                        line=line_num,
                        evidence=line_strip,
                        type=meta.get("type", default_type),
                        mode=mode if mode != "Unknown / Not Determined" else meta.get("default_mode", "Unknown / Not Determined"),
                        key_size=key_size if key_size != "Unknown / Not Determined" else meta.get("default_key_size", "Unknown / Not Determined"),
                        library=default_lib,
                        confidence="HIGH"
                    ))

        return artefacts

    def _normalize_algorithm(self, name: str) -> Optional[str]:
        name_clean = name.upper().replace("-", "").replace("_", "")
        if name_clean == "MD5":
            return "MD5"
        if name_clean == "SHA1":
            return "SHA-1"
        if name_clean == "SHA256":
            return "SHA-256"
        if name_clean == "SHA384":
            return "SHA-384"
        if name_clean == "SHA512":
            return "SHA-512"
        if name_clean in ["SHA3256", "SHA3512", "SHA3"]:
            return "SHA-3"
        if "DES" in name_clean:
            return "3DES" if "3" in name_clean or "EDE" in name_clean else "DES"
        if "AES" in name_clean:
            return "AES-256" if "256" in name_clean else "AES"
        if "RC4" in name_clean or "ARC4" in name_clean:
            return "RC4"
        if "RSA" in name_clean:
            return "RSA-1024" if "1024" in name_clean else "RSA"
        return None
