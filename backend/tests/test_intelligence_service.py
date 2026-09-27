from types import SimpleNamespace

import httpx
import pytest
from openai import APIConnectionError

from backend.models.change import FieldChange
from backend.models.intelligence import IntelligenceBrief, IntelligenceEvidence
from backend.services.intelligence_service import (
    IntelligenceConfigurationError,
    IntelligenceService,
    IntelligenceServiceError,
    IntelligenceValidationError,
)


class FakeCompletions:
    def __init__(self, content: str | None = None, error: Exception | None = None):
        self.content = content
        self.error = error
        self.calls: list[dict] = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        if self.error is not None:
            raise self.error
        message = SimpleNamespace(content=self.content)
        return SimpleNamespace(choices=[SimpleNamespace(message=message)])


class FakeClient:
    def __init__(self, completions: FakeCompletions):
        self.chat = SimpleNamespace(completions=completions)


def verified_evidence() -> IntelligenceEvidence:
    return IntelligenceEvidence(
        medication_name="metoprolol",
        changed_fields=["warnings"],
        changes=[
            FieldChange(
                field="warnings",
                change_type="modified",
                old_value=["Original warning."],
                new_value=["Updated warning."],
            )
        ],
        priority_score=46,
        priority_level="medium",
        priority_reasons=[
            "Warnings changed",
            "Existing monitored label information was modified",
        ],
        source_metadata={
            "name": "FDA/openFDA",
            "url": "https://api.fda.gov/drug/label.json",
            "effective_time": "20260101",
        },
    )


def valid_brief_json() -> str:
    return (
        '{"what_changed":"The warnings text changed.",'
        '"why_it_may_matter":"The update may warrant professional review.",'
        '"suggested_review":"Compare the supplied old and new warning text.",'
        '"evidence_summary":"RxSignal reports one modified warnings section."}'
    )


def test_valid_structured_output_is_parsed_with_all_required_fields() -> None:
    completions = FakeCompletions(content=valid_brief_json())
    service = IntelligenceService(client=FakeClient(completions))

    result = service.generate_brief(verified_evidence())

    assert isinstance(result, IntelligenceBrief)
    assert set(result.model_dump()) == {
        "what_changed",
        "why_it_may_matter",
        "suggested_review",
        "evidence_summary",
    }
    assert result.what_changed == "The warnings text changed."


@pytest.mark.parametrize(
    "content",
    [
        "not JSON",
        '```json\n{"what_changed":"Changed"}\n```',
        '{"what_changed":"Changed"}',
        (
            '{"what_changed":"Changed","why_it_may_matter":"Review",'
            '"suggested_review":"Compare","evidence_summary":"Evidence",'
            '"priority_score":99}'
        ),
    ],
)
def test_malformed_or_schema_invalid_output_is_rejected(content: str) -> None:
    service = IntelligenceService(
        client=FakeClient(FakeCompletions(content=content))
    )

    with pytest.raises(IntelligenceValidationError) as exc_info:
        service.generate_brief(verified_evidence())

    assert str(exc_info.value) == (
        "The Meta Model API returned an invalid intelligence brief."
    )


def test_missing_api_key_is_handled_cleanly(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("MODEL_API_KEY", raising=False)
    monkeypatch.setattr(
        "backend.services.intelligence_service.load_dotenv",
        lambda *args, **kwargs: False,
    )

    with pytest.raises(IntelligenceConfigurationError) as exc_info:
        IntelligenceService().generate_brief(verified_evidence())

    assert str(exc_info.value) == (
        "MODEL_API_KEY is required for the Meta Model API."
    )


def test_meta_api_failure_is_handled_cleanly() -> None:
    request = httpx.Request("POST", "https://api.meta.ai/v1/chat/completions")
    error = APIConnectionError(request=request)
    service = IntelligenceService(
        client=FakeClient(FakeCompletions(error=error))
    )

    with pytest.raises(IntelligenceServiceError) as exc_info:
        service.generate_brief(verified_evidence())

    assert str(exc_info.value) == (
        "Unable to generate an intelligence brief from the Meta Model API."
    )
    assert "api.meta.ai" not in str(exc_info.value)


def test_prompt_contains_verified_evidence_and_grounding_constraints() -> None:
    completions = FakeCompletions(content=valid_brief_json())
    service = IntelligenceService(client=FakeClient(completions))

    service.generate_brief(verified_evidence())

    call = completions.calls[0]
    system_prompt = call["messages"][0]["content"]
    evidence_prompt = call["messages"][1]["content"]
    assert call["model"] == "muse-spark-1.3"
    assert "Use only the supplied verified RxSignal evidence" in system_prompt
    assert "Do not invent FDA facts" in system_prompt
    assert "Do not diagnose" in system_prompt
    assert "Do not provide patient-specific medical advice" in system_prompt
    assert "Do not recommend starting, stopping, or changing" in system_prompt
    assert "Do not determine whether a change occurred" in system_prompt
    assert "Do not modify, reinterpret, recalculate, or replace" in system_prompt
    assert "evidence is insufficient" in system_prompt
    assert "healthcare professional" in system_prompt
    assert "distinct from AI interpretation" in system_prompt
    assert '"medication_name":"metoprolol"' in evidence_prompt
    assert '"old_value":["Original warning."]' in evidence_prompt
    assert '"new_value":["Updated warning."]' in evidence_prompt
    assert '"priority_score":46' in evidence_prompt
    assert '"priority_level":"medium"' in evidence_prompt
    assert "Warnings changed" in evidence_prompt
    assert "FDA/openFDA" in evidence_prompt


def test_service_preserves_deterministic_priority_and_does_not_return_it() -> None:
    evidence = verified_evidence()
    original_priority = (
        evidence.priority_score,
        evidence.priority_level,
        list(evidence.priority_reasons),
    )
    service = IntelligenceService(
        client=FakeClient(FakeCompletions(content=valid_brief_json()))
    )

    result = service.generate_brief(evidence)

    assert (
        evidence.priority_score,
        evidence.priority_level,
        evidence.priority_reasons,
    ) == original_priority
    assert "priority" not in result.model_dump()
