from fastapi import APIRouter, HTTPException
import pandas as pd
from pathlib import Path

router = APIRouter()
MODELS_DIR = Path(__file__).parent.parent.parent / "models"

@router.get("/equity-curve/{horizon}")
def get_equity_curve(horizon: int):
    """Get equity curve for backtesting."""
    if horizon not in [1, 5, 20]:
        raise HTTPException(status_code=400, detail="Invalid horizon")
    try:
        df = pd.read_csv(MODELS_DIR / f"equity_curve_{horizon}d.csv")
        return {"horizon": horizon, "data": df.to_dict(orient="records")}
    except FileNotFoundError:
        return {"horizon": horizon, "data": []}

@router.get("/summary")
def get_summary():
    """Get backtest summary for all horizons."""
    try:
        with open(MODELS_DIR / "backtest_summary.json") as f:
            import json
            return json.load(f)
    except FileNotFoundError:
        return {}
