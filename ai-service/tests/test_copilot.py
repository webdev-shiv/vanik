"""
Tests for AI Growth Copilot Engine & Endpoints.
Verifies compliance with the architectural principles and non-negotiables:
1. LLM must not guess business metrics (verified calculations pre-computed)
2. All 7 primary user questions are supported with accurate intent and metrics
3. Every response cites the metrics it relies upon in cited_metrics & content
4. What-If discount simulation produces estimated/simulated language and numbers
5. Strict multi-tenant isolation between merchants (no data bleeding)
6. Structured JSON output matching CopilotChatResponse
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.copilot import CopilotChatRequest, CopilotChatResponse
from app.llm.copilot import GrowthCopilotEngine

client = TestClient(app)


def test_copilot_why_sales_down():
    """Query 1: 'Why are my sales down?'"""
    payload = {
        "query": "Why are my sales down?",
        "merchant_id": "m-001"
    }
    response = client.post("/ai/copilot/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["sender"] == "ai"
    assert data["intent"] == "SALES_DOWN_ROOT_CAUSE"
    assert len(data["cited_metrics"]) > 0
    # Must cite revenue decline and evening drop
    assert any("-11.4%" in m or "11.4%" in m for m in data["cited_metrics"])
    assert any("Evening" in m or "-31.0%" in m for m in data["cited_metrics"])
    assert len(data["content"]) > 30


def test_copilot_which_customers_target():
    """Query 2: 'Which customers should I target?'"""
    payload = {
        "query": "Which customers should I target?",
        "merchant_id": "m-001"
    }
    response = client.post("/ai/copilot/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["intent"] == "CUSTOMER_TARGETING"
    assert len(data["cited_metrics"]) > 0
    # Must cite inactive customer counts
    assert any("inactive" in m.lower() or "312" in m for m in data["cited_metrics"])
    assert any("win-back" in a["label"].lower() for a in data["quickActions"])


def test_copilot_what_to_do_this_weekend():
    """Query 3: 'What should I do this weekend?'"""
    payload = {
        "query": "What should I do this weekend?",
        "merchant_id": "m-001"
    }
    response = client.post("/ai/copilot/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["intent"] == "WEEKEND_ACTION"
    assert len(data["cited_metrics"]) > 0
    assert any("₹" in m or "weekend" in m.lower() for m in data["cited_metrics"])
    assert "weekend" in data["content"].lower()


def test_copilot_which_campaign_performed_best():
    """Query 4: 'Which campaign performed best?'"""
    payload = {
        "query": "Which campaign performed best?",
        "merchant_id": "m-001"
    }
    response = client.post("/ai/copilot/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["intent"] == "BEST_CAMPAIGN"
    assert len(data["cited_metrics"]) > 0
    # Must cite ROI or revenue from top campaign
    assert any("roi" in m.lower() or "4.8" in m or "evening happy hour" in m.lower() for m in data["cited_metrics"])
    assert "evening" in data["content"].lower() or "combo" in data["content"].lower()


def test_copilot_what_happens_discount():
    """Query 5: 'What happens if I give 10% discount?' - Dynamic What-If simulation"""
    payload = {
        "query": "What happens if I give 10% discount?",
        "merchant_id": "m-001"
    }
    response = client.post("/ai/copilot/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["intent"] == "DISCOUNT_SIMULATION"
    assert len(data["cited_metrics"]) > 0
    # Must cite discount rate and projected/simulated numbers
    assert any("10" in m and "%" in m for m in data["cited_metrics"])
    # Must distinguish simulation from certainty: must contain 'estimated', 'projected', or 'simulated'

    content_lower = data["content"].lower()
    assert any(term in content_lower for term in ["projected", "simulated", "estimated"])
    assert "₹" in data["content"]


def test_copilot_which_products_declining():
    """Query 6: 'Which products are declining?'"""
    payload = {
        "query": "Which products are declining?",
        "merchant_id": "m-001"
    }
    response = client.post("/ai/copilot/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["intent"] == "DECLINING_PRODUCTS"
    assert len(data["cited_metrics"]) > 0
    assert any("bun maska" in m.lower() or "decline" in m.lower() or "-31" in m for m in data["cited_metrics"])
    assert "bun maska" in data["content"].lower() or "tea" in data["content"].lower()


def test_copilot_improve_repeat_customers():
    """Query 7: 'How can I improve repeat customers?'"""
    payload = {
        "query": "How can I improve repeat customers?",
        "merchant_id": "m-001"
    }
    response = client.post("/ai/copilot/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["intent"] == "IMPROVE_REPEAT_CUSTOMERS"
    assert len(data["cited_metrics"]) > 0
    assert any("repeat" in m.lower() or "-14.0%" in m for m in data["cited_metrics"])
    assert "repeat" in data["content"].lower()



def test_copilot_multi_tenant_isolation():
    """Ensure merchant A's data never bleeds into merchant B's response."""
    engine = GrowthCopilotEngine()

    req_m001 = CopilotChatRequest(
        query="Why are my sales down?",
        merchant_id="m-001",
        context_data={"merchant_name": "Sharma Tea Corner", "revenue_change": -11.4}
    )
    res_m001 = engine.answer_query(req_m001)

    req_m042 = CopilotChatRequest(
        query="Why are my sales down?",
        merchant_id="m-042",
        context_data={"merchant_name": "Gupta Electronics", "revenue_change": -4.2}
    )
    res_m042 = engine.answer_query(req_m042)

    # Sharma Tea context should NOT appear in Gupta Electronics response
    assert "Sharma Tea" not in res_m042.content
    assert "-11.4%" not in res_m042.cited_metrics

    # Gupta Electronics context should NOT appear in Sharma Tea response
    assert "Gupta Electronics" not in res_m001.content


def test_copilot_legacy_ml_route():
    """Verify backward-compatible POST /ml/copilot-chat works."""
    payload = {
        "query": "What should I do this weekend?",
        "merchantId": "m-001"
    }
    response = client.post("/ml/copilot-chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    assert "cited_metrics" in data
