# Cryptographic Discovery: Enterprise Cryptographic Discovery & Analysis

> **Enterprise Cryptographic Discovery & Analysis Tool (ECDAT)**  
> **Smart India Hackathon (SIH 2026) Problem Statement: SIH26164**  
> *Deterministic static cryptographic inventory, classical risk scoring, potential data exposure evaluation, and post-quantum migration readiness planner.*

---

## 1. Overview & Problem Statement
Large enterprise organizations manage hundreds of repositories containing heterogeneous cryptographic artefacts. Without a centralized inventory, organizations struggle to identify:
- Which cryptographic algorithms, key lengths, and cipher modes are active.
- Where deprecated, weak, or broken primitives (DES, RC4, 3DES, MD5, SHA-1, RSA < 2048) reside.
- Which assets expose confidential data or fail regulatory mandates.
- Which public-key algorithms are vulnerable to quantum cryptanalysis (Shor's algorithm) requiring **Post-Quantum Cryptography (PQC)** migration planning.

**Cryptographic Discovery** solves this by providing a safe, zero-execution static analysis scanner that parses uploaded repository ZIP archives, catalogs all cryptographic usage into a Cryptographic Bill of Materials (CBOM), evaluates classical risk, assesses potential data exposure, and produces estimated PQC migration timelines.

---

## 2. Six-Module Application Workflow

The application is structured into six core operational modules:

1. **01 Discovery — Assets Ingestion Console**:
   - Safe static upload and analysis of repository ZIP files (Python, Java, dependency manifests, TLS configs).
   - Real-time dynamic scanning console with 6-stage pipeline (`UPLOAD → VALIDATE → DISCOVER → ANALYZE → ASSESS → GENERATE REPORT`), live file counters, current file/primitive display, and backend state polling.

2. **02 Overview — Executive Readiness Center**:
   - Executive dashboard presenting verified scan results: files scanned, crypto artefacts, critical/high/medium findings, 0–100 risk score gauge, potential exposure, and PQC migration readiness.

3. **03 CBOM — Cryptographic Inventory Studio**:
   - CBOM-ready inventory table detailing algorithm, primitive type, mode, key size, library, file, line number, severity, quantum risk, PQC candidate status, exposure, and migration effort. Includes search, multi-factor filtering, and direct JSON/CSV export.

4. **04 Risk / Mosca — Quantum Exposure Engine**:
   - Explains classical cryptanalytic vulnerabilities alongside quantum Harvest-Now-Decrypt-Later (HNDL) exposure. Features an interactive conceptual **Mosca's Theorem Urgency Model** ($X + Y > Z$) based on actual repository findings.

5. **05 Dependencies — Blast Radius Visualizer**:
   - Interactive relationship visualizer tracing:
     `Cryptographic Usage → Libraries → Affected Files → Call Sites → Component Impact`.

6. **06 Migration — Hybrid Remediation Workbench**:
   - Developer-centric guidance, compatibility considerations, and prototype remediation wrappers (e.g. NIST FIPS 203 ML-KEM, FIPS 204 ML-DSA, AES-256-GCM) clearly designated as instructional patterns.

### B. Deterministic Cryptographic Discovery
- **Languages Supported**: Python (`.py`), Java (`.java`), configuration/dependency manifests (`requirements.txt`, `package.json`, `pom.xml`, YAML/JSON TLS configs).
- **Algorithms Detected**:
  - *Symmetric*: AES (128/256, modes: ECB, CBC, GCM, CTR), DES, 3DES (TripleDES / DESede), RC4 (ARC4).
  - *Hash Functions*: MD5, SHA-1, SHA-256, SHA-384, SHA-512, SHA-3.
  - *Asymmetric & Signatures*: RSA (1024, 2048, 4096), ECC (curves like SECP256R1), ECDSA, Ed25519.
  - *Message Authentication & Transport*: HMAC (HMAC-SHA256, HMAC-MD5), TLS / SSL configurations.
  - *Libraries*: `hashlib`, `PyCryptodome`, `cryptography`, `Java JCA/JCE`, `BouncyCastle`, `OpenSSL`.

### C. CryptoLens Prototype Risk Engine & Scoring
- **Rule Matrix**:
  - `CRITICAL`: DES, RC4 (broken keyspace and statistical biases).
  - `HIGH`: 3DES (Sweet32 collisions), MD5, SHA-1, RSA < 2048 bits (e.g. RSA-1024).
  - `MEDIUM`: Unauthenticated RSA, unverified modes.
  - `LOW / INFO`: AES-128, AES-256, SHA-256, SHA-384, SHA-512, SHA-3.
  - `WARNING`: Unknown / undetermined cryptographic implementations.
- **Prototype Risk Score (0–100 scale)**:
  - Starts at 100 (optimal security posture).
  - Deductions: -25 points per Critical, -15 per High, -8 per Medium, -5 per Warning, -1 per Low.
  - Clamped between 0 and 100.

### D. Feature 1: Potential Data Exposure Engine
- **Levels**: `LOW`, `MEDIUM`, `HIGH`, `VERY HIGH`, `UNKNOWN`.
- **Evidence-Based Factors**: Analyzes mathematical cipher strength, key length, mode of operation (e.g. ECB mode leaking structural data patterns), and sensitive contexts without fabricating false leak probabilities.
- **Non-Alarmist Disclaimer**: *"Potential exposure is a prototype assessment based on available scan evidence and configurable rules. It is not a prediction of actual data leakage."*

### E. Feature 2: Estimated Post-Quantum Migration Effort Engine
- **Quantum Relevance**:
  - High concern for asymmetric primitives (RSA, ECC, ECDSA, Ed25519) vulnerable to Shor's algorithm on Cryptographically Relevant Quantum Computers (CRQCs).
  - Lower concern for modern symmetric ciphers (AES-256) and secure hashes (SHA-256/384/512) where Grover's algorithm retains a 128-bit quantum security margin.
- **Migration Effort Ranges**:
  - `LOW`: 1–2 weeks (isolated routines or simple key-length adjustments).
  - `MEDIUM`: 2–6 weeks (single/few asymmetric endpoints requiring key lifecycle and compatibility testing).
  - `HIGH`: 6+ weeks (multiple asymmetric touchpoints across files requiring protocol and PKI refactoring).
  - `NOT REQUIRED`: Modern symmetric authenticated ciphers (AES-256-GCM) and collision-resistant hashes.
- **Disclaimer**: *"Migration estimates are approximate prototype estimates and should not be treated as guaranteed project timelines. PQC migration assessment identifies potential candidates for further analysis; it does not automatically migrate production software."*

### F. Reports & Compliance Exports
- **CBOM-Ready JSON**: Complete machine-readable cryptographic Bill of Materials.
- **Standard CSV**: 18-column audit table compatible with Microsoft Excel, SIEMs, and audit pipelines.

---

## 3. Technology Stack
- **Backend**: Python 3.14 / 3.10+, FastAPI, SQLite, SQLAlchemy, Pydantic v2, Uvicorn.
- **Frontend**: React 18, Vite, Lucide-React, Pure CSS Cyber-Command Center styling.
- **Testing**: Pytest, HTTPX test client.
- **Architecture**: Decoupled RESTful API with zero external cloud or heavy infrastructure requirements.

---

## 4. Project Directory Structure
```
CryptoLens/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entrypoint & lifecycle
│   │   ├── config.py                # Security thresholds, file limits & disclaimers
│   │   ├── api/
│   │   │   └── routes.py            # Endpoints: /scan, /inventory, /findings, /report/*
│   │   ├── scanner/
│   │   │   ├── zip_extractor.py     # Zip-slip traversal & bomb defense extractor
│   │   │   └── file_discovery.py    # Recursive walker skipping binaries & build dirs
│   │   ├── detectors/
│   │   │   ├── base.py              # Base detector & DetectedArtefact data model
│   │   │   ├── pattern_registry.py  # Canonical algorithm metadata lookup table
│   │   │   ├── python_detector.py   # Python AST & contextual regex parser
│   │   │   ├── java_detector.py     # Java JCA/JCE and BouncyCastle parser
│   │   │   └── config_detector.py   # Dependency manifests (requirements.txt, pom.xml)
│   │   ├── rules/
│   │   │   ├── risk_engine.py       # Prototype rules & 0-100 risk score calculator
│   │   │   ├── exposure_engine.py   # Potential Data Exposure assessment
│   │   │   └── pqc_engine.py        # Quantum risk & migration effort estimation
│   │   ├── models/
│   │   │   ├── db.py                # SQLite connection & sessionmaker
│   │   │   └── schemas.py           # SQLAlchemy tables & Pydantic schemas
│   │   └── services/
│   │       ├── scan_service.py      # Orchestrator linking extraction, detectors & rules
│   │       └── report_service.py    # JSON & CSV export builders
│   ├── tests/
│   │   ├── test_zip_security.py     # Path traversal, archive bomb & corrupt zip tests
│   │   ├── test_python_detector.py # DES, AES, 3DES, RC4, MD5, SHA, RSA, ECC, HMAC
│   │   ├── test_java_detector.py   # Java Cipher, MessageDigest, KeyPairGenerator
│   │   ├── test_risk_engine.py     # Severity assignments and score deductions
│   │   ├── test_exposure_engine.py # LOW, MEDIUM, HIGH, VERY HIGH, UNKNOWN
│   │   ├── test_pqc_engine.py      # Quantum risk, PQC candidates & effort ranges
│   │   └── test_api.py             # E2E endpoints: upload, scan, inventory, exports
│   ├── requirements.txt
│   └── pytest.ini
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Sidebar, Header, MetricCard, RiskChart, Badges...
│   │   ├── pages/                   # UploadPage, OverviewPage, InventoryPage, FindingsPage, ReportsPage
│   │   ├── services/api.js          # REST client communicating with FastAPI
│   │   ├── App.jsx                  # Main view router
│   │   ├── main.jsx                 # React root
│   │   └── index.css                # Dark Navy / Cyan cybersecurity command theme
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── sample-project/                  # Safe demonstration repository with Python & Java crypto
├── sample-project.zip               # Pre-packaged archive ready for instant UI scan
├── README.md                        # Project documentation
├── ARCHITECTURE.md                  # Comprehensive architectural blueprint
├── SIH_MAPPING.md                   # Formal SIH26164 requirements trace
├── SELF_REVIEW.md                   # Verification checklist & quality review
└── .gitignore
```

---

## 5. Quick Start Instructions (Windows / VS Code)

### Prerequisites
- Python 3.10+ (tested with Python 3.14.7)
- Node.js 18+ (tested with Node v24.20.0 and npm 11.19.0)
- Git (optional)

### Step 1: Clone or Open Project in VS Code
Open the project directory in VS Code:
```powershell
cd C:\Users\bashe\.gemini\antigravity\scratch\CryptoLens
```

### Step 2: Start the Backend
Open a terminal in VS Code (PowerShell):
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*The FastAPI backend will start at `http://127.0.0.1:8000`. API documentation is available at `http://127.0.0.1:8000/docs`.*

### Step 3: Start the Frontend
Open a second terminal in VS Code:
```powershell
cd frontend
npm install
npm run dev
```
*The Vite frontend will start at `http://localhost:5173`.*

### Step 4: Run the Complete Workflow
1. Open your browser and navigate to `http://localhost:5173`.
2. Drag and drop the included `sample-project.zip` file into the upload zone.
3. Click **Start Scan**.
4. Observe the real-time scanning pipeline stages:
   `UPLOAD → DISCOVER → ANALYZE → ASSESS → GENERATE REPORT`.
5. Review the **Overview Dashboard** (Risk Score, Potential Data Exposure, PQC Migration Readiness).
6. Explore the **Inventory** page to search and filter by algorithm, severity, or exposure.
7. Click on any finding row to view the **Finding Detail Panel** with contextual reasons, actionable remediation, and source code evidence.
8. Navigate to **Reports** to download the complete **JSON** and **CSV** reports.

---

## 6. Running Automated Tests
Run the entire backend test suite using pytest:
```powershell
cd backend
.\.venv\Scripts\pytest -v
```
All 25 unit and integration tests across 7 test suites validate:
- ZIP security (zip-slip path traversal, archive bombs, corrupt archives).
- Python and Java cryptographic detector accuracy.
- Classical severity mappings and 0–100 risk score calculations.
- Potential Data Exposure levels and non-alarmist disclaimers.
- Quantum risk classification and PQC migration effort estimates.
- End-to-end API upload, scan persistence, inventory querying, and JSON/CSV report generation.

---

## 7. Security Controls & Guarantees
- **Static Analysis Exclusively**: Uploaded code is NEVER imported or executed.
- **Untrusted Archive Containment**: Archives are extracted into temporary isolated directories with canonical path resolution guards.
- **No Unrealistic AI / Hallucination**: Every finding links to an exact file, line number, and verified code evidence string.
- **No Fake Metrics**: All dashboard counters, risk scores, exposure ratings, and PQC candidates are derived strictly from deterministic scan data.

---

## 8. Known Limitations & Future Scope
- **Current Language Support**: Python and Java are supported in this prototype, alongside manifest and config files. Future scope includes C/C++, Go, Rust, and C#.
- **Dynamic Key Generation**: Purely dynamic runtime keys generated via remote network KMS or HSM without local source code signatures cannot be statically inspected.
- **Future Scope**: Direct Git repository cloning via URL, CI/CD pipeline GitHub Action / GitLab CI integration, and CycloneDX 1.6 CBOM XML format export.
