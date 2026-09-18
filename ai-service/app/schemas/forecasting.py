"""
Pydantic Schemas for Sales Forecasting.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class DailyRevenueRecord(BaseModel):
    date: str = Field(..., description="Date formatted as YYYY-MM-DD")
    revenue: float = Field(..., ge=0.0, description="Total daily sales in INR")
    transaction_count: Optional[int] = Field(None, ge=0, description="Daily transaction count")


class ForecastRequest(BaseModel):
    merchant_id: str = Field("m-001", description="Merchant UUID or identifier")
    horizon_days: int = Field(7, ge=1, le=30, description="Forecast horizon in days (e.g. 7 or 14)")
    history: Optional[List[DailyRevenueRecord]] = Field(
        None,
        description="Historical daily sales telemetry (at least 14 days recommended). If omitted, uses merchant historical data."
    )


class DailyForecast(BaseModel):
    date: str
    day_of_week: str
    predicted_revenue: float
    lower_bound_90: float
    upper_bound_90: float
    trend: str = Field("STABLE", description="UP, DOWN, or STABLE")


class ForecastResponse(BaseModel):
    merchant_id: str
    horizon_days: int
    total_projected_revenue: float
    avg_daily_revenue: float
    model_version: str
    confidence_interval: str = "90%"
    daily_forecasts: List[DailyForecast]
