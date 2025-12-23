import yfinance as yf
import pandas as pd
from config import TICKERS, START_DATE, RAW_DIR

def fetch_ticker(name: str, ticker: str) -> pd.DataFrame:
    """Fetch OHLCV data for a single ticker."""
    df = yf.download(ticker, start=START_DATE, progress=False)

    # Handle MultiIndex columns (when yfinance returns multiple tickers)
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.droplevel(1)

    # Rename columns with ticker prefix
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
