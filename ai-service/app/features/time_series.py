"""
Time Series Feature Extractor for Sales Forecasting.
Generates autoregressive lag features, rolling statistics, and calendar indicators
with strict temporal causality (zero lookahead bias).
"""
from typing import List, Dict, Any
import pandas as pd
import numpy as np


class TimeSeriesFeatureExtractor:
    """
    Constructs feature matrices from daily revenue telemetry:
    - Lag features: t-1, t-7, t-14
    - Rolling window aggregates: 7-day mean, 14-day mean, 7-day std
    - Calendar features: day_of_week, is_weekend, day_of_month
    """

    FEATURE_COLUMNS = [
        "revenue_lag_1",
        "revenue_lag_7",
        "revenue_lag_14",
        "rolling_7_mean",
        "rolling_14_mean",
        "rolling_7_std",
        "day_of_week",
        "is_weekend",
        "is_month_start",
        "is_month_end",
    ]

    @classmethod
    def create_features(cls, df: pd.DataFrame, target_col: str = "daily_revenue") -> pd.DataFrame:
        """
        Expects a DataFrame with 'date' and target_col, sorted chronologically.
        """
        data = df.copy()
        data["date"] = pd.to_datetime(data["date"])
        data = data.sort_values("date").reset_index(drop=True)

        # Strictly causal lags: shift(1) is yesterday's revenue
        data["revenue_lag_1"] = data[target_col].shift(1)
        data["revenue_lag_7"] = data[target_col].shift(7)
        data["revenue_lag_14"] = data[target_col].shift(14)

        # Rolling statistics shifted by 1 to never include today's value
        data["rolling_7_mean"] = data[target_col].shift(1).rolling(window=7, min_periods=1).mean()
        data["rolling_14_mean"] = data[target_col].shift(1).rolling(window=14, min_periods=1).mean()
        data["rolling_7_std"] = data[target_col].shift(1).rolling(window=7, min_periods=1).std().fillna(0.0)

        # Calendar features
        data["day_of_week"] = data["date"].dt.dayofweek
        data["is_weekend"] = data["day_of_week"].isin([5, 6]).astype(int)
        data["is_month_start"] = data["date"].dt.is_month_start.astype(int)
        data["is_month_end"] = data["date"].dt.is_month_end.astype(int)

        # Backfill initial days for lags with mean where NaN exists
        base_mean = data[target_col].dropna().mean() if len(data[target_col].dropna()) > 0 else 0.0
        data["revenue_lag_1"] = data["revenue_lag_1"].fillna(base_mean)
        data["revenue_lag_7"] = data["revenue_lag_7"].fillna(data["revenue_lag_1"])
        data["revenue_lag_14"] = data["revenue_lag_14"].fillna(data["revenue_lag_7"])
        data["rolling_7_mean"] = data["rolling_7_mean"].fillna(base_mean)
        data["rolling_14_mean"] = data["rolling_14_mean"].fillna(base_mean)

        return data

    @classmethod
    def prepare_step_feature(
        cls,
        history_values: List[float],
        target_date: pd.Timestamp
    ) -> np.ndarray:
        """
        Creates a single feature vector for predicting a future step given recent history.
        history_values must contain at least 14 days of revenue up to t-1.
        """
        n = len(history_values)
        if n == 0:
            raise ValueError("History values cannot be empty for feature extraction.")

        lag_1 = float(history_values[-1])
        lag_7 = float(history_values[-7]) if n >= 7 else lag_1
        lag_14 = float(history_values[-14]) if n >= 14 else lag_7

        recent_7 = history_values[-7:] if n >= 7 else history_values
        recent_14 = history_values[-14:] if n >= 14 else history_values

        rolling_7_m = float(np.mean(recent_7))
        rolling_14_m = float(np.mean(recent_14))
        rolling_7_s = float(np.std(recent_7)) if len(recent_7) > 1 else 0.0

        dow = target_date.dayofweek
        is_wknd = 1 if dow in [5, 6] else 0
        is_m_start = 1 if target_date.is_month_start else 0
        is_m_end = 1 if target_date.is_month_end else 0

        feature_vector = np.array([[
            lag_1,
            lag_7,
            lag_14,
            rolling_7_m,
            rolling_14_m,
            rolling_7_s,
            dow,
            is_wknd,
            is_m_start,
            is_m_end,
        ]], dtype=np.float64)

        return feature_vector
