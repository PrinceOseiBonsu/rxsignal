from fastapi.testclient import TestClient

from backend.main import app
from backend.models.intelligence import IntelligenceBrief, IntelligenceEvidence
from backend.services.intelligence_service import (
    IntelligenceConfigurationError,
    IntelligenceServiceError,
    IntelligenceValidationError,
)


client = TestClient(app)


def evidence_payload() -> dict:
    return {
        "medication_name": "metoprolol",
        "changed_fields": ["warnings"],
        "changes": [
            {
                "field": "warnings",
                "change_type": "modified",
                "old_value": ["Original warning."],
                "new_value": ["Updated warning."],
            }
        ],
        "priority_score": 46,
        "priority_level": "medium",
        "priority_reasons": [
            "Warnings changed",
            "Existing monitored label information was modified",
        ],
        "source_metadata": {
            "name": "FDA/openFDA",
            "url": "https://api.fda.gov/drug/label.json",
        },
    }


def brief() -> IntelligenceBrief:
    return IntelligenceBrief(
        what_changed="The warnings text changed.",
        why_it_may_matter="The update may warrant professional review.",
        suggested_review="Compare the supplied old and new warning text.",
        evidence_summary="RxSignal reports one modified warnings section.",
    )


class CapturingIntelligenceService:
    def __init__(self) -> None:
        self.received_evidence: IntelligenceEvidence | None = None

    def generate_brief(self, evidence: IntelligenceEvidence) -> IntelligenceBrief:
        self.received_evidence = evidence
        return brief()


class FailingIntelligenceService:
    def __init__(self, error: Exception) -> None:
        self.error = error

    def generate_brief(self, evidence: IntelligenceEvidence) -> IntelligenceBrief:
        raise self.error


def test_intelligence_endpoint_returns_http_200(monkeypatch) -> None:
    service = CapturingIntelligenceService()
    monkeypatch.setattr("backend.main.intelligence_service", service)

    response = client.post("/api/intelligence", json=evidence_payload())

    assert response.status_code == 200


def test_intelligence_response_contains_exactly_four_brief_fields(monkeypatch) -> None:
    monkeypatch.setattr(
        "backend.main.intelligence_service",
        CapturingIntelligenceService(),
    )

    response = client.post("/api/intelligence", json=evidence_payload())

    assert set(response.json()) == {
        "what_changed",
        "why_it_may_matter",
        "suggested_review",
        "evidence_summary",
    }


def test_intelligence_endpoint_rejects_invalid_request_payload(monkeypatch) -> None:
    service = CapturingIntelligenceService()
    monkeypatch.setattr("backend.main.intelligence_service", service)
    payload = evidence_payload()
    del payload["changes"]

    response = client.post("/api/intelligence", json=payload)

    assert response.status_code == 422
    assert service.received_evidence is None


def test_configuration_error_is_sanitized(monkeypatch) -> None:
    monkeypatch.setattr(
        "backend.main.intelligence_service",
        FailingIntelligenceService(
            IntelligenceConfigurationError("secret configuration detail")
        ),
    )

    response = client.post("/api/intelligence", json=evidence_payload())

    assert response.status_code == 500
    assert response.json() == {
        "detail": "Intelligence service is not configured."
    }
    assert "secret" not in response.text


def test_meta_service_error_is_sanitized(monkeypatch) -> None:
    monkeypatch.setattr(
        "backend.main.intelligence_service",
        FailingIntelligenceService(
            IntelligenceServiceError("raw upstream failure detail")
        ),
    )

    response = client.post("/api/intelligence", json=evidence_payload())

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Intelligence service is temporarily unavailable."
    }
    assert "upstream failure" not in response.text


def test_model_output_validation_error_is_sanitized(monkeypatch) -> None:
    monkeypatch.setattr(
        "backend.main.intelligence_service",
        FailingIntelligenceService(
            IntelligenceValidationError("raw model output detail")
        ),
    )

    response = client.post("/api/intelligence", json=evidence_payload())

    assert response.status_code == 502
    assert response.json() == {
        "detail": "Intelligence service returned an invalid response."
    }
    assert "model output" not in response.text


def test_endpoint_preserves_caller_supplied_deterministic_priority(monkeypatch) -> None:
    service = CapturingIntelligenceService()
    monkeypatch.setattr("backend.main.intelligence_service", service)
    payload = evidence_payload()

    response = client.post("/api/intelligence", json=payload)

    assert response.status_code == 200
    assert service.received_evidence is not None
    assert service.received_evidence.priority_score == payload["priority_score"]
    assert service.received_evidence.priority_level == payload["priority_level"]
    assert service.received_evidence.priority_reasons == payload["priority_reasons"]
