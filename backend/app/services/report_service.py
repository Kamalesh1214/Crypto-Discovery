import io
import csv
import json
from typing import List, Dict, Any
from app.models.schemas import ScanModel, ArtefactModel
from app.config import (
    DISCLAIMER_PROTOTYPE,
    DISCLAIMER_EXPOSURE,
    DISCLAIMER_MIGRATION,
    DISCLAIMER_PQC
)

class ReportService:
    @staticmethod
    def generate_json_report(scan: ScanModel, artefacts: List[ArtefactModel]) -> str:
        report_data = {
            "report_name": "CryptoLens Cryptographic Discovery & Analysis Report",
            "version": "1.0.0",
            "metadata": {
                "scan_id": scan.id,
                "project_name": scan.project_name,
                "filename": scan.filename,
                "scan_time": scan.upload_time.isoformat() if scan.upload_time else "",
                "status": scan.status,
                "files_scanned": scan.files_scanned,
                "total_artefacts": scan.total_artefacts
            },
            "executive_summary": {
                "risk_score": scan.risk_score,
                "risk_score_label": "CryptoLens Prototype Risk Score (0-100, 100=Best)",
                "critical_findings": scan.critical_count,
                "high_findings": scan.high_count,
                "medium_count": scan.medium_count,
                "low_count": scan.low_count,
                "potential_data_exposure": scan.potential_exposure,
                "pqc_migration_effort": scan.pqc_migration_effort,
                "pqc_candidates_count": scan.pqc_candidate_count,
                "highest_priority_pqc_candidate": scan.highest_pqc_candidate
            },
            "disclaimers": {
                "prototype_rules": DISCLAIMER_PROTOTYPE,
                "potential_exposure": DISCLAIMER_EXPOSURE,
                "migration_effort": DISCLAIMER_MIGRATION,
                "pqc_migration": DISCLAIMER_PQC
            },
            "inventory": []
        }

        for item in artefacts:
            report_data["inventory"].append({
                "id": item.id,
                "algorithm": item.algorithm,
                "type": item.type,
                "mode": item.mode,
                "key_size": item.key_size,
                "library": item.library,
                "file": item.file,
                "line": item.line,
                "evidence": item.evidence,
                "severity": item.severity,
                "reason": item.reason,
                "recommendation": item.recommendation,
                "quantum_risk": item.quantum_risk,
                "pqc_migration_candidate": item.pqc_migration_candidate,
                "potential_exposure": item.potential_exposure,
                "exposure_reason": item.exposure_reason,
                "exposure_factors": json.loads(item.exposure_factors or "[]"),
                "migration_effort": item.migration_effort,
                "migration_time_estimate": item.migration_time_estimate,
                "migration_reason": item.migration_reason,
                "migration_factors": json.loads(item.migration_factors or "[]")
            })

        return json.dumps(report_data, indent=2)

    @staticmethod
    def generate_csv_report(scan: ScanModel, artefacts: List[ArtefactModel]) -> str:
        output = io.StringIO()
        fieldnames = [
            "Algorithm",
            "Type",
            "Mode",
            "Key Size",
            "Library",
            "File",
            "Line",
            "Evidence",
            "Severity",
            "Reason",
            "Recommendation",
            "Quantum Risk",
            "PQC Migration Candidate",
            "Potential Exposure",
            "Exposure Reason",
            "Migration Effort",
            "Migration Time Estimate",
            "Migration Reason"
        ]

        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()

        for item in artefacts:
            writer.writerow({
                "Algorithm": item.algorithm,
                "Type": item.type,
                "Mode": item.mode,
                "Key Size": item.key_size,
                "Library": item.library,
                "File": item.file,
                "Line": item.line,
                "Evidence": item.evidence,
                "Severity": item.severity,
                "Reason": item.reason,
                "Recommendation": item.recommendation,
                "Quantum Risk": item.quantum_risk,
                "PQC Migration Candidate": item.pqc_migration_candidate,
                "Potential Exposure": item.potential_exposure,
                "Exposure Reason": item.exposure_reason,
                "Migration Effort": item.migration_effort,
                "Migration Time Estimate": item.migration_time_estimate,
                "Migration Reason": item.migration_reason
            })

        return output.getvalue()
