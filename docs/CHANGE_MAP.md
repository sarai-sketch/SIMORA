# SIMORA change map — preserve the current UI

## 1. Files to add

| Add this file | Purpose |
|---|---|
| `backend/app/simulation/scenario_engine.py` | Scenario validation and transparent first-order calculations |
| `backend/app/routers/simulations.py` | FastAPI endpoint `POST /api/simulations/run` |
| `frontend/src/types/scenario.ts` | Shared TypeScript types |
| `frontend/src/components/ClimateScenarioPanel.tsx` | New scenario controls and results panel |
| `frontend/src/components/climate-scenarios.css` | Styles scoped to the new panel |

## 2. Files to edit minimally

### `backend/app/main.py`
Find where the existing routers are included. Add:

```python
from app.routers.simulations import router as simulations_router
app.include_router(simulations_router)
```

Keep your existing routers and middleware. Do not create a second FastAPI app.

If your project uses a different import convention, follow the existing router imports.

### `frontend/src/services/api.ts`
Your repository already has an API service for NASA POWER. Reuse its existing backend base URL. Do not create a second API base URL if one already exists.

The new component accepts `apiBaseUrl` as a prop so it can use the same Render URL.

### Existing parcel detail / parcel workspace screen
Find the component that renders the selected parcel and its current climate / crop-rotation sections. Import:

```tsx
import ClimateScenarioPanel from "./ClimateScenarioPanel";
```

Then insert it as one new section or tab, for example:

```tsx
<ClimateScenarioPanel
  apiBaseUrl={API_BASE_URL}
  parcelName={selectedParcel.name}
  crop={selectedParcel.crop ?? "maize"}
/>
```

Replace `API_BASE_URL`, `selectedParcel.name`, and `selectedParcel.crop` with the actual names already used in your project.

Do not replace the map, parcel 3D view, NASA climate card, rotation planner, profile, or header. The intended UI change is additive: one new “Climate scenarios” tab/card inside the current parcel workspace.

## 3. Files not to redesign or replace
- `frontend/src/App.tsx`
- `frontend/src/style.css`
- Current map and catalog components
- Current `Parcela3D.tsx`
- Existing crop rotation component
- Existing NASA POWER service and endpoint
- Existing marketplace / rental / purchase flows

Only edit these if a specific integration requires a small import, callback, or route addition.

## 4. Authentication behavior

Search the frontend for handlers used by:
- “List your land” / publish listing
- “Request rental” / rent
- “Make offer” / purchase offer
- “My listings” / owner management

At the start of each protected action, call the existing auth guard. Conceptual pattern:

```tsx
function requireLogin(action: () => void) {
  if (!currentUser) {
    setAuthModalOpen(true);
    return;
  }
  action();
}
```

Use your existing sign-in modal/page and current account state. Do not add a second login system.

Public actions should not call `requireLogin`:
- opening the home page
- viewing the map
- browsing the catalog
- opening public parcel details
- viewing public climate information
- opening the registration page voluntarily

For a demo, `localStorage` is acceptable if clearly labelled as demo-only. It is not production security.

## 5. Suggested user flow

Public visitor → Map / Catalog → Parcel detail → Climate / crop rotation / scenario exploration.

Only when visitor chooses Publish, Rent, Purchase offer, or Manage listing:
- if signed out: open existing sign-in / create-account UI;
- after successful sign-in: return to the action the user started;
- if signed in: continue the form.

## 6. Verification checklist

- [ ] Existing home page looks the same.
- [ ] Existing map and pins still work.
- [ ] Existing catalog cards still show their maps.
- [ ] Existing parcel digital twin still opens.
- [ ] Existing crop rotation still works.
- [ ] Existing NASA POWER panel still works.
- [ ] New scenario panel is visible inside parcel workspace.
- [ ] Scenario submission calls the Render API.
- [ ] Results clearly say “hypothetical scenario”, not forecast.
- [ ] Public browsing works without login.
- [ ] Publish / rent / purchase offer opens login when signed out.
- [ ] Signed-in demo account can complete the existing demo flow.
