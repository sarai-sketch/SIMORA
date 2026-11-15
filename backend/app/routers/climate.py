from datetime import date, timedelta
from typing import Optional
import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/climate", tags=["climate"])

@router.get("/power")
async def nasa_power(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    start: Optional[str] = None,
    end: Optional[str] = None,
):
    """Return NASA POWER daily climate data for the selected listing coordinates."""
    end_date = date.fromisoformat(end) if end else date.today() - timedelta(days=5)
    start_date = date.fromisoformat(start) if start else end_date - timedelta(days=29)
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start must be before end")
    params = {
        "parameters": "PRECTOTCORR,T2M,T2M_MAX,T2M_MIN,RH2M,ALLSKY_SFC_SW_DWN,WS2M",
        "community": "AG",
        "longitude": longitude,
        "latitude": latitude,
        "start": start_date.strftime("%Y%m%d"),
        "end": end_date.strftime("%Y%m%d"),
        "format": "JSON",
    }
    try:
        async with httpx.AsyncClient(timeout=35) as client:
            response = await client.get(
                "https://power.larc.nasa.gov/api/temporal/daily/point", params=params
            )
            response.raise_for_status()
            payload = response.json()
        properties = payload.get("properties", {})
        return {
            "latitude": latitude,
            "longitude": longitude,
            "start": start_date.isoformat(),
            "end": end_date.isoformat(),
            "source": "NASA POWER Daily Point API",
            "status": "live",
            "units": properties.get("parameter", {}),
            "values": properties.get("parameter", {}),
            "note": (
                "NASA POWER gridded climate estimates for the selected coordinates. "
                "These are not direct parcel-level soil measurements."
            ),
        }
    except (httpx.HTTPError, ValueError, KeyError) as exc:
        raise HTTPException(status_code=502, detail=f"NASA POWER request failed: {exc}") from exc
