from datetime import datetime

from pydantic import BaseModel, Field

from backend.models.change import FieldChange, MonitoredField
from backend.models.drug import DrugLabel
from backend.models.priority import PriorityLevel, PriorityResult


class SnapshotRecord(BaseModel):
    id: int
    drug_key: str
    label: DrugLabel
    captured_at: datetime


class SignalRecord(BaseModel):
    id: int
    drug_key: str
    previous_snapshot_id: int | None
    current_snapshot_id: int | None
    detected_at: datetime
    changed_fields: list[MonitoredField]
    changes: list[FieldChange]
    priority_score: int
    priority_level: PriorityLevel
    priority_reasons: list[str]


class MonitoringResult(BaseModel):
    drug_key: str
    baseline_created: bool
    has_changes: bool
    message: str
    changed_fields: list[MonitoredField] = Field(default_factory=list)
    previous_snapshot_id: int | None = None
    current_snapshot_id: int | None = None
    signal_id: int | None = None
    priority: PriorityResult | None = None


class HistoryResult(BaseModel):
    drug_key: str
    snapshot_count: int
    signal_count: int
    snapshot_order: str
    snapshots: list[SnapshotRecord]
    signals: list[SignalRecord]
