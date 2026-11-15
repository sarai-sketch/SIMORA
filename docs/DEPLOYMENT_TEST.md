# Local test and deployment

## Backend
From the repository root:

```bash
cd backend
# activate your existing virtual environment
pip install -r requirements.txt
```

Register the router in `app/main.py` (see `CHANGE_MAP.md`), then:

```bash
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/docs`. Test `POST /api/simulations/run` with:

```json
{
  "event": "drought",
  "parcel_name": "Parcel North",
  "crop": "maize",
  "growth_stage": "vegetative",
  "duration_days": 3,
  "precipitation_mm": 10,
  "crop_et_mm": 15,
  "irrigation_mm": 0,
  "runoff_mm": 0,
  "drainage_mm": 0,
  "effective_rain_fraction": 0.8,
  "initial_soil_water_mm": 40,
  "available_water_capacity_mm": 100
}
```

Expected first-order result:
- Effective precipitation = 8 mm
- Estimated soil-water change = -7 mm
- Estimated final storage = 33 mm

This is only as reliable as the supplied soil-water capacity, initial storage, crop ET, runoff, drainage and effective rainfall assumptions.

## Frontend
Copy the component and CSS. Add it to the current parcel workspace without replacing the workspace. Pass the same backend base URL used by your NASA POWER request.

## Deploy
1. Commit to a feature branch and push.
2. Deploy backend to Render.
3. Confirm `POST https://YOUR-RENDER-SERVICE/api/simulations/run` works in `/docs`.
4. Confirm Render CORS allows the exact Netlify origin.
5. Deploy frontend to Netlify.
6. Test public browsing while signed out.
7. Test publish/rent/purchase actions while signed out; they should open the existing login flow.
8. Test again signed in with the demo accounts documented in your main README.
