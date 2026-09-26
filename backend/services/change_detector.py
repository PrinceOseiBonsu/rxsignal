from backend.models.change import (
    ChangeDetectionResult,
    ChangeType,
    FieldChange,
    MonitoredField,
)
from backend.models.drug import DrugLabel


MONITORED_FIELDS: tuple[MonitoredField, ...] = (
    "indications_and_usage",
    "warnings",
    "boxed_warning",
    "contraindications",
    "adverse_reactions",
)


class ChangeDetector:
    def compare(self, old: DrugLabel, new: DrugLabel) -> ChangeDetectionResult:
        changes: list[FieldChange] = []

        for field in MONITORED_FIELDS:
            old_value = self._normalize_sections(getattr(old, field))
            new_value = self._normalize_sections(getattr(new, field))

            if old_value == new_value:
                continue

            changes.append(
                FieldChange(
                    field=field,
                    change_type=self._classify_change(old_value, new_value),
                    old_value=old_value,
                    new_value=new_value,
                )
            )

        return ChangeDetectionResult(
            has_changes=bool(changes),
            changed_fields=[change.field for change in changes],
            changes=changes,
        )

    @staticmethod
    def _normalize_sections(sections: list[str]) -> list[str]:
        normalized = [" ".join(section.split()) for section in sections]
        return [section for section in normalized if section]

    @staticmethod
    def _classify_change(
        old_value: list[str],
        new_value: list[str],
    ) -> ChangeType:
        if not old_value:
            return "added"
        if not new_value:
            return "removed"
        return "modified"
