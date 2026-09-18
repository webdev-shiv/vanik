"""
Unit tests for Feature Engineering Extractors.
"""
import pytest
import pandas as pd
import numpy as np
from datetime import datetime

from app.features.rfm import RFMFeatureExtractor
from app.features.time_series import TimeSeriesFeatureExtractor
from app.features.anomaly_features import AnomalyFeatureExtractor


def test_rfm_feature_extraction():
    sample_txns = [
        {"transaction_id": "t1", "customer_id": "c1", "timestamp": "2026-09-01 10:00:00", "total_amount": 100.0},
        {"transaction_id": "t2", "customer_id": "c1", "timestamp": "2026-09-10 12:00:00", "total_amount": 250.0},
        {"transaction_id": "t3", "customer_id": "c2", "timestamp": "2026-08-01 15:00:00", "total_amount": 500.0},
    ]
    ref_date = datetime(2026, 9, 15, 0, 0, 0)
    rfm_df = RFMFeatureExtractor.compute_rfm_from_transactions(sample_txns, reference_date=ref_date)

    assert len(rfm_df) == 2
    c1 = rfm_df[rfm_df["customer_id"] == "c1"].iloc[0]
    assert c1["frequency"] == 2
    assert c1["monetary_total"] == 350.0
    assert c1["avg_order_value"] == 175.0
    assert c1["recency_days"] == pytest.approx(4.5, abs=0.2)


def test_rfm_quintile_scoring():
    df = pd.DataFrame([
        {"customer_id": f"c{i}", "recency_days": 10 * i, "frequency": i + 1, "monetary_total": 100 * (i + 1)}
        for i in range(10)
    ])
    scored = RFMFeatureExtractor.calculate_rfm_scores(df)
    assert "r_score" in scored.columns
    assert "f_score" in scored.columns
    assert "m_score" in scored.columns
    assert "rfm_segment" in scored.columns
    assert scored["r_score"].min() >= 1 and scored["r_score"].max() <= 5


def test_time_series_features_causality():
    dates = pd.date_range("2026-01-01", periods=20, freq="D")
    df = pd.DataFrame({
        "date": dates,
        "daily_revenue": [100.0 + i * 10 for i in range(20)]
    })
    feat_df = TimeSeriesFeatureExtractor.create_features(df)

    # Check that lag_1 is strictly yesterday's revenue
    assert feat_df.loc[1, "revenue_lag_1"] == 100.0
    assert feat_df.loc[7, "revenue_lag_7"] == 100.0

    # Ensure rolling_7_mean does not include today's value (strictly causal)
    # At index 7, rolling_7_mean of shifted revenue is mean of indices 0..6
    expected_mean = df.loc[0:6, "daily_revenue"].mean()
    assert feat_df.loc[7, "rolling_7_mean"] == pytest.approx(expected_mean, rel=1e-3)


def test_anomaly_features_extraction():
    timestamps = pd.date_range("2026-09-01 00:00:00", periods=48, freq="h")
    df = pd.DataFrame({
        "timestamp": timestamps,
        "transaction_count": [10] * 48,
        "total_amount": [1000.0] * 48
    })
    # Inject a 50% drop at index 40
    df.loc[40, "total_amount"] = 500.0

    out = AnomalyFeatureExtractor.extract_hourly_features(df)
    assert "revenue_ratio_to_baseline" in out.columns
    assert "revenue_z_score" in out.columns
    assert out.loc[40, "revenue_ratio_to_baseline"] < 1.0
