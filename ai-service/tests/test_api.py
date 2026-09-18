"""
Integration tests for FastAPI REST Endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert "models_loaded" in data


def test_segment_customers_endpoint():
    payload = {
        "merchant_id": "m-001",
        "customers": [
            {
                "customer_id": "cust_101",
                "recency_days": 12.0,
                "frequency": 8,
                "monetary_value": 4200.0,
                "avg_order_value": 525.0
            }
        ]
    }
    response = client.post("/ai/segment-customers", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["merchant_id"] == "m-001"
    assert "cohort_distribution" in data
    assert "customer_assignments" in data
    assert len(data["customer_assignments"]) == 1


def test_forecast_sales_endpoint():
    payload = {
        "merchant_id": "m-001",
        "horizon_days": 7
    }
    response = client.post("/ai/forecast-sales", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["horizon_days"] == 7
    assert len(data["daily_forecasts"]) == 7
    assert data["confidence_interval"] == "90%"


def test_detect_anomalies_endpoint():
    payload = {
        "merchant_id": "m-001"
    }
    response = client.post("/ai/detect-anomalies", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["merchant_id"] == "m-001"
    assert "anomaly_detected" in data
    assert "evidence_points" in data


def test_recommendations_endpoint_exact_schema():
    payload = {
        "merchant_id": "m-001"
    }
    response = client.post("/ai/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Exact required fields
    assert "merchant_id" in data
    assert "problem" in data
    assert "evidence" in data and isinstance(data["evidence"], list)
    assert "recommended_action" in data
    assert "estimated_impact" in data
    assert "revenue_change_percent" in data["estimated_impact"]
    assert "transaction_change_percent" in data["estimated_impact"]
    assert "confidence" in data
    assert isinstance(data["confidence"], (int, float))


def test_simulate_endpoint():
    payload = {
        "merchant_id": "m-001",
        "action": "evening offer",
        "discount_percentage": 20.0,
        "duration": 14,
        "target_customer_segment": "At Risk",
        "expected_campaign_reach": 500,
        "budget": 500.0
    }
    response = client.post("/ai/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "scenario" in data
    assert "incremental" in data
    assert "confidence" in data
    assert data["baseline"]["revenue"] > 0
    assert data["scenario"]["transactions"] > 0


def test_validation_error_handling():
    # Invalid discount_percentage > 100
    invalid_payload = {
        "merchant_id": "m-001",
        "action": "evening offer",
        "discount_percentage": 150.0,  # triggers le=100 validation error
        "duration": 14,
        "target_customer_segment": "At Risk",
        "expected_campaign_reach": 500
    }
    response = client.post("/ai/simulate", json=invalid_payload)
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
    assert data["error"] == "Validation Error"


def test_backward_compatibility_endpoints():
    # /ml/why-tree
    r_tree = client.get("/ml/why-tree")
    assert r_tree.status_code == 200
    assert len(r_tree.json()) > 0

    # /ml/preset-scenarios
    r_presets = client.get("/ml/preset-scenarios")
    assert r_presets.status_code == 200
    assert len(r_presets.json()) == 3


def test_root_cause_analysis_endpoint():
    payload = {
        "merchant_id": "m-001"
    }
    response = client.post("/ai/root-cause-analysis", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Exact required fields from user specification
    assert "merchant_id" in data
    assert data["merchant_id"] == "m-001"
    assert "overall_change" in data
    assert "direction" in data
    assert "contributors" in data
    assert isinstance(data["contributors"], list)
    assert len(data["contributors"]) > 0

    # Check contributor format
    first_contrib = data["contributors"][0]
    assert "factor" in first_contrib
    assert "change_percent" in first_contrib
    assert "contribution" in first_contrib
    assert first_contrib["contribution"] in ["high", "medium", "low"]

    assert "recommended_actions" in data
    assert isinstance(data["recommended_actions"], list)

    # Check 3-tier explanation
    assert "explanation" in data
    assert "observed_facts" in data["explanation"]
    assert "inferred_contributors" in data["explanation"]
    assert "recommendations" in data["explanation"]
    assert "causality_disclaimer" in data["explanation"]

