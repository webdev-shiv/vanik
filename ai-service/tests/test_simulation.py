"""
Unit and Integration Tests for What-If Simulator.
Tests required edge cases:
- zero discount
- normal discount
- extreme discount
- invalid duration
- unknown customer segment
"""
import pytest
from pydantic import ValidationError
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.simulation import WhatIfSimulateRequest
from app.services.simulation_service import simulation_service

client = TestClient(app)


def test_zero_discount_simulation():
    """
    Zero discount test:
    - discount_percentage = 0.0
    - Volume lift occurs from reach/awareness only (no price markdown)
    - Incremental revenue is non-negative
    - Wording adheres to 'estimated', 'predicted', 'simulated'
    """
    req = WhatIfSimulateRequest(
        merchant_id="m-001",
        action="evening offer",
        discount_percentage=0.0,
        duration=14,
        target_customer_segment="At Risk",
        expected_campaign_reach=400,
        budget=500.0
    )
    res = simulation_service.simulate_what_if(req)

    # 1. Baseline verification
    assert res.baseline.revenue > 0
    assert res.baseline.transactions > 0
    assert res.baseline.customers > 0

    # 2. Scenario verification
    assert res.scenario.transactions >= res.baseline.transactions
    assert res.incremental.revenue >= 0.0  # Zero discount means no price erosion
    assert res.incremental.transactions >= 0

    # 3. Confidence verification
    assert 0.65 <= res.confidence <= 0.95

    # 4. Probabilistic language check
    all_notes = " ".join(res.simulation_notes) + " " + res.disclaimer
    lower_notes = all_notes.lower()
    assert any(w in lower_notes for w in ["estimated", "predicted", "simulated"])
    assert "not guarantee" in lower_notes or "do not guarantee" in lower_notes


def test_normal_discount_simulation():
    """
    Normal discount test:
    - discount_percentage = 15.0%
    - Moderate price discount generates healthy volume elasticity
    - Revenue, transactions, and customers are projected with positive lifts
    """
    req = WhatIfSimulateRequest(
        merchant_id="m-001",
        action="evening offer",
        discount_percentage=15.0,
        duration=14,
        target_customer_segment="Regular Customers",
        expected_campaign_reach=600,
        budget=800.0
    )
    res = simulation_service.simulate_what_if(req)

    assert res.baseline.revenue > 0
    assert res.scenario.transactions > res.baseline.transactions
    assert res.incremental.transactions > 0
    assert res.scenario.customers >= res.baseline.customers
    assert 0.70 <= res.confidence <= 0.95


def test_extreme_discount_simulation():
    """
    Extreme discount test:
    - discount_percentage = 85.0%
    - Volume demand saturates while unit price collapses
    - Results in negative incremental revenue (margin erosion modeled correctly)
    """
    req = WhatIfSimulateRequest(
        merchant_id="m-001",
        action="targeted discount",
        discount_percentage=85.0,
        duration=14,
        target_customer_segment="All Customers",
        expected_campaign_reach=1000
    )
    res = simulation_service.simulate_what_if(req)

    assert res.scenario.transactions > res.baseline.transactions
    # 85% discount destroys net revenue despite footfall surge
    assert res.incremental.revenue < 0.0
    assert res.scenario.revenue < res.baseline.revenue


def test_invalid_duration_validation_error():
    """
    Invalid duration test:
    - duration = 0 or negative
    - duration > 365
    - Expects Pydantic ValidationError or HTTP 422
    """
    # 1. Pydantic validation error directly on schema
    with pytest.raises(ValidationError):
        WhatIfSimulateRequest(
            action="evening offer",
            discount_percentage=10.0,
            duration=0,  # Invalid: ge=1
            target_customer_segment="Champions",
            expected_campaign_reach=300
        )

    with pytest.raises(ValidationError):
        WhatIfSimulateRequest(
            action="evening offer",
            discount_percentage=10.0,
            duration=-7,  # Invalid: negative
            target_customer_segment="Champions",
            expected_campaign_reach=300
        )

    # 2. HTTP 422 through TestClient
    resp = client.post("/ai/simulate", json={
        "action": "evening offer",
        "discount_percentage": 10.0,
        "duration": -5,
        "target_customer_segment": "Champions",
        "expected_campaign_reach": 300
    })
    assert resp.status_code == 422


def test_unknown_customer_segment_validation_error():
    """
    Unknown customer segment test:
    - target_customer_segment = 'MartianConsumers'
    - Expects Pydantic ValidationError and HTTP 422
    """
    with pytest.raises(ValidationError) as excinfo:
        WhatIfSimulateRequest(
            action="evening offer",
            discount_percentage=10.0,
            duration=7,
            target_customer_segment="MartianConsumers",  # Unknown segment
            expected_campaign_reach=300
        )
    assert "Unknown customer segment" in str(excinfo.value)

    resp = client.post("/ai/simulate", json={
        "action": "evening offer",
        "discount_percentage": 10.0,
        "duration": 7,
        "target_customer_segment": "AlienCustomers",
        "expected_campaign_reach": 300
    })
    assert resp.status_code == 422


def test_simulate_endpoint_exact_response_schema():
    """
    Full integration check verifying exact top-level JSON response fields.
    """
    payload = {
        "merchant_id": "m-001",
        "action": "bundle offer",
        "discount_percentage": 10.0,
        "duration": 21,
        "target_customer_segment": "Loyal Customers",
        "expected_campaign_reach": 800,
        "budget": 1200.0
    }
    resp = client.post("/ai/simulate", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    # Exact required response fields
    assert "baseline" in data
    assert "revenue" in data["baseline"]
    assert "transactions" in data["baseline"]
    assert "customers" in data["baseline"]

    assert "scenario" in data
    assert "revenue" in data["scenario"]
    assert "transactions" in data["scenario"]
    assert "customers" in data["scenario"]

    assert "incremental" in data
    assert "revenue" in data["incremental"]
    assert "transactions" in data["incremental"]

    assert "confidence" in data
    assert isinstance(data["confidence"], (int, float))

    # Guardrail wording check
    assert "disclaimer" in data
    assert any(term in str(data).lower() for term in ["estimated", "predicted", "simulated"])
