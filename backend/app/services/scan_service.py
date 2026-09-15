import os
import uuid
import json
import time
import shutil
import threading
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.scanner.zip_extractor import SafeZipExtractor
from app.scanner.file_discovery import discover_files
from app.detectors.python_detector import PythonDetector
from app.detectors.java_detector import JavaDetector
from app.detectors.config_detector import ConfigDetector
from app.rules.risk_engine import RiskEngine
from app.rules.exposure_engine import ExposureEngine
from app.rules.pqc_engine import PQCEngine
from app.models.schemas import ScanModel, ArtefactModel

# Thread-safe in-memory scan status dictionary for live polling
SCAN_STATUS: Dict[str, Dict[str, Any]] = {}
SCAN_STATUS_LOCK = threading.Lock()

def update_scan_status(scan_id: str, **kwargs):
    with SCAN_STATUS_LOCK:
        if scan_id not in SCAN_STATUS:
            SCAN_STATUS[scan_id] = {
                "scan_id": scan_id,
                "status": "running",
                "stage": "upload",
                "stage_index": 1,
                "stage_name": "UPLOAD",
                "progress": 5,
                "files_discovered": 0,
                "files_analyzed": 0,
                "supported_files": 0,
                "ignored_files": 0,
                "crypto_artifacts": 0,
                "findings": 0,
                "current_file": "Initializing scan...",
                "current_algorithm": "N/A",
                "logs": [],
                "error": None
            }
        SCAN_STATUS[scan_id].update(kwargs)

