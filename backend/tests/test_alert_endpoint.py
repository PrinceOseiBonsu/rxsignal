from datetime import datetime, timezone

from fastapi.testclient import TestClient

from backend.main import app
from backend.models.alerts import AlertRecord, AlertsResponse
from backend.models.drug import SourceMetadata
from backend.repositories import SnapshotRepositoryError
from backend.services.alert_service import AlertNotFoundError


client = TestClient(app)


def alert() -> AlertRecord:
    return AlertRecord(
        id=12,
        drug_key="metoprolol",
        medication_name="Lopressor",
        detected_at=datetime(2026, 2, 2, tzinfo=timezone.utc),
        previous_snapshot_id=1,
        current_snapshot_id=2,
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
        previous_snapshot=None,
        current_snapshot=None,
    )


class FakeAlertService:
    def list_alerts(self) -> AlertsResponse:
        return AlertsResponse(
            alerts=[alert()],
            monitored_medications=[],
            updated_at=datetime(2026, 2, 2, tzinfo=timezone.utc),
        )

    def get_alert(self, signal_id: int) -> AlertRecord:
        if signal_id != 12:
            raise AlertNotFoundError("Persisted signal was not found.")
        return alert()


class FailingAlertService:
    def list_alerts(self) -> AlertsResponse:
        raise SnapshotRepositoryError("Unable to load detected signals.")


def test_alert_feed_returns_persisted_signals(monkeypatch) -> None:
    monkeypatch.setattr("backend.main.alert_service", FakeAlertService())

    response = client.get("/api/alerts")

    assert response.status_code == 200
    assert response.json()["alerts"][0]["id"] == 12
    assert response.json()["alerts"][0]["priority_score"] == 46


def test_alert_detail_returns_one_signal(monkeypatch) -> None:
    monkeypatch.setattr("backend.main.alert_service", FakeAlertService())

    response = client.get("/api/alerts/12")

    assert response.status_code == 200
    assert response.json()["changed_fields"] == ["warnings"]


def test_alert_detail_returns_404_for_unknown_signal(monkeypatch) -> None:
    monkeypatch.setattr("backend.main.alert_service", FakeAlertService())

    response = client.get("/api/alerts/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Persisted signal was not found."}


def test_alert_repository_failure_is_sanitized(monkeypatch) -> None:
    monkeypatch.setattr("backend.main.alert_service", FailingAlertService())

    response = client.get("/api/alerts")

    assert response.status_code == 503
    assert response.json() == {"detail": "Unable to load detected signals."}
