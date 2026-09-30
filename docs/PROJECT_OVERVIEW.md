# FLOODSAFE — Project Overview

## Problem

Floods can affect communities differently within the same region because terrain, rainfall, land use, drainage and proximity to water bodies vary spatially. A useful community-facing system should therefore communicate **where risk is higher and why**, rather than only showing a single regional label.

## Proposed solution

FLOODSAFE combines:

1. **GIS** for spatial visualization.
2. **Multiple flood-conditioning factors** for location-level analysis.
3. **RFE** for feature selection.
4. **GBM** for susceptibility modelling.
5. **Interactive risk communication** for community users.

## System architecture

```text
┌──────────────────────────────────────────────────────────┐
│ INPUT DATA                                               │
│ Rainfall • DEM • Slope • LULC • Rivers • Flood history │
└──────────────────────────┬───────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ PREPROCESSING                                            │
│ Cleaning • alignment • raster standardisation • labels  │
└──────────────────────────┬───────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ RFE                                                       │
│ Select the most informative features                     │
└──────────────────────────┬───────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ GBM                                                       │
│ Learn nonlinear relationships and classify susceptibility│
└──────────────────────────┬───────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ GIS + COMMUNITY LAYER                                    │
│ Risk map • location check • surrounding risk • guidance │
└──────────────────────────────────────────────────────────┘
```

## Prototype interaction

The intended interaction is:

**Map → select location → inspect risk → detailed risk check → surrounding risk**

and the reverse:

**Risk Check → select/search location → view surrounding risk on map**

This makes the GIS map and risk-check module parts of one workflow rather than separate demo screens.

## Dataset planning

Example factors in the project plan include elevation, slope, aspect, curvature, TWI, NDVI, distance from roads, distance from rivers, LULC, rainfall, lithology, soil type and soil texture.

The exact dataset version, record count, train/validation split and final model metrics should be filled in from the actual downloaded/processed dataset before claiming them as project results.

## Methodology notes

### RFE

Recursive Feature Elimination repeatedly trains a model and removes less useful features until the desired feature subset is obtained. The purpose is to reduce redundancy and focus the final model on informative variables.

### GBM

Gradient Boosting Machine builds an ensemble of weak learners sequentially. Each new learner focuses on reducing the previous model's errors. It can model nonlinear relationships between environmental factors and flood susceptibility.

## Prototype vs production

The current repository is intentionally a frontend prototype. Its demo risk values are not live emergency predictions. A production implementation would need:

- verified geospatial datasets,
- a trained and validated model,
- reproducible preprocessing,
- model/version tracking,
- an API/backend,
- reliable map/geocoding services,
- and appropriate official emergency-warning integrations.
