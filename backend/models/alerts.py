from datetime import datetime

from pydantic import BaseModel

from backend.models.change import FieldChange, MonitoredField
from backend.models.drug import SourceMetadata
from backend.models.priority import PriorityLevel


class AlertSnapshotEvidence(BaseModel):
    id: int
    captured_at: datetime
    effective_time: str | None
    generic_name: list[str]
    brand_name: list[str]
    manufacturer: list[str]
    source: SourceMetadata


class AlertRecord(BaseModel):
    id: int
    drug_key: str
    medication_name: str
    detected_at: datetime
    previous_snapshot_id: int | None
    current_snapshot_id: int | None
    changed_fields: list[MonitoredField]
    changes: list[FieldChange]
    priority_score: int
    priority_level: PriorityLevel
    priority_reasons: list[str]
    previous_snapshot: AlertSnapshotEvidence | None
    current_snapshot: AlertSnapshotEvidence | None


class MonitoredMedication(BaseModel):
    drug_key: str
    medication_name: str
    generic_name: list[str]
    brand_name: list[str]
    latest_snapshot_at: datetime
    effective_time: str | None
    source: SourceMetadata


class AlertsResponse(BaseModel):
    alerts: list[AlertRecord]
    monitored_medications: list[MonitoredMedication]
    updated_at: datetime | None
