from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Literal
from app.simulation.scenario_engine import run_scenario

router = APIRouter(prefix="/api/simulations", tags=["Climate simulations"])


class ScenarioRequest(BaseModel):
    event: Literal["drought", "heavy_rain", "frost", "heatwave", "hail", "enso"]
    parcel_id: Optional[str] = None
    parcel_name: Optional[str] = None
    crop: Optional[str] = None
    growth_stage: Optional[str] = None
    duration_days: float = Field(default=1, gt=0, le=365)

    precipitation_mm: Optional[float] = Field(default=None, ge=0, le=5000)
    irrigation_mm: Optional[float] = Field(default=0, ge=0, le=2000)
    crop_et_mm: Optional[float] = Field(default=None, ge=0, le=1000)
    runoff_mm: Optional[float] = Field(default=0, ge=0, le=2000)
    drainage_mm: Optional[float] = Field(default=0, ge=0, le=2000)
    effective_rain_fraction: float = Field(default=0.8, ge=0, le=1)
    initial_soil_water_mm: Optional[float] = Field(default=None, ge=0, le=2000)
    available_water_capacity_mm: Optional[float] = Field(default=None, ge=0, le=2000)

    minimum_temperature_c: Optional[float] = Field(default=None, ge=-80, le=20)
    maximum_temperature_c: Optional[float] = Field(default=None, ge=-20, le=65)
    hail_diameter_cm: Optional[float] = Field(default=None, ge=0, le=15)
    enso_phase: Optional[str] = None


@router.post("/run")
def simulate(request: ScenarioRequest):
    try:
        return run_scenario(request.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
