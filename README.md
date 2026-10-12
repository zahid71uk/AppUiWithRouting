# Parcel property desk

An independent Next.js frontend for the Value Estimator and Market Analysis APIs. Estimate history is stored in the current browser; no account or remote history store is used.

## Requirements

- Node.js 20.9 or newer
- npm

## Setup and run

Copy `.env.example` to `.env.local`, then configure `VALUEESTIMATOR_API_URL` and `MARKET_ANALYSIS_API_URL` for the running backend services. Install dependencies and start the frontend:

## before running below powershell command switch to the projetc folde "AppUiWithRouting"
```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`. Start `PricePredictionModel`, `valueestimator`, and `marketanalysis` first. Next.js Route Handlers forward requests server-to-server, so browser CORS access is not required.

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
- `/market-analysis` filters and visualizes descriptive statistics from the supplied housing sample, supports a model what-if estimate, and exports filtered rows as CSV or a print-ready PDF.

The market dataset currently contains 50 rows without dates or locations. Analysis is descriptive sample data, not a market trend, independent appraisal, or external market valuation. What-if results are model outputs, not valuations.