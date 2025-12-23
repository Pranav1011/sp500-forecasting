# S&P 500 Forecasting Platform

A professional-grade machine learning platform for multi-horizon S&P 500 price forecasting with an interactive Bloomberg-style dashboard.

## Overview

This platform combines advanced machine learning techniques with a modern web interface to provide accurate S&P 500 price predictions across multiple time horizons (1-day, 7-day, and 30-day forecasts). The system features ensemble modeling, automated hyperparameter optimization, comprehensive backtesting, and real-time performance monitoring.

## Features

- **Multi-Horizon Forecasting**: Generate predictions for 1-day, 7-day, and 30-day time horizons
- **Ensemble Models**: Combines XGBoost, Random Forest, and LSTM models for robust predictions
- **Advanced Feature Engineering**: Technical indicators, rolling statistics, and momentum features
- **Hyperparameter Optimization**: Automated tuning using Optuna
- **Comprehensive Backtesting**: Walk-forward validation with detailed performance metrics
- **Bloomberg-Style Dashboard**: Professional, interactive UI with real-time charts and analytics
- **REST API**: FastAPI backend for seamless model serving
- **Performance Monitoring**: Track model accuracy, MAE, RMSE, and directional accuracy

## Tech Stack

### Machine Learning Pipeline
- **Python 3.9+**
- **XGBoost**: Gradient boosting for tabular data
- **Random Forest**: Ensemble decision trees
- **LSTM (TensorFlow)**: Deep learning for time series
- **Optuna**: Hyperparameter optimization
- **yfinance**: Real-time market data
- **ta (Technical Analysis)**: Feature engineering

### Backend
- **FastAPI**: High-performance API framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **joblib**: Model serialization

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Interactive data visualization
- **shadcn/ui**: Modern UI components

## Project Structure

```
sp500-forecasting/
├── ml/                          # Machine Learning Pipeline
│   ├── data/
│   │   ├── raw/                 # Raw market data
│   │   └── sample/              # Sample datasets (tracked)
│   ├── models/                  # Trained models (.pkl, .h5)
│   ├── src/
│   │   ├── data_ingestion.py   # Data fetching and preprocessing
│   │   ├── feature_engineering.py
│   │   ├── train.py             # Model training scripts
│   │   ├── backtest.py          # Backtesting framework
│   │   └── utils.py
│   ├── tests/                   # Unit tests
│   └── requirements.txt
│
├── backend/                     # FastAPI Server
│   ├── app/
│   │   ├── main.py              # API entrypoint
│   │   ├── models.py            # Pydantic schemas
│   │   └── predict.py           # Prediction logic
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/                    # Next.js Dashboard
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Main dashboard
│   │   └── api/                 # API routes
│   ├── components/
│   │   ├── ForecastChart.tsx
│   │   ├── MetricsPanel.tsx
│   │   └── HistoricalPerformance.tsx
│   ├── lib/
│   │   └── api.ts               # Backend API client
│   ├── public/
│   ├── package.json
│   └── tailwind.config.ts
│
├── .gitignore
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.9 or higher
- Node.js 18+ and npm
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sp500-forecasting
```

### 2. ML Pipeline Setup
```bash
cd ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Train Models
```bash
# Fetch data and train models
python src/data_ingestion.py
python src/train.py

# Run backtesting
python src/backtest.py
```

### 4. Backend Setup
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### 5. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## API Endpoints

- `GET /api/forecast` - Get latest S&P 500 forecasts (1-day, 7-day, 30-day)
- `GET /api/metrics` - Retrieve model performance metrics
- `GET /api/historical` - Fetch historical predictions and actuals
- `POST /api/retrain` - Trigger model retraining (admin)

## Deployment

### Backend (Recommended: Render/Railway)
1. Deploy FastAPI app with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
2. Set environment variables
3. Upload trained models to persistent storage

### Frontend (Recommended: Vercel)
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Set environment variables (API URL)
4. Deploy

## Model Performance

The ensemble model typically achieves:
- **1-Day Forecast**: ~2-3% MAPE
- **7-Day Forecast**: ~4-6% MAPE
- **30-Day Forecast**: ~6-10% MAPE
- **Directional Accuracy**: 60-70%

*Note: Performance varies with market conditions. Always use in conjunction with other analysis.*

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Disclaimer

This platform is for educational and research purposes only. Do not use these predictions for actual trading without proper risk management and additional analysis. Past performance does not guarantee future results.

## Contact

For questions or suggestions, please open an issue on GitHub.
