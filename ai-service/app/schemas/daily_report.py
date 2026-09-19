from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ProductPerformanceMetric(BaseModel):
    product_name: str
    quantity: int
    revenue: float
    trend: str = "STABLE"  # "UP", "DOWN", "STABLE"


class ComparisonMetrics(BaseModel):
    vs_yesterday: Optional[float] = None  # Percentage difference, e.g. -8.0%
    vs_7_day_average: Optional[float] = None  # Percentage difference, e.g. +3.2%
    yesterday_revenue: Optional[float] = None
    seven_day_avg_revenue: Optional[float] = None


class DailyReportRequest(BaseModel):
    merchant_id: str = Field(default="m-001", description="Merchant identifier")
    date: Optional[str] = Field(default=None, description="Report date in YYYY-MM-DD format (defaults to latest transaction date or today)")
    language: Optional[str] = Field(default="hinglish", description="Voice script language: hinglish, hindi, or english")
    report_length: Optional[str] = Field(default="standard", description="Report duration: short (30s) or standard (45s)")
    includes: Optional[List[str]] = Field(default=None, description="Sections to include in voice script")


class DailyReportResponse(BaseModel):
    id: str
    merchant_id: str
    date: str
    revenue: float
    transactions: int
    average_order_value: float
    profit: Optional[float] = None
    profit_margin: Optional[float] = None
    profit_label: str = "Estimated Gross Profit"
    has_reliable_cost: bool = False
    data_sufficiency: str = "HIGH"  # "HIGH", "MEDIUM", "INSUFFICIENT"
    data_sufficiency_message: Optional[str] = None
    yesterday_diff_amount: Optional[float] = None
    yesterday_diff_direction: Optional[str] = None
    comparison: ComparisonMetrics
    top_products: List[ProductPerformanceMetric] = []
    declining_products: List[ProductPerformanceMetric] = []
    peak_hours: List[str] = []
    slow_hours: List[str] = []
    insights: List[str] = []
    recommendations: List[str] = []
    voice_script: str
    voice_script_hinglish: str
    voice_script_hindi: str
    voice_script_english: str
    audio_url: Optional[str] = None
    language: str = "hinglish"
    generated_at: str
    status: str = "READY"
    soundbox_status: str = "SOUNDBOX_OFFLINE"
    soundbox_message: str = "Web/Device Audio Active (Soundbox hardware not connected)"


class GenerateAudioRequest(BaseModel):
    merchant_id: str = "m-001"
    language: Optional[str] = "hinglish"
    voice_name: Optional[str] = None


class GenerateAudioResponse(BaseModel):
    merchant_id: str
    date: str
    audio_url: str
    duration_seconds: float
    language: str
    format: str = "audio/wav"
    soundbox_status: str
    voice_script: str
