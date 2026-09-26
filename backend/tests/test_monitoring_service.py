from datetime import datetime, timezone

from backend.models.drug import DrugLabel
from backend.models.history import SignalRecord, SnapshotRecord
from backend.models.priority import PriorityResult
from backend.services.change_detector import ChangeDetector
from backend.services.monitoring_service import MonitoringService
from backend.services.priority_engine import PriorityEngine


class FakeFDAService:
    def __init__(self, labels: list[DrugLabel]) -> None:
        self.labels = labels
        self.calls = 0

    def get_drug_label(self, drug_name: str) -> DrugLabel:
        label = self.labels[min(self.calls, len(self.labels) - 1)]
        self.calls += 1
        return label


class FakeRepository:
    def __init__(self) -> None:
        self.snapshots: list[SnapshotRecord] = []
        self.signals: list[SignalRecord] = []

    def save_snapshot(self, drug_key: str, label: DrugLabel) -> SnapshotRecord:
        snapshot = SnapshotRecord(
            id=len(self.snapshots) + 1,
            drug_key=drug_key,
            label=label,
            captured_at=datetime.now(timezone.utc),
        )
        self.snapshots.append(snapshot)
        return snapshot

    def get_latest_snapshot(self, drug_key: str) -> SnapshotRecord | None:
        matches = [
            snapshot for snapshot in self.snapshots if snapshot.drug_key == drug_key
        ]
        return matches[-1] if matches else None

    def list_snapshot_history(self, drug_key: str) -> list[SnapshotRecord]:
        return [
            snapshot
            for snapshot in reversed(self.snapshots)
            if snapshot.drug_key == drug_key
        ]

    def save_detected_signal(
        self,
        drug_key: str,
        previous_snapshot_id: int | None,
        current_snapshot_id: int | None,
        comparison,
        priority: PriorityResult,
    ) -> SignalRecord:
        signal = SignalRecord(
            id=len(self.signals) + 1,
            drug_key=drug_key,
            previous_snapshot_id=previous_snapshot_id,
            current_snapshot_id=current_snapshot_id,
            detected_at=datetime.now(timezone.utc),
            changed_fields=comparison.changed_fields,
            changes=comparison.changes,
            priority_score=priority.score,
            priority_level=priority.priority,
            priority_reasons=priority.reasons,
        )
        self.signals.append(signal)
        return signal

    def list_detected_signals(self, drug_key: str) -> list[SignalRecord]:
        return [
            signal for signal in reversed(self.signals) if signal.drug_key == drug_key
        ]


class SpyChangeDetector(ChangeDetector):
    def __init__(self) -> None:
        self.calls = 0

    def compare(self, old: DrugLabel, new: DrugLabel):
        self.calls += 1
        return super().compare(old, new)


class SpyPriorityEngine(PriorityEngine):
    def __init__(self) -> None:
        self.calls = 0

    def prioritize(self, comparison):
        self.calls += 1
        return super().prioritize(comparison)


def make_service(
    labels: list[DrugLabel],
) -> tuple[MonitoringService, FakeRepository, SpyChangeDetector, SpyPriorityEngine]:
    repository = FakeRepository()
    detector = SpyChangeDetector()
    priority_engine = SpyPriorityEngine()
    service = MonitoringService(
        fda_service=FakeFDAService(labels),
        repository=repository,
        change_detector=detector,
        priority_engine=priority_engine,
    )
    return service, repository, detector, priority_engine


def label(**overrides: list[str]) -> DrugLabel:
    return DrugLabel(**overrides)


def test_first_monitoring_call_creates_baseline() -> None:
    service, repository, _, _ = make_service([label(warnings=["Stable."])])

    result = service.monitor_drug(" Metoprolol ")

    assert result.drug_key == "metoprolol"
    assert result.baseline_created is True
    assert result.has_changes is False
    assert len(repository.snapshots) == 1


def test_first_monitoring_call_creates_no_signal() -> None:
    service, repository, _, _ = make_service([label(warnings=["Stable."])])

    service.monitor_drug("metoprolol")

    assert repository.signals == []


def test_second_identical_label_reports_no_changes() -> None:
    service, repository, detector, priority_engine = make_service(
        [label(warnings=["Stable."])]
    )

    service.monitor_drug("metoprolol")
    result = service.monitor_drug("metoprolol")

    assert result.baseline_created is False
    assert result.has_changes is False
    assert result.message == "No monitored label changes detected"
    assert detector.calls == 1
    assert priority_engine.calls == 0
    assert len(repository.snapshots) == 1


def test_identical_label_does_not_create_duplicate_signal() -> None:
    service, repository, _, _ = make_service([label(warnings=["Stable."])])

    service.monitor_drug("metoprolol")
    service.monitor_drug("metoprolol")

    assert repository.signals == []


def test_changed_label_uses_change_detector_and_priority_engine() -> None:
    service, _, detector, priority_engine = make_service(
        [
            label(warnings=["Original warning."]),
            label(warnings=["Updated warning."]),
        ]
    )

    service.monitor_drug("metoprolol")
    result = service.monitor_drug("metoprolol")

    assert detector.calls == 1
    assert priority_engine.calls == 1
    assert result.has_changes is True
    assert result.changed_fields == ["warnings"]
    assert result.priority is not None
    assert result.priority.priority == "medium"


def test_changed_label_stores_new_snapshot_and_signal() -> None:
    service, repository, _, _ = make_service(
        [
            label(warnings=["Original warning."]),
            label(warnings=["Updated warning."]),
        ]
    )

    service.monitor_drug("metoprolol")
    result = service.monitor_drug("metoprolol")

    assert len(repository.snapshots) == 2
    assert len(repository.signals) == 1
    assert result.previous_snapshot_id == 1
    assert result.current_snapshot_id == 2
    assert result.signal_id == 1


def test_history_returns_snapshots_and_signals() -> None:
    service, _, _, _ = make_service(
        [
            label(warnings=["Original warning."]),
            label(warnings=["Updated warning."]),
        ]
    )
    service.monitor_drug("metoprolol")
    service.monitor_drug("metoprolol")

    history = service.get_history("metoprolol")

    assert history.snapshot_count == 2
    assert history.signal_count == 1
    assert [snapshot.id for snapshot in history.snapshots] == [2, 1]
    assert history.signals[0].changed_fields == ["warnings"]
