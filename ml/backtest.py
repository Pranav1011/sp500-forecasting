import pandas as pd
import numpy as np
import joblib
import json
from .config import PROCESSED_DIR, MODELS_DIR, HORIZONS

def calculate_sharpe(returns: pd.Series, risk_free: float = 0.02) -> float:
    """Calculate annualized Sharpe ratio."""
    excess = returns - risk_free / 252
    if excess.std() == 0:
        return 0.0
    return float(np.sqrt(252) * excess.mean() / excess.std())

def calculate_max_drawdown(cumulative: pd.Series) -> float:
    """Calculate maximum drawdown."""
    peak = cumulative.expanding().max()
    drawdown = (cumulative - peak) / peak
    return float(drawdown.min())

def calculate_sortino(returns: pd.Series, risk_free: float = 0.02) -> float:
    """Calculate annualized Sortino ratio."""
    excess = returns - risk_free / 252
    downside = returns[returns < 0].std()
    if downside == 0:
        return 0.0
    return float(np.sqrt(252) * excess.mean() / downside)

def run_backtest(horizon: int = 1, threshold: float = 0.001) -> dict:
    """Run backtest for a given horizon."""
    df = pd.read_csv(PROCESSED_DIR / "features.csv", index_col=0, parse_dates=True)

    feature_cols = joblib.load(MODELS_DIR / f"features_{horizon}d.pkl")
    scaler = joblib.load(MODELS_DIR / f"scaler_{horizon}d.pkl")

    # Load models
    models = {
        "xgboost": joblib.load(MODELS_DIR / f"xgboost_{horizon}d.pkl"),
        "rf": joblib.load(MODELS_DIR / f"rf_{horizon}d.pkl"),
        "ridge": joblib.load(MODELS_DIR / f"ridge_{horizon}d.pkl"),
    }

    # Use last 20% for backtest
    split_idx = int(len(df) * 0.8)
    test_df = df.iloc[split_idx:].copy()

    print(f"\n{'='*50}")
    print(f"Backtesting {horizon}-day horizon")
    print(f"Test period: {test_df.index[0].date()} to {test_df.index[-1].date()}")
    print(f"Test size: {len(test_df)} days")
    print(f"{'='*50}")

    X_test = scaler.transform(test_df[feature_cols].values)

    # Ensemble prediction (simple average)
    predictions = np.zeros(len(test_df))
    for name, model in models.items():
        predictions += model.predict(X_test)
    predictions /= len(models)

    test_df["prediction"] = predictions
    test_df["actual_return"] = test_df[f"target_{horizon}d"]

    # Generate signals
    test_df["signal"] = 0
    test_df.loc[test_df["prediction"] > threshold, "signal"] = 1
    test_df.loc[test_df["prediction"] < -threshold, "signal"] = -1

    # Calculate strategy returns (use shift to avoid look-ahead)
    test_df["strategy_return"] = test_df["signal"].shift(1) * test_df["actual_return"]
    test_df["strategy_return"] = test_df["strategy_return"].fillna(0)

    # Cumulative returns
    test_df["cumulative_strategy"] = (1 + test_df["strategy_return"]).cumprod()
    test_df["cumulative_benchmark"] = (1 + test_df["actual_return"].fillna(0)).cumprod()

    # Calculate metrics
    strategy_returns = test_df["strategy_return"].dropna()

    results = {
        "horizon": horizon,
        "test_start": str(test_df.index[0].date()),
        "test_end": str(test_df.index[-1].date()),
        "total_return": float(test_df["cumulative_strategy"].iloc[-1] - 1),
        "benchmark_return": float(test_df["cumulative_benchmark"].iloc[-1] - 1),
        "sharpe_ratio": calculate_sharpe(strategy_returns),
        "sortino_ratio": calculate_sortino(strategy_returns),
        "max_drawdown": calculate_max_drawdown(test_df["cumulative_strategy"]),
        "volatility": float(strategy_returns.std() * np.sqrt(252)),
        "win_rate": float((strategy_returns > 0).sum() / (strategy_returns != 0).sum()) if (strategy_returns != 0).sum() > 0 else 0,
        "num_trades": int((test_df["signal"] != 0).sum()),
        "directional_accuracy": float(
            ((test_df["prediction"] > 0) == (test_df["actual_return"] > 0)).mean()
        ),
    }

    # Print results
    print(f"\nBacktest Results:")
    print("-" * 40)
    print(f"  Total Return:      {results['total_return']:>10.2%}")
    print(f"  Benchmark Return:  {results['benchmark_return']:>10.2%}")
    print(f"  Sharpe Ratio:      {results['sharpe_ratio']:>10.2f}")
    print(f"  Sortino Ratio:     {results['sortino_ratio']:>10.2f}")
    print(f"  Max Drawdown:      {results['max_drawdown']:>10.2%}")
    print(f"  Volatility:        {results['volatility']:>10.2%}")
    print(f"  Win Rate:          {results['win_rate']:>10.2%}")
    print(f"  Directional Acc:   {results['directional_accuracy']:>10.2%}")
    print(f"  Number of Trades:  {results['num_trades']:>10}")

    # Save results
    with open(MODELS_DIR / f"backtest_{horizon}d.json", "w") as f:
        json.dump(results, f, indent=2)

    # Save equity curve
    equity_df = test_df[["cumulative_strategy", "cumulative_benchmark"]].copy()
    equity_df.index = equity_df.index.strftime("%Y-%m-%d")
    equity_df.to_csv(MODELS_DIR / f"equity_curve_{horizon}d.csv")

    print(f"\nResults saved to: {MODELS_DIR}")

    return results

def run_all_backtests() -> dict:
    """Run backtests for all horizons."""
    all_results = {}
    for h in HORIZONS:
        all_results[f"{h}d"] = run_backtest(h)

    # Save combined results
    with open(MODELS_DIR / "backtest_summary.json", "w") as f:
        json.dump(all_results, f, indent=2)

    return all_results

if __name__ == "__main__":
    results = run_all_backtests()
    print("\n" + "="*50)
    print("Backtesting complete for all horizons!")
    print("="*50)
