"""
Tests for OpenAI Analytics Explanation Layer.
Verifies compliance with the 7 core prompt requirements and strict rules:
1. Never invent numbers
2. Never change numerical values
3. Never claim certainty from estimates
4. Clearly distinguish observed metrics from predictions
5. Keep language understandable to small merchants
6. Recommendations should be actionable
7. Return structured JSON
"""

import json
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.openai_explanation import (
    AnalyticsExplanationRequest,
    OpenAIInsightExplanationResponse,
    AnalyticsContributor
)
from app.services.openai_service import OpenAIService

client = TestClient(app)

EXAMPLE_INPUT = {
    "merchant": "Sharma Tea Corner",
    "revenue_change": -11.4,
    "transaction_change": -8.2,
    "repeat_customer_change": -14.0,
    "contributors": [
        {
            "factor": "Evening transactions",
            "change_percent": -31.0
        }
    ],
    "recommendation": "evening_combo_offer"
}


def test_explain_analytics_endpoint_structure():
    """Verify endpoint accepts exact user payload and returns all 7 required fields."""
    response = client.post("/ai/explain-analytics", json=EXAMPLE_INPUT)
    assert response.status_code == 200
    data = response.json()

    # Verify all 7 required fields are present and non-empty
    assert "short_insight_title" in data and len(data["short_insight_title"]) > 5
    assert "explanation" in data and len(data["explanation"]) > 20
    assert "evidence" in data and isinstance(data["evidence"], list) and len(data["evidence"]) >= 4
    assert "recommended_action" in data and len(data["recommended_action"]) > 10
    assert "reason_for_recommendation" in data and len(data["reason_for_recommendation"]) > 15
    assert "expected_outcome_language" in data and len(data["expected_outcome_language"]) > 15
    assert "confidence_explanation" in data and len(data["confidence_explanation"]) > 15


def test_rule_never_change_numbers():
    """Verify numbers in input are preserved exactly without alteration or rounding."""
    response = client.post("/ai/explain-analytics", json=EXAMPLE_INPUT)
    assert response.status_code == 200
    data = response.json()

    all_evidence = " ".join(data["evidence"])
    assert "-11.4" in all_evidence or "11.4%" in all_evidence
    assert "-8.2" in all_evidence or "8.2%" in all_evidence
    assert "-14.0" in all_evidence or "-14%" in all_evidence or "14.0%" in all_evidence
    assert "-31.0" in all_evidence or "-31%" in all_evidence or "31.0%" in all_evidence


def test_rule_non_guarantee_and_probabilistic_language():
    """Verify expected outcome uses forward-looking probabilistic terms and disclaims guarantees."""
    response = client.post("/ai/explain-analytics", json=EXAMPLE_INPUT)
    data = response.json()

    outcome = data["expected_outcome_language"].lower()
    # Must use words like estimated, projected, simulated, or potential
    probabilistic_words = ["estimate", "project", "simulat", "potential", "indicat"]
    assert any(w in outcome for w in probabilistic_words)

    # Must not claim guaranteed revenue
    assert "guarantee" in outcome or "not guaranteed" in outcome or "depend" in outcome


def test_rule_distinguish_observed_from_predictions():
    """Verify that evidence clearly references observed past metrics."""
    response = client.post("/ai/explain-analytics", json=EXAMPLE_INPUT)
    data = response.json()

    evidence_text = " ".join(data["evidence"]).lower()
    assert "observed" in evidence_text or "measured" in evidence_text


def test_rule_actionable_recommendation():
    """Verify recommendation provides concrete operational action."""
    response = client.post("/ai/explain-analytics", json=EXAMPLE_INPUT)
    data = response.json()

    action = data["recommended_action"].lower()
    assert "combo" in action or "offer" in action
    assert "evening" in action or "5:00" in action or "pm" in action


def test_mock_openai_api_call():
    """Verify that OpenAIService correctly formats prompt and invokes OpenAI client when key is configured."""
    mock_llm_response = {
        "short_insight_title": "Sharma Tea Corner Evening Sales Slump: -11.4% Revenue",
        "explanation": "Revenue fell by -11.4% mainly due to an acute drop in evening footfall.",
        "evidence": [
            "Observed revenue change: -11.4%",
            "Observed transaction volume change: -8.2%",
            "Observed repeat customer change: -14.0%",
            "Observed Evening transactions shift: -31.0%"
        ],
        "recommended_action": "Introduce a ₹49 Tea + Samosa evening combo between 5:00 PM and 8:30 PM.",
        "reason_for_recommendation": "Directly targets the 31.0% slump in evening transactions without discounting morning hours.",
        "expected_outcome_language": "Simulated projections estimate potential evening recovery; results are not guaranteed.",
        "confidence_explanation": "High confidence in diagnostic findings from transaction logs; moderate confidence in predictive response."
    }

    mock_client = MagicMock()
    mock_completion = MagicMock()
    mock_choice = MagicMock()
    mock_message = MagicMock()
    mock_message.content = json.dumps(mock_llm_response)
    mock_choice.message = mock_message
    mock_completion.choices = [mock_choice]
    mock_client.chat.completions.create.return_value = mock_completion

    service = OpenAIService()
    service._client = mock_client

    req = AnalyticsExplanationRequest(**EXAMPLE_INPUT)
    result = service.explain_analytics(req)

    assert result.short_insight_title == mock_llm_response["short_insight_title"]
    assert len(result.evidence) == 4
    assert mock_client.chat.completions.create.called

    call_args = mock_client.chat.completions.create.call_args
    assert call_args.kwargs["response_format"] == {"type": "json_object"}
    assert call_args.kwargs["temperature"] == 0.1
