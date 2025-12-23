# S&P 500 Forecasting Platform - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready ML forecasting platform with ensemble models, backtesting, and Bloomberg-style dashboard.

**Architecture:** Python ML pipeline → FastAPI backend → Next.js frontend. Models trained offline, served via API.

**Tech Stack:** Python 3.11, XGBoost, scikit-learn, TensorFlow/Keras, FastAPI, Next.js 14, Tailwind, shadcn/ui, Recharts

---

## Phase 1: Project Setup & Data Pipeline

### Task 1: Initialize Project Structure

**Files:**
- Create: `.gitignore`
- Create: `ml/requirements.txt`
- Create: `backend/requirements.txt`
- Create: `README.md`

**Step 1: Create .gitignore**

```
# Python
__pycache__/
*.py[cod]
venv/
.env
*.pkl
*.h5
*.joblib

# Node
node_modules/
.next/
.vercel

# Data
*.csv
!ml/data/sample/*.csv

# IDE
.idea/
.vscode/
*.swp
```

**Step 2: Create ML requirements**

```
yfinance>=0.2.40
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
xgboost>=2.0.0
tensorflow>=2.15.0
optuna>=3.5.0
joblib>=1.3.0
ta>=0.11.0
pytest>=7.4.0
```

**Step 3: Create backend requirements**

```
fastapi>=0.109.0
uvicorn>=0.27.0
pydantic>=2.5.0
joblib>=1.3.0
pandas>=2.0.0
numpy>=1.24.0
python-dotenv>=1.0.0
```

**Step 4: Commit**

```bash
git add -A && git commit -m "chore: initialize project structure"
```

---

### Task 2: Data Collection Module

**Files:**
- Create: `ml/config.py`
- Create: `ml/data_collection.py`
- Create: `tests/test_data_collection.py`

**Step 1: Create config**

```python
# ml/config.py
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
MODELS_DIR = Path(__file__).parent.parent / "backend" / "models"

TICKERS = {
    "sp500": "^GSPC",
    "vix": "^VIX",
    "treasury_10y": "^TNX",
    "usd_index": "DX-Y.NYB",
    "xlk": "XLK",
    "xlf": "XLF",
    "xle": "XLE",
}

START_DATE = "2010-01-01"
HORIZONS = [1, 5, 20]  # days ahead to predict
```

**Step 2: Create data collection**

```python
# ml/data_collection.py
import yfinance as yf
import pandas as pd
from config import TICKERS, START_DATE, RAW_DIR

def fetch_ticker(name: str, ticker: str) -> pd.DataFrame:
    """Fetch OHLCV data for a single ticker."""
    df = yf.download(ticker, start=START_DATE, progress=False)
    df.columns = [f"{name}_{c.lower()}" for c in df.columns]
    return df

def fetch_all_data() -> pd.DataFrame:
    """Fetch and merge all ticker data."""
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    dfs = []
    for name, ticker in TICKERS.items():
        df = fetch_ticker(name, ticker)
        df.to_csv(RAW_DIR / f"{name}.csv")
        dfs.append(df)

    merged = pd.concat(dfs, axis=1)
    merged = merged.dropna()
    merged.to_csv(RAW_DIR / "merged.csv")
    return merged

if __name__ == "__main__":
    df = fetch_all_data()
    print(f"Collected {len(df)} rows, {len(df.columns)} columns")
```

**Step 3: Create test**

```python
# tests/test_data_collection.py
import pytest
from ml.data_collection import fetch_ticker

def test_fetch_ticker_returns_dataframe():
    df = fetch_ticker("test", "^GSPC")
    assert len(df) > 0
    assert "test_close" in df.columns
```

**Step 4: Run test and commit**

```bash
cd ml && python -m pytest ../tests/test_data_collection.py -v
git add -A && git commit -m "feat: add data collection module"
```

---

### Task 3: Feature Engineering Module

**Files:**
- Create: `ml/feature_engineering.py`
- Create: `tests/test_features.py`

