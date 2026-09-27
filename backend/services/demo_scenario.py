from __future__ import annotations

from dataclasses import dataclass

from backend.models.change import ChangeDetectionResult
from backend.models.drug import DrugLabel, SourceMetadata
from backend.models.history import SignalRecord, SnapshotRecord
from backend.models.priority import PriorityResult
from backend.repositories import TigerSnapshotRepository
from backend.services.change_detector import ChangeDetector
from backend.services.priority_engine import PriorityEngine


DEMO_DRUG_KEY = "rxsignal-demo-medication"
DEMO_MEDICATION_NAME = "RxSignal Demo Medication"
DEMO_SOURCE_NAME = "RxSignal synthetic demonstration"
DEMO_SOURCE_URL = "rxsignal://synthetic-demonstration"


class DemoScenarioError(RuntimeError):
    """Raised when the reserved demo records are incomplete or untrusted."""


@dataclass(frozen=True)
class DemoSeedResult:
    created: bool
    previous_snapshot: SnapshotRecord
    current_snapshot: SnapshotRecord
    signal: SignalRecord
    comparison: ChangeDetectionResult
    priority: PriorityResult


def demo_labels() -> tuple[DrugLabel, DrugLabel]:
    source = SourceMetadata(name=DEMO_SOURCE_NAME, url=DEMO_SOURCE_URL)
    shared = {
        "generic_name": ["RxSignal fictional demonstration compound"],
        "brand_name": [DEMO_MEDICATION_NAME],
        "manufacturer": ["RxSignal demonstration data"],
        "indications_and_usage": [
            "Synthetic demonstration only. This fictional label exists solely "
            "to demonstrate the RxSignal review workflow."
        ],
        "source": source,
    }
    old_label = DrugLabel(
        **shared,
        boxed_warning=[
            "SYNTHETIC DEMONSTRATION ONLY. The fictional product should be "
            "reviewed before use with DemoCompound Alpha."
        ],
    )
    new_label = DrugLabel(
        **shared,
        boxed_warning=[
            "SYNTHETIC DEMONSTRATION ONLY. The fictional product should not be "
            "used with DemoCompound Alpha because the simulated label now "
            "describes a severe fictional reaction requiring immediate "
            "professional review. This is not an actual FDA update."
        ],
    )
    return old_label, new_label


def seed_demo_scenario(repository=None) -> DemoSeedResult:
    repository = repository or TigerSnapshotRepository()
    old_label, new_label = demo_labels()
    comparison = ChangeDetector().compare(old_label, new_label)
    if not comparison.has_changes:
        raise DemoScenarioError("The demo scenario does not contain a change.")
    priority = PriorityEngine().prioritize(comparison)

    snapshots = repository.list_snapshot_history(DEMO_DRUG_KEY)
    signals = repository.list_detected_signals(DEMO_DRUG_KEY)
    _validate_reserved_records(snapshots, signals)

    if signals:
        if len(signals) != 1:
            raise DemoScenarioError(
                "The reserved demo key contains multiple signals; no data was changed."
            )
        previous, current = _validate_existing_scenario(
            snapshots,
            signals[0],
            old_label,
            new_label,
            comparison,
            priority,
        )
        return DemoSeedResult(
            created=False,
            previous_snapshot=previous,
            current_snapshot=current,
            signal=signals[0],
            comparison=comparison,
            priority=priority,
        )

    previous = _one_matching_snapshot(snapshots, old_label, "baseline")
    current = _one_matching_snapshot(snapshots, new_label, "updated")
    known_ids = {
        snapshot.id for snapshot in (previous, current) if snapshot is not None
    }
    if any(snapshot.id not in known_ids for snapshot in snapshots):
        raise DemoScenarioError(
            "The reserved demo key contains unexpected snapshots; no data was changed."
        )

    if previous is None:
        previous = repository.save_snapshot(DEMO_DRUG_KEY, old_label)
    if current is None:
        current = repository.save_snapshot(DEMO_DRUG_KEY, new_label)

    signal = repository.save_detected_signal(
        drug_key=DEMO_DRUG_KEY,
        previous_snapshot_id=previous.id,
        current_snapshot_id=current.id,
        comparison=comparison,
        priority=priority,
    )
    return DemoSeedResult(
        created=True,
        previous_snapshot=previous,
        current_snapshot=current,
        signal=signal,
        comparison=comparison,
        priority=priority,
    )


def _validate_reserved_records(
    snapshots: list[SnapshotRecord],
    signals: list[SignalRecord],
) -> None:
    if any(snapshot.drug_key != DEMO_DRUG_KEY for snapshot in snapshots):
        raise DemoScenarioError("Unexpected snapshot returned for the demo key.")
    if any(signal.drug_key != DEMO_DRUG_KEY for signal in signals):
        raise DemoScenarioError("Unexpected signal returned for the demo key.")
    if any(
        snapshot.label.source.name != DEMO_SOURCE_NAME
        or snapshot.label.source.url != DEMO_SOURCE_URL
        for snapshot in snapshots
    ):
        raise DemoScenarioError(
            "The reserved demo key contains non-synthetic provenance; no data was changed."
        )


def _one_matching_snapshot(
    snapshots: list[SnapshotRecord],
    expected_label: DrugLabel,
    label: str,
) -> SnapshotRecord | None:
    matches = [snapshot for snapshot in snapshots if snapshot.label == expected_label]
    if len(matches) > 1:
        raise DemoScenarioError(
            f"The demo scenario contains duplicate {label} snapshots."
        )
    return matches[0] if matches else None


def _validate_existing_scenario(
    snapshots: list[SnapshotRecord],
    signal: SignalRecord,
    old_label: DrugLabel,
    new_label: DrugLabel,
    comparison: ChangeDetectionResult,
    priority: PriorityResult,
) -> tuple[SnapshotRecord, SnapshotRecord]:
    by_id = {snapshot.id: snapshot for snapshot in snapshots}
    previous = by_id.get(signal.previous_snapshot_id)
    current = by_id.get(signal.current_snapshot_id)
    if previous is None or current is None:
        raise DemoScenarioError(
            "The persisted demo signal is missing linked snapshot evidence."
        )
    if previous.label != old_label or current.label != new_label:
        raise DemoScenarioError(
            "The persisted demo evidence does not match the defined scenario."
        )
    if (
        signal.changed_fields != comparison.changed_fields
        or signal.changes != comparison.changes
        or signal.priority_score != priority.score
        or signal.priority_level != priority.priority
        or signal.priority_reasons != priority.reasons
    ):
        raise DemoScenarioError(
            "The persisted demo signal does not match deterministic pipeline output."
        )
    if len(snapshots) != 2:
        raise DemoScenarioError(
            "The reserved demo key contains unexpected snapshots; no data was changed."
        )
    return previous, current
