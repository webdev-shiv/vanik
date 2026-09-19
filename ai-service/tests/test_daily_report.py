import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.daily_report_service import daily_report_service
from app.schemas.daily_report import DailyReportRequest

client = TestClient(app)


def test_generate_daily_report_service():
    """Verify daily business report generation adheres to schema and mathematical truth."""
    req = DailyReportRequest(merchant_id="m-001", language="hinglish")
    res = daily_report_service.generate_daily_report(req)

    assert res.merchant_id == "m-001"
    assert res.revenue >= 0
    assert res.transactions >= 0
    assert res.average_order_value >= 0
    assert res.profit_label in ["Gross Profit", "Estimated Gross Profit"]
    assert len(res.voice_script) > 20
    assert "₹" in res.voice_script or "rupe" in res.voice_script.lower()
    assert len(res.top_products) > 0
    assert len(res.recommendations) > 0


def test_multilingual_voice_scripts():
    """Verify voice scripts in Hinglish, Hindi, and English are all synthesized correctly."""
    req_hinglish = DailyReportRequest(merchant_id="m-001", language="hinglish")
    res_hinglish = daily_report_service.generate_daily_report(req_hinglish)

    req_hindi = DailyReportRequest(merchant_id="m-001", language="hindi")
    res_hindi = daily_report_service.generate_daily_report(req_hindi)

    req_eng = DailyReportRequest(merchant_id="m-001", language="english")
    res_eng = daily_report_service.generate_daily_report(req_eng)

    assert "aaj" in res_hinglish.voice_script.lower() or "sales" in res_hinglish.voice_script.lower()
    assert "बिक्री" in res_hindi.voice_script or "लाभ" in res_hindi.voice_script
    assert "sales" in res_eng.voice_script.lower() or "today" in res_eng.voice_script.lower()


def test_zero_transactions_edge_case():
    """Verify that when 0 transactions exist, numbers are not fabricated and recommendations advise store readiness."""
    req = DailyReportRequest(merchant_id="m-999_nonexistent", date="2099-01-01")
    res = daily_report_service.generate_daily_report(req)

    assert res.revenue == 0.0
    assert res.transactions == 0
    assert res.profit == 0.0
    assert "koi transactions record nahi hue" in res.voice_script.lower() or "no transactions" in res.voice_script.lower()
    assert any("opening hours" in r.lower() or "connectivity" in r.lower() or "readiness" in r.lower() for r in res.recommendations)


def test_api_generate_endpoint():
    """Verify POST /daily-report/generate and /ai/daily-report/generate."""
    payload = {
        "merchant_id": "m-001",
        "language": "hinglish",
        "report_length": "standard"
    }
    response = client.post("/daily-report/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "revenue" in data
    assert "voice_script" in data
    assert "comparison" in data
    assert "top_products" in data


def test_api_get_today_endpoint():
    """Verify GET /daily-report/{merchant_id}/today."""
    response = client.get("/daily-report/m-001/today?language=hinglish")
    assert response.status_code == 200
    data = response.json()
    assert data["merchant_id"] == "m-001"
    assert "voice_script_hindi" in data
    assert "voice_script_hinglish" in data


def test_api_generate_audio_endpoint():
    """Verify POST /daily-report/{merchant_id}/{date}/generate-audio."""
    response = client.post(
        "/daily-report/m-001/2025-09-20/generate-audio",
        json={"merchant_id": "m-001", "language": "hinglish"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "audio_url" in data
    assert data["soundbox_status"] in ["SOUNDBOX_READY", "SOUNDBOX_OFFLINE"]
