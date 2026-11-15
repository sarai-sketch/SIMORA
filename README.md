# SIMORA — Agricultural Land Marketplace

### Live demo: **[https://simoraa.netlify.app](https://simoraa.netlify.app/)**

> No installation needed. Open the link, browse the map and catalog without an account, or sign in with a [demo account](#demo-accounts) to publish land, request a lease or send a purchase offer.

---

SIMORA is a **marketplace for agricultural land** with a **digital twin** of every parcel. People can find rural land to lease or buy, see where it is and what the regional climate looks like, plan a three-season crop rotation, and explore "what if…" climate scenarios before making a decision.

It is a **hackathon / demo prototype**: the full journey works end to end, but it is not meant for real payments, legal contracts or production authentication (see [Limitations](#limitations-and-data-honesty)).

## Table of contents

1. [What you can do](#what-you-can-do)
2. [Demo accounts](#demo-accounts)
3. [Where the data comes from](#where-the-data-comes-from)
4. [Climate scenarios](#climate-scenarios)
5. [Tech stack](#tech-stack)
6. [Project structure](#project-structure)
7. [Run locally](#run-locally)
8. [API reference](#api-reference)
9. [Deployment](#deployment)
10. [Project status](#project-status)
11. [Limitations and data honesty](#limitations-and-data-honesty)

## What you can do

| Area | Description |
|---|---|
| **Map & catalog** | Browse available parcels as pins on a map or as catalog cards with satellite thumbnails, size, soil type and price. Public: no login required. |
| **Digital parcel twin** | Open a parcel to see a rotatable **3D model** (scaled from the entered area) or a **satellite view** of the location. |
| **Crop rotation planner** | Choose a crop for each of three seasons (corn, potato, fava bean, quinoa, cover crop). A 0–100 indicator scores soil, water and diversity. |
| **Planting capacity** | Theoretical maximum number of planting spaces from the parcel area (1.2 m² each, before paths, slopes or irrigation). |
| **NASA climate context** | Recent temperature, precipitation and relative humidity for the parcel's coordinates, from NASA POWER. |
| **Climate scenarios** | Hypothetical drought, heavy rain, frost, heatwave, hail and El Niño / La Niña scenarios (see below). |
| **Crop assistant** | A chat that answers questions about the selected parcel using its rotation, soil description and NASA context. Rule-based, **not** generative AI. |
| **Leasing** | Pick a start date and duration; SIMORA calculates the end date and estimated total. The owner accepts or declines from **My Parcels**. |
| **Purchase offers** | Send an amount and a message; the owner accepts or declines from **My Parcels**. |
| **List Your Land** | Owners publish a property: name, community, coordinates, area, soil, lease price, purchase price, image URL and description. |

Browsing is public. Signing in is required only to **publish, lease or make an offer**.

> No payment is collected and accepting an offer does **not** transfer legal title. These are demo transaction states.

### Main user journeys

1. Explore the map and catalog (no account needed).
2. Open a parcel: inspect the digital twin, rotation, NASA data and scenarios.
3. Sign in (or create a demo account) as a **farmer** and submit a lease request or purchase offer.
4. Sign in as a **landowner**, open **My Parcels** and accept or decline incoming requests and offers.
5. As a landowner, use **List Your Land** to publish a new property.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Landowner | `owner@simora.com` | `Simora123!` |
| Farmer / tenant | `farmer@simora.com` | `Simora123!` |

You can also create a new account from the sign-in screen.

**Demo persistence:** accounts, listings, lease requests, purchase offers and crop-rotation edits are stored in the browser's `localStorage`. Data stays on the device where it was created, is not shared between users or devices, and is reset by clearing the site data. Passwords are stored unencrypted in this demo mode.

## Where the data comes from

SIMORA is explicit about what is real and what is not.

| Data | Source | Real? |
|---|---|---|
| Temperature, precipitation, relative humidity | **NASA POWER** Daily Point API (`community=AG`), requested with the parcel's coordinates | Yes. Real, but gridded regional estimates |
| Satellite imagery | **Esri World Imagery** tiles | Yes. Real imagery |
| The three included parcels (Sunrise Farm, Riverbend Field, Highland Sun Plot), their prices and owners | Hard-coded sample listings | No. Fictional |
| "Soil & Microclimate" card (pH, organic matter, N, P, K, moisture) | Fixed sample values, labelled `SAMPLE DATA` | No. Not measured |
| Scenario inputs (rain, evapotranspiration, temperatures…) | Typed by the user | User assumptions |
| Parcels published by users | Entered in the form, stored in the browser | Unverified |

**About the NASA data**

- The backend requests `PRECTOTCORR, T2M, T2M_MAX, T2M_MIN, RH2M, ALLSKY_SFC_SW_DWN, WS2M`. By default it covers the **last 30 days, ending 5 days ago** (POWER publishes with a delay).
- The parcel screen shows three values: **temperature** (mean °C), **precipitation** (mean **mm per day** over the period, not a total) and **relative humidity** (% of the *air*, not soil moisture).
- These are historical, gridded estimates for the area around the coordinates. They are **not a forecast** and **not a soil measurement**.
- If NASA POWER or the backend is unreachable, the panel says so and displays **no values** rather than inventing any.

## Climate scenarios

The **Climate scenarios** panel is a "what if?" tool, not a prediction. Every result is labelled `hypothetical` and lists its limitations.

| Scenario | What SIMORA computes | What it deliberately does not do |
|---|---|---|
| **Drought**, **Heavy rainfall** | A transparent first-order soil-water balance: `ΔS = P_effective + I − ETc − R − D`. If initial soil water and available water capacity are provided, it also returns the final storage and any excess or unmet demand. | No yield or crop-loss prediction. |
| **Frost**, **Heatwave**, **Hail**, **El Niño / La Niña** | Records the input and returns **which data would be required** for a quantitative impact (crop- and stage-specific thresholds, exposure duration, hailstone energy, official ENSO outlook…). | No loss percentages. Hail diameter alone, or air temperature alone, cannot honestly be converted into damage. |

Impact models need crop-, cultivar- and growth-stage-specific calibration reviewed by an agronomist before quantitative claims are made.

## Tech stack

**Frontend** — React 18 · TypeScript · Vite · Leaflet / react-leaflet (maps) · React Three Fiber / Three.js (3D) · Recharts · Lucide icons

**Backend** — Python 3.11+ · FastAPI · httpx · Pydantic · pytest

**External services** — NASA POWER · Esri World Imagery

**Hosting** — Netlify (live demo) · GitHub Pages (workflow included) · optional Render web service for the API

## Project structure

```
SIMORA/
├── frontend/                 React + Vite app
│   └── src/
│       ├── App.tsx           Pages: map, catalog, parcel detail, My Parcels, List Your Land
│       ├── rotation.ts       Crop data and rotation scoring
│       └── components/
│           ├── ParcelTwin3D.tsx            3D parcel model
│           ├── ClimateScenarioPanel.tsx    Scenario controls and results
│           └── SoilMicroclimateCard.tsx    Sample soil card
├── backend/                  FastAPI service
│   ├── app/main.py           App, CORS, /api/climate/power, router registration
│   ├── app/routers/simulations.py          POST /api/simulations/run
│   ├── app/simulation/scenario_engine.py   Scenario calculations
│   └── tests/                pytest suite
├── supabase/schema.sql       Optional shared-database schema (not wired in yet)
├── hardware/                 ESP32 prototypes (sensor stake, field rover)
├── docs/                     Extra documentation
└── .github/workflows/        GitHub Pages deployment
```

## Run locally

Requirements: **Node.js 20+** and **Python 3.11+**.

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

### 2. Backend (NASA climate data and scenarios)

Open a second terminal at the repository root.

**Windows (PowerShell)**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

**macOS / Linux**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: <http://localhost:8000/docs>.

The frontend reads the API address from `VITE_API_URL` (default `http://localhost:8000`). See `frontend/.env.example`.

> **Without the backend** the marketplace and all demo workflows still work. Only the NASA climate panel and the scenario calculations are unavailable, and the app says so instead of showing made-up values.

### Docker (optional)

```bash
docker compose up
```

Starts the API on port 8000 and the frontend on port 5173.

### Tests

```bash
cd backend
pytest
```

## API reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Service name and status |
| `GET` | `/health` | Health check |
| `GET` | `/api/climate/power?latitude=&longitude=&start=&end=` | NASA POWER daily data for a point. `start`/`end` are ISO dates (optional). Returns `502` if NASA is unreachable. |
| `POST` | `/api/simulations/run` | Runs a hypothetical scenario. `event` is one of `drought`, `heavy_rain`, `frost`, `heatwave`, `hail`, `enso`. |

Example:

```bash
curl -X POST http://localhost:8000/api/simulations/run \
  -H "Content-Type: application/json" \
  -d '{"event":"drought","duration_days":3,"precipitation_mm":10,"crop_et_mm":15,
       "effective_rain_fraction":0.8,"initial_soil_water_mm":40,
       "available_water_capacity_mm":100}'
```

## Deployment

### Live site (Netlify)

The public demo at **<https://simoraa.netlify.app>** is the static frontend. To deploy your own copy on Netlify:

| Setting | Value |
|---|---|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `frontend/dist` |
| Environment variable | `VITE_API_URL` = public URL of your backend (optional) |

If `VITE_API_URL` is not set, or the backend is asleep or unreachable, the climate panel and scenarios report that they are unavailable. The rest of the app is unaffected.

### Backend (Render)

Deploy `backend` as a Render Web Service:

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build command | `pip install -r requirements.txt` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Environment variable | `CORS_ORIGINS` = your frontend origin, e.g. `https://simoraa.netlify.app` |

Then set `VITE_API_URL` to the Render URL and redeploy the frontend.

### GitHub Pages (alternative)

1. Create a repository named `SIMORA` and push the contents of this folder to its root (the `.github` folder must be at the root).
2. In **Settings → Pages**, choose **GitHub Actions** as the source.
3. Push to `main`; the workflow builds `frontend` and publishes it.
4. Add a repository secret `VITE_API_URL` with the public backend URL, then push again or run the workflow manually.

## Project status

| Component | Status |
|---|---|
| Map, catalog, parcel pages | Working (sample data) |
| Accounts, listings, leases, offers | Working in demo mode (`localStorage`) |
| 3D / satellite twin, rotation planner | Working (indicative scores) |
| NASA POWER climate panel | Working when the backend is reachable |
| Climate scenarios | Water balance for drought / heavy rain; "required data" report for the other events |
| Crop assistant | Partial. Rule-based local answers only |
| Real soil data (pH, nutrients) | Not available. Sample values only |
| Shared online database (Supabase) | Partial. Schema ready, not connected |
| Field sensors (ESP32 sensor stake) | Prototype. Sends synthetic values; no receiving endpoint is active |
| Field rover | Prototype. Safe placeholder; no movement implemented |
| Other satellite sources (GPM, SMAP, SRTM, ERA5…) | Planned. Documented as future sources; nothing is downloaded |

## Limitations and data honesty

- **Not a forecast.** NASA POWER values are historical gridded estimates; scenarios are user-defined hypotheticals.
- **Not a soil measurement.** Regional rainfall and air humidity do not describe the soil of a specific parcel. A laboratory soil analysis or calibrated sensors are required.
- **Not a surveyed boundary.** The 3D field is a square of the entered area, and planting capacity needs a verified polygon and crop-specific spacing.
- **Not agronomic advice.** Rotation scores are educational indicators, not validated yield predictions. Consult an agronomist before field decisions.
- **Not a legal transaction.** No payments, contracts or title transfers take place.
- **Not production security.** `localStorage` accounts are for demonstration only and must be replaced by real authentication (for example, Supabase Auth) before real use.
- The included rural properties, owners and prices are **fictional sample listings**.
