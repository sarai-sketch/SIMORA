# SIMORA — Windows, GitHub, Render and Netlify deployment

## What changed
- Preserved existing map, catalog, parcel twin, rotation planner, and marketplace styling.
- Added `Microclimates · Soil context` card with **illustrative soil assumptions**, not invented NASA soil measurements.
- Connected `Climate scenarios` panel to each parcel, with six user-defined what-if events.
- NASA POWER historical data is queried for the selected parcel and displayed as a climate baseline inside the simulator.
- Added event-specific adaptation options. No invented crop-loss percentages or claims that the event will occur.
- Map, catalog and parcel analysis are public. Publishing, leasing and purchase offers require signing in. Existing test accounts remain.
- Added root `netlify.toml` and removed a duplicate GitHub Pages workflow.

## STEP 1 — Back up the current project
In Windows File Explorer, copy your existing SIMORA folder to `SIMORA-backup`.

## STEP 2 — Replace your local project files
Extract this ZIP. Open the extracted `SIMORA-main` folder in Visual Studio Code.
Do not extract the ZIP inside the existing repo and accidentally create a nested `SIMORA-main/SIMORA-main` folder.
If you are using an existing Git clone, copy the contents of this extracted folder into the *root of the clone*, keeping its `.git` folder. Do not copy a new `.git` folder.

## STEP 3 — Test backend locally
Open Terminal > New Terminal in VS Code at the repo root.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

If PowerShell refuses to activate the virtual environment, use Command Prompt and `.venv\Scripts\activate.bat` instead.

Visit `http://127.0.0.1:8000/docs`. You should see:
- `GET /api/climate/power`
- `GET /api/microclimates/soil`
- `POST /api/simulations/run`

To test soil: `/api/microclimates/soil?soil=Loamy`.
To test scenarios, expand POST `/api/simulations/run` > Try it out and send:

```json
{"event":"drought","parcel_name":"Sunrise Farm","crop":"corn","duration_days":3,"precipitation_mm":10,"crop_et_mm":15}
```

## STEP 4 — Test frontend locally
Open a **second** VS Code terminal in the repo root:

```powershell
cd frontend
npm ci
```

Create `frontend/.env.local` with this single line:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Then run:

```powershell
npm run dev
```

Open `http://localhost:5173`. Explore the map without signing in, select a parcel, scroll to `Microclimates · Soil context` and `Climate scenarios`, then test the simulator.

## STEP 5 — Push changes to your EXISTING GitHub repository
From the **repo root** in VS Code terminal:

```powershell
git status
git add .
git commit -m "Connect SIMORA microclimates and climate simulations"
git push origin main
```

If `git status` says "not a git repository", you opened the extracted ZIP instead of your existing Git clone. Open your original clone and copy the extracted files into it, preserving its `.git` directory.
If `git push` is rejected, do not force push; first check whether another teammate pushed changes.

Open `https://github.com/sarai-sketch/SIMORA` and confirm the latest commit appears in `main`. If it does not, Render and Netlify cannot receive the changes.

## STEP 6 — Deploy backend on Render
1. Go to `https://dashboard.render.com/` > your `simora-pskk` service.
2. Settings: verify Repository `sarai-sketch/SIMORA`, Branch `main`, Root Directory `backend`.
3. Build Command: `pip install -r requirements.txt`.
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Environment: `PYTHON_VERSION=3.12.7` and `CORS_ORIGINS=https://simoraa.netlify.app,http://localhost:5173,http://127.0.0.1:5173`.
6. Manual Deploy > Deploy latest commit if automatic deployment did not start.
7. Wait for status Live. Visit `https://simora-pskk.onrender.com/docs` and confirm `GET /api/microclimates/soil` exists.

If the new endpoint is missing, Render is still running an old commit or the wrong root directory.

## STEP 7 — Deploy frontend on Netlify
1. Go to `https://app.netlify.com/` > site `simoraa` > Site configuration / Build & deploy.
2. Confirm linked GitHub repository `sarai-sketch/SIMORA` and branch `main`.
3. If Netlify reads the root `netlify.toml`, its base is `frontend`, build command `npm ci && npm run build`, publish directory `dist` relative to base.
4. Environment variables: set `VITE_API_URL=https://simora-pskk.onrender.com` (NO trailing slash; NO `/docs`).
5. Trigger deploy > Deploy site / Clear cache and deploy site if needed.
6. Open Deploys and inspect the commit SHA. It must match the new GitHub commit.
7. When Published, visit `https://simoraa.netlify.app/` and press `Ctrl + Shift + R`.

**Important:** Vite embeds `VITE_API_URL` at build time. Changing it in Netlify requires a fresh frontend build.

## STEP 8 — Verify in browser
1. Open the public site in a private/incognito window. The map should open without login.
2. Open a parcel > scroll to `Microclimates · Soil context` and `Climate scenarios`.
3. In Chrome F12 > Network > Fetch/XHR, check `GET /api/climate/power`, `GET /api/microclimates/soil`, and `POST /api/simulations/run`.
4. These requests should go to `https://simora-pskk.onrender.com`, not localhost.
5. If they show CORS errors, recheck `CORS_ORIGINS` on Render and redeploy backend.
6. Click Request to lease or Make a purchase offer while signed out: the sign-in screen should appear.
7. Sign in with `farmer@simora.com` / `Simora123!` and try again.
8. To publish, sign in with `owner@simora.com` / `Simora123!`.

## Important limitations
- Soil values are explicitly illustrative, based on declared texture. Real soil quality needs laboratory or field data.
- NASA POWER supplies historical gridded climate context. It does not predict parcel-level hail, frost, or ENSO impacts.
- Scenarios are user-defined and do not claim validated yield losses.
- The demo's users, listings and requests are stored in browser localStorage. They do not sync between users or devices and are not secure production authentication.
- An existing browser may have old localStorage parcel data; test in incognito to see the default sample listings.
