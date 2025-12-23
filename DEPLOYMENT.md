# Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- Railway or Render account (for backend)

## Backend Deployment

### Option 1: Railway

1. Go to [Railway](https://railway.app) and create a new project
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Railway will auto-detect the Python app
5. Environment variables will be set automatically

### Option 2: Render

1. Go to [Render](https://render.com) and create a new Web Service
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Use the following settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Python version: 3.11

### Backend URL

After deployment, note your backend URL (e.g., `https://sp500-api.railway.app`)

## Frontend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com) and import your GitHub repository
2. Set the root directory to `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your backend URL from above
4. Deploy

## Post-Deployment

### Generate Initial Models

The first time you deploy, models won't exist yet. To generate them:

1. Clone the repository locally
2. Install dependencies:
   ```bash
   cd ml
   pip install -r requirements.txt
   ```
3. Run the full pipeline:
   ```bash
   python -c "from data_collection import fetch_all_data; fetch_all_data()"
   python -c "from feature_engineering import create_features; create_features()"
   python -c "from train_models import train_all_models; from config import HORIZONS; [train_all_models(h) for h in HORIZONS]"
   python -c "from backtest import run_all_backtests; run_all_backtests()"
   ```
4. Commit and push the generated files in `backend/models/`

### Daily Updates

The GitHub Actions workflow (`train.yml`) runs daily at 6:00 AM UTC to:
- Fetch latest market data
- Retrain all models
- Run backtests
- Commit updated metrics

## URLs

After deployment, your app will be available at:
- Frontend: `https://your-project.vercel.app`
- Backend API: `https://your-backend.railway.app/docs` (Swagger UI)
- Health check: `https://your-backend.railway.app/api/health`

## Troubleshooting

### CORS Issues
The backend is configured to allow all origins (`*`). For production, update `backend/main.py` to restrict origins.

### No Data Showing
Run the ML pipeline to generate model files. The dashboard shows a helpful message when no data exists.

### API Connection Failed
Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel environment variables.
