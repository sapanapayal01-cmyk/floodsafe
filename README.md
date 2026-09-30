# FLOODSAFE — AI & GIS Based Flood Risk Mapping and Early Warning System

FLOODSAFE is a web-based prototype for demonstrating how GIS, flood-related spatial factors and a machine-learning workflow can be combined to assess flood susceptibility and communicate location-based risk information to communities.

## Project idea

**Predict. Prepare. Protect.**

The prototype is designed as a **region-ready platform**, not a single-district flood application. A pilot study area can be used for demonstration, while the system architecture is intended to accept verified local GIS/flood-inventory data for other flood-prone regions.

## Review 1 methodology

The proposed ML workflow uses:

**Input data → Preprocessing → RFE (Recursive Feature Elimination) → GBM (Gradient Boosting Machine) → Flood Susceptibility → GIS visualization → Community guidance**

The current interface is a demonstration prototype. Any displayed risk values in the prototype are labelled as demo/representative values and must not be treated as live emergency warnings or validated model outputs.

## Repository structure

```text
FLOODSAFE_GitHub_Ready/
├── index.html                         # Main single-page prototype
├── style.css                          # UI and responsive styling
├── app.js                             # Navigation, map interactions, risk demo logic
├── assets/
│   └── FLOODSAFE_offline_world_map.svg # Local fallback map asset
├── docs/
│   └── PROJECT_OVERVIEW.md            # Architecture, methodology and demo notes
├── .gitignore
├── LICENSE
└── README.md
```

## Run locally

No Python package installation is required for the current frontend prototype.

### Option 1 — Open directly

Open `index.html` in a modern browser.

### Option 2 — Use a local server (recommended)

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

A local server is recommended because browsers can apply restrictions to local files when external web resources are used.

## GitHub Pages

1. Create a GitHub repository.
2. Upload all files while preserving the folder structure.
3. Go to **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`.
6. Save and open the generated Pages URL.

## Main prototype features

- Interactive FLOODSAFE dashboard
- Region/state selection
- Place search and location selection
- Interactive map and location inspection
- Location risk check
- Surrounding-risk view
- RFE + GBM methodology explanation
- Dataset and feature information
- Community-focused risk guidance
- Team page
- Local map fallback for situations where an online basemap is unavailable

## Important implementation note

The online basemap is an external dependency. The project also contains a local SVG fallback so the prototype remains presentable if the online map service is unavailable. The fallback is schematic and should not be presented as a precise street-level GIS layer.

## Moving from prototype to real ML system

For a production/research implementation, replace the demo risk logic in `app.js` with a trained model/API and verified spatial datasets. A typical backend could expose an endpoint such as:

```text
POST /api/risk
```

with location/features as input and validated model outputs as the response.

Suggested production data pipeline:

```text
Satellite / DEM / Rainfall / River / LULC / Historical flood inventory
                         ↓
                  Preprocessing
                         ↓
                         RFE
                         ↓
                        GBM
                         ↓
              Susceptibility prediction
                         ↓
                    GIS layer
                         ↓
              Community risk guidance
```

## Team

Sapana  
Sachin Gurjar  
Vashu Dev  
Sathwik Reddy

## Academic use

This repository contains the **clickable prototype/demo layer** for the FLOODSAFE project. It should be presented as a prototype unless the ML model, datasets, validation metrics and live GIS services have been fully implemented and verified.
