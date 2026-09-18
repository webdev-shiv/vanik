"""
Aggregated Pydantic schemas for Merchant Growth AI.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.schemas.segmentation import (
    CustomerInputRecord,
    SegmentationRequest,
    CustomerAssignment,
    SegmentCohortSummary,
    SegmentationResponse,
)
from app.schemas.forecasting import (
    DailyRevenueRecord,
    ForecastRequest,
    DailyForecast,
    ForecastResponse,
)
from app.schemas.anomaly import (
    HourlyTelemetryInput,
    AnomalyDetectionRequest,
    AnomalyEvent,
    AnomalyDetectionResponse,
    WhyTreeNode,
)
from app.schemas.recommendation import (
    EstimatedImpact,
    RecommendationRequest,
    RecommendationResponse,
)
from app.schemas.simulation import (
    WhatIfSimulateRequest,
    WhatIfSimulateResponse,
    MetricsTrio,
    IncrementalTrio,
    SimulationRequest,
    SimulationImpact,
    SimulationResponse,
    SimulationScenario,
)
from app.schemas.root_cause import (
    PeriodSpec,
    RootCauseRequest,
    ContributorItem,
    ExplanationTier,
    DimensionDelta,
    CustomerCohortDelta,
    DetailedDimensionMetrics,
    RootCauseResponse,
)


from app.schemas.copilot import (
    QuickAction,
    CopilotChatRequest,
    CopilotChatResponse,
)

# Retain ChatRequest and ChatResponse as aliases for backwards compatibility
ChatRequest = CopilotChatRequest
ChatResponse = CopilotChatResponse


__all__ = [
    "CustomerInputRecord",
    "SegmentationRequest",
    "CustomerAssignment",
    "SegmentCohortSummary",
    "SegmentationResponse",
    "DailyRevenueRecord",
    "ForecastRequest",
    "DailyForecast",
    "ForecastResponse",
    "HourlyTelemetryInput",
    "AnomalyDetectionRequest",
    "AnomalyEvent",
    "AnomalyDetectionResponse",
    "WhyTreeNode",
    "EstimatedImpact",
    "RecommendationRequest",
    "RecommendationResponse",
    "WhatIfSimulateRequest",
    "WhatIfSimulateResponse",
    "MetricsTrio",
    "IncrementalTrio",
    "SimulationRequest",
    "SimulationImpact",
    "SimulationResponse",
    "SimulationScenario",
    "PeriodSpec",
    "RootCauseRequest",
    "ContributorItem",
    "ExplanationTier",
    "DimensionDelta",
    "CustomerCohortDelta",
    "DetailedDimensionMetrics",
    "RootCauseResponse",
    "QuickAction",
    "CopilotChatRequest",
    "CopilotChatResponse",
    "ChatRequest",
    "ChatResponse",
]

