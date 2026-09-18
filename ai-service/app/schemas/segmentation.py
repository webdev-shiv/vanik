"""
Pydantic Schemas for Customer RFM Segmentation.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CustomerInputRecord(BaseModel):
    customer_id: str = Field(..., description="Unique customer ID")
    recency_days: float = Field(..., ge=0, description="Days since last transaction")
    frequency: int = Field(..., ge=1, description="Total transaction count")
    monetary_value: float = Field(..., ge=0, description="Total monetary spend in INR")
    avg_order_value: Optional[float] = Field(None, ge=0, description="Average order value in INR")
    customer_tenure_days: Optional[float] = Field(None, ge=0, description="Customer relationship age in days")
    weekend_tx_ratio: Optional[float] = Field(0.0, ge=0, le=1, description="Ratio of weekend purchases")
    evening_tx_ratio: Optional[float] = Field(0.0, ge=0, le=1, description="Ratio of evening purchases")


class SegmentationRequest(BaseModel):
    merchant_id: str = Field("m-001", description="Merchant UUID or code")
    customers: Optional[List[CustomerInputRecord]] = Field(None, description="List of customer records to segment. If omitted, uses default merchant dataset.")


class CustomerAssignment(BaseModel):
    customer_id: str
    cluster_id: int
    segment_name: str
    r_score: int = Field(..., ge=1, le=5)
    f_score: int = Field(..., ge=1, le=5)
    m_score: int = Field(..., ge=1, le=5)
    rfm_score: str
    churn_risk: float = Field(..., ge=0.0, le=1.0)


class SegmentCohortSummary(BaseModel):
    segment_name: str
    customer_count: int
    percent_of_total: float
    avg_monetary: float
    avg_frequency: float
    avg_recency: float
    recommended_strategy: str


class SegmentationResponse(BaseModel):
    merchant_id: str
    total_customers: int
    model_version: str
    silhouette_score: Optional[float] = None
    cohort_distribution: List[SegmentCohortSummary]
    customer_assignments: List[CustomerAssignment]
