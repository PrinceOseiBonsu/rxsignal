import pytest

from backend.models.drug import DrugLabel
from backend.services.change_detector import ChangeDetector


@pytest.fixture
def detector() -> ChangeDetector:
    return ChangeDetector()


def label(**overrides: list[str]) -> DrugLabel:
    return DrugLabel(**overrides)


def test_no_changes(detector: ChangeDetector) -> None:
    old = label(warnings=["Monitor blood pressure."])
    new = label(warnings=["Monitor blood pressure."])

    result = detector.compare(old, new)

    assert result.has_changes is False
    assert result.changed_fields == []
    assert result.changes == []


def test_warning_added(detector: ChangeDetector) -> None:
    result = detector.compare(
        label(),
        label(warnings=["Monitor blood pressure."]),
    )

    assert result.changed_fields == ["warnings"]
    assert result.changes[0].change_type == "added"
    assert result.changes[0].old_value == []
    assert result.changes[0].new_value == ["Monitor blood pressure."]


def test_warning_removed(detector: ChangeDetector) -> None:
    result = detector.compare(
        label(warnings=["Monitor blood pressure."]),
        label(),
    )

    assert result.changed_fields == ["warnings"]
    assert result.changes[0].change_type == "removed"


def test_warning_modified(detector: ChangeDetector) -> None:
    result = detector.compare(
        label(warnings=["Monitor blood pressure."]),
        label(warnings=["Monitor blood pressure weekly."]),
    )

    assert result.changed_fields == ["warnings"]
    assert result.changes[0].change_type == "modified"


def test_boxed_warning_added(detector: ChangeDetector) -> None:
    result = detector.compare(
        label(),
        label(boxed_warning=["Serious risk described here."]),
    )

    assert result.changed_fields == ["boxed_warning"]
    assert result.changes[0].change_type == "added"


def test_multiple_fields_changed(detector: ChangeDetector) -> None:
    result = detector.compare(
        label(
            contraindications=["Previous contraindication."],
            adverse_reactions=["Headache."],
        ),
        label(
            indications_and_usage=["New indication."],
            adverse_reactions=["Headache and nausea."],
        ),
    )

    assert result.has_changes is True
    assert result.changed_fields == [
        "indications_and_usage",
        "contraindications",
        "adverse_reactions",
    ]
    assert [change.change_type for change in result.changes] == [
        "added",
        "removed",
        "modified",
    ]


def test_whitespace_only_differences_are_ignored(
    detector: ChangeDetector,
) -> None:
    old = label(warnings=["Monitor   blood\npressure.\tClosely."])
    new = label(warnings=["  Monitor blood pressure. Closely.  "])

    result = detector.compare(old, new)

    assert result.has_changes is False
    assert result.changed_fields == []
