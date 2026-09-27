from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from backend.models.change import FieldChange, MonitoredField
from backend.models.priority import PriorityLevel


class IntelligenceEvidence(BaseModel):
    """Verified deterministic evidence supplied to the intelligence service."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    medication_name: str = Field(min_length=1)
    changed_fields: list[MonitoredField] = Field(min_length=1)
    changes: list[FieldChange] = Field(min_length=1)
    priority_score: int = Field(ge=0, le=100)
    priority_level: PriorityLevel
    priority_reasons: list[str] = Field(min_length=1)
    source_metadata: dict[str, Any] | None = None


class IntelligenceBrief(BaseModel):
    """Grounded AI explanation of a verified RxSignal label update."""

    model_config = ConfigDict(extra="forbid")

    what_changed: str = Field(strict=True, min_length=1)
    why_it_may_matter: str = Field(strict=True, min_length=1)
    suggested_review: str = Field(strict=True, min_length=1)
    evidence_summary: str = Field(strict=True, min_length=1)
