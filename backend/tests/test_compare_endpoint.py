from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_compare_endpoint_returns_structured_changes() -> None:
    response = client.post(
        "/api/compare",
        json={
            "old": {"warnings": ["Original warning."]},
            "new": {"warnings": ["Updated warning."]},
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "has_changes": True,
        "changed_fields": ["warnings"],
        "changes": [
            {
                "field": "warnings",
                "change_type": "modified",
                "old_value": ["Original warning."],
                "new_value": ["Updated warning."],
            }
        ],
    }
