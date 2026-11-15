from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_scenario_health_route():
    response = client.get("/api/simulations/health")
    assert response.status_code == 200
    assert "/api/simulations/run" in response.json()["routes"]


def test_scenario_run_route():
    payload = {
        "event": "drought",
        "parcel_id": "p1",
        "parcel_name": "Sunrise Farm",
        "crop": "corn",
        "growth_stage": "Vegetative",
        "duration_days": 3,
        "precipitation_mm": 0,
        "crop_et_mm": 12,
    }
    response = client.post("/api/simulations/run", json=payload)
    assert response.status_code == 200
    assert response.json()["event"] == "drought"
    assert response.json()["calculation"]["estimated_change_in_soil_water_mm"] == -12


def test_legacy_scenario_route_alias():
    payload = {
        "event": "drought",
        "parcel_id": "p1",
        "duration_days": 3,
        "precipitation_mm": 0,
        "crop_et_mm": 12,
    }
    response = client.post("/api/simulaciones/ejecutar", json=payload)
    assert response.status_code == 200