**Step 1: Create feature engineering**

```python
# ml/feature_engineering.py
import pandas as pd
import numpy as np
from ta import add_all_ta_features
from config import PROCESSED_DIR, HORIZONS

def add_returns(df: pd.DataFrame, col: str = "sp500_close") -> pd.DataFrame:
    """Add return features for multiple horizons."""
    for h in [1, 5, 10, 20]:
        df[f"return_{h}d"] = df[col].pct_change(h)
    return df

def add_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Add technical indicators using ta library."""
    df = add_all_ta_features(
        df, open="sp500_open", high="sp500_high",
        low="sp500_low", close="sp500_close", volume="sp500_volume"
    )
    return df

def add_targets(df: pd.DataFrame, col: str = "sp500_close") -> pd.DataFrame:
    """Add forward-looking target variables."""
    for h in HORIZONS:
        df[f"target_{h}d"] = df[col].pct_change(h).shift(-h)
    return df

def create_features(input_path: str, output_path: str = None) -> pd.DataFrame:
    """Full feature engineering pipeline."""
    df = pd.read_csv(input_path, index_col=0, parse_dates=True)

    df = add_returns(df)
    df = add_technical_indicators(df)
    df = add_targets(df)

    # Lag all features by 1 to avoid look-ahead bias
    feature_cols = [c for c in df.columns if not c.startswith("target_")]
    df[feature_cols] = df[feature_cols].shift(1)

    df = df.dropna()

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    output_path = output_path or PROCESSED_DIR / "features.csv"
    df.to_csv(output_path)

    return df

if __name__ == "__main__":
    from config import RAW_DIR
    df = create_features(RAW_DIR / "merged.csv")
    print(f"Created {len(df.columns)} features, {len(df)} rows")
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add feature engineering module"
```

---

### Task 4: Model Training Module

**Files:**
- Create: `ml/train_models.py`
- Create: `ml/models/__init__.py`

**Step 1: Create training script**

```python
# ml/train_models.py
import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from xgboost import XGBRegressor
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import json
from config import PROCESSED_DIR, MODELS_DIR, HORIZONS

def get_feature_cols(df: pd.DataFrame) -> list:
    """Get feature column names (exclude targets)."""
    return [c for c in df.columns if not c.startswith("target_")]

def walk_forward_split(df: pd.DataFrame, n_splits: int = 5):
    """Generate walk-forward train/test splits."""
    tscv = TimeSeriesSplit(n_splits=n_splits)
    X = df[get_feature_cols(df)]
    for train_idx, test_idx in tscv.split(X):
        yield train_idx, test_idx

def train_xgboost(X_train, y_train, X_test, y_test) -> tuple:
    """Train XGBoost with basic hyperparameters."""
    model = XGBRegressor(
        n_estimators=100, max_depth=6, learning_rate=0.1,
        random_state=42, n_jobs=-1
    )
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    return model, mae, preds

def train_rf(X_train, y_train, X_test, y_test) -> tuple:
    """Train Random Forest."""
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    return model, mae, preds

def train_ridge(X_train, y_train, X_test, y_test) -> tuple:
    """Train Ridge Regression."""
    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    return model, mae, preds

def train_all_models(horizon: int = 1) -> dict:
    """Train all models for a given horizon."""
    df = pd.read_csv(PROCESSED_DIR / "features.csv", index_col=0, parse_dates=True)

    feature_cols = get_feature_cols(df)
    target_col = f"target_{horizon}d"

    X = df[feature_cols].values
    y = df[target_col].values

    # Use last split for final model
    splits = list(walk_forward_split(df))
    train_idx, test_idx = splits[-1]

    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    results = {}

    # Train models
    xgb_model, xgb_mae, xgb_preds = train_xgboost(X_train_scaled, y_train, X_test_scaled, y_test)
    rf_model, rf_mae, rf_preds = train_rf(X_train_scaled, y_train, X_test_scaled, y_test)
    ridge_model, ridge_mae, ridge_preds = train_ridge(X_train_scaled, y_train, X_test_scaled, y_test)

    results = {
        "xgboost": {"model": xgb_model, "mae": xgb_mae},
        "rf": {"model": rf_model, "mae": rf_mae},
        "ridge": {"model": ridge_model, "mae": ridge_mae},
    }

    # Save models
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    for name, data in results.items():
        joblib.dump(data["model"], MODELS_DIR / f"{name}_{horizon}d.pkl")
    joblib.dump(scaler, MODELS_DIR / f"scaler_{horizon}d.pkl")
    joblib.dump(feature_cols, MODELS_DIR / f"features_{horizon}d.pkl")

    # Save metrics
    metrics = {name: {"mae": float(data["mae"])} for name, data in results.items()}
    with open(MODELS_DIR / f"metrics_{horizon}d.json", "w") as f:
        json.dump(metrics, f, indent=2)

    return results

if __name__ == "__main__":
    for h in HORIZONS:
        print(f"\nTraining models for {h}-day horizon...")
        results = train_all_models(h)
        for name, data in results.items():
            print(f"  {name}: MAE = {data['mae']:.6f}")
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add model training module"
```

