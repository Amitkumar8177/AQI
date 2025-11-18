
# AQI Monitoring System

A full-stack Air Quality Index (AQI) monitoring and prediction system. It provides:

- Real-time AQI lookups (IQAir/OpenWeatherMap integrations)
- ML-based AQI prediction from pollutant readings
- Simulated historical and 24-hour forecast endpoints for demo and UI
- A responsive React dashboard (Vite + Tailwind)

This README is a concise, developer-focused guide for getting the project up and running locally, understanding the layout, and contributing.

---

## Quick links

- Repo: (local workspace)
- Backend: `backend/` (Flask API)
- Frontend: `frontend/` (React + Vite)
- ML code/artifacts: `ml_model/`

---

## Features

- Predict AQI from pollutant inputs using a trained model (.pkl)
- Fetch real-time AQI with fallback between IQAir and OpenWeatherMap
- Provide simulated hourly/daily historical and 24-hour forecast data for the UI
- Clean, componentized React frontend with charts and health advice

---

## Tech stack

- Backend: Python, Flask, Flask-CORS, requests
- ML: scikit-learn (model saved with joblib), pandas, numpy
- Frontend: React, Vite, Tailwind CSS, Recharts
- Optional: MongoDB (for historical storage in future)

---

## Quickstart (Windows / PowerShell)

Prereqs:

# AQI Monitoring System

One-line description
--------------------
An extendable full-stack application that monitors and predicts Air Quality Index (AQI). It combines a Flask API (model serving and external API aggregation), a scikit-learn model for AQI prediction, and a React (Vite + Tailwind) frontend for visualization and interaction.

Description
-----------
This project is designed to demonstrate a simple, reproducible pipeline for: data ingestion (external AQI APIs), model inference (predicting AQI from pollutant concentrations), and presentation (dashboard visualizations and health advice). The backend exposes REST endpoints for real-time lookups, simulated historical and forecast data, and model predictions. The frontend consumes these endpoints and provides an interactive user experience.

# AQI Monitoring System

An extendable full-stack application that monitors and predicts Air Quality Index (AQI). This README focuses on clarity for developers: what the project does, how data flows, how to run it locally, and how to contribute.

Table of contents
- Description
- Quickstart
- Configuration (.env)
- API reference (examples)
- ML model inputs & artifacts
- Project structure
- Development notes
- Contributing & license

---

Description
-----------
This system provides three primary capabilities:

- Real-time AQI retrieval: The backend fetches live AQI data from IQAir and falls back to OpenWeatherMap when needed.
- AQI prediction: A scikit-learn model predicts AQI from pollutant concentration inputs (PM2.5, PM10, NO2, SO2, CO, O3) plus a small set of weather features.
- Visualization & advice: The React frontend displays current/past/future AQI, pollutant contributions and health guidance.

The backend (`backend/app.py`) standardizes responses so the frontend has a single JSON format to render. Simulated endpoints (historical, forecast) are provided so the UI works even without a history database.

Architecture / data flow (summary)
- Frontend -> Backend (HTTP via Axios)
- Backend -> External APIs (IQAir, OpenWeatherMap) for live AQI
- Backend -> ML model (joblib-loaded .pkl) for predictions
- (Optional) Backend -> MongoDB for historical storage (not required for demo)

---

Quickstart (Windows / PowerShell)
-------------------------------
Prerequisites
- Python 3.9+
- Node.js 16+ and npm or pnpm
- Git

Backend

```powershell
cd e:\aqi-monitoring-system\backend
python -m venv .venv
. .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Frontend

```powershell
cd e:\aqi-monitoring-system\frontend
npm install
# npm run dev
```

Run (development)

```powershell
# start backend
cd e:\aqi-monitoring-system\backend
. .venv\Scripts\Activate.ps1
python app.py

