from datetime import date, timedelta
from typing import Optional
import os
import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.routers.simulations import router as simulations_router, legacy_router as legacy_simulations_router
from app.routers.microclimates import router as microclimates_router
from app.routers.land_sources import router as land_sources_router
app = FastAPI(title="SIMORA API", version="1.0.0", description="Agricultural land marketplace climate context API")
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,https://simoraa.netlify.app").split(",")
app.add_middleware(CORSMiddleware, allow_origins=[x.strip() for x in origins], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(simulations_router)
app.include_router(legacy_simulations_router)
app.include_router(microclimates_router)
app.include_router(land_sources_router)

class ClimateResponse(BaseModel):
    latitude: float
    longitude: float
    start: str
    end: str
    source: str
    status: str
    units: dict
    values: dict
    note: str

@app.get("/")
def root():
    return {"name": "SIMORA API", "status": "ok", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/climate/power", response_model=ClimateResponse)
async def nasa_power(latitude: float = Query(..., ge=-90, le=90), longitude: float = Query(..., ge=-180, le=180), start: Optional[str] = None, end: Optional[str] = None):
    end_date = date.fromisoformat(end) if end else date.today() - timedelta(days=5)
    start_date = date.fromisoformat(start) if start else end_date - timedelta(days=29)
    if start_date > end_date:
        raise HTTPException(400, "start must be before end")
    params = {"parameters": "PRECTOTCORR,T2M,T2M_MAX,T2M_MIN,RH2M,ALLSKY_SFC_SW_DWN,WS2M", "community": "AG", "longitude": longitude, "latitude": latitude, "start": start_date.strftime("%Y%m%d"), "end": end_date.strftime("%Y%m%d"), "format": "JSON"}
    try:
        async with httpx.AsyncClient(timeout=35) as client:
            response = await client.get("https://power.larc.nasa.gov/api/temporal/daily/point", params=params)
            response.raise_for_status()
            data = response.json()
        properties = data.get("properties", {})
        return ClimateResponse(latitude=latitude, longitude=longitude, start=start_date.isoformat(), end=end_date.isoformat(), source="NASA POWER Daily Point API", status="live", units=properties.get("parameter", {}), values=properties.get("parameter", {}), note="NASA POWER daily gridded estimates for the selected coordinates. They are regional model/satellite-assisted products, not parcel-level soil measurements.")
    except (httpx.HTTPError, ValueError, KeyError) as exc:
        raise HTTPException(502, f"NASA POWER request failed: {str(exc)}") from exc
