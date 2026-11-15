"""Land-cover and national weather-source discovery for SIMORA.

MapBiomas assets are public but parcel-level raster sampling requires Google
Earth Engine (GEE) authentication or a downloaded/hosted raster. This router
therefore exposes authoritative catalogue metadata and links, not invented
per-parcel classifications.
"""
from typing import Any
import httpx
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/land", tags=["Land history & national sources"])
SENAMHI_OAPI = "https://wis.senamhi.gob.bo/oapi"


@router.get("/sources")
def land_sources() -> dict[str, Any]:
    return {
        "mapbiomas": {
            "name": "MapBiomas Bolivia",
            "status": "public_catalogue_requires_gee_for_parcel_sampling",
            "collection": "Collection 4",
            "coverage_years": "1985-2025",
            "spatial_resolution_m": 30,
            "land_cover_classes": 29,
            "products": ["land cover and land use", "annual and monthly water surface", "burned area and fire history", "deforestation alerts"],
            "platform_url": "https://bolivia.mapbiomas.org/",
            "assets_url": "https://bolivia.mapbiomas.org/downloads/assets-en-google-earth-engine/",
            "downloads_url": "https://bolivia.mapbiomas.org/downloads/",
            "method_note": "Landsat-based annual classifications. Parcel-level statistics require intersecting the parcel geometry with the official raster asset in Google Earth Engine or a GIS workflow.",
            "measured_for_selected_parcel": False,
        },
        "senamhi": {
            "name": "SENAMHI Bolivia",
            "status": "ogc_api_discovery_available",
            "collections_url": f"{SENAMHI_OAPI}/collections?f=json",
            "service_url": SENAMHI_OAPI,
            "public_services": ["stations", "station observations (where exposed by the service)", "data notifications"],
            "measured_for_selected_parcel": False,
            "method_note": "Station observations are point measurements. A station must be selected and its distance/elevation relative to the parcel considered; station data are not automatically parcel measurements.",
        },
    }


@router.get("/senamhi/collections")
async def senamhi_collections():
    url = f"{SENAMHI_OAPI}/collections?f=json"
    try:
        async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
            response = await client.get(url, headers={"Accept": "application/json"})
            response.raise_for_status()
            payload = response.json()
        collections = payload.get("collections", []) if isinstance(payload, dict) else []
        return {
            "status": "live",
            "source": "SENAMHI WIS OGC API - Features",
            "source_url": url,
            "collections": [
                {"id": item.get("id"), "title": item.get("title"), "description": item.get("description")}
                for item in collections
            ],
            "note": "Collection discovery is live. It does not mean every collection contains public observations for every parcel or date.",
        }
    except (httpx.HTTPError, ValueError) as exc:
        return {
            "status": "unavailable",
            "source": "SENAMHI WIS OGC API - Features",
            "source_url": url,
            "collections": [],
            "note": f"SENAMHI discovery could not be retrieved right now ({type(exc).__name__}). Use the official portal link to verify availability.",
        }


@router.get("/senamhi/stations")
async def senamhi_stations(limit: int = Query(default=20, ge=1, le=100)):
    url = f"{SENAMHI_OAPI}/collections/Stations/items"
    try:
        async with httpx.AsyncClient(timeout=25, follow_redirects=True) as client:
            response = await client.get(url, params={"f": "json", "limit": limit}, headers={"Accept": "application/geo+json, application/json"})
            response.raise_for_status()
            payload = response.json()
        features = payload.get("features", []) if isinstance(payload, dict) else []
        stations = []
        for feature in features:
            props = feature.get("properties") or {}
            stations.append({
                "id": feature.get("id") or props.get("id"),
                "name": props.get("name") or props.get("station_name") or props.get("nombre") or "SENAMHI station",
                "properties": props,
                "geometry": feature.get("geometry"),
            })
        return {"status": "live", "source": "SENAMHI WIS Stations collection", "source_url": url, "count": len(stations), "stations": stations}
    except (httpx.HTTPError, ValueError) as exc:
        return {"status": "unavailable", "source": "SENAMHI WIS Stations collection", "source_url": url, "count": 0, "stations": [], "note": f"Station list unavailable ({type(exc).__name__})."}
