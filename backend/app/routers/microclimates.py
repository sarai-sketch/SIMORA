"""Soil assumptions: user-declared texture, NOT remotely measured soil quality."""
from fastapi import APIRouter, Query
router = APIRouter(prefix="/api/microclimates", tags=["Microclimates"])

# Broad illustrative assumptions, not site-specific lab measurements.
SOILS = {
    "loamy": {"available_water_capacity_mm_per_m": 150, "infiltration_note": "Moderate; field tests required"},
    "sandy loam": {"available_water_capacity_mm_per_m": 110, "infiltration_note": "Often relatively rapid; field tests required"},
    "clay loam": {"available_water_capacity_mm_per_m": 170, "infiltration_note": "Variable, sometimes slower; field tests required"},
    "sandy": {"available_water_capacity_mm_per_m": 80, "infiltration_note": "Often rapid; field tests required"},
    "clay": {"available_water_capacity_mm_per_m": 150, "infiltration_note": "Often slow; field tests required"},
}

@router.get("/soil")
def soil_context(soil: str = Query(default="Unknown"), rooting_depth_m: float = Query(default=0.6, gt=0, le=3)):
    profile = SOILS.get(soil.strip().lower())
    return {
        "soil_texture": soil,
        "data_status": "illustrative_assumptions",
        "source": "SIMORA example texture assumptions; not NASA, laboratory, or sensor measurements",
        "measured_soil_quality": False,
        "fertility": None,
        "ph": None,
        "organic_matter_percent": None,
        "measured_soil_moisture": None,
        "assumed_rooting_depth_m": rooting_depth_m,
        "example_available_water_capacity_mm": round(profile["available_water_capacity_mm_per_m"] * rooting_depth_m, 1) if profile else None,
        "infiltration_note": profile["infiltration_note"] if profile else "Unknown; site survey required",
        "required_for_real_assessment": ["field soil texture test", "laboratory pH and organic matter", "soil water measurement", "field drainage assessment"],
        "note": "NASA POWER measures weather-related variables, not soil fertility. Example values must never be presented as measured soil quality."
    }
