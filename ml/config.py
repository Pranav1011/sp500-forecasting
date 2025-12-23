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
HORIZONS = [1, 5, 20]