# start frontend (in a separate terminal)
cd e:\aqi-monitoring-system\frontend
npm run dev
```

Open the Vite URL (usually http://localhost:5173) shown by the frontend terminal.

---

Configuration (.env)
---------------------
Copy `backend/.env.example` to `backend/.env` and fill in values. Key variables:

- SECRET_KEY — Flask secret for sessions (any random string)
- DEBUG — True/False
- OPENWEATHER_API_KEY — OpenWeatherMap API key
- IQAIR_API_KEY — IQAir AirVisual API key
- MONGO_URI — optional MongoDB connection string
- CORS_ORIGINS — comma-separated frontend origins (eg. http://localhost:5173)

Do not commit `.env` to source control. A `.gitignore` is included.

---

API reference (examples)
------------------------

1) Health check

GET /api/health

Response (200):

```json
{
    "status": "healthy",
    "model_loaded": true,
    "timestamp": "2025-11-12T..."
}
```

2) Predict AQI

POST /api/predict
Content-Type: application/json

Example request body:

```json
{
    "PM2.5": 35,
    "PM10": 50,
    "NO2": 20,
    "SO2": 5,
    "CO": 0.4,
    "O3": 10,
    "Temperature": 25,
    "Humidity": 60,
    "Wind_Speed": 4,
    "Pressure": 1012
}
```

Example response:

```json
{
    "success": true,
    "aqi": 86.5,
    "category": "Moderate",
    "color": "#fbbf24",
    "emoji": "😐",
    "description": "Air quality is acceptable...",
    "health_advice": "Sensitive individuals should consider...",
    "pollutants": {"PM2.5": 35, "PM10": 50, "NO2": 20, "SO2": 5, "CO": 0.4, "O3": 10},
    "contributions": {"PM2.5": 65.2, "PM10": 20.1, "NO2": 8.3},
    "timestamp": "2025-11-12T..."
}
```

3) Real-time AQI

GET /api/realtime?city=London

Response: standardized JSON (see `backend/app.py` for full shape). Fields include `aqi`, `category`, `pollutants`, `coordinates` and `source`.

4) Forecast & Historical

- GET /api/forecast?city=CityName — returns simulated 24-hour forecast
- GET /api/historical?days=7 — returns simulated hourly/daily historical data

---

ML model inputs & artifacts
---------------------------
The ML model expects a fixed set of feature names (saved in `feature_names.pkl`). Typical features include:

- PM2.5, PM10, NO2, SO2, CO, O3
- Temperature, Humidity, Wind_Speed, Pressure

Artifacts (in `ml_model/`):
- `aqi_model.pkl` — trained model (joblib)
- `scaler.pkl` — StandardScaler used during training (if applicable)
- `feature_names.pkl` — ordered list of feature column names

If you retrain the model, overwrite those files with joblib and restart the backend.

---

Project layout (short)

```
aqi-monitoring-system/
├─ backend/         # Flask API and configuration
├─ frontend/        # React + Vite application
├─ ml_model/        # training scripts, dataset, saved model artifacts
└─ README.md
```

Files of interest
- `backend/app.py` — API endpoints and model loading
- `backend/config.py` — configuration and model paths
- `frontend/src/components` — React UI
- `ml_model/train_model.py` — training pipeline

---

## Frontend components (detailed)

### CitySearch (`frontend/src/components/CitySearch.jsx`)

Purpose
- A lightweight search box used in the dashboard to look up cities by name and select one to fetch real-time AQI.

Key behaviour
- Performs incremental search once the user types 2+ characters.
- Calls the backend endpoint: `GET /api/search_city?city=<query>` and expects a JSON array of city objects.
- When a city is selected the component calls the provided `onCitySelect(city)` callback with the selected city object.

Props
- `onCitySelect: (city) => void` — required. Called when user selects a city. The `city` object has at least: `name`, `country`, `lat`, `lon`, and optionally `state`.

Expected API contract
- Request: `GET /api/search_city?city=Delhi`
- Response (example):

```json
[
    {"name": "Delhi", "state": "Delhi", "country": "India", "lat": 28.7041, "lon": 77.1025},
    {"name": "Delhi Cantonment", "state": "Delhi", "country": "India", "lat": 28.5562, "lon": 77.0986}
]
```

Integration / usage example

```jsx
import CitySearch from './components/CitySearch';

function Dashboard() {
    const handleCitySelect = (city) => {
        // city.lat / city.lon or city.name can be used to request realtime AQI
        fetchRealtimeAQI(city.lat, city.lon);
    };

    return <CitySearch onCitySelect={handleCitySelect} />;
}
```

Styling & accessibility notes
- The component uses simple button-based list items and Tailwind utility classes (`input-field`, `w-full`, etc.).
- It currently lacks keyboard navigation and ARIA attributes; consider adding `role="listbox"` / `role="option"` and keyboard support for better accessibility.

Suggested improvements
- Debounce requests (e.g., 200–400ms) to reduce backend load.
- Add loading/error UI states and retry/backoff for network errors.
- Support arrow-key navigation and Enter to select to improve UX.
- Cache recent queries or popular city list for instant suggestions.


Development notes
-----------------
- Do not commit secrets. Use `.env` for local keys and `.env.example` as a template.
- Remove `backend/venv/` from version control; keep virtual environments local.
- Add unit tests for backend endpoints and ML validation; CI (GitHub Actions) is recommended.

---

Contributing
------------
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-change`
3. Make changes and tests
4. Open a Pull Request with a clear description

---

License
-------
This repository currently does not contain a LICENSE file. If you plan to open-source it, add a license (for example MIT) and commit it.

Contact
-------
Open an issue or contact the maintainer for questions.

