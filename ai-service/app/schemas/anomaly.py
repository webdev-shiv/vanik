"""
Pydantic Schemas for Sales Anomaly Detection and Why-Tree Diagnostics.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class HourlyTelemetryInput(BaseModel):
    timestamp: str = Field(..., description="Timestamp in ISO 8601 format or YYYY-MM-DD HH:MM:SS")
    hour: Optional[int] = Field(None, ge=0, le=23)
    transactions_count: int = Field(..., ge=0)
    total_revenue: float = Field(..., ge=0.0)


class AnomalyDetectionRequest(BaseModel):
    merchant_id: str = Field("m-001", description="Merchant UUID")
    telemetry: Optional[List[HourlyTelemetryInput]] = Field(
        None,
        description="Hourly telemetry records. If omitted, uses recorded telemetry for the merchant."
    )


class AnomalyEvent(BaseModel):
    timestamp: str
    hour: int
    actual_revenue: float
    expected_revenue: float
    drop_percentage: float
    z_score: float
    severity: str = Field(..., description="LOW, MEDIUM, HIGH, or CRITICAL")
    reason: str


class AnomalyDetectionResponse(BaseModel):
    merchant_id: str
    anomaly_detected: bool
    anomaly_count: int
    primary_issue: str
    peak_drop_percent: float
    affected_window: str
    evidence_points: List[str]
    model_version: str
    anomalies: List[AnomalyEvent]


class WhyTreeNode(BaseModel):
    id: str
    label: str
    impact: str
    status: str
    detail: str
    children: Optional[List["WhyTreeNode"]] = None


WhyTreeNode.model_rebuild()
