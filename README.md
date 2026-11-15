# SIMORA — Agricultural Land Marketplace

SIMORA keeps the original green agricultural marketplace layout and adds an English-language demo experience for account access, land listings, leasing and purchase offers.

## Demo mode (no database required)

The demo uses browser `localStorage` for accounts, listings, lease requests, purchase offers and crop rotation edits. Data stays in the browser where it was created and is not shared between devices. This is intended for a hackathon/demo, not production authentication or legally binding transactions.

### Test accounts

| Role | Email | Password |
|---|---|---|
| Landowner | `owner@simora.com` | `Simora123!` |
| Farmer / tenant | `farmer@simora.com` | `Simora123!` |

You can also create a new account from the sign-in screen. After signing in, **List Your Land** becomes available. The property form includes name, community, coordinates, area, soil type, lease price, purchase price, image URL and a full property description.

## Main user journeys

1. Sign in or create a demo account.
2. Explore the map and browse the land catalog.
3. Open a property and inspect its digital parcel view, crop rotation and climate context.
4. Submit a lease request by choosing a start date and duration. The calculated end date and total price are shown; the owner can accept or decline the request from **My Parcels**.
5. Submit a purchase offer with an amount and message. The owner can accept or decline it from **My Parcels**.
6. Sign in as a landowner, publish a property and review incoming requests and offers.

No payment is collected and accepting an offer does not transfer legal title. These are demo transaction states.

## Tech stack

- Frontend: React 18, TypeScript, Vite, Leaflet, React Three Fiber, Three.js and Lucide icons.
- Backend: Python, FastAPI and httpx.
- Climate source: NASA POWER Daily Point API, requested using the selected property's coordinates.
- Hosting: GitHub Pages for the frontend; optional Render service for the FastAPI backend.

## Run locally on Windows

Requirements: Node.js 20+ and Python 3.11+.

### 1. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### 2. Backend for NASA POWER

Open a second terminal at the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`.

If the backend is not running, the marketplace and demo workflows still work; the climate panel reports that NASA data is unavailable instead of inventing values.

## GitHub deployment

1. Create a GitHub repository named `SIMORA`.
2. Upload or push the contents of this folder to the repository root (the `.github` folder must be at the root).
3. In GitHub, open **Settings → Pages** and choose **GitHub Actions** as the deployment source.
4. Push to the `main` branch. The included workflow builds `frontend` and publishes it to GitHub Pages.
5. For NASA climate data on the public site, deploy `backend` as a Render Web Service and add a GitHub Actions repository secret named `VITE_API_URL` with the public backend URL. Then push again or run the workflow manually.

Render settings:
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment variable: `CORS_ORIGINS` set to your GitHub Pages origin.

## Important data notes

- The included rural properties are sample listings that can be edited or removed in the browser's local demo state.
- NASA POWER provides gridded climate estimates at/near the selected coordinates. It does not measure the exact soil conditions or cadastral boundaries of a parcel.
- The 3D field is a visual scale representation based on the entered area, not a surveyed parcel polygon. Accurate planting capacity requires a verified boundary and crop-specific spacing.
