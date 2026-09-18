"""
Anomaly Feature Extractor for Hourly and Daily Sales Telemetry.
Calculates rolling expected baselines, z-score deviations, and ratio shifts.
"""
from typing import List, Dict, Any
import pandas as pd
import numpy as np


class AnomalyFeatureExtractor:
    """
    Extracts deviation metrics to identify:
    - Acute evening demand slumps (e.g. -31% drop during peak hours)
    - Off-peak transaction spikes (unusual late-night or abnormal surges)
    - Z-score deviation from 4-week hourly rolling baselines
    """

    FEATURE_COLUMNS = [
        "hour_of_day",
        "day_of_week",
        "is_weekend",
        "baseline_hourly_revenue",
        "baseline_hourly_txns",
        "revenue_ratio_to_baseline",
        "txn_ratio_to_baseline",
        "revenue_z_score",
        "txn_z_score",
    ]

    @classmethod
    def extract_hourly_features(
        cls,
        telemetry: pd.DataFrame
    ) -> pd.DataFrame:
        df = telemetry.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp").reset_index(drop=True)

        df["hour_of_day"] = df["timestamp"].dt.hour
        df["day_of_week"] = df["timestamp"].dt.dayofweek
        df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)

        # Compute rolling baseline by hour of day and weekday/weekend
        grouped_stats = df.groupby(["hour_of_day", "is_weekend"]).agg(
            base_rev_mean=("total_amount", "mean"),
            base_rev_std=("total_amount", "std"),
            base_txns_mean=("transaction_count", "mean"),
            base_txns_std=("transaction_count", "std")
        ).reset_index()

        df = df.merge(grouped_stats, on=["hour_of_day", "is_weekend"], how="left")

        df["baseline_hourly_revenue"] = df["base_rev_mean"].fillna(df["total_amount"])
        df["baseline_hourly_txns"] = df["base_txns_mean"].fillna(df["transaction_count"])

        # Ratio deviations
        df["revenue_ratio_to_baseline"] = (
            df["total_amount"] / df["baseline_hourly_revenue"].replace(0, np.nan)
        ).fillna(1.0).clip(lower=0.0, upper=10.0)

        df["txn_ratio_to_baseline"] = (
            df["transaction_count"] / df["baseline_hourly_txns"].replace(0, np.nan)
        ).fillna(1.0).clip(lower=0.0, upper=10.0)

        # Z-Scores
        rev_std = df["base_rev_std"].replace(0, np.nan).fillna(1.0)
        df["revenue_z_score"] = ((df["total_amount"] - df["baseline_hourly_revenue"]) / rev_std).clip(-5.0, 5.0)

        txns_std = df["base_txns_std"].replace(0, np.nan).fillna(1.0)
        df["txn_z_score"] = ((df["transaction_count"] - df["baseline_hourly_txns"]) / txns_std).clip(-5.0, 5.0)

        return df
