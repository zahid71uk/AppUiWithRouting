# Parcel property desk

An independent Next.js frontend for the Value Estimator and Market Analysis APIs. Estimate history is stored in the current browser; no account or remote history store is used.

## Requirements

- Node.js 20.9 or newer
- npm

## Setup and run

Copy `.env.example` to `.env.local`, then configure `VALUEESTIMATOR_API_URL`, `MARKET_ANALYSIS_API_URL`, and `PRICE_PREDICTION_API_URL` for the running backend services. Dataset upload is disabled by default. To expose it, set `NEXT_PUBLIC_DATASET_UPLOAD_ENABLED=true`, `DATASET_UPLOAD_ENABLED=true`, and `DATASET_UPLOAD_TOKEN` in the server environment; the token must match PricePredictionModel's upload token. Also configure the cache invalidation token identically in PricePredictionModel and Market Analysis. Install dependencies and start the frontend:

## before running below powershell command switch to the projetc folde "AppUiWithRouting"
```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`. Start `PricePredictionModel`, `valueestimator`, and `marketanalysis` first. Next.js Route Handlers forward requests server-to-server, so browser CORS access is not required.

## Docker

Build and run the frontend image from this directory after starting the backend containers on the `property-estimator` network:

```powershell
docker build -t property-desk .
docker run -d --name property-desk --network property-estimator -p 3000:3000 -e PRICE_PREDICTION_API_URL=http://price-prediction:8000 -e VALUEESTIMATOR_API_URL=http://valueestimator:8001 -e MARKET_ANALYSIS_API_URL=http://marketanalysis:8082 property-desk
```

Open `http://localhost:3000`. The `NEXT_PUBLIC_DATASET_UPLOAD_ENABLED` flag is compiled into the frontend image and defaults to `false`. To show the upload form, build with `docker build --build-arg NEXT_PUBLIC_DATASET_UPLOAD_ENABLED=true -t property-desk .`, and also pass `-e DATASET_UPLOAD_ENABLED=true -e DATASET_UPLOAD_TOKEN=$env:DATASET_UPLOAD_TOKEN` at runtime. The token must match the one configured in `PricePredictionModel`. Keep uploads disabled unless both services are configured with the same strong token. Stop the container with `docker stop property-desk` and remove it with `docker rm property-desk`.

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
- `/data-management` server-renders the active dataset and model status; its authenticated CSV upload is hidden unless explicitly enabled.

The market dataset currently contains 50 rows without dates or locations. Analysis is descriptive sample data, not a market trend, independent appraisal, or external market valuation. What-if results are model outputs, not valuations.