"""
FastAPI REST API routes for VANIK Daily Business Voice Brief.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional

from app.schemas.daily_report import (
    DailyReportRequest,
    DailyReportResponse,
    GenerateAudioRequest,
    GenerateAudioResponse,
)
from app.services.daily_report_service import daily_report_service

daily_report_router = APIRouter(prefix="/daily-report", tags=["Daily Business Voice Brief"])


@daily_report_router.post(
    "/generate",
    response_model=DailyReportResponse,
    summary="Generate Daily Business Voice Brief",
)
def generate_report(request: DailyReportRequest):
    """
    Computes daily business analytics, compares with yesterday and 7-day average,
    and produces a concise natural-language voice script in Hinglish, Hindi, or English.
    """
    try:
        return daily_report_service.generate_daily_report(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate daily business report: {str(e)}",
        )


@daily_report_router.get(
    "/{merchant_id}/today",
    response_model=DailyReportResponse,
    summary="Get Today's Business Voice Brief",
)
def get_today_report(
    merchant_id: str,
    language: Optional[str] = Query("hinglish", description="Voice script language"),
    report_length: Optional[str] = Query("standard", description="short or standard"),
):
    """
    Retrieves today's (or latest available) business voice brief for the merchant.
    """
    try:
        return daily_report_service.generate_daily_report(
            DailyReportRequest(
                merchant_id=merchant_id,
                date=None,
                language=language,
                report_length=report_length,
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch today's business report: {str(e)}",
        )


@daily_report_router.get(
    "/{merchant_id}/{date}",
    response_model=DailyReportResponse,
    summary="Get Business Voice Brief for Specific Date",
)
def get_report_by_date(
    merchant_id: str,
    date: str,
    language: Optional[str] = Query("hinglish", description="Voice script language"),
    report_length: Optional[str] = Query("standard", description="short or standard"),
):
    """
    Retrieves business voice brief for a specific date (YYYY-MM-DD).
    """
    try:
        return daily_report_service.generate_daily_report(
            DailyReportRequest(
                merchant_id=merchant_id,
                date=date,
                language=language,
                report_length=report_length,
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch business report for date {date}: {str(e)}",
        )


@daily_report_router.post(
    "/{merchant_id}/{date}/generate-audio",
    response_model=GenerateAudioResponse,
    summary="Generate TTS Audio for Daily Voice Brief",
)
def generate_audio(merchant_id: str, date: str, request: GenerateAudioRequest):
    """
    Generates TTS audio parameters and dispatches/checks Soundbox status.
    """
    try:
        return daily_report_service.generate_audio_simulation(
            merchant_id=merchant_id,
            target_date_str=date,
            language=request.language or "hinglish",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate audio for date {date}: {str(e)}",
        )