def append_scan_log(scan_id: str, level: str, message: str):
    """Append a real event emitted by the active static-analysis pipeline."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    with SCAN_STATUS_LOCK:
        if scan_id not in SCAN_STATUS:
            update_scan_status(scan_id)
        logs = SCAN_STATUS[scan_id].setdefault("logs", [])
        logs.append({"timestamp": timestamp, "level": level, "message": message})
        # Keep the response lightweight while retaining the most recent activity.
        if len(logs) > 300:
            del logs[:-300]


def get_scan_status(scan_id: str) -> Optional[Dict[str, Any]]:
    with SCAN_STATUS_LOCK:
        if scan_id in SCAN_STATUS:
            return dict(SCAN_STATUS[scan_id])
    return None

class ScanService:
    def __init__(self, db: Session):
        self.db = db
        self.python_detector = PythonDetector()
        self.java_detector = JavaDetector()
        self.config_detector = ConfigDetector()

    def process_zip_archive(
        self,
        zip_path: str,
        project_name: str,
        original_filename: str,
        scan_id: Optional[str] = None
    ) -> ScanModel:
        if not scan_id:
            scan_id = str(uuid.uuid4())
            
        temp_extracted_dir = None

        try:
            # 1. Pipeline Stage 02: VALIDATE
            update_scan_status(
                scan_id,
                status="running",
                stage="validate",
                stage_index=2,
                stage_name="VALIDATE",
                progress=15,
                current_file="Verifying ZIP integrity and path traversal protection..."
            )
            append_scan_log(scan_id, "INFO", "Initializing discovery scan...")
            time.sleep(0.1)

            # Safe ZIP extraction with zip-slip and bomb protection
            temp_extracted_dir, extracted_count = SafeZipExtractor.extract(zip_path)
            append_scan_log(scan_id, "INFO", f"ZIP security validation passed — {extracted_count} archive files extracted for static inspection.")

            # 2. Pipeline Stage 03: DISCOVER
            update_scan_status(
                scan_id,
                stage="discover",
                stage_index=3,
                stage_name="DISCOVER",
                progress=30,
                current_file="Inspecting file tree and categorizing source files..."
            )
            time.sleep(0.1)

            discovered = discover_files(temp_extracted_dir)
            files_scanned = len(discovered)
            ignored_files = max(0, extracted_count - files_scanned)

            update_scan_status(
                scan_id,
                files_discovered=files_scanned,
                supported_files=files_scanned,
                ignored_files=ignored_files,
                progress=35
            )
            append_scan_log(scan_id, "DISCOVER", f"Found {files_scanned} supported source/configuration files.")
            if ignored_files:
                append_scan_log(scan_id, "INFO", f"Skipped {ignored_files} archive files outside the static-analysis allowlist.")

            # 3. Pipeline Stage 04: ANALYZE
            raw_artefacts = []
            files_analyzed_count = 0

            for idx, item in enumerate(discovered):
                update_scan_status(
                    scan_id,
                    stage="analyze",
                    stage_index=4,
                    stage_name="ANALYZE",
                    current_file=item.relative_path,
                    files_analyzed=files_analyzed_count,
                    progress=35 + int(35 * ((idx + 1) / max(1, files_scanned)))
                )

                append_scan_log(scan_id, "SCAN", f"Analyzing {item.relative_path}")
                found = []
                if item.file_type == "python":
                    found = self.python_detector.scan_file(item.absolute_path, item.relative_path)
                elif item.file_type == "java":
                    found = self.java_detector.scan_file(item.absolute_path, item.relative_path)
                elif item.file_type == "config":
                    found = self.config_detector.scan_file(item.absolute_path, item.relative_path)

                if found:
                    raw_artefacts.extend(found)
                    last_algo = found[-1].algorithm
                    update_scan_status(
                        scan_id,
                        current_algorithm=last_algo,
                        crypto_artifacts=len(raw_artefacts),
                        findings=len(raw_artefacts)
                    )
                    for artefact in found:
                        append_scan_log(scan_id, "MATCH", f"{artefact.algorithm} detected in {artefact.file}:{artefact.line}")
                else:
                    append_scan_log(scan_id, "INFO", f"No cryptographic usage detected in {item.relative_path}")

                files_analyzed_count += 1
                # Small micro-pause so scanning activity is visible dynamically
                time.sleep(0.06)

            update_scan_status(
                scan_id,
                files_analyzed=files_analyzed_count,
                crypto_artifacts=len(raw_artefacts),
                findings=len(raw_artefacts),
                progress=70
            )

            # 4. Pipeline Stage 05: ASSESS
            update_scan_status(
                scan_id,
                stage="assess",
                stage_index=5,
                stage_name="ASSESS",
                progress=75,
                current_file="Evaluating RiskEngine, Potential Data Exposure & PQC Migration..."
            )
            append_scan_log(scan_id, "INFO", "Assessing detected artefacts with risk, exposure, and PQC engines...")
            time.sleep(0.1)

            # Count PQC candidate occurrences for effort estimation
            pqc_count = 0
            affected_files = set()
            for art in raw_artefacts:
                algo = art.algorithm.upper()
                if any(pk in algo for pk in ["RSA", "ECC", "ECDSA", "ED25519", "DIFFIE-HELLMAN"]):
                    pqc_count += 1
                    affected_files.add(art.file)

            # Evaluate Risk, Exposure, and PQC for each artefact
            evaluated_artefacts: List[ArtefactModel] = []
            severities: List[str] = []
            exposure_levels: List[str] = []
            pqc_evals: List[Dict[str, Any]] = []

            risk_dist = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFORMATIONAL": 0, "WARNING": 0}
            exposure_dist = {"VERY HIGH": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "UNKNOWN": 0}
            migration_dist = {"6+ weeks": 0, "2–6 weeks": 0, "1–2 weeks": 0, "Not Required": 0, "Unknown": 0}

            for art in raw_artefacts:
                # Risk evaluation
                risk_eval = RiskEngine.evaluate_artefact(art)
                sev = risk_eval["severity"]
                severities.append(sev)
                if sev in risk_dist:
                    risk_dist[sev] += 1
                else:
                    risk_dist["WARNING"] += 1

                # Exposure evaluation
                exp_eval = ExposureEngine.evaluate(art, sev)
                exp_level = exp_eval["potential_exposure"]
                exposure_levels.append(exp_level)
                if exp_level in exposure_dist:
                    exposure_dist[exp_level] += 1
                else:
                    exposure_dist["UNKNOWN"] += 1

                # PQC evaluation
                pqc_eval = PQCEngine.evaluate(
                    art,
                    total_pqc_count_in_project=pqc_count,
                    files_affected_count=len(affected_files)
                )
                pqc_eval["algorithm"] = art.algorithm
                pqc_evals.append(pqc_eval)

                time_est = pqc_eval["migration_time_estimate"]
                if time_est in migration_dist:
                    migration_dist[time_est] += 1
                else:
                    migration_dist["Unknown"] += 1

                artefact_db = ArtefactModel(
                    id=str(uuid.uuid4()),
                    scan_id=scan_id,
                    algorithm=art.algorithm,
                    type=art.type,
                    mode=art.mode,
                    key_size=art.key_size,
                    library=art.library,
                    file=art.file,
                    line=art.line,
                    evidence=art.evidence,
                    severity=sev,
                    reason=risk_eval["reason"],
                    recommendation=risk_eval["recommendation"],
                    quantum_risk=pqc_eval["quantum_risk"],
                    pqc_migration_candidate=pqc_eval["pqc_migration_candidate"],
                    potential_exposure=exp_level,
                    exposure_reason=exp_eval["exposure_reason"],
                    exposure_factors=json.dumps(exp_eval["exposure_factors"]),
                    migration_effort=pqc_eval["migration_effort"],
                    migration_time_estimate=pqc_eval["migration_time_estimate"],
                    migration_reason=pqc_eval["migration_reason"],
                    migration_factors=json.dumps(pqc_eval["migration_factors"])
                )
                evaluated_artefacts.append(artefact_db)

            # 5. Pipeline Stage 06: GENERATE REPORT
            update_scan_status(
                scan_id,
                stage="generate_report",
                stage_index=6,
                stage_name="GENERATE REPORT",
                progress=90,
                current_file="Persisting Cryptographic Inventory & compiling report metrics..."
            )
            append_scan_log(scan_id, "INFO", "Generating report metrics from completed static-analysis results...")
            time.sleep(0.1)

            risk_score = RiskEngine.calculate_risk_score(severities)
            overall_exposure = ExposureEngine.aggregate_exposure(exposure_levels)
            pqc_summary = PQCEngine.aggregate_migration_summary(pqc_evals)

            summary_dict = {
                "risk_distribution": risk_dist,
                "exposure_distribution": exposure_dist,
                "migration_distribution": migration_dist,
                "files_scanned": files_scanned,
                "total_artefacts": len(evaluated_artefacts),
                "risk_score": risk_score,
                "potential_exposure": overall_exposure,
                "pqc_migration_effort": pqc_summary["overall_migration_effort"],
                "pqc_time_estimate": pqc_summary["overall_time_estimate"],
                "pqc_candidate_count": pqc_summary["pqc_candidate_count"],
                "highest_pqc_candidate": pqc_summary["highest_priority_candidate"]
            }

            scan_record = ScanModel(
                id=scan_id,
                project_name=project_name or "Unnamed Project",
                filename=original_filename,
                status="COMPLETED",
                files_scanned=files_scanned,
                total_artefacts=len(evaluated_artefacts),
                critical_count=risk_dist["CRITICAL"],
                high_count=risk_dist["HIGH"],
                medium_count=risk_dist["MEDIUM"],
                low_count=risk_dist["LOW"] + risk_dist["INFORMATIONAL"],
                risk_score=risk_score,
                potential_exposure=overall_exposure,
                pqc_migration_effort=pqc_summary["overall_migration_effort"],
                pqc_candidate_count=pqc_summary["pqc_candidate_count"],
                highest_pqc_candidate=pqc_summary["highest_priority_candidate"],
                summary_json=json.dumps(summary_dict)
            )

            self.db.add(scan_record)
            for art_row in evaluated_artefacts:
                self.db.add(art_row)
            self.db.commit()
            self.db.refresh(scan_record)

            # Mark scan complete
            append_scan_log(scan_id, "INFO", f"Scan completed — {files_scanned} files analyzed, {len(evaluated_artefacts)} cryptographic artefacts recorded.")
            update_scan_status(
                scan_id,
                status="completed",
                stage="completed",
                stage_index=6,
                stage_name="GENERATE REPORT",
                progress=100,
                files_analyzed=files_scanned,
                crypto_artifacts=len(evaluated_artefacts),
                findings=len(evaluated_artefacts),
                current_file="Scan completed successfully",
                current_algorithm="Ready"
            )

            return scan_record

        except Exception as e:
            update_scan_status(
                scan_id,
                status="failed",
                error=str(e),
                current_file=f"Error: {str(e)}"
            )
            raise

        finally:
            if temp_extracted_dir and os.path.exists(temp_extracted_dir):
                shutil.rmtree(temp_extracted_dir, ignore_errors=True)
