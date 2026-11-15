# SIMORA repair update — map, scenario API, and workspace layout

This update is based on the uploaded SIMORA source archive. It preserves the existing visual identity and marketplace flows.

## Fixes included

1. **Scenario API compatibility**
   - Canonical route: `POST /api/simulations/run`
   - Legacy alias: `POST /api/simulaciones/ejecutar`
   - Diagnostic route: `GET /api/simulations/health`
   - Both POST routes execute the same scenario engine.

2. **Leaflet map rendering**
   - Added a `MapAutoResize` helper using `invalidateSize()` and `ResizeObserver`, useful when a map is mounted in a panel or after a layout change.
   - Corrected the parcel detail Esri tile URL to `{z}/{y}/{x}`.
   - Added OpenStreetMap as a selectable fallback layer.
   - Set explicit map container sizing and native/max zoom settings.

3. **Parcel workspace layout**
   - Moved Climate Scenarios below the main two-column parcel workspace so it spans the available width.
   - Moved Soil & Microclimate and Land Data into a balanced lower section.
   - Kept the parcel twin, crop timeline, crop rotation, NASA card, and lease/purchase actions.

## Local verification

Backend (from `SIMORA/backend`):

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Open:
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/api/simulations/health`
- `http://127.0.0.1:8000/docs`

Frontend (second terminal, from `SIMORA/frontend`):

```powershell
npm ci
npm run build
npm run dev
```

## Deployment

Commit and push from the repository root:

```powershell
git add .
git commit -m "Fix parcel map, scenario routes and workspace layout"
git push origin main
```

Then deploy the latest commit on Render and Netlify.

Netlify:
- Base directory: `frontend`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://simora-pskk.onrender.com`

Render:
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set `CORS_ORIGINS=https://simoraa.netlify.app`

## Important limitations

- Esri imagery is not guaranteed to have the same detail or acquisition date at every zoom level. OpenStreetMap is a base-map fallback, not satellite imagery.
- NASA POWER is historical gridded climate context, not a parcel-scale forecast or soil measurement.
- MapBiomas parcel-level statistics still require sampling its raster products against a surveyed parcel polygon, e.g. through Google Earth Engine.
- SENAMHI station data must be spatially evaluated against parcel distance and elevation; station observations are not automatically parcel measurements.
- Scenario outputs remain hypothetical and should not be presented as crop-loss or yield predictions.
