# SIMORA deployment checklist

## 1. Create the GitHub repository
- Create a repository named `simora` (or another name you choose).
- Upload the contents of this folder to the repository root. The `.github` directory must be included.
- Commit to the `main` branch.

## 2. Deploy the API on Render
GitHub Pages only hosts static frontend files. The FastAPI service must run separately.
- In Render, create a Web Service connected to this GitHub repository.
- Root Directory: `backend`.
- Build: `pip install -r requirements.txt`.
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Add `CORS_ORIGINS` with the exact Pages URL, e.g. `https://YOUR-USER.github.io` or `https://YOUR-USER.github.io/simora`.
- Copy the Render URL, e.g. `https://simora-api.onrender.com`.

## 3. Configure Supabase
- Create a Supabase project.
- Run `supabase/schema.sql` in SQL Editor.
- In Authentication → URL Configuration, add your GitHub Pages URL to Site URL and Redirect URLs.
- Copy Project URL and anon/public key. Never use the service-role key in browser code.

## 4. Configure GitHub Actions secrets
Repository → Settings → Secrets and variables → Actions → New repository secret:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (Render API URL)

## 5. Enable GitHub Pages
- Repository → Settings → Pages.
- Source: GitHub Actions.
- Push to `main` or run Actions → Deploy SIMORA frontend to GitHub Pages → Run workflow.

## 6. Check deployment
- Open the Pages URL shown in Settings → Pages.
- Test signup/login, listing publication, property detail, rental date request, purchase offer, and NASA POWER climate panel.
- If NASA panel says it cannot connect, check `VITE_API_URL`, Render health at `/health`, and `CORS_ORIGINS`.

## Current product boundaries
The app supports account sign-in/sign-up with Supabase, listing form, lease request and purchase offer submission. A request/offer is not a signed contract. SIMORA does not process deposits, escrow, title transfer, legal due diligence or payments. Those require a verified owner, legal documents, payment provider and jurisdiction-specific contracts. Sample properties in the code are starter content and must be replaced by owner-authorized listings before public launch.
