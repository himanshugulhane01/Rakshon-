def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "ScamShield"
    assert "/api/v1/health" in data["health"]


def test_health_check_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app_name"] == "ScamShield"
    assert data["database"] == "connected"
    assert "en" in data["supported_languages"]
    assert "hi" in data["supported_languages"]
    assert "mr" in data["supported_languages"]

