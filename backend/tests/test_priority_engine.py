import pytest

from backend.models.drug import DrugLabel
from backend.models.priority import PriorityResult
from backend.services.change_detector import ChangeDetector
from backend.services.priority_engine import PriorityEngine


@pytest.fixture
def detector() -> ChangeDetector:
    return ChangeDetector()


@pytest.fixture
def engine() -> PriorityEngine:
    return PriorityEngine()


def label(**overrides: list[str]) -> DrugLabel:
    return DrugLabel(**overrides)


def prioritize(
    detector: ChangeDetector,
    engine: PriorityEngine,
    old: DrugLabel,
    new: DrugLabel,
) -> PriorityResult:
    return engine.prioritize(detector.compare(old, new))


def test_no_changes_score_zero_and_low_priority(
    detector: ChangeDetector,
    engine: PriorityEngine,
) -> None:
    result = prioritize(detector, engine, label(), label())

    assert result.score == 0
    assert result.priority == "low"
    assert result.reasons == ["No monitored label changes detected"]


def test_boxed_warning_added_has_high_priority(
    detector: ChangeDetector,
    engine: PriorityEngine,
) -> None:
    result = prioritize(
        detector,
        engine,
        label(),
        label(boxed_warning=["New boxed warning text."]),
    )

    assert result.score == 66
    assert result.priority == "high"


def test_warning_modified(
    detector: ChangeDetector,
    engine: PriorityEngine,
) -> None:
    result = prioritize(
        detector,
        engine,
        label(warnings=["Original warning."]),
        label(warnings=["Updated warning."]),
    )

    assert result.score == 46
    assert result.priority == "medium"


def test_adverse_reaction_modified(
    detector: ChangeDetector,
    engine: PriorityEngine,
) -> None:
    result = prioritize(
        detector,
        engine,
        label(adverse_reactions=["Original reaction."]),
        label(adverse_reactions=["Updated reaction."]),
    )

    assert result.score == 36
    assert result.priority == "medium"


def test_indications_change_scores_less_than_boxed_warning(
    detector: ChangeDetector,
    engine: PriorityEngine,
) -> None:
    indications = prioritize(
        detector,
        engine,
        label(),
        label(indications_and_usage=["New indication."]),
    )
    boxed_warning = prioritize(
        detector,
        engine,
        label(),
        label(boxed_warning=["New boxed warning."]),
    )

    assert indications.score < boxed_warning.score


def test_multiple_sections_increase_priority(
    detector: ChangeDetector,
    engine: PriorityEngine,
) -> None:
    single = prioritize(
        detector,
        engine,
        label(),
        label(warnings=["New warning."]),
    )
    multiple = prioritize(
        detector,
        engine,
        label(),
        label(
            warnings=["New warning."],
            contraindications=["New contraindication."],
        ),
    )

    assert multiple.score > single.score
    assert "Multiple monitored label sections changed" in multiple.reasons


def test_score_never_exceeds_100(
    detector: ChangeDetector,
    engine: PriorityEngine,
) -> None:
    long_text = "x" * 2_000
    result = prioritize(
        detector,
        engine,
        label(),
        label(
            indications_and_usage=[long_text],
            warnings=[long_text],
            boxed_warning=[long_text],
            contraindications=[long_text],
            adverse_reactions=[long_text],
        ),
    )

    assert result.score == 100


def test_reasons_explain_scoring_factors(
    detector: ChangeDetector,
    engine: PriorityEngine,
) -> None:
    result = prioritize(
        detector,
        engine,
        label(),
        label(boxed_warning=["New boxed warning."]),
    )

    assert "Boxed warning changed" in result.reasons
    assert "New monitored label information was added" in result.reasons
    assert any("magnitude" in reason.lower() for reason in result.reasons)
