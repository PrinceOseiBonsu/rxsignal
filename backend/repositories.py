from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

from backend.database import get_connection
from backend.models.change import ChangeDetectionResult, FieldChange, MonitoredField
from backend.models.drug import DrugLabel, SourceMetadata
from backend.models.history import SignalRecord, SnapshotRecord
from backend.models.priority import PriorityResult


class SnapshotRepositoryError(RuntimeError):
    """Raised when snapshot persistence fails."""


class TigerSnapshotRepository:
    def save_snapshot(self, drug_key: str, label: DrugLabel) -> SnapshotRecord:
        captured_at = datetime.now(timezone.utc)
        try:
            with get_connection() as connection:
                with connection.cursor(row_factory=dict_row) as cursor:
                    cursor.execute(
                        """
                        INSERT INTO label_snapshots (
                            drug_key,
                            generic_name,
                            brand_name,
                            manufacturer,
                            indications_and_usage,
                            warnings,
                            boxed_warning,
                            contraindications,
                            adverse_reactions,
                            effective_time,
                            source,
                            captured_at
                        )
                        VALUES (
                            %(drug_key)s,
                            %(generic_name)s,
                            %(brand_name)s,
                            %(manufacturer)s,
                            %(indications_and_usage)s,
                            %(warnings)s,
                            %(boxed_warning)s,
                            %(contraindications)s,
                            %(adverse_reactions)s,
                            %(effective_time)s,
                            %(source)s,
                            %(captured_at)s
                        )
                        RETURNING *
                        """,
                        {
                            "drug_key": drug_key,
                            "generic_name": Jsonb(label.generic_name),
                            "brand_name": Jsonb(label.brand_name),
                            "manufacturer": Jsonb(label.manufacturer),
                            "indications_and_usage": Jsonb(
                                label.indications_and_usage
                            ),
                            "warnings": Jsonb(label.warnings),
                            "boxed_warning": Jsonb(label.boxed_warning),
                            "contraindications": Jsonb(label.contraindications),
                            "adverse_reactions": Jsonb(label.adverse_reactions),
                            "effective_time": label.effective_time,
                            "source": Jsonb(label.source.model_dump()),
                            "captured_at": captured_at,
                        },
                    )
                    row = cursor.fetchone()
                    connection.commit()
        except Exception as exc:
            raise SnapshotRepositoryError("Unable to save label snapshot.") from exc

        return self._snapshot_from_row(row)

    def get_latest_snapshot(self, drug_key: str) -> SnapshotRecord | None:
        try:
            with get_connection() as connection:
                with connection.cursor(row_factory=dict_row) as cursor:
                    cursor.execute(
                        """
                        SELECT *
                        FROM label_snapshots
                        WHERE drug_key = %s
                        ORDER BY captured_at DESC, id DESC
                        LIMIT 1
                        """,
                        (drug_key,),
                    )
                    row = cursor.fetchone()
        except Exception as exc:
            raise SnapshotRepositoryError("Unable to load latest snapshot.") from exc

        return self._snapshot_from_row(row) if row else None

    def list_snapshot_history(self, drug_key: str) -> list[SnapshotRecord]:
        try:
            with get_connection() as connection:
                with connection.cursor(row_factory=dict_row) as cursor:
                    cursor.execute(
                        """
                        SELECT *
                        FROM label_snapshots
                        WHERE drug_key = %s
                        ORDER BY captured_at DESC, id DESC
                        """,
                        (drug_key,),
                    )
                    rows = cursor.fetchall()
        except Exception as exc:
            raise SnapshotRepositoryError("Unable to load snapshot history.") from exc

        return [self._snapshot_from_row(row) for row in rows]

    def save_detected_signal(
        self,
        drug_key: str,
        previous_snapshot_id: int | None,
        current_snapshot_id: int | None,
        comparison: ChangeDetectionResult,
        priority: PriorityResult,
    ) -> SignalRecord:
        detected_at = datetime.now(timezone.utc)
        try:
            with get_connection() as connection:
                with connection.cursor(row_factory=dict_row) as cursor:
                    cursor.execute(
                        """
                        INSERT INTO detected_signals (
                            drug_key,
                            previous_snapshot_id,
                            current_snapshot_id,
                            detected_at,
                            changed_fields,
                            changes,
                            priority_score,
                            priority_level,
                            priority_reasons
                        )
                        VALUES (
                            %(drug_key)s,
                            %(previous_snapshot_id)s,
                            %(current_snapshot_id)s,
                            %(detected_at)s,
                            %(changed_fields)s,
                            %(changes)s,
                            %(priority_score)s,
                            %(priority_level)s,
                            %(priority_reasons)s
                        )
                        RETURNING *
                        """,
                        {
                            "drug_key": drug_key,
                            "previous_snapshot_id": previous_snapshot_id,
                            "current_snapshot_id": current_snapshot_id,
                            "detected_at": detected_at,
                            "changed_fields": Jsonb(comparison.changed_fields),
                            "changes": Jsonb(
                                [
                                    change.model_dump()
                                    for change in comparison.changes
                                ]
                            ),
                            "priority_score": priority.score,
                            "priority_level": priority.priority,
                            "priority_reasons": Jsonb(priority.reasons),
                        },
                    )
                    row = cursor.fetchone()
                    connection.commit()
        except Exception as exc:
            raise SnapshotRepositoryError("Unable to save detected signal.") from exc

        return self._signal_from_row(row)

    def list_detected_signals(self, drug_key: str) -> list[SignalRecord]:
        try:
            with get_connection() as connection:
                with connection.cursor(row_factory=dict_row) as cursor:
                    cursor.execute(
                        """
                        SELECT *
                        FROM detected_signals
                        WHERE drug_key = %s
                        ORDER BY detected_at DESC, id DESC
                        """,
                        (drug_key,),
                    )
                    rows = cursor.fetchall()
        except Exception as exc:
            raise SnapshotRepositoryError("Unable to load detected signals.") from exc

        return [self._signal_from_row(row) for row in rows]

    @staticmethod
    def _snapshot_from_row(row: dict[str, Any]) -> SnapshotRecord:
        label = DrugLabel(
            generic_name=row["generic_name"],
            brand_name=row["brand_name"],
            manufacturer=row["manufacturer"],
            indications_and_usage=row["indications_and_usage"],
            warnings=row["warnings"],
            boxed_warning=row["boxed_warning"],
            contraindications=row["contraindications"],
            adverse_reactions=row["adverse_reactions"],
            effective_time=row["effective_time"],
            source=SourceMetadata(**row["source"]),
        )
        return SnapshotRecord(
            id=row["id"],
            drug_key=row["drug_key"],
            label=label,
            captured_at=row["captured_at"],
        )

    @staticmethod
    def _signal_from_row(row: dict[str, Any]) -> SignalRecord:
        return SignalRecord(
            id=row["id"],
            drug_key=row["drug_key"],
            previous_snapshot_id=row["previous_snapshot_id"],
            current_snapshot_id=row["current_snapshot_id"],
            detected_at=row["detected_at"],
            changed_fields=[
                field for field in row["changed_fields"]
            ],
            changes=[
                FieldChange(**change)
                for change in row["changes"]
            ],
            priority_score=row["priority_score"],
            priority_level=row["priority_level"],
            priority_reasons=row["priority_reasons"],
        )
