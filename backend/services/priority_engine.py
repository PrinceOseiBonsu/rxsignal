from backend.models.change import (
    ChangeDetectionResult,
    ChangeType,
    MonitoredField,
)
from backend.models.priority import PriorityLevel, PriorityResult


# Transparent product-prioritization heuristics, not clinically validated risk scores.
SECTION_WEIGHTS: dict[MonitoredField, int] = {
    "boxed_warning": 45,
    "warnings": 30,
    "contraindications": 30,
    "adverse_reactions": 20,
    "indications_and_usage": 10,
}

# Added and modified content receive more review attention than removed content.
CHANGE_TYPE_WEIGHTS: dict[ChangeType, int] = {
    "added": 20,
    "modified": 15,
    "removed": 10,
}

FIELD_LABELS: dict[MonitoredField, str] = {
    "boxed_warning": "Boxed warning",
    "warnings": "Warnings",
    "contraindications": "Contraindications",
    "adverse_reactions": "Adverse reactions",
    "indications_and_usage": "Indications and usage",
}

CHANGE_TYPE_REASONS: dict[ChangeType, str] = {
    "added": "New monitored label information was added",
    "modified": "Existing monitored label information was modified",
    "removed": "Monitored label information was removed",
}

CHARS_PER_MAGNITUDE_POINT = 200
MAX_MAGNITUDE_POINTS_PER_CHANGE = 5
MULTI_SECTION_POINTS = 5
MAX_MULTI_SECTION_BONUS = 10
MAX_SCORE = 100
MEDIUM_PRIORITY_THRESHOLD = 30
HIGH_PRIORITY_THRESHOLD = 60


class PriorityEngine:
    def prioritize(self, comparison: ChangeDetectionResult) -> PriorityResult:
        if not comparison.has_changes:
            return PriorityResult(
                score=0,
                priority="low",
                reasons=["No monitored label changes detected"],
            )

        score = 0
        reasons: list[str] = []
        seen_change_types: set[ChangeType] = set()
        magnitude_points = 0

        for change in comparison.changes:
            score += SECTION_WEIGHTS[change.field]
            score += CHANGE_TYPE_WEIGHTS[change.change_type]
            magnitude_points += self._magnitude_points(
                change.old_value,
                change.new_value,
            )
            reasons.append(f"{FIELD_LABELS[change.field]} changed")

            if change.change_type not in seen_change_types:
                reasons.append(CHANGE_TYPE_REASONS[change.change_type])
                seen_change_types.add(change.change_type)

        score += magnitude_points
        point_label = "point" if magnitude_points == 1 else "points"
        reasons.append(
            f"Changed text magnitude contributed {magnitude_points} {point_label}"
        )

        multi_section_bonus = self._multi_section_bonus(len(comparison.changed_fields))
        if multi_section_bonus:
            score += multi_section_bonus
            reasons.append("Multiple monitored label sections changed")

        final_score = min(score, MAX_SCORE)
        return PriorityResult(
            score=final_score,
            priority=self._priority_level(final_score),
            reasons=reasons,
        )

    @staticmethod
    def _magnitude_points(old_value: list[str], new_value: list[str]) -> int:
        character_count = max(
            len(" ".join(old_value)),
            len(" ".join(new_value)),
        )
        points = max(
            1,
            (character_count + CHARS_PER_MAGNITUDE_POINT - 1)
            // CHARS_PER_MAGNITUDE_POINT,
        )
        return min(points, MAX_MAGNITUDE_POINTS_PER_CHANGE)

    @staticmethod
    def _multi_section_bonus(changed_section_count: int) -> int:
        additional_sections = max(0, changed_section_count - 1)
        return min(
            additional_sections * MULTI_SECTION_POINTS,
            MAX_MULTI_SECTION_BONUS,
        )

    @staticmethod
    def _priority_level(score: int) -> PriorityLevel:
        if score >= HIGH_PRIORITY_THRESHOLD:
            return "high"
        if score >= MEDIUM_PRIORITY_THRESHOLD:
            return "medium"
        return "low"
