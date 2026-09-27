from datetime import datetime, timezone

import pytest

from backend.models.drug import DrugLabel
from backend.models.history import SignalRecord, SnapshotRecord
from backend.services.change_detector import ChangeDetector
from backend.services.demo_scenario import (
    DEMO_DRUG_KEY,
    DEMO_MEDICATION_NAME,
    DEMO_SOURCE_NAME,
    DemoScenarioError,
    demo_labels,
    seed_demo_scenario,
)
from backend.services.priority_engine import PriorityEngine


class FakeRepository:
    def __init__(self) -> None:
        self.snapshots = [
            SnapshotRecord(
                id=1,
                drug_key="metoprolol",
                label=DrugLabel(generic_name=["metoprolol"]),
                captured_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
            ),
            SnapshotRecord(
                id=2,
                drug_key="lisinopril",
                label=DrugLabel(generic_name=["lisinopril"]),
                captured_at=datetime(2026, 1, 2, tzinfo=timezone.utc),
            ),
        ]
        self.signals: list[SignalRecord] = []

    def list_snapshot_history(self, drug_key: str) -> list[SnapshotRecord]:
        return [
            snapshot
            for snapshot in reversed(self.snapshots)
            if snapshot.drug_key == drug_key
        ]

    def list_detected_signals(self, drug_key: str) -> list[SignalRecord]:
        return [
            signal for signal in reversed(self.signals) if signal.drug_key == drug_key
        ]

    def save_snapshot(self, drug_key: str, label: DrugLabel) -> SnapshotRecord:
        snapshot = SnapshotRecord(
            id=len(self.snapshots) + 1,
            drug_key=drug_key,
            label=label,
            captured_at=datetime(2026, 2, len(self.snapshots), tzinfo=timezone.utc),
        )
        self.snapshots.append(snapshot)
        return snapshot

    def save_detected_signal(
        self,
        drug_key,
        previous_snapshot_id,
        current_snapshot_id,
        comparison,
        priority,
    ) -> SignalRecord:
        signal = SignalRecord(
            id=len(self.signals) + 1,
            drug_key=drug_key,
            previous_snapshot_id=previous_snapshot_id,
            current_snapshot_id=current_snapshot_id,
            detected_at=datetime(2026, 2, 10, tzinfo=timezone.utc),
            changed_fields=comparison.changed_fields,
            changes=comparison.changes,
            priority_score=priority.score,
            priority_level=priority.priority,
            priority_reasons=priority.reasons,
        )
        self.signals.append(signal)
        return signal


def test_seed_uses_real_deterministic_pipeline_and_synthetic_provenance() -> None:
    repository = FakeRepository()

    result = seed_demo_scenario(repository)

    old_label, new_label = demo_labels()
    comparison = ChangeDetector().compare(old_label, new_label)
    priority = PriorityEngine().prioritize(comparison)
    assert result.created is True
    assert result.comparison == comparison
    assert result.priority == priority
    assert result.signal.priority_score == priority.score
    assert result.signal.priority_reasons == priority.reasons
    assert result.comparison.changed_fields == ["boxed_warning"]
    assert result.current_snapshot.label.brand_name == [DEMO_MEDICATION_NAME]
    assert result.previous_snapshot.label.source.name == DEMO_SOURCE_NAME
    assert result.current_snapshot.label.source.name == DEMO_SOURCE_NAME


def test_seed_is_idempotent_and_leaves_real_records_untouched() -> None:
    repository = FakeRepository()
    real_records_before = [
        snapshot.model_copy(deep=True) for snapshot in repository.snapshots
    ]

    first = seed_demo_scenario(repository)
    second = seed_demo_scenario(repository)

    assert first.created is True
    assert second.created is False
    assert second.signal.id == first.signal.id
    assert len(repository.list_snapshot_history(DEMO_DRUG_KEY)) == 2
    assert len(repository.list_detected_signals(DEMO_DRUG_KEY)) == 1
    assert repository.snapshots[:2] == real_records_before


def test_seed_refuses_non_synthetic_data_under_reserved_key() -> None:
    repository = FakeRepository()
    repository.save_snapshot(
        DEMO_DRUG_KEY,
        DrugLabel(brand_name=[DEMO_MEDICATION_NAME]),
    )

    with pytest.raises(DemoScenarioError, match="non-synthetic provenance"):
        seed_demo_scenario(repository)

    assert repository.list_detected_signals(DEMO_DRUG_KEY) == []