---

### Task 5: Backtesting Module

**Files:**
- Create: `ml/backtest.py`

**Step 1: Create backtesting**

```python
# ml/backtest.py
import pandas as pd
import numpy as np
import joblib
import json
from config import PROCESSED_DIR, MODELS_DIR, HORIZONS

def calculate_sharpe(returns: pd.Series, risk_free: float = 0.02) -> float:
    """Calculate annualized Sharpe ratio."""
    excess = returns - risk_free / 252
    if excess.std() == 0:
        return 0.0
    return np.sqrt(252) * excess.mean() / excess.std()

def calculate_max_drawdown(cumulative: pd.Series) -> float:
    """Calculate maximum drawdown."""
    peak = cumulative.expanding().max()
    drawdown = (cumulative - peak) / peak
    return drawdown.min()

def run_backtest(horizon: int = 1, threshold: float = 0.001) -> dict:
    """Run backtest for a given horizon."""
    df = pd.read_csv(PROCESSED_DIR / "features.csv", index_col=0, parse_dates=True)

    feature_cols = joblib.load(MODELS_DIR / f"features_{horizon}d.pkl")
    scaler = joblib.load(MODELS_DIR / f"scaler_{horizon}d.pkl")

    # Load ensemble (average of models)
    models = {
        "xgboost": joblib.load(MODELS_DIR / f"xgboost_{horizon}d.pkl"),
        "rf": joblib.load(MODELS_DIR / f"rf_{horizon}d.pkl"),
        "ridge": joblib.load(MODELS_DIR / f"ridge_{horizon}d.pkl"),
    }

    # Use last 20% for backtest
    split_idx = int(len(df) * 0.8)
    test_df = df.iloc[split_idx:].copy()

    X_test = scaler.transform(test_df[feature_cols].values)

    # Ensemble prediction (simple average)
    predictions = np.zeros(len(test_df))
    for model in models.values():
        predictions += model.predict(X_test)
    predictions /= len(models)

    test_df["prediction"] = predictions
    test_df["actual_return"] = test_df[f"target_{horizon}d"]

    # Generate signals
    test_df["signal"] = 0
    test_df.loc[test_df["prediction"] > threshold, "signal"] = 1
    test_df.loc[test_df["prediction"] < -threshold, "signal"] = -1

    # Calculate strategy returns
    test_df["strategy_return"] = test_df["signal"].shift(1) * test_df["actual_return"]
    test_df["strategy_return"] = test_df["strategy_return"].fillna(0)

    # Cumulative returns
    test_df["cumulative_strategy"] = (1 + test_df["strategy_return"]).cumprod()
    test_df["cumulative_benchmark"] = (1 + test_df["actual_return"]).cumprod()

    # Metrics
    results = {
        "horizon": horizon,
        "total_return": float(test_df["cumulative_strategy"].iloc[-1] - 1),
        "benchmark_return": float(test_df["cumulative_benchmark"].iloc[-1] - 1),
        "sharpe_ratio": float(calculate_sharpe(test_df["strategy_return"])),
        "max_drawdown": float(calculate_max_drawdown(test_df["cumulative_strategy"])),
        "win_rate": float((test_df["strategy_return"] > 0).mean()),
        "num_trades": int((test_df["signal"] != 0).sum()),
        "directional_accuracy": float(
            ((test_df["prediction"] > 0) == (test_df["actual_return"] > 0)).mean()
        ),
    }

    # Save results
    with open(MODELS_DIR / f"backtest_{horizon}d.json", "w") as f:
        json.dump(results, f, indent=2)

    # Save equity curve
    test_df[["cumulative_strategy", "cumulative_benchmark"]].to_csv(
        MODELS_DIR / f"equity_curve_{horizon}d.csv"
    )

    return results

if __name__ == "__main__":
    for h in HORIZONS:
        print(f"\nBacktesting {h}-day horizon...")
        results = run_backtest(h)
        print(f"  Sharpe: {results['sharpe_ratio']:.2f}")
        print(f"  Dir. Accuracy: {results['directional_accuracy']:.1%}")
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add backtesting module"
```

