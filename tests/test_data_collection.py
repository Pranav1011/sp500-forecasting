import pytest
import pandas as pd
import numpy as np
from unittest.mock import patch, MagicMock
from pathlib import Path
import sys

# Add ml directory to path
ml_path = Path(__file__).parent.parent / "ml"
sys.path.insert(0, str(ml_path))

from data_collection import fetch_ticker, fetch_all_data
from config import TICKERS, RAW_DIR


@pytest.fixture
def mock_yfinance_data():
    """Create mock OHLCV data for testing."""
    dates = pd.date_range("2010-01-01", periods=100, freq="D")
    data = {
        "Open": np.random.uniform(100, 200, 100),
        "High": np.random.uniform(100, 200, 100),
        "Low": np.random.uniform(100, 200, 100),
        "Close": np.random.uniform(100, 200, 100),
        "Volume": np.random.uniform(1e6, 1e9, 100),
        "Adj Close": np.random.uniform(100, 200, 100),
    }
    df = pd.DataFrame(data, index=dates)
    return df


@pytest.fixture
def mock_yfinance_multiindex_data():
    """Create mock data with MultiIndex columns (as yfinance sometimes returns)."""
    dates = pd.date_range("2010-01-01", periods=100, freq="D")
    data = {
        "Open": np.random.uniform(100, 200, 100),
        "High": np.random.uniform(100, 200, 100),
        "Low": np.random.uniform(100, 200, 100),
        "Close": np.random.uniform(100, 200, 100),
        "Volume": np.random.uniform(1e6, 1e9, 100),
        "Adj Close": np.random.uniform(100, 200, 100),
    }
    df = pd.DataFrame(data, index=dates)
    # Create MultiIndex columns
    df.columns = pd.MultiIndex.from_product([df.columns, ["^GSPC"]])
    return df


@patch("data_collection.yf.download")
def test_fetch_ticker_single_index(mock_download, mock_yfinance_data):
    """Test fetching a single ticker with standard column names."""
    mock_download.return_value = mock_yfinance_data

    result = fetch_ticker("sp500", "^GSPC")

    assert len(result) == 100
    assert all(col.startswith("sp500_") for col in result.columns)
    assert "sp500_close" in result.columns
    assert "sp500_volume" in result.columns
    mock_download.assert_called_once_with("^GSPC", start="2010-01-01", progress=False)


@patch("data_collection.yf.download")
def test_fetch_ticker_multi_index(mock_download, mock_yfinance_multiindex_data):
    """Test fetching a single ticker with MultiIndex columns."""
    mock_download.return_value = mock_yfinance_multiindex_data

    result = fetch_ticker("sp500", "^GSPC")

    assert len(result) == 100
    assert all(col.startswith("sp500_") for col in result.columns)
    assert "sp500_close" in result.columns
    assert "sp500_volume" in result.columns
    mock_download.assert_called_once_with("^GSPC", start="2010-01-01", progress=False)


@patch("data_collection.yf.download")
def test_fetch_all_data(mock_download, mock_yfinance_data, tmp_path):
    """Test fetching all tickers and merging data."""
    # Mock yfinance download to return test data
    mock_download.return_value = mock_yfinance_data

    # Temporarily override RAW_DIR for testing
    with patch("data_collection.RAW_DIR", tmp_path):
        result = fetch_all_data()

        # Check that data was fetched for all tickers
        assert mock_download.call_count == len(TICKERS)

        # Check that individual CSV files were created
        for name in TICKERS.keys():
            csv_file = tmp_path / f"{name}.csv"
            assert csv_file.exists()

        # Check merged CSV was created
        merged_file = tmp_path / "merged.csv"
        assert merged_file.exists()

        # Check result DataFrame
        assert len(result) > 0
        assert len(result.columns) == len(TICKERS) * 6  # 6 columns per ticker


@patch("data_collection.yf.download")
def test_fetch_all_data_handles_nans(mock_download, mock_yfinance_data, tmp_path):
    """Test that fetch_all_data properly handles NaN values."""
    # Create data with some NaN values
    data_with_nans = mock_yfinance_data.copy()
    data_with_nans.iloc[0:5, 0] = np.nan

    mock_download.return_value = data_with_nans

    with patch("data_collection.RAW_DIR", tmp_path):
        result = fetch_all_data()

        # Check that NaN rows were dropped
        assert not result.isnull().any().any()


def test_column_naming():
    """Test that columns are properly renamed with lowercase and prefix."""
    dates = pd.date_range("2010-01-01", periods=10, freq="D")
    test_df = pd.DataFrame(
        {"Open": [100] * 10, "Close": [101] * 10, "Volume": [1e6] * 10}, index=dates
    )

    with patch("data_collection.yf.download", return_value=test_df):
        result = fetch_ticker("test", "TEST")

        assert "test_open" in result.columns
        assert "test_close" in result.columns
        assert "test_volume" in result.columns
        assert "Open" not in result.columns
        assert "Close" not in result.columns


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
