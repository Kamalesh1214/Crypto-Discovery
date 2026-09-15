import json
from datetime import datetime, timezone
from typing import List, Optional, Any, Dict
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel, ConfigDict
from app.models.db import Base

class ScanModel(Base):
    __tablename__ = "scans"

    id = Column(String(64), primary_key=True, index=True)
    project_name = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    upload_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String(32), default="COMPLETED")
    files_scanned = Column(Integer, default=0)
    total_artefacts = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    risk_score = Column(Integer, default=100)
    potential_exposure = Column(String(32), default="LOW")
    pqc_migration_effort = Column(String(32), default="NOT REQUIRED")
    pqc_candidate_count = Column(Integer, default=0)
    highest_pqc_candidate = Column(String(64), default="None")
    summary_json = Column(Text, default="{}")

    artefacts = relationship("ArtefactModel", back_populates="scan", cascade="all, delete-orphan")

    def get_summary(self) -> Dict[str, Any]:
        try:
            return json.loads(self.summary_json or "{}")
        except Exception:
            return {}

class ArtefactModel(Base):
    __tablename__ = "artefacts"

    id = Column(String(64), primary_key=True, index=True)
    scan_id = Column(String(64), ForeignKey("scans.id"), index=True)
    algorithm = Column(String(64), nullable=False)
    type = Column(String(64), default="Unknown / Not Determined")
    mode = Column(String(64), default="Unknown / Not Determined")
    key_size = Column(String(64), default="Unknown / Not Determined")
    library = Column(String(64), default="Unknown / Not Determined")
    file = Column(String(512), nullable=False)
    line = Column(Integer, default=1)
    evidence = Column(Text, default="")
    severity = Column(String(32), default="MEDIUM")
    reason = Column(Text, default="")
    recommendation = Column(Text, default="")
    quantum_risk = Column(String(32), default="UNKNOWN")
    pqc_migration_candidate = Column(String(32), default="Unknown")
    potential_exposure = Column(String(32), default="UNKNOWN")
    exposure_reason = Column(Text, default="")
    exposure_factors = Column(Text, default="[]")
    migration_effort = Column(String(32), default="UNKNOWN")
    migration_time_estimate = Column(String(64), default="Unknown")
    migration_reason = Column(Text, default="")
    migration_factors = Column(Text, default="[]")

    scan = relationship("ScanModel", back_populates="artefacts")

# Pydantic Models for Serialization
class ArtefactSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    scan_id: str
    algorithm: str
    type: str
    mode: str
    key_size: str
    library: str
    file: str
    line: int
    evidence: str
    severity: str
    reason: str
    recommendation: str
    quantum_risk: str
    pqc_migration_candidate: str
    potential_exposure: str
    exposure_reason: str
    exposure_factors: Any
    migration_effort: str
    migration_time_estimate: str
    migration_reason: str
    migration_factors: Any

class ScanSummarySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_name: str
    filename: str
    upload_time: datetime
    status: str
    files_scanned: int
    total_artefacts: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    risk_score: int
    potential_exposure: str
    pqc_migration_effort: str
    pqc_candidate_count: int
    highest_pqc_candidate: str
    summary_data: Optional[Dict[str, Any]] = None

class ScanDetailSchema(ScanSummarySchema):
    artefacts: List[ArtefactSchema] = []