---

## Phase 2: Backend API

### Task 6: FastAPI Setup

**Files:**
- Create: `backend/main.py`
- Create: `backend/api/routes/predictions.py`
- Create: `backend/api/routes/metrics.py`
- Create: `backend/api/routes/data.py`

**Step 1: Create main.py**

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import predictions, metrics, data

app = FastAPI(title="S&P 500 Forecasting API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
app.include_router(data.router, prefix="/api/data", tags=["data"])

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
```

**Step 2: Create predictions route**

```python
# backend/api/routes/predictions.py
from fastapi import APIRouter
import joblib
import json
from pathlib import Path

router = APIRouter()
MODELS_DIR = Path(__file__).parent.parent.parent / "models"

@router.get("/")
def get_predictions():
    """Get current predictions for all horizons."""
    predictions = {}
    for horizon in [1, 5, 20]:
        try:
            with open(MODELS_DIR / f"backtest_{horizon}d.json") as f:
                backtest = json.load(f)
            predictions[f"{horizon}d"] = {
                "horizon_days": horizon,
                "directional_accuracy": backtest["directional_accuracy"],
                "sharpe_ratio": backtest["sharpe_ratio"],
            }
        except FileNotFoundError:
            predictions[f"{horizon}d"] = None
    return predictions
```

**Step 3: Create metrics route**

```python
# backend/api/routes/metrics.py
from fastapi import APIRouter
import json
from pathlib import Path

router = APIRouter()
MODELS_DIR = Path(__file__).parent.parent.parent / "models"

@router.get("/")
def get_metrics():
    """Get model performance metrics."""
    all_metrics = {}
    for horizon in [1, 5, 20]:
        try:
            with open(MODELS_DIR / f"metrics_{horizon}d.json") as f:
                all_metrics[f"{horizon}d"] = json.load(f)
            with open(MODELS_DIR / f"backtest_{horizon}d.json") as f:
                backtest = json.load(f)
                all_metrics[f"{horizon}d"]["backtest"] = backtest
        except FileNotFoundError:
            pass
    return all_metrics
```

**Step 4: Create data route**

```python
# backend/api/routes/data.py
from fastapi import APIRouter
import pandas as pd
from pathlib import Path

router = APIRouter()
MODELS_DIR = Path(__file__).parent.parent.parent / "models"

@router.get("/equity-curve/{horizon}")
def get_equity_curve(horizon: int):
    """Get equity curve for backtesting."""
    try:
        df = pd.read_csv(MODELS_DIR / f"equity_curve_{horizon}d.csv")
        return df.to_dict(orient="records")
    except FileNotFoundError:
        return []
```

**Step 5: Create __init__.py files and commit**

```bash
mkdir -p backend/api/routes
touch backend/api/__init__.py backend/api/routes/__init__.py
git add -A && git commit -m "feat: add FastAPI backend"
```

---

## Phase 3: Frontend

### Task 7: Next.js Setup

**Step 1: Create Next.js app**

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Step 2: Install dependencies**

```bash
npm install recharts @tanstack/react-table lucide-react
npx shadcn@latest init
npx shadcn@latest add card table badge tabs
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: initialize Next.js frontend"
```

---

### Task 8: Dashboard Components

**Files:**
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/components/PriceChart.tsx`
- Create: `frontend/src/components/MetricsTable.tsx`
- Create: `frontend/src/components/PredictionPanel.tsx`
- Modify: `frontend/src/app/page.tsx`

**Step 1: Create API client**

```typescript
// frontend/src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchMetrics() {
  const res = await fetch(`${API_URL}/api/metrics`);
  return res.json();
}

export async function fetchPredictions() {
  const res = await fetch(`${API_URL}/api/predictions`);
  return res.json();
}

export async function fetchEquityCurve(horizon: number) {
  const res = await fetch(`${API_URL}/api/data/equity-curve/${horizon}`);
  return res.json();
}
```

**Step 2: Create components (abbreviated - full code in implementation)**

Components will include:
- `PriceChart.tsx` - Recharts line chart for equity curve
- `MetricsTable.tsx` - TanStack table for model comparison
- `PredictionPanel.tsx` - Card showing current predictions
- `TechnicalPanel.tsx` - RSI, MACD gauges

**Step 3: Update page.tsx with dashboard layout**

```typescript
// frontend/src/app/page.tsx
import { PriceChart } from "@/components/PriceChart";
import { MetricsTable } from "@/components/MetricsTable";
import { PredictionPanel } from "@/components/PredictionPanel";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">S&P 500 Forecasting Platform</h1>
      </header>
      <div className="grid grid-cols-3 gap-4">
        <PriceChart />
        <PredictionPanel />
        <MetricsTable />
      </div>
    </main>
  );
}
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add dashboard components"
```

---

## Phase 4: Deployment & CI/CD

### Task 9: GitHub Actions

**Files:**
- Create: `.github/workflows/test.yml`
- Create: `.github/workflows/train.yml`

**Step 1: Create test workflow**

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r ml/requirements.txt
      - run: pytest tests/ -v
```

**Step 2: Create train workflow**

```yaml
# .github/workflows/train.yml
name: Daily Training
on:
  schedule:
    - cron: "0 6 * * *"
  workflow_dispatch:
jobs:
  train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r ml/requirements.txt
      - run: python ml/data_collection.py
      - run: python ml/feature_engineering.py
      - run: python ml/train_models.py
      - run: python ml/backtest.py
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: update models [skip ci]"
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add CI/CD workflows"
```

---

### Task 10: Deployment Configuration

**Files:**
- Create: `backend/Procfile`
- Create: `backend/railway.json`
- Create: `frontend/vercel.json`

**Step 1: Backend deployment files**

```
# backend/Procfile
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

```json
// backend/railway.json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": { "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT" }
}
```

**Step 2: Frontend deployment**

```json
// frontend/vercel.json
{
  "framework": "nextjs"
}
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add deployment configuration"
```

---

## Execution Summary

| Phase | Tasks | Estimated Commits |
|-------|-------|-------------------|
| 1. ML Pipeline | Tasks 1-5 | 5 commits |
| 2. Backend API | Task 6 | 1 commit |
| 3. Frontend | Tasks 7-8 | 2 commits |
| 4. Deployment | Tasks 9-10 | 2 commits |

**Total: 10 tasks, ~10 commits**

---

**Plan complete and saved to `docs/plans/2025-12-22-implementation-plan.md`.**

**Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
