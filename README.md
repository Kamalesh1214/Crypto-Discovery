# Cryptographic Discovery

### Enterprise Cryptographic Discovery & Analysis Tool (ECDAT)

**Smart India Hackathon 2026 — SIH26164**
**Theme:** Blockchain & Cybersecurity

Cryptographic Discovery is an enterprise-focused platform for discovering cryptographic assets, building a centralized cryptographic inventory, identifying security and quantum risks, and supporting post-quantum migration planning.

---

## Demo

### 1. Download Demo Files

Download the prepared repository containing cryptographic examples for demonstration.

### [⬇️ Download Demo Files — sample-project.zip](https://github.com/Kamalesh1214/Crypto-Discovery/raw/refs/heads/main/samples/sample-project.zip)

OR

### [⬇️ Download Demo Files — cryptographic-discovery-advanced-test.zip](https://github.com/Kamalesh1214/Crypto-Discovery/raw/refs/heads/main/samples/cryptographic-discovery-advanced-test.zip)

### 2. Launch Live Demo

After downloading the ZIP:

### [🚀 Open Cryptographic Discovery](https://crypto-discovery.vercel.app/)

Upload `Demo Files` and start the scan.

### 3. Explore

```text
Discovery → CBOM → Risk → Dependencies → Migration → Reports
```

---

## What It Does

### Cryptographic Discovery

Discovers cryptographic usage across source code, libraries, dependencies, configurations, and TLS-related files.

### CBOM

Builds a centralized **Cryptographic Bill of Materials (CBOM)** containing the discovered cryptographic assets and their associated information.

### Risk Analysis

Identifies deprecated, weak, and potentially vulnerable cryptographic algorithms and prioritizes them based on security risk.

### Quantum Readiness

Identifies public-key cryptography that may require migration in the post-quantum era and highlights potential **Harvest Now, Decrypt Later (HNDL)** exposure.

### Migration Planning

Provides migration guidance, including dependency impact, migration effort, and hybrid post-quantum cryptography concepts.

### Reports

Exports the discovered cryptographic inventory and analysis results for further review.

---

## Key Features

* Static cryptographic discovery
* CBOM-ready inventory
* Classical risk assessment
* HNDL exposure assessment
* Mosca's Theorem-based quantum urgency concept
* Dependency and migration impact analysis
* PQC migration guidance
* JSON and CSV reports
* Secure ZIP analysis
* Source-level evidence for findings

---

## Architecture

```text
Repository
     │
     ▼
Cryptographic Discovery
     │
     ▼
     CBOM
     │
     ├── Risk Analysis
     │
     ├── HNDL / Quantum Risk
     │
     ├── Dependency Analysis
     │
     └── PQC Migration
             │
             ▼
        Reports & Actions
```

---

## Technology Stack

* **Frontend:** React, Vite, CSS
* **Backend:** Python, FastAPI
* **Database:** SQLite, SQLAlchemy
* **Testing:** Pytest, HTTPX

---

## Security

* Uploaded repositories are analyzed statically.
* Uploaded source code is not executed.
* ZIP extraction includes path-traversal protection.
* Findings are linked to source evidence.
* Risk and exposure results are generated from deterministic rules.

---

## Project Vision

```text
DISCOVER
   ↓
INVENTORY
   ↓
ASSESS
   ↓
PRIORITIZE
   ↓
MIGRATE
```

Cryptographic Discovery aims to provide organizations with visibility into their cryptographic assets and a structured path toward **quantum-ready cryptography**.

---

## Links

**[⬇️ Download Demo Files — sample-project.zip](https://github.com/Kamalesh1214/Crypto-Discovery/raw/refs/heads/main/samples/sample-project.zip)**

**[⬇️ Download Demo Files — cryptographic-discovery-advanced-test.zip](https://github.com/Kamalesh1214/Crypto-Discovery/raw/refs/heads/main/samples/cryptographic-discovery-advanced-test.zip)**

**[🚀 Live Demo](https://crypto-discovery.vercel.app/)**

**Problem Statement:** SIH26164