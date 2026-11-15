from app.simulation.scenario_engine import run_scenario


def test_water_balance_is_transparent():
    result = run_scenario({
        "event": "drought",
        "duration_days": 3,
        "precipitation_mm": 10,
        "crop_et_mm": 15,
        "irrigation_mm": 0,
        "runoff_mm": 0,
        "drainage_mm": 0,
        "effective_rain_fraction": 0.8,
        "initial_soil_water_mm": 40,
        "available_water_capacity_mm": 100
    })
    assert result["scenario_type"] == "hypothetical"
    assert result["calculation"]["effective_precipitation_mm"] == 8
    assert result["calculation"]["estimated_change_in_soil_water_mm"] == -7
    assert result["calculation"]["estimated_final_soil_water_mm"] == 33


def test_hail_does_not_invent_crop_loss():
    result = run_scenario({
        "event": "hail",
        "hail_diameter_cm": 2,
        "crop": "maize",
        "growth_stage": "vegetative"
    })
    assert result["calculation"] is None
    assert result["required_for_quantitative_impact"]
    assert not any("loss_percent" in key for key in result)
