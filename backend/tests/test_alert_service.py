from datetime import datetime, timezone

import pytest

from backend.models.drug import DrugLabel
from backend.models.history import SignalRecord, SnapshotRecord
from backend.services.alert_service import AlertNotFoundError, AlertService


def snapshot(snapshot_id: int, drug_key: str = "metoprolol") -> SnapshotRecord:
    return SnapshotRecord(
        id=snapshot_id,
        drug_key=drug_key,
        label=DrugLabel(
            generic_name=["metoprolol tartrate"],
            brand_name=["Lopressor"],
            warnings=["Stored warning."],
            effective_time="20260101",
        ),
        captured_at=datetime(2026, 1, snapshot_id, tzinfo=timezone.utc),
    )


def signal(signal_id: int, day: int) -> SignalRecord:
    return SignalRecord(
        id=signal_id,
        drug_key="metoprolol",
        previous_snapshot_id=1,
        current_snapshot_id=2,
        detected_at=datetime(2026, 2, day, tzinfo=timezone.utc),
        changed_fields=["warnings"],
        changes=[
            {
                "field": "warnings",
                "change_type": "modified",
                "old_value": ["Old warning."],
                "new_value": ["New warning."],
            }
        ],
        priority_score=46,
        priority_level="medium",
        priority_reasons=["Warnings changed"],
    )


class FakeAlertRepository:
    def __init__(self, signals: list[SignalRecord] | None = None) -> None:
        self.signals = signals or []
        self.snapshots = {1: snapshot(1), 2: snapshot(2)}

    def list_all_detected_signals(self) -> list[SignalRecord]:
        return self.signals

    def list_latest_snapshots(self) -> list[SnapshotRecord]:
        return [self.snapshots[2]]

    def get_detected_signal(self, signal_id: int) -> SignalRecord | None:
        return next(
            (item for item in self.signals if item.id == signal_id),
            None,
        )

    def get_snapshot_by_id(self, snapshot_id: int | None) -> SnapshotRecord | None:
        return self.snapshots.get(snapshot_id) if snapshot_id is not None else None


def test_alert_feed_is_newest_first_and_contains_persisted_evidence() -> None:
    service = AlertService(FakeAlertRepository([signal(1, 1), signal(2, 2)]))

    result = service.list_alerts()

    assert [alert.id for alert in result.alerts] == [2, 1]
    assert result.alerts[0].medication_name == "Lopressor"
    assert result.alerts[0].changes[0].old_value == ["Old warning."]
    assert result.alerts[0].priority_score == 46
    assert result.alerts[0].current_snapshot is not None
    assert result.alerts[0].current_snapshot.source.name == "FDA/openFDA"


def test_empty_signal_feed_still_lists_monitored_medications() -> None:
    result = AlertService(FakeAlertRepository()).list_alerts()

    assert result.alerts == []
    assert result.monitored_medications[0].drug_key == "metoprolol"
    assert result.updated_at == datetime(2026, 1, 2, tzinfo=timezone.utc)


def test_get_alert_returns_stable_signal_id() -> None:
    result = AlertService(FakeAlertRepository([signal(7, 2)])).get_alert(7)

    assert result.id == 7
    assert result.drug_key == "metoprolol"


def test_get_alert_raises_for_unknown_signal() -> None:
    with pytest.raises(AlertNotFoundError):
        AlertService(FakeAlertRepository()).get_alert(999)
