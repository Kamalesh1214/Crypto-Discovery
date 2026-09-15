import os
import uuid
import tempfile
import json
import threading
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response, Query, BackgroundTasks
from fastapi.responses import JSONResponse, PlainTextResponse
from sqlalchemy.orm import Session

from app.models.db import get_db, SessionLocal
from app.models.schemas import (
    ScanModel,
    ArtefactModel,
    ArtefactSchema,
    ScanSummarySchema,
    ScanDetailSchema
)
from app.services.scan_service import ScanService, get_scan_status, update_scan_status, append_scan_log
from app.services.report_service import ReportService
from app.scanner.zip_extractor import ZipSecurityError

router = APIRouter(prefix="/api", tags=["Cryptographic Discovery API"])

def _run_background_scan(temp_zip_path: str, project_name: str, original_filename: str, scan_id: str):
    db = SessionLocal()
    try:
        service = ScanService(db)
        service.process_zip_archive(
            zip_path=temp_zip_path,
            project_name=project_name,
            original_filename=original_filename,
            scan_id=scan_id
        )
    except Exception as e:
        update_scan_status(scan_id, status="failed", error=str(e), current_file=f"Error: {str(e)}")
    finally:
        db.close()
        if os.path.exists(temp_zip_path):
            try:
                os.remove(temp_zip_path)
            except Exception:
                pass

