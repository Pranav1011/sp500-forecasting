from fastapi import APIRouter, HTTPException
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
            with open(MODELS_DIR / f"metrics_{horizon}d.json") as f:
                metrics = json.load(f)
            predictions[f"{horizon}d"] = {
                "horizon_days": horizon,
                "directional_accuracy": backtest["directional_accuracy"],
                "sharpe_ratio": backtest["sharpe_ratio"],
                "total_return": backtest["total_return"],
                "model_metrics": metrics
            }
        except FileNotFoundError:
            predictions[f"{horizon}d"] = None
    return {"predictions": predictions}

@router.get("/{horizon}")
def get_prediction_by_horizon(horizon: int):
    """Get prediction for a specific horizon."""
    if horizon not in [1, 5, 20]:
        raise HTTPException(status_code=400, detail="Invalid horizon. Use 1, 5, or 20.")
    try:
        with open(MODELS_DIR / f"backtest_{horizon}d.json") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"No data for {horizon}d horizon")
