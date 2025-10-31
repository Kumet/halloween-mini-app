import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

TEST_DB = Path(__file__).parent / "history_test.db"
if TEST_DB.exists():
    TEST_DB.unlink()
os.environ["HISTORY_DB_PATH"] = str(TEST_DB)

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app import history  # noqa: E402  pylint: disable=wrong-import-position
from app.main import app  # noqa: E402  pylint: disable=wrong-import-position


client = TestClient(app)


@pytest.fixture(autouse=True)
def _reset_history():
    history.clear_history()
    yield


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_trick_or_treat_seeded() -> None:
    payload = {"name": "Tester", "seed": 123}
    response = client.post("/api/trick-or-treat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["result"] in {"treat", "trick"}
    assert "message" in data
    assert "payload" in data
    # seed を指定した場合、結果が安定することを確認
    repeat = client.post("/api/trick-or-treat", json=payload).json()
    assert repeat == data


def test_story_endpoint() -> None:
    payload = {
        "mode": "gag",
        "hero_name": "Tester",
        "length": "medium",
        "seed": 7,
    }
    response = client.post("/api/story", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "gag"
    assert data["title"]
    assert isinstance(data["story"], str) and len(data["story"]) > 0


def test_metrics_endpoint() -> None:
    # 事前に少なくとも1リクエストを発行してメトリクスが生成されるようにする
    client.get("/api/health")
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "http_requests_total" in response.text


def test_history_endpoint() -> None:
    client.post("/api/trick-or-treat", json={"name": "Tester", "seed": 1})
    client.post(
        "/api/story",
        json={"mode": "kids", "hero_name": "Tester", "length": "short", "seed": 2},
    )
    response = client.get("/api/history?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert {entry["type"] for entry in data} >= {"trick", "story"}


def teardown_module(module):  # noqa: ANN001
    if TEST_DB.exists():
        TEST_DB.unlink()
