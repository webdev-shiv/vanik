"""
Pydantic Schemas for OpenAI Analytics Explanation Layer.
Structures the LLM narrative generation on top of verified upstream ML analytics.
The LLM does NOT calculate raw business metrics itself; it explains verified numbers.
"""
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, model_validator


class AnalyticsContributor(BaseModel):
    factor: str = Field(..., description="Operational or temporal factor, e.g. Evening transactions")
    change_percent: float = Field(..., description="Observed percentage shift for this factor, e.g. -31.0")


class AnalyticsExplanationRequest(BaseModel):
    merchant: Optional[str] = Field(None, description="Merchant business name, e.g. Sharma Tea Corner")
    merchant_name: Optional[str] = Field(None, description="Alias for merchant business name")
    revenue_change: float = Field(..., description="Observed overall revenue change percentage, e.g. -11.4")
    transaction_change: float = Field(..., description="Observed transaction volume change percentage, e.g. -8.2")
    repeat_customer_change: float = Field(..., description="Observed repeat customer change percentage, e.g. -14.0")
    contributors: List[AnalyticsContributor] = Field(
        ...,
        description="List of top contributor factors with their observed percentage changes"
    )
    recommendation: str = Field(..., description="Recommended growth intervention, e.g. evening_combo_offer")
    timeframe: Optional[str] = Field("Last 30 Days vs Prior Period", description="Analysis comparison window")

    @model_validator(mode="before")
    @classmethod
    def resolve_merchant_field(cls, data: Any) -> Any:
        if isinstance(data, dict):
            val = data.get("merchant") or data.get("merchant_name") or "Sharma Tea Corner"
            data["merchant"] = val
            data["merchant_name"] = val
        return data


class OpenAIInsightExplanationResponse(BaseModel):
    short_insight_title: str = Field(
        ...,
        description="Concise, merchant-friendly insight headline (1 sentence)"
    )
    explanation: str = Field(
        ...,
        description="Clear, non-technical breakdown of the observed business shifts"
    )
    evidence: List[str] = Field(
        ...,
        description="Explicitly cited observed metrics directly from the input without alteration or fabrication"
    )
    recommended_action: str = Field(
        ...,
        description="Concrete, actionable operational step for the merchant"
    )
    reason_for_recommendation: str = Field(
        ...,
        description="Logical rationale explaining why this action addresses the primary bottleneck"
    )
    expected_outcome_language: str = Field(
        ...,
        description="Forward-looking estimated impact framed in probabilistic, non-guaranteed terms"
    )
    confidence_explanation: str = Field(
        ...,
        description="Explanation of statistical confidence, data basis, and remaining business uncertainties"
    )
