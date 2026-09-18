"""
Pydantic Schemas for Root-Cause Analysis Service.
Enforces the exact requested response structure, 11-dimension metric decomposition,
and 3-tier merchant-friendly explanations (Observed Fact, Inferred Contributor, Recommendation).
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class PeriodSpec(BaseModel):
    start_date: Optional[str] = Field(None, description="Start date formatted as YYYY-MM-DD")
    end_date: Optional[str] = Field(None, description="End date formatted as YYYY-MM-DD")
    label: Optional[str] = Field("period", description="Human-readable period descriptor")


class RootCauseRequest(BaseModel):
    merchant_id: str = Field("m-001", description="Merchant UUID or identifier")
    current_period: Optional[PeriodSpec] = Field(
        None,
        description="Current evaluation period (defaults to recent 30-day window)"
    )
    comparison_period: Optional[PeriodSpec] = Field(
        None,
        description="Prior comparison period (defaults to preceding 30-day window)"
    )


class ContributorItem(BaseModel):
    factor: str = Field(..., description="Operational factor or dimension name (e.g. 'Evening transactions')")
    change_percent: float = Field(..., description="Observed percentage change in factor")
    contribution: str = Field(..., description="Qualitative impact: 'high', 'medium', or 'low'")


class ExplanationTier(BaseModel):
    observed_facts: List[str] = Field(
        ...,
        description="Directly measured empirical changes (revenue, volume, AOV, churn counts)"
    )
    inferred_contributors: List[str] = Field(
        ...,
        description="Observational variance attributions explaining where the gap originated"
    )
    recommendations: List[str] = Field(
        ...,
        description="Actionable operational interventions addressing the identified root causes"
    )
    causality_disclaimer: str = Field(
        "Attributions are based on observational telemetry variance decomposition and correlation; they do not establish unconfounded counterfactual causality.",
        description="Methodological honesty statement regarding statistical causality"
    )


class DimensionDelta(BaseModel):
    dimension_name: str
    comparison_value: float
    current_value: float
    absolute_change: float
    percentage_change: float


class CustomerCohortDelta(BaseModel):
    new_customers_comparison: int
    new_customers_current: int
    new_customers_change_percent: float
    repeat_customers_comparison: int
    repeat_customers_current: int
    repeat_customers_change_percent: float
    inactive_regular_customers_count: int


class DetailedDimensionMetrics(BaseModel):
    revenue: DimensionDelta
    transactions: DimensionDelta
    average_transaction_value: DimensionDelta
    customers: CustomerCohortDelta
    category_breakdown: List[DimensionDelta]
    product_breakdown_top_decliners: List[DimensionDelta]
    product_breakdown_top_gainers: List[DimensionDelta]
    time_of_day_breakdown: List[DimensionDelta]
    weekday_weekend_breakdown: List[DimensionDelta]
    campaign_performance: List[Dict[str, Any]]


class RootCauseResponse(BaseModel):
    merchant_id: str
    overall_change: float = Field(..., description="Overall percentage revenue change (e.g. -11.4)")
    direction: str = Field(..., description="Direction of shift: 'down', 'up', or 'flat'")
    contributors: List[ContributorItem]
    recommended_actions: List[str]
    explanation: ExplanationTier
    detailed_metrics: Optional[DetailedDimensionMetrics] = None
