# SIMORA — Agricultural Land Marketplace

SIMORA is an English-language web application for discovering rural agricultural land, publishing properties for lease or sale, sending rental requests and purchase offers, and viewing property climate context from NASA POWER.

## Stack
- Frontend: React 18, TypeScript, Vite, Leaflet, Lucide icons
- Authentication and optional shared data: Supabase Auth + PostgreSQL (RLS)
- API: FastAPI + httpx; NASA POWER daily point endpoint
- Hosting: GitHub Pages (frontend) + Render (API) + Supabase (auth/database)

## Run locally
Requirements: Node.js 20+, Python 3.11+.

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
Open http://localhost:5173.

### API (second terminal)
```bash
cd backend
python -m venv .venv
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs. Health: http://localhost:8000/health.

## Authentication and shared data
Without Supabase environment variables, the frontend uses a device-local account mode for local preview only. It is not secure production authentication and local data is not shared across devices.

For production accounts and shared marketplace records:
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `frontend/.env.local`.
4. Enable email authentication in Supabase Auth.
5. Configure email confirmation and redirect URLs for your deployed site.

The Supabase anon key is intended for browser use when Row Level Security is correctly configured. Never expose a Supabase service-role key in frontend code.

## Deploy with GitHub
### Frontend on GitHub Pages
1. Create a GitHub repository and push this folder's contents to its `main` branch.
2. In GitHub, open **Settings → Pages** and choose **GitHub Actions** as the source.
3. Add repository Actions secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`.
4. Push to `main`. The workflow `.github/workflows/deploy-pages.yml` builds and publishes `frontend/dist`.

### API on Render
1. Create a new **Web Service** in Render connected to the same GitHub repository.
2. Set Root Directory to `backend` (or use the included `backend/render.yaml`).
3. Build command: `pip install -r requirements.txt`.
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Set `CORS_ORIGINS` to your GitHub Pages URL (comma-separated if needed).
6. Put the Render service URL into the GitHub Actions secret `VITE_API_URL` and redeploy the Pages workflow.

## Product flows
- Account creation and login (Supabase in production; device-local preview mode without Supabase).
- Publish a property with title, locality, coordinates, area, transaction type, price, terms, soil, water, access, crops and description.
- Lease enquiry with requested start/end dates; owner confirmation is required.
- Purchase offer with proposed amount; owner review and legal transfer/payment are handled outside SIMORA in this version.
- My Land page lists properties and the signed-in user's requests/offers.

## NASA data notes
The API calls NASA POWER daily point data for precipitation, air temperature, humidity, wind and solar radiation. NASA POWER values are gridded estimates at/near the requested coordinates; they are not cadastral, parcel-scale soil measurements. Property boundaries, land area, soil test results and water rights must be independently verified. The UI does not claim that NASA has measured the exact parcel.

## Important limitations
- The map pins use listing coordinates and Esri World Imagery tiles; listing sample data is illustrative until replaced by verified owner listings.
- Property imagery is loaded from Unsplash URLs; replace it with owner-authorized photos for production.
- Rental requests and purchase offers are enquiries, not legally binding contracts or payment processing.
- Supabase SQL policies are a starter schema; have them reviewed before commercial deployment. Owners' deal inbox and full transaction lifecycle are future backend features.
