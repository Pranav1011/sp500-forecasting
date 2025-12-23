import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import json
from .config import PROCESSED_DIR, MODELS_DIR, HORIZONS

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
        random_state=42, n_jobs=-1, verbosity=0
    )
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    return model, mae, preds

def train_rf(X_train, y_train, X_test, y_test) -> tuple:
    """Train Random Forest."""
    model = RandomForestRegressor(
        n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
    )
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

def calculate_directional_accuracy(y_true, y_pred) -> float:
    """Calculate percentage of correct direction predictions."""
    return float(((y_true > 0) == (y_pred > 0)).mean())

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

    print(f"\n{'='*50}")
    print(f"Training models for {horizon}-day horizon")
    print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
    print(f"{'='*50}")

    results = {}

    # Train models
    print("\nTraining XGBoost...")
    xgb_model, xgb_mae, xgb_preds = train_xgboost(X_train_scaled, y_train, X_test_scaled, y_test)
    xgb_dir_acc = calculate_directional_accuracy(y_test, xgb_preds)

    print("Training Random Forest...")
    rf_model, rf_mae, rf_preds = train_rf(X_train_scaled, y_train, X_test_scaled, y_test)
    rf_dir_acc = calculate_directional_accuracy(y_test, rf_preds)

    print("Training Ridge Regression...")
    ridge_model, ridge_mae, ridge_preds = train_ridge(X_train_scaled, y_train, X_test_scaled, y_test)
    ridge_dir_acc = calculate_directional_accuracy(y_test, ridge_preds)

    results = {
        "xgboost": {"model": xgb_model, "mae": xgb_mae, "dir_acc": xgb_dir_acc, "preds": xgb_preds},
        "rf": {"model": rf_model, "mae": rf_mae, "dir_acc": rf_dir_acc, "preds": rf_preds},
        "ridge": {"model": ridge_model, "mae": ridge_mae, "dir_acc": ridge_dir_acc, "preds": ridge_preds},
    }

    # Ensemble prediction (simple average)
    ensemble_preds = (xgb_preds + rf_preds + ridge_preds) / 3
    ensemble_mae = mean_absolute_error(y_test, ensemble_preds)
    ensemble_dir_acc = calculate_directional_accuracy(y_test, ensemble_preds)
    results["ensemble"] = {"mae": ensemble_mae, "dir_acc": ensemble_dir_acc}

    # Print results
    print(f"\nResults for {horizon}-day horizon:")
    print("-" * 40)
    for name, data in results.items():
        print(f"  {name:12} | MAE: {data['mae']:.6f} | Dir Acc: {data['dir_acc']:.1%}")

    # Save models
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    for name in ["xgboost", "rf", "ridge"]:
        joblib.dump(results[name]["model"], MODELS_DIR / f"{name}_{horizon}d.pkl")
    joblib.dump(scaler, MODELS_DIR / f"scaler_{horizon}d.pkl")
    joblib.dump(feature_cols, MODELS_DIR / f"features_{horizon}d.pkl")

    # Save metrics
    metrics = {
        name: {
            "mae": float(data["mae"]),
            "directional_accuracy": float(data["dir_acc"])
        }
        for name, data in results.items()
    }
    with open(MODELS_DIR / f"metrics_{horizon}d.json", "w") as f:
        json.dump(metrics, f, indent=2)

    # Save feature importance (from XGBoost)
    importance = dict(zip(feature_cols, xgb_model.feature_importances_.tolist()))
    importance_sorted = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True)[:20])
    with open(MODELS_DIR / f"feature_importance_{horizon}d.json", "w") as f:
        json.dump(importance_sorted, f, indent=2)

    print(f"\nModels saved to: {MODELS_DIR}")

    return results

if __name__ == "__main__":
    for h in HORIZONS:
        results = train_all_models(h)
    print("\n" + "="*50)
    print("Training complete for all horizons!")
