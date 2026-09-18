"""
FastAPI REST Router for Merchant Growth AI.
Exposes standardized /ai/* endpoints and maintains backward-compatible /ml/* routes.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any, Optional

from app.utils.logger import logger
from app.schemas.segmentation import SegmentationRequest, SegmentationResponse
from app.schemas.forecasting import ForecastRequest, ForecastResponse
from app.schemas.anomaly import AnomalyDetectionRequest, AnomalyDetectionResponse, WhyTreeNode
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.schemas.simulation import (
    WhatIfSimulateRequest,
    WhatIfSimulateResponse,
    SimulationRequest,
    SimulationResponse,
    SimulationScenario,
)
from app.schemas.root_cause import RootCauseRequest, RootCauseResponse
from app.schemas.openai_explanation import AnalyticsExplanationRequest, OpenAIInsightExplanationResponse
from app.schemas.copilot import CopilotChatRequest, CopilotChatResponse


from app.services.segmentation_service import segmentation_service
from app.services.forecasting_service import forecasting_service
from app.services.anomaly_service import anomaly_service
from app.services.recommendation_service import recommendation_service
from app.services.simulation_service import simulation_service
from app.services.root_cause_service import root_cause_service
from app.services.openai_service import openai_service
from app.llm.copilot import GrowthCopilotEngine

router = APIRouter()
copilot_engine = GrowthCopilotEngine()


# ---------------------------------------------------------
# PRIMARY SPECIFICATION ENDPOINTS (/ai/*)
# ---------------------------------------------------------

@router.post(
    "/ai/segment-customers",
    response_model=SegmentationResponse,
    summary="RFM Customer Segmentation",
    description="Clusters customers into RFM behavioral cohorts (Champions, Loyal, At Risk, Dormant) and computes churn risk."
)
def api_segment_customers(req: SegmentationRequest):
    try:
        return segmentation_service.segment_customers(req)
    except Exception as e:
        logger.error(f"Error in /ai/segment-customers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/ai/forecast-sales",
    response_model=ForecastResponse,
    summary="Sales Forecasting",
    description="Generates multi-step daily sales forecasts with 90% confidence bands using autoregressive lag models."
)
def api_forecast_sales(req: ForecastRequest):
    try:
        return forecasting_service.forecast_sales(req)
    except Exception as e:
        logger.error(f"Error in /ai/forecast-sales: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/ai/detect-anomalies",
    response_model=AnomalyDetectionResponse,
    summary="Sales Anomaly Detection",
    description="Evaluates hourly transaction telemetry to identify demand slumps, volume spikes, and statistical deviations."
)
def api_detect_anomalies(req: AnomalyDetectionRequest):
    try:
        return anomaly_service.detect_anomalies(req)
    except Exception as e:
        logger.error(f"Error in /ai/detect-anomalies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/ai/recommendations",
    response_model=RecommendationResponse,
    summary="Merchant Growth Recommendations",
    description="Returns evidence-backed, explainable recommendations with non-fabricated impact percentages."
)
def api_recommendations(req: RecommendationRequest):
    try:
        return recommendation_service.generate_recommendation(req)
    except Exception as e:
        logger.error(f"Error in /ai/recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/ai/simulate",
    response_model=WhatIfSimulateResponse,
    summary="What-If Scenario Simulation",
    description="Estimates scenario outcomes, incremental lifts, and confidence for campaign interventions based on historical merchant baselines."
)
def api_simulate(req: WhatIfSimulateRequest):
    try:
        return simulation_service.simulate_what_if(req)
    except Exception as e:
        logger.error(f"Error in /ai/simulate: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/ai/root-cause-analysis",
    response_model=RootCauseResponse,
    summary="Root-Cause Analysis & Diagnostics",
    description="Calculates comparative performance shifts across 11 operational dimensions and generates a 3-tier merchant-friendly explanation."
)
def api_root_cause_analysis(req: RootCauseRequest):
    try:
        return root_cause_service.analyze_root_cause(req)
    except Exception as e:
        logger.error(f"Error in /ai/root-cause-analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/analyze-root-cause", response_model=RootCauseResponse, include_in_schema=False)
def api_analyze_root_cause_alias(req: RootCauseRequest):
    return api_root_cause_analysis(req)


@router.post(
    "/ai/explain-analytics",
    response_model=OpenAIInsightExplanationResponse,
    summary="OpenAI Analytics Explanation",
    description="Translates structured ML analytics into a 7-part merchant-friendly narrative using OpenAI LLM (or deterministic fallback)."
)
def api_explain_analytics(req: AnalyticsExplanationRequest):
    try:
        return openai_service.explain_analytics(req)
    except Exception as e:
        logger.error(f"Error in /ai/explain-analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/openai-explanation", response_model=OpenAIInsightExplanationResponse, include_in_schema=False)
def api_openai_explanation_alias(req: AnalyticsExplanationRequest):
    return api_explain_analytics(req)


@router.post(
    "/ai/copilot/chat",
    response_model=CopilotChatResponse,
    summary="AI Growth Copilot Conversational Engine",
    description="Answers merchant business questions with verified analytical facts, cited metrics, and multi-tenant data isolation."
)
def api_copilot_chat(req: CopilotChatRequest):
    try:
        return copilot_engine.answer_query(req)
    except Exception as e:
        logger.error(f"Error in /ai/copilot/chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# BACKWARD-COMPATIBLE ENDPOINTS (/ml/* for Spring Boot backend)
# ---------------------------------------------------------

@router.get("/ml/why-tree", response_model=List[WhyTreeNode])
def get_why_tree(merchant_id: str = "m-001"):
    return anomaly_service.generate_why_tree(merchant_id)


@router.get("/ml/preset-scenarios", response_model=List[SimulationScenario])
def get_preset_scenarios():
    return simulation_service.get_preset_scenarios()


@router.post("/ml/simulate-growth", response_model=SimulationResponse)
def legacy_simulate_growth(req: SimulationRequest):
    return simulation_service.simulate_growth(req)


@router.post("/ml/segment-customers", response_model=SegmentationResponse)
def legacy_segment_customers(customers: Optional[List[Dict[str, Any]]] = None):
    # Support legacy raw list format
    req = SegmentationRequest()
    return segmentation_service.segment_customers(req)


@router.post("/ml/detect-anomalies", response_model=AnomalyDetectionResponse)
def legacy_detect_anomalies(data: Optional[Dict[str, Any]] = None):
    req = AnomalyDetectionRequest()
    return anomaly_service.detect_anomalies(req)


@router.post("/ml/copilot-chat", response_model=CopilotChatResponse)
def copilot_chat(req: CopilotChatRequest):
    return copilot_engine.answer_query(req)

