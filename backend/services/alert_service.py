from backend.models.alerts import (
    AlertRecord,
    AlertsResponse,
    AlertSnapshotEvidence,
    MonitoredMedication,
)
from backend.models.history import SignalRecord, SnapshotRecord


class AlertNotFoundError(LookupError):
    """Raised when a persisted signal ID does not exist."""


class AlertService:
    def __init__(self, repository) -> None:
        self.repository = repository

    def list_alerts(self) -> AlertsResponse:
        signals = sorted(
            self.repository.list_all_detected_signals(),
            key=lambda signal: (signal.detected_at, signal.id),
            reverse=True,
        )
        latest_snapshots = self.repository.list_latest_snapshots()
        alerts = [self._build_alert(signal) for signal in signals]
        monitored_medications = [
            self._build_monitored_medication(snapshot)
            for snapshot in latest_snapshots
        ]
        timestamps = [signal.detected_at for signal in signals] + [
            snapshot.captured_at for snapshot in latest_snapshots
        ]
        return AlertsResponse(
            alerts=alerts,
            monitored_medications=sorted(
                monitored_medications,
                key=lambda medication: medication.medication_name.casefold(),
            ),
            updated_at=max(timestamps) if timestamps else None,
        )

    def get_alert(self, signal_id: int) -> AlertRecord:
        signal = self.repository.get_detected_signal(signal_id)
        if signal is None:
            raise AlertNotFoundError("Persisted signal was not found.")
        return self._build_alert(signal)

    def _build_alert(self, signal: SignalRecord) -> AlertRecord:
        previous_snapshot = self.repository.get_snapshot_by_id(
            signal.previous_snapshot_id
        )
        current_snapshot = self.repository.get_snapshot_by_id(
            signal.current_snapshot_id
        )
        return AlertRecord(
            id=signal.id,
            drug_key=signal.drug_key,
            medication_name=self._medication_name(
                current_snapshot,
                signal.drug_key,
            ),
            detected_at=signal.detected_at,
            previous_snapshot_id=signal.previous_snapshot_id,
            current_snapshot_id=signal.current_snapshot_id,
            changed_fields=signal.changed_fields,
            changes=signal.changes,
            priority_score=signal.priority_score,
            priority_level=signal.priority_level,
            priority_reasons=signal.priority_reasons,
            previous_snapshot=self._snapshot_evidence(previous_snapshot),
            current_snapshot=self._snapshot_evidence(current_snapshot),
        )

    @classmethod
    def _build_monitored_medication(
        cls,
        snapshot: SnapshotRecord,
    ) -> MonitoredMedication:
        return MonitoredMedication(
            drug_key=snapshot.drug_key,
            medication_name=cls._medication_name(snapshot, snapshot.drug_key),
            generic_name=snapshot.label.generic_name,
            brand_name=snapshot.label.brand_name,
            latest_snapshot_at=snapshot.captured_at,
            effective_time=snapshot.label.effective_time,
            source=snapshot.label.source,
        )

    @staticmethod
    def _medication_name(
        snapshot: SnapshotRecord | None,
        fallback: str,
    ) -> str:
        if snapshot is None:
            return fallback
        names = snapshot.label.brand_name or snapshot.label.generic_name
        return names[0] if names else fallback

    @staticmethod
    def _snapshot_evidence(
        snapshot: SnapshotRecord | None,
    ) -> AlertSnapshotEvidence | None:
        if snapshot is None:
            return None
        return AlertSnapshotEvidence(
            id=snapshot.id,
            captured_at=snapshot.captured_at,
            effective_time=snapshot.label.effective_time,
            generic_name=snapshot.label.generic_name,
            brand_name=snapshot.label.brand_name,
            manufacturer=snapshot.label.manufacturer,
            source=snapshot.label.source,
        )
