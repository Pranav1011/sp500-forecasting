from fastapi import APIRouter
import json
from pathlib import Path

router = APIRouter()
MODELS_DIR = Path(__file__).parent.parent.parent / "models"

@router.get("/")
def get_metrics():
    """Get model performance metrics for all horizons."""
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
    return {"metrics": all_metrics}

@router.get("/feature-importance/{horizon}")
def get_feature_importance(horizon: int):
    """Get feature importance for a specific horizon."""
    try:
        with open(MODELS_DIR / f"feature_importance_{horizon}d.json") as f:
            return {"horizon": horizon, "features": json.load(f)}
    except FileNotFoundError:
        return {"horizon": horizon, "features": {}}
