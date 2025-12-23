"""Basic tests for the ML pipeline configuration."""
import sys
from pathlib import Path

# Add ml directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "ml"))

def test_config_imports():
    """Test that config module can be imported."""
    from config import TICKERS, HORIZONS, START_DATE
    assert len(TICKERS) > 0
    assert HORIZONS == [1, 5, 20]
    assert START_DATE == "2010-01-01"

def test_tickers_defined():
    """Test that required tickers are defined."""
    from config import TICKERS
    assert "sp500" in TICKERS
    assert "vix" in TICKERS

def test_directories_defined():
    """Test that directories are properly defined."""
    from config import DATA_DIR, RAW_DIR, PROCESSED_DIR, MODELS_DIR
    assert DATA_DIR is not None
    assert RAW_DIR is not None
    assert PROCESSED_DIR is not None
    assert MODELS_DIR is not None
