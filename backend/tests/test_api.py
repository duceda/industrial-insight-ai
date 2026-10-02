import os
import time
import joblib
import pytest
from fastapi.testclient import TestClient

from backend.app.main import create_app


@pytest.fixture(scope="module")
def app():
    app = create_app()
    # ensure model loaded during startup
    with TestClient(app) as client:
        yield client


def test_health(app):
    r = app.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is True


def test_model_metadata(app):
    r = app.get("/model")
    assert r.status_code == 200
    body = r.json()
    assert "model_version" in body
    assert "metrics" in body


def test_predict_valid(app):
    payload = {
        "machine_id": "M-1",
        "reading": {
            "air_temperature": 300.0,
            "process_temperature": 310.0,
            "rotational_speed": 1500.0,
            "torque": 40.0,
            "tool_wear": 120.0,
        },
    }
    r = app.post("/predict", json=payload)
    assert r.status_code == 200
    j = r.json()
    assert 0.0 <= j["prob_failure"] <= 1.0
    assert j["risk_level"] in ["healthy", "warning", "critical"]
    assert "model_version" in j
    assert "feature_importances" in j
    assert len(j["feature_importances"]) == 5


def test_predict_invalid(app):
    payload = {
        "machine_id": "M-1",
        "reading": {
            "air_temperature": -999.0,
            "process_temperature": 310.0,
            "rotational_speed": 1500.0,
            "torque": 40.0,
            "tool_wear": 120.0,
        },
    }
    r = app.post("/predict", json=payload)
    assert r.status_code == 422
