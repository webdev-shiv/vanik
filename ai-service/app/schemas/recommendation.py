"""
Pydantic Schemas for Merchant Growth Recommendations.
Adheres strictly to the expected response structure.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class EstimatedImpact(BaseModel):
    revenue_change_percent: float = Field(..., description="Estimated percentage change in revenue (e.g. 18.5)")
    transaction_change_percent: float = Field(..., description="Estimated percentage change in transactions (e.g. 24.0)")


class RecommendationRequest(BaseModel):
    merchant_id: str = Field("m-001", description="Merchant identifier (e.g. m-001)")
    merchant_category: Optional[str] = Field("Food & Beverage", description="Business category")
    current_problem: Optional[str] = Field(None, description="Optional diagnosed problem override")


class RecommendationResponse(BaseModel):
    merchant_id: str
    problem: str
    evidence: List[str]
    recommended_action: str
    estimated_impact: EstimatedImpact
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence score between 0 and 1")
