from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


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
