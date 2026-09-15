# SIH 2026 Problem Statement SIH26164: Requirements & Implementation Traceability

This document maps the core objectives of **Problem Statement SIH26164 (Enterprise Cryptographic Discovery & Analysis Tool - ECDAT)** directly to the implemented modules, algorithms, and components in **Cryptographic Discovery**.

---

## 1. Compliance Traceability Matrix (Six-Module Architecture)

| Product Module | SIH26164 Requirement | Cryptographic Discovery Implementation Details | Status |
| :--- | :--- | :--- | :---: |
| **01 Discovery**<br>*(Assets Ingestion Console)* | Safe repository scanning & real-time discovery tracking. | `SafeZipExtractor` path traversal & bomb guards. Real-time dynamic scanning console with 6-stage pipeline (`UPLOAD → VALIDATE → DISCOVER → ANALYZE → ASSESS → GENERATE REPORT`), backend status polling (`GET /api/scan/{id}/status`), live file counters, and current activity tracking. | **IMPLEMENTED** |
| **02 Overview**<br>*(Executive Readiness Center)* | Executive summary, posture metrics, and classical risk score. | Centralized dashboard displaying verified files scanned, crypto artefacts, critical/high/medium findings, 0–100 **CryptoLens Prototype Risk Score**, potential exposure rating, and PQC migration readiness. | **IMPLEMENTED** |
| **03 CBOM**<br>*(Cryptographic Inventory Studio)* | Structured CBOM-ready cryptographic inventory and audit exports. | Multi-column tabular inventory (Algorithm, Type, Mode, Key Size, Library, File, Line, Severity, Quantum Risk, PQC Candidate, Exposure, Effort). Search, multi-criteria filters, and one-click JSON CBOM & CSV audit exports. | **IMPLEMENTED** |
| **04 Risk / Mosca**<br>*(Quantum Exposure Engine)* | Classical vs quantum risk, HNDL threat, and migration urgency. | Conceptual **Mosca's Theorem Urgency Model** ($X + Y > Z$) with interactive data shelf life parameter sliders, Shor/Grover algorithm threat analysis, and evidence-grounded exposure factor breakdown. | **IMPLEMENTED** |
| **05 Dependencies**<br>*(Blast Radius Visualizer)* | Cryptographic usage, library bindings, and component blast radius. | Interactive relationship visualizer tracing: `Cryptographic Primitive → Library Provider → Target Source Files → Call Sites → Impact Severity`. | **IMPLEMENTED** |
| **06 Migration**<br>*(Hybrid Remediation Workbench)* | Actionable remediation guidance and PQC migration planning. | Developer workbench providing concrete prototype remediation code wrappers (NIST FIPS 203 ML-KEM, FIPS 204 ML-DSA, AES-256-GCM), compatibility considerations, and regression testing criteria. | **IMPLEMENTED** |
| **7. Actionable Recommendations** | Provide clear, practical remediation guidance for each identified finding. | Centralized `ALGORITHM_METADATA` and `RiskEngine` generate concrete migration instructions (e.g., migrating from DES/RC4 to AES-GCM; upgrading RSA-1024 to RSA-3072 or ML-KEM/ML-DSA). | **IMPLEMENTED** |
| **8. CBOM & Audit Export** | Export findings and inventory in standardized, machine-readable formats. | `ReportService` exports full cryptographic Bill of Materials in **JSON format** and comprehensive 18-column tabular audits in **CSV format**. | **IMPLEMENTED** |
| **9. Safe Archive Handling** | Protect against malicious or untrusted repository ZIP files. | `SafeZipExtractor` implements path traversal (Zip-Slip) guards, 100MB upload caps, 250MB extracted size caps, 2,000 file count caps, and 100:1 ratio archive bomb defenses. | **IMPLEMENTED** |
| **10. Multilingual Static Parsing** | Universal programming language coverage. | Python (`.py`), Java (`.java`), and dependency/config files are fully implemented. C/C++, Go, Rust, and C# are modularly planned for subsequent releases. | **PARTIALLY IMPLEMENTED** |
| **11. Automated Production PQC Migration** | Automatically rewrite codebase to use post-quantum libraries. | CryptoLens is strictly a discovery, analysis, risk scoring, and migration planning tool. Automated code generation is intentionally reserved for human security engineering oversight. | **FUTURE SCOPE** |
| **12. Git Remote Repository Cloner** | Connect directly to GitHub, GitLab, or Bitbucket via OAuth/token. | Currently accepts uploaded ZIP archives of repositories. Direct Git remote cloning and webhook ingestion are planned for v2.0. | **FUTURE SCOPE** |
| **13. CycloneDX 1.6 CBOM XML Export** | Formal OASIS/CycloneDX 1.6 CBOM standard format. | Structured JSON export is fully implemented and mapped to CBOM attributes; formal CycloneDX XML serialization can be layered on. | **FUTURE SCOPE** |

---

## 2. Alignment with SIH Evaluation Criteria
- **Innovation & Technical Depth**: Combines classical static analysis (AST parsing) with post-quantum readiness triage without relying on probabilistic AI or slow cloud dependencies.
- **Feasibility & Performance**: Runs completely locally on Windows/Linux in seconds, requiring only Python, FastAPI, React, and SQLite.
- **Accuracy & Determinism**: Zero hallucinated findings or fake leakage probabilities. Every finding provides verifiable line numbers and code snippets.
- **Commercial & Enterprise Readiness**: Ready for compliance audits, enterprise CBOM generation, and executive post-quantum roadmap planning.
