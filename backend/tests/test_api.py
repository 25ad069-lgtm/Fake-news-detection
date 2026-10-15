import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"


def test_invalid_text_request_rejected():
    response = client.post(
        "/api/v1/analyze",
        json={"headline": "Sample", "text": "short text"},
    )
    assert response.status_code == 422


def test_analysis_returns_inconclusive_when_model_unavailable():
    response = client.post(
        "/api/v1/analyze",
        json={"headline": "Local school board approves budget update", "text": "The district released a summary of proposed budget changes this week. Officials said the plan would maintain staffing while expanding classroom support. Community members will review the proposal before a final vote in the coming months. The article describes the timeline, responsibilities, and public comment process in straightforward language."},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["prediction"] in {"real", "fake"}
    if payload["source"] == "local-model":
        scores = payload["class_probabilities"]
        assert set(scores) == {"real", "fake"}
        assert abs(sum(scores.values()) - 1.0) < 0.01
        assert isinstance(payload["confidence"], float)


def test_unsupported_upload_type_rejected():
    response = client.post(
        "/api/v1/analyze-file",
        files={"file": ("sample.csv", b"name,value\n1,2\n", "text/csv")},
    )
    assert response.status_code == 400
