from typing import Literal

from pydantic import BaseModel

from .drug import DrugLabel


MonitoredField = Literal[
    "indications_and_usage",
    "warnings",
    "boxed_warning",
    "contraindications",
    "adverse_reactions",
]
ChangeType = Literal["added", "removed", "modified"]


class FieldChange(BaseModel):
    field: MonitoredField
    change_type: ChangeType
    old_value: list[str]
    new_value: list[str]


class ChangeDetectionResult(BaseModel):
    has_changes: bool
    changed_fields: list[MonitoredField]
    changes: list[FieldChange]


class ChangeComparisonRequest(BaseModel):
    old: DrugLabel
    new: DrugLabel