@router.post("/scan")
async def upload_and_scan(
    file: UploadFile = File(...),
    project_name: Optional[str] = Form(None),
    background: bool = Query(False, description="Whether to run the scan asynchronously"),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip archive files are accepted.")

    scan_id = str(uuid.uuid4())
    proj_name = project_name or file.filename.replace(".zip", "")

    # Save uploaded file to safe temp location
    temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
    try:
        content = await file.read()
        temp_zip.write(content)
        temp_zip.close()
    except Exception as e:
        if os.path.exists(temp_zip.name):
            os.remove(temp_zip.name)
        raise HTTPException(status_code=500, detail=f"Failed to receive upload: {str(e)}")

    if background:
        # Initialize status for polling
        update_scan_status(
            scan_id,
            status="running",
            stage="upload",
            stage_index=1,
            stage_name="UPLOAD",
            progress=10,
            current_file="Validating archive structure...",
            current_algorithm="N/A"
        )
        append_scan_log(scan_id, "INFO", f"Upload received: {file.filename}")
        # Launch in background thread
        thread = threading.Thread(
            target=_run_background_scan,
            args=(temp_zip.name, proj_name, file.filename, scan_id),
            daemon=True
        )
        thread.start()

        return {
            "id": scan_id,
            "scan_id": scan_id,
            "project_name": proj_name,
            "filename": file.filename,
            "status": "running",
            "message": "Scan initiated in background"
        }

    # Synchronous mode (used by existing tests)
    try:
        service = ScanService(db)
        scan_record = service.process_zip_archive(
            zip_path=temp_zip.name,
            project_name=proj_name,
            original_filename=file.filename,
            scan_id=scan_id
        )

        resp = ScanSummarySchema.model_validate(scan_record)
        resp.summary_data = scan_record.get_summary()
        return resp

    except ZipSecurityError as ze:
        raise HTTPException(status_code=400, detail=f"Security Policy Violation: {str(ze)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan Processing Error: {str(e)}")
    finally:
        if os.path.exists(temp_zip.name):
            try:
                os.remove(temp_zip.name)
            except Exception:
                pass

@router.get("/scan/{scan_id}/status")
def get_status(scan_id: str, db: Session = Depends(get_db)):
    """
    Returns real-time scan progress, active stage, files analyzed, and detected artefacts.
    """
    mem_status = get_scan_status(scan_id)
    if mem_status:
        return mem_status

    # Check if scan exists in database (e.g. from previous run)
    scan = db.query(ScanModel).filter(ScanModel.id == scan_id).first()
    if scan:
        return {
            "scan_id": scan.id,
            "status": "completed",
            "stage": "completed",
            "stage_index": 6,
            "stage_name": "GENERATE REPORT",
            "progress": 100,
            "files_discovered": scan.files_scanned,
            "files_analyzed": scan.files_scanned,
            "supported_files": scan.files_scanned,
            "ignored_files": 0,
            "crypto_artifacts": scan.total_artefacts,
            "findings": scan.total_artefacts,
            "current_file": "Completed",
            "current_algorithm": "Complete",
            "logs": [{"timestamp": "--:--:--", "level": "INFO", "message": "Historical scan — live event log is available only while a scan is running."}],
            "error": None
        }

    raise HTTPException(status_code=404, detail="Scan ID not found.")

@router.get("/scans", response_model=List[ScanSummarySchema])
def list_scans(db: Session = Depends(get_db)):
    scans = db.query(ScanModel).order_by(ScanModel.upload_time.desc()).all()
    results = []
    for s in scans:
        item = ScanSummarySchema.model_validate(s)
        item.summary_data = s.get_summary()
        results.append(item)
    return results

@router.get("/scan/{scan_id}", response_model=ScanSummarySchema)
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(ScanModel).filter(ScanModel.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")
    resp = ScanSummarySchema.model_validate(scan)
    resp.summary_data = scan.get_summary()
    return resp

@router.get("/scan/{scan_id}/findings", response_model=List[ArtefactSchema])
def get_findings(
    scan_id: str,
    severity: Optional[str] = None,
    exposure: Optional[str] = None,
    pqc_candidate: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ArtefactModel).filter(ArtefactModel.scan_id == scan_id)
    if severity:
        query = query.filter(ArtefactModel.severity == severity.upper())
    if exposure:
        query = query.filter(ArtefactModel.potential_exposure == exposure.upper())
    if pqc_candidate:
        query = query.filter(ArtefactModel.pqc_migration_candidate == pqc_candidate)

    artefacts = query.all()
    results = []
    for a in artefacts:
        schema_obj = ArtefactSchema.model_validate(a)
        try:
            schema_obj.exposure_factors = json.loads(a.exposure_factors or "[]")
        except Exception:
            schema_obj.exposure_factors = []
        try:
            schema_obj.migration_factors = json.loads(a.migration_factors or "[]")
        except Exception:
            schema_obj.migration_factors = []
        results.append(schema_obj)

    return results

@router.get("/scan/{scan_id}/inventory", response_model=List[ArtefactSchema])
def get_inventory(scan_id: str, db: Session = Depends(get_db)):
    artefacts = db.query(ArtefactModel).filter(ArtefactModel.scan_id == scan_id).all()
    results = []
    for a in artefacts:
        schema_obj = ArtefactSchema.model_validate(a)
        try:
            schema_obj.exposure_factors = json.loads(a.exposure_factors or "[]")
        except Exception:
            schema_obj.exposure_factors = []
        try:
            schema_obj.migration_factors = json.loads(a.migration_factors or "[]")
        except Exception:
            schema_obj.migration_factors = []
        results.append(schema_obj)
    return results

@router.get("/scan/{scan_id}/report/json")
def export_json_report(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(ScanModel).filter(ScanModel.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    artefacts = db.query(ArtefactModel).filter(ArtefactModel.scan_id == scan_id).all()
    json_content = ReportService.generate_json_report(scan, artefacts)

    filename = f"CryptographicDiscovery_CBOM_{scan.project_name}_{scan.id[:8]}.json"
    return Response(
        content=json_content,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/scan/{scan_id}/report/csv")
def export_csv_report(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(ScanModel).filter(ScanModel.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    artefacts = db.query(ArtefactModel).filter(ArtefactModel.scan_id == scan_id).all()
    csv_content = ReportService.generate_csv_report(scan, artefacts)

    filename = f"CryptographicDiscovery_Audit_{scan.project_name}_{scan.id[:8]}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
