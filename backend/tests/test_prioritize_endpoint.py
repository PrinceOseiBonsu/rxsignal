from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_prioritize_endpoint_returns_structured_result() -> None:
    response = client.post(
        "/api/prioritize",
        json={
            "old": {},
            "new": {"boxed_warning": ["New boxed warning text."]},
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "score": 66,
        "priority": "high",
        "reasons": [
            "Boxed warning changed",
            "New monitored label information was added",
            "Changed text magnitude contributed 1 point",
        ],
    }
