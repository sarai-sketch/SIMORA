# SIMORA — Incremental update pack

## Important: this pack is designed to PRESERVE your current interface

Your public repository README describes the current stack as:
- `frontend`: React 18 + TypeScript + Vite
- `backend`: FastAPI + Python
- NASA climate source currently connected: NASA POWER Daily Point API
- demo accounts/listings/lease requests stored in browser `localStorage`

This pack is an additive starter kit. It does not replace your existing app, CSS, map, catalog, parcel screen, or marketplace flows.

## What is included
1. A small FastAPI scenario endpoint: `POST /api/simulations/run`
2. A transparent scenario engine that reports inputs, water-balance estimates when enough soil inputs exist, and what additional calibration is required.
3. A React panel that can be inserted into the existing parcel workspace as a new tab/card.
4. A change map explaining exactly where to connect the new parts.
5. A safe authentication behavior plan: browsing remains public; login is required only for publish, rent, and purchase actions.

## Before copying files
Make a backup or create a Git branch:
`git checkout -b feature/climate-scenarios`

Do not overwrite your current `App.tsx`, `style.css`, `Parcela3D.tsx`, `api.ts`, or marketplace components.

## Integration order
1. Copy the `backend/app/simulation/scenario_engine.py` file into your existing backend.
2. Copy `backend/app/routers/simulations.py`.
3. Register the router in `backend/app/main.py` (snippet in `docs/CHANGE_MAP.md`).
4. Copy `frontend/src/types/scenario.ts`.
5. Copy `frontend/src/components/ClimateScenarioPanel.tsx` and its CSS.
6. Import the panel into your existing parcel detail/workspace screen. Add it as a new tab/section beside your current climate and crop-rotation sections. Do not replace the current layout.
7. Set the frontend API base URL to your existing Render backend URL, using the same mechanism already used by your NASA POWER panel.
8. Test locally before deploying.

## Scientific boundary
The starter engine does NOT invent crop-loss percentages or claim to forecast hail at parcel scale. It separates:
- real source observations/forecasts (must be fetched from a weather provider),
- user-defined hypothetical scenarios,
- impact calculations that require crop-specific calibration and local soil/parcel inputs.

A scenario is not a forecast. The current version provides transparent scenario setup and a first-order water-balance estimate only when the required inputs are supplied. Hail, frost, and heat injury need crop-, cultivar-, and growth-stage-specific thresholds validated by agronomic sources or experts before quantitative damage claims are enabled.

## Authentication
Your repo README currently documents demo authentication and `localStorage`. Keep that approach for the hackathon:
- Public: home, map, catalog, parcel public information, public climate view.
- Login required: create listing, request rental, send purchase offer, manage own listings/requests.
- The existing sign-in and account creation screens should remain available voluntarily from the header.
- Do not force login when opening or exploring the site.
- `localStorage` demo accounts are not secure production authentication and do not sync across devices.

## Not a full replacement ZIP
The current source code could not be fetched from GitHub in this environment. Therefore this ZIP is a safe, modular update pack based on the repository structure and README, not a rebuilt copy of your complete repository. Upload your current project ZIP here if you want exact edits merged into your actual files.
