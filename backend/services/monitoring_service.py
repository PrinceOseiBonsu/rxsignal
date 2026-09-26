from backend.models.history import HistoryResult, MonitoringResult
from backend.services.change_detector import ChangeDetector
from backend.services.drug_identity import normalize_drug_key
from backend.services.fda_service import FDAService
from backend.services.priority_engine import PriorityEngine


class MonitoringService:
    def __init__(
        self,
        fda_service: FDAService,
        repository,
        change_detector: ChangeDetector,
        priority_engine: PriorityEngine,
    ) -> None:
        self.fda_service = fda_service
        self.repository = repository
        self.change_detector = change_detector
        self.priority_engine = priority_engine

    def monitor_drug(self, drug_name: str) -> MonitoringResult:
        drug_key = normalize_drug_key(drug_name)
        if not drug_key:
            return MonitoringResult(
                drug_key=drug_key,
                baseline_created=False,
                has_changes=False,
                message="Drug name is required",
            )

        current_label = self.fda_service.get_drug_label(drug_name)
        previous_snapshot = self.repository.get_latest_snapshot(drug_key)

        if previous_snapshot is None:
            current_snapshot = self.repository.save_snapshot(drug_key, current_label)
            return MonitoringResult(
                drug_key=drug_key,
                baseline_created=True,
                has_changes=False,
                message="Initial label snapshot stored",
                current_snapshot_id=current_snapshot.id,
            )

        comparison = self.change_detector.compare(
            previous_snapshot.label,
            current_label,
        )
        if not comparison.has_changes:
            return MonitoringResult(
                drug_key=drug_key,
                baseline_created=False,
                has_changes=False,
                message="No monitored label changes detected",
                previous_snapshot_id=previous_snapshot.id,
                current_snapshot_id=previous_snapshot.id,
            )

        current_snapshot = self.repository.save_snapshot(drug_key, current_label)
        priority = self.priority_engine.prioritize(comparison)
        signal = self.repository.save_detected_signal(
            drug_key=drug_key,
            previous_snapshot_id=previous_snapshot.id,
            current_snapshot_id=current_snapshot.id,
            comparison=comparison,
            priority=priority,
        )

        return MonitoringResult(
            drug_key=drug_key,
            baseline_created=False,
            has_changes=True,
            message="Monitored label changes detected",
            changed_fields=comparison.changed_fields,
            previous_snapshot_id=previous_snapshot.id,
            current_snapshot_id=current_snapshot.id,
            signal_id=signal.id,
            priority=priority,
        )

    def get_history(self, drug_name: str) -> HistoryResult:
        drug_key = normalize_drug_key(drug_name)
        snapshots = self.repository.list_snapshot_history(drug_key)
        signals = self.repository.list_detected_signals(drug_key)
        return HistoryResult(
            drug_key=drug_key,
            snapshot_count=len(snapshots),
            signal_count=len(signals),
            snapshot_order="newest-first",
            snapshots=snapshots,
            signals=signals,
        )
