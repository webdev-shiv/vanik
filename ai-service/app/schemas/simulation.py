"""
Pydantic Schemas for What-If Campaign Simulator.
Validates campaign actions, segment targeting, duration, and enforces probabilistic non-guarantee language.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator, model_validator


VALID_ACTIONS = [
    "evening offer",
    "weekend offer",
    "loyalty campaign",
    "win-back campaign",
    "bundle offer",
    "targeted discount",
]

VALID_SEGMENTS = [
    "champions",
    "loyal customers",
    "potential loyalists",
    "at risk",
    "dormant / lost",
    "dormant/lost",
    "dormant",
    "new / promising",
    "new customers",
    "all customers",
    "regular customers",
]


class WhatIfSimulateRequest(BaseModel):
    action: str = Field(..., description="Action type: evening offer, weekend offer, loyalty campaign, win-back campaign, bundle offer, targeted discount")
    discount_percentage: float = Field(..., ge=0.0, le=100.0, description="Promotional discount percentage (0 to 100)")
    duration: int = Field(..., ge=1, le=365, description="Campaign duration in days (must be between 1 and 365)")
    target_customer_segment: str = Field(..., description="Target cohort (e.g. Champions, Loyal Customers, At Risk, Dormant / Lost, All Customers)")
    expected_campaign_reach: int = Field(..., ge=1, description="Estimated number of customers exposed to campaign")
    budget: Optional[float] = Field(None, ge=0.0, description="Optional campaign marketing spend in INR")
    merchant_id: Optional[str] = Field("m-001", description="Merchant ID")

    @model_validator(mode="before")
    @classmethod
    def resolve_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "duration" not in data and "duration_days" in data:
                data["duration"] = data["duration_days"]
            if "duration" not in data and "durationDays" in data:
                data["duration"] = data["durationDays"]
            if not data.get("merchant_id") and data.get("merchantId"):
                data["merchant_id"] = data["merchantId"]
            if not data.get("merchant_id"):
                data["merchant_id"] = "m-001"
            if "discount_percentage" not in data and "discountPercentage" in data:
                data["discount_percentage"] = data["discountPercentage"]
            if "target_customer_segment" not in data and "targetCustomerSegment" in data:
                data["target_customer_segment"] = data["targetCustomerSegment"]
            if "expected_campaign_reach" not in data and "expectedReach" in data:
                data["expected_campaign_reach"] = data["expectedReach"]
            if "expected_campaign_reach" not in data and "expected_reach" in data:
                data["expected_campaign_reach"] = data["expected_reach"]

            seg = str(data.get("target_customer_segment", "")).lower()
            if "commuter" in seg or "evening" in seg or "at-risk" in seg or "at risk" in seg:
                data["target_customer_segment"] = "At Risk"
            elif "inactive" in seg or "dormant" in seg:
                data["target_customer_segment"] = "Dormant / Lost"
            elif "weekend" in seg:
                data["target_customer_segment"] = "Regular Customers"
            elif "all" in seg:
                data["target_customer_segment"] = "All Customers"
            elif "loyal" in seg or "champion" in seg:
                data["target_customer_segment"] = "Loyal Customers"
            elif "new" in seg or "walk-in" in seg:
                data["target_customer_segment"] = "New Customers"
            elif "regular" in seg or "returning" in seg:
                data["target_customer_segment"] = "Regular Customers"
        return data

    @field_validator("action")
    @classmethod
    def validate_action(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in VALID_ACTIONS:
            valid_list = ", ".join(VALID_ACTIONS)
            raise ValueError(f"Unknown action '{v}'. Must be one of: {valid_list}")
        return clean

    @field_validator("target_customer_segment")
    @classmethod
    def validate_segment(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in VALID_SEGMENTS:
            valid_list = ", ".join(["Champions", "Loyal Customers", "Potential Loyalists", "At Risk", "Dormant / Lost", "All Customers"])
            raise ValueError(f"Unknown customer segment '{v}'. Must be one of: {valid_list}")
        return v.strip()


class MetricsTrio(BaseModel):
    revenue: float = Field(..., description="Revenue in INR")
    transactions: int = Field(..., description="Total transaction volume")
    customers: int = Field(..., description="Unique customer count")
    average_order_value: Optional[float] = Field(None, description="Average order value in INR")


class IncrementalTrio(BaseModel):
    revenue: float = Field(..., description="Estimated incremental revenue delta in INR")
    transactions: int = Field(..., description="Estimated incremental transactions count")
    customers: Optional[int] = Field(None, description="Estimated incremental unique customer count")


class WhatIfSimulateResponse(BaseModel):
    baseline: MetricsTrio
    scenario: MetricsTrio
    incremental: IncrementalTrio
    confidence: float = Field(..., ge=0.0, le=1.0, description="Statistical confidence score (e.g. 0.85)")
    merchant_id: Optional[str] = None
    action: Optional[str] = None
    duration_days: Optional[int] = None
    target_customer_segment: Optional[str] = None
    disclaimer: str = Field(
        "Simulated figures are forward-looking statistical estimates and do not guarantee actual financial performance.",
        description="Non-guarantee warning"
    )
    simulation_notes: List[str] = Field(default_factory=list)


# ---------------------------------------------------------
# BACKWARD-COMPATIBILITY SCHEMAS (for Spring Boot /ml/simulate-growth)
# ---------------------------------------------------------

class SimulationRequest(BaseModel):
    merchant_id: str = Field("m-001", description="Merchant ID")
    discount_percent: float = Field(20.0, ge=0.0, le=90.0, description="Discount or cashback percentage")
    price_change_percent: float = Field(0.0, ge=-50.0, le=100.0, description="Price change percentage")
    marketing_spend: float = Field(500.0, ge=0.0, description="Campaign marketing spend in INR")
    staff_hours_increase: float = Field(0.0, ge=0.0, description="Additional staff/operational hours")


class SimulationImpact(BaseModel):
    revenue_change_percent: float
    transaction_change_percent: float
    profit_margin_change_percent: float
    estimated_roi: float


class SimulationResponse(BaseModel):
    merchant_id: str
    scenario_name: str = "Custom What-If Simulation"
    price_elasticity: float
    baseline_revenue: float
    projected_revenue: float
    revenue_delta: float
    baseline_transactions: int
    projected_transactions: int
    transactions_delta: int
    baseline_net_profit: float
    projected_net_profit: float
    profit_delta: float
    impact: SimulationImpact
    recommendation_verdict: str
    reasoning: List[str]


class SimulationScenario(BaseModel):
    id: str
    title: str
    description: str
    discount_percent: float
    price_change_percent: float
    marketing_spend: float
    expected_lift_pct: float
