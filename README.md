# Parcel property estimates

An independent Next.js frontend for the marketanalysis API. Estimate history is stored in the current browser; no account or remote history store is used.

## Requirements

- Node.js 20.9 or newer
- npm

## Setup and run

Copy `.env.example` to `.env.local`, then set `MARKETANALYSIS_API_URL` to the running marketanalysis API. Install dependencies and start the frontend:

## before running below powershell command switch to the projetc folde "AppUiWithRouting"
```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`. Start the existing `PricePredictionModel` API and the separate `marketanalysis` API first. The Next.js Route Handler forwards estimate requests server-to-server, so browser CORS access is not required.

## Checks

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

## Views

- `/` creates a property estimate and shows recent results.
- `/history` lists or removes estimates saved in this browser.
- `/compare` compares up to five saved properties and their model estimates.

The estimates are model outputs, not independent appraisals or external market valuations.