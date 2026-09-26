from datetime import datetime, timezone

from fastapi.testclient import TestClient

from backend.main import app
from backend.models.drug import DrugLabel
from backend.models.history import HistoryResult, MonitoringResult, SnapshotRecord


client = TestClient(app)


class FakeMonitoringService:
    def monitor_drug(self, drug_name: str) -> MonitoringResult:
        return MonitoringResult(
            drug_key=drug_name.lower(),
            baseline_created=True,
            has_changes=False,
            message="Initial label snapshot stored",
            current_snapshot_id=1,
        )

    def get_history(self, drug_name: str) -> HistoryResult:
        snapshot = SnapshotRecord(
            id=1,
            drug_key=drug_name.lower(),
            label=DrugLabel(warnings=["Stable."]),
            captured_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
        )
        return HistoryResult(
            drug_key=drug_name.lower(),
            snapshot_count=1,
            signal_count=0,
            snapshot_order="newest-first",
            snapshots=[snapshot],
            signals=[],
        )


def test_monitoring_endpoint_returns_valid_structured_response(monkeypatch) -> None:
    monkeypatch.setattr("backend.main.monitoring_service", FakeMonitoringService())

    response = client.post("/api/monitor/metoprolol")

    assert response.status_code == 200
    assert response.json()["drug_key"] == "metoprolol"
    assert response.json()["baseline_created"] is True
    assert response.json()["has_changes"] is False
    assert response.json()["current_snapshot_id"] == 1


def test_history_endpoint_returns_stored_history(monkeypatch) -> None:
    monkeypatch.setattr("backend.main.monitoring_service", FakeMonitoringService())

    response = client.get("/api/history/metoprolol")

    assert response.status_code == 200
    payload = response.json()
    assert payload["drug_key"] == "metoprolol"
    assert payload["snapshot_count"] == 1
    assert payload["signal_count"] == 0
    assert payload["snapshots"][0]["label"]["warnings"] == ["Stable."]
