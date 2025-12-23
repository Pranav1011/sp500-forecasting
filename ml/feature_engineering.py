import pandas as pd
import numpy as np
from ta import add_all_ta_features
from ta.volatility import BollingerBands, AverageTrueRange
from ta.momentum import RSIIndicator, StochasticOscillator
from ta.trend import MACD, SMAIndicator, EMAIndicator
try:
    from .config import PROCESSED_DIR, HORIZONS, RAW_DIR
except ImportError:
    from config import PROCESSED_DIR, HORIZONS, RAW_DIR

def add_returns(df: pd.DataFrame, col: str = "sp500_close") -> pd.DataFrame:
    """Add return features for multiple horizons."""
    df = df.copy()
    for h in [1, 5, 10, 20]:
        df[f"return_{h}d"] = df[col].pct_change(h)
    df["log_return_1d"] = np.log(df[col] / df[col].shift(1))
    return df

def add_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Add technical indicators manually for more control."""
    df = df.copy()
    close = df["sp500_close"]
    high = df["sp500_high"]
    low = df["sp500_low"]
    volume = df["sp500_volume"]

    # Moving Averages
    for period in [10, 20, 50, 200]:
        df[f"sma_{period}"] = SMAIndicator(close, window=period).sma_indicator()
        df[f"ema_{period}"] = EMAIndicator(close, window=period).ema_indicator()

    # RSI
    df["rsi_14"] = RSIIndicator(close, window=14).rsi()

    # MACD
    macd = MACD(close)
    df["macd"] = macd.macd()
    df["macd_signal"] = macd.macd_signal()
    df["macd_diff"] = macd.macd_diff()

    # Bollinger Bands
    bb = BollingerBands(close, window=20, window_dev=2)
    df["bb_upper"] = bb.bollinger_hband()
    df["bb_lower"] = bb.bollinger_lband()
    df["bb_width"] = bb.bollinger_wband()
    df["bb_pct"] = bb.bollinger_pband()

    # ATR
    df["atr_14"] = AverageTrueRange(high, low, close, window=14).average_true_range()

    # Stochastic
    stoch = StochasticOscillator(high, low, close)
    df["stoch_k"] = stoch.stoch()
    df["stoch_d"] = stoch.stoch_signal()

    # Volatility
    df["volatility_20"] = close.pct_change().rolling(20).std() * np.sqrt(252)
    df["volatility_5"] = close.pct_change().rolling(5).std() * np.sqrt(252)

    # Price momentum
    df["momentum_10"] = close / close.shift(10) - 1
    df["momentum_20"] = close / close.shift(20) - 1

    # Volume features
    df["volume_sma_20"] = volume.rolling(20).mean()
    df["volume_ratio"] = volume / df["volume_sma_20"]

    return df

def add_market_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add features from other market indicators."""
    df = df.copy()

    # VIX features
    if "vix_close" in df.columns:
        df["vix_change"] = df["vix_close"].pct_change()
        df["vix_sma_10"] = df["vix_close"].rolling(10).mean()

    # Treasury yield features
    if "treasury_10y_close" in df.columns:
        df["yield_change"] = df["treasury_10y_close"].pct_change()

    # Sector relative strength
    for sector in ["xlk", "xlf", "xle"]:
        col = f"{sector}_close"
        if col in df.columns:
            df[f"{sector}_rel_strength"] = df[col].pct_change(5) - df["sp500_close"].pct_change(5)

    return df

def add_targets(df: pd.DataFrame, col: str = "sp500_close") -> pd.DataFrame:
    """Add forward-looking target variables."""
    df = df.copy()
    for h in HORIZONS:
        df[f"target_{h}d"] = df[col].pct_change(h).shift(-h)
    return df

def create_features(input_path: str = None, output_path: str = None) -> pd.DataFrame:
    """Full feature engineering pipeline."""
    input_path = input_path or RAW_DIR / "merged.csv"
    df = pd.read_csv(input_path, index_col=0, parse_dates=True)

    print(f"Input data: {len(df)} rows, {len(df.columns)} columns")

    df = add_returns(df)
    df = add_technical_indicators(df)
    df = add_market_features(df)
    df = add_targets(df)

    # Lag all features by 1 to avoid look-ahead bias (except targets)
    feature_cols = [c for c in df.columns if not c.startswith("target_")]
    df[feature_cols] = df[feature_cols].shift(1)

    # Drop NaN rows
    df = df.dropna()

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    output_path = output_path or PROCESSED_DIR / "features.csv"
    df.to_csv(output_path)

    print(f"Output data: {len(df)} rows, {len(df.columns)} columns")
    print(f"Saved to: {output_path}")

    return df

if __name__ == "__main__":
    df = create_features()
    print(f"\nFeature columns: {len([c for c in df.columns if not c.startswith('target_')])}")
    print(f"Target columns: {[c for c in df.columns if c.startswith('target_')]}")
