import sys

from backend.database import DatabaseConfigurationError
from backend.repositories import SnapshotRepositoryError
from backend.services.demo_scenario import DemoScenarioError, seed_demo_scenario


def main() -> int:
    try:
        result = seed_demo_scenario()
    except (DatabaseConfigurationError, SnapshotRepositoryError, DemoScenarioError) as exc:
        print(f"Demo scenario was not seeded: {exc}", file=sys.stderr)
        return 1

    action = "created" if result.created else "already present"
    print(f"RxSignal synthetic demonstration is {action}.")
    print(f"Signal ID: {result.signal.id}")
    print(f"Changed fields: {', '.join(result.comparison.changed_fields)}")
    print(
        "Deterministic priority: "
        f"{result.priority.score}/100 ({result.priority.priority})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
