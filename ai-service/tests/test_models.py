"""
Unit tests for Model Serialization, Loading, and Inference.
"""
import pytest
import os
import numpy as np
import pandas as pd

from app.utils.model_registry import model_registry
from app.services.segmentation_service import segmentation_service
from app.services.forecasting_service import forecasting_service
from app.services.anomaly_service import anomaly_service
from app.services.recommendation_service import recommendation_service
from app.services.simulation_service import simulation_service
from app.schemas.segmentation import SegmentationRequest, CustomerInputRecord
from app.schemas.forecasting import ForecastRequest
from app.schemas.anomaly import AnomalyDetectionRequest
from app.schemas.recommendation import RecommendationRequest
from app.schemas.simulation import SimulationRequest


def test_model_registry_loads_all_models():
    meta = model_registry.get_metadata()
    assert "models" in meta
    models = meta["models"]
    assert "segmentation" in models
    assert "forecasting" in models
    assert "anomaly" in models
    assert "recommendation" in models


def test_segmentation_inference():
    req = SegmentationRequest(
        merchant_id="m-001",
        customers=[
            CustomerInputRecord(customer_id="c1", recency_days=5.0, frequency=20, monetary_value=12000.0, avg_order_value=600.0),
            CustomerInputRecord(customer_id="c2", recency_days=85.0, frequency=2, monetary_value=400.0, avg_order_value=200.0)
        ]
    )
    res = segmentation_service.segment_customers(req)
    assert res.merchant_id == "m-001"
    assert len(res.customer_assignments) == 2
    assert res.customer_assignments[0].r_score >= res.customer_assignments[1].r_score


def test_forecasting_inference():
    req = ForecastRequest(merchant_id="m-001", horizon_days=7)
    res = forecasting_service.forecast_sales(req)
    assert res.horizon_days == 7
    assert len(res.daily_forecasts) == 7
    assert res.total_projected_revenue > 0
    for day in res.daily_forecasts:
        assert day.predicted_revenue >= 0
        assert day.lower_bound_90 <= day.predicted_revenue <= day.upper_bound_90


def test_anomaly_inference():
    req = AnomalyDetectionRequest(merchant_id="m-001")
    res = anomaly_service.detect_anomalies(req)
    assert res.merchant_id == "m-001"
    assert isinstance(res.anomaly_detected, bool)
    assert len(res.evidence_points) > 0


def test_recommendation_inference_non_fabricated():
    req = RecommendationRequest(merchant_id="m-001")
    res = recommendation_service.generate_recommendation(req)
    assert res.merchant_id == "m-001"
    assert len(res.problem) > 0
    assert len(res.evidence) > 0
    assert len(res.recommended_action) > 0
    assert res.estimated_impact.revenue_change_percent > 0
    assert res.estimated_impact.transaction_change_percent > 0
    assert 0.0 <= res.confidence <= 1.0


def test_simulation_microeconomic_consistency():
    # Test positive discount increases volume
    req = SimulationRequest(merchant_id="m-001", discount_percent=20.0, price_change_percent=0.0, marketing_spend=500.0)
    res = simulation_service.simulate(req)
    assert res.projected_transactions >= res.baseline_transactions
    assert res.impact.transaction_change_percent > 0
    assert res.price_elasticity < 0  # Downward sloping demand
