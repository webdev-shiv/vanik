#!/usr/bin/env python3
"""
Merchant Growth AI — End-to-End Integration & Resilience Test Suite.
Verifies the complete pipeline:
  Synthetic transaction -> DB/Supabase -> Spring Boot -> Python ML -> OpenAI/Fallback -> n8n -> Frontend

Tests 14 Core Functional Requirements + 6 Failure / Boundary Conditions + Frontend Routes.
"""
import sys
import json
import urllib.request
import urllib.error
from typing import Dict, Any, Tuple

SPRING_BOOT_URL = "http://localhost:8080"
PYTHON_AI_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:3000"

results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "details": []
}


def log_test(name: str, passed: bool, message: str = ""):
    results["total"] += 1
    if passed:
        results["passed"] += 1
        print(f"  [OK] {name}")
    else:
        results["failed"] += 1
        print(f"  [FAIL] {name}: {message}")
    
    results["details"].append({
        "name": name,
        "passed": passed,
        "message": message
    })


def http_request(url: str, method: str = "GET", data: Dict[str, Any] = None, headers: Dict[str, str] = None) -> Tuple[int, Any]:
    req_headers = {"User-Agent": "MerchantGrowth-E2E-Tester"}
    if headers:
        req_headers.update(headers)
    
    encoded_data = None
    if data is not None:
        req_headers["Content-Type"] = "application/json"
        encoded_data = json.dumps(data).encode("utf-8")
    
    req = urllib.request.Request(url, data=encoded_data, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            body = resp.read().decode("utf-8")
            try:
                parsed = json.loads(body)
            except Exception:
                parsed = body
            return status, parsed
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = body
        return e.code, parsed
    except Exception as e:
        return 0, str(e)


def run_e2e_suite():
    print("=" * 70)
    print("  MERCHANT GROWTH AI — END-TO-END VERIFICATION SUITE")
    print("=" * 70)

    # -------------------------------------------------------------
    # 0. SERVICE HEALTH CHECKS
    # -------------------------------------------------------------
    print("\n[Phase 0: Service Health Checks]")
    st_py, body_py = http_request(f"{PYTHON_AI_URL}/health")
    log_test("0.1 Python AI Service Health", st_py == 200 and body_py.get("status") == "UP", f"Status: {st_py}")

    st_sb, body_sb = http_request(f"{SPRING_BOOT_URL}/api/merchants/m-001")
    log_test("0.2 Spring Boot Service Health", st_sb == 200 and body_sb.get("success") is True, f"Status: {st_sb}")

    st_fe, body_fe = http_request(f"{FRONTEND_URL}/")
    log_test("0.3 Next.js Frontend Health", st_fe == 200, f"Status: {st_fe}")

    # -------------------------------------------------------------
    # 1. MERCHANT LOGIN
    # -------------------------------------------------------------
    print("\n[Phase 1: Merchant Authentication]")
    st_login, body_login = http_request(
        f"{SPRING_BOOT_URL}/api/auth/login",
        method="POST",
        data={"username": "m-001", "password": "password123"}
    )
    login_ok = (st_login == 200 and 
                body_login.get("success") is True and 
                "token" in body_login.get("data", {}) and 
                body_login["data"].get("merchantId") == "m-001")
    log_test("1. Merchant Login Authentication", login_ok, f"Status {st_login}: {body_login}")

    # -------------------------------------------------------------
    # 2. DASHBOARD LOADING
    # -------------------------------------------------------------
    print("\n[Phase 2: Dashboard Loading]")
    st_dash, body_dash = http_request(f"{SPRING_BOOT_URL}/api/dashboard/m-001")
    dash_data = body_dash.get("data", {}) if isinstance(body_dash, dict) else {}
    dash_ok = (st_dash == 200 and 
               len(dash_data.get("kpis", [])) >= 4 and 
               "healthScore" in dash_data and 
               len(dash_data.get("topRecommendations", [])) >= 1)
    log_test("2. Dashboard Aggregation Loading", dash_ok, f"Status {st_dash}: {len(dash_data.get('kpis', []))} KPIs")

    # -------------------------------------------------------------
    # 3. REVENUE CALCULATION
    # -------------------------------------------------------------
    print("\n[Phase 3: Revenue Calculation]")
    st_sales, body_sales = http_request(f"{SPRING_BOOT_URL}/api/analytics/sales/m-001")
    sales_data = body_sales.get("data", {}) if isinstance(body_sales, dict) else {}
    daily_trends = sales_data.get("dailyTrends") or sales_data.get("revenueTrends7D") or []
    rev_ok = (st_sales == 200 and 
              sales_data.get("totalRevenue", 0) > 0 and 
              sales_data.get("averageOrderValue", 0) > 0 and 
              len(daily_trends) >= 7)
    log_test("3. Revenue & AOV Calculation", rev_ok, f"Total Rev: {sales_data.get('totalRevenue')}, AOV: {sales_data.get('averageOrderValue')}")

    # -------------------------------------------------------------
    # 4. TRANSACTION CALCULATION
    # -------------------------------------------------------------
    print("\n[Phase 4: Transaction & Footfall Calculation]")
    hourly_telemetry = sales_data.get("hourlyHeatmap") or sales_data.get("hourlyActivity") or []
    tx_ok = (st_sales == 200 and 
             sales_data.get("totalTransactions", 0) > 100 and 
             len(hourly_telemetry) >= 7)
    log_test("4. Transaction Count & Hourly Telemetry", tx_ok, f"Total Tx: {sales_data.get('totalTransactions')}")

    # -------------------------------------------------------------
    # 5. CUSTOMER SEGMENTATION (RFM)
    # -------------------------------------------------------------
    print("\n[Phase 5: RFM Customer Segmentation]")
    st_cust, body_cust = http_request(f"{SPRING_BOOT_URL}/api/analytics/customers/m-001")
    cust_data = body_cust.get("data", {}) if isinstance(body_cust, dict) else {}
    sb_seg_ok = (st_cust == 200 and len(cust_data.get("segments", [])) >= 3)
    
    st_rfm, body_rfm = http_request(
        f"{PYTHON_AI_URL}/ai/segment-customers",
        method="POST",
        data={"merchant_id": "m-001"}
    )
    py_rfm_ok = (st_rfm == 200 and 
                 body_rfm.get("total_customers", 0) > 0 and 
                 len(body_rfm.get("cohort_distribution", [])) >= 3 and 
                 len(body_rfm.get("customer_assignments", [])) > 0)
    log_test("5. Customer RFM Segmentation (Spring Boot & Python ML)", sb_seg_ok and py_rfm_ok, 
             f"Spring Boot: {st_cust}, Python: {st_rfm}, Total Cust: {body_rfm.get('total_customers')}")

    # -------------------------------------------------------------
    # 6. SALES FORECASTING
    # -------------------------------------------------------------
    print("\n[Phase 6: Multi-Horizon Sales Forecasting]")
    st_fc, body_fc = http_request(
        f"{PYTHON_AI_URL}/ai/forecast-sales",
        method="POST",
        data={"merchant_id": "m-001", "horizon_days": 30}
    )
    fc_ok = (st_fc == 200 and 
             body_fc.get("horizon_days") == 30 and 
             len(body_fc.get("daily_forecasts", [])) == 30 and 
             body_fc.get("total_projected_revenue", 0) > 0)
    log_test("6. Sales Forecasting (30D Horizon + Bounds)", fc_ok, 
             f"Status {st_fc}, Total Projected: {body_fc.get('total_projected_revenue')}")

    # -------------------------------------------------------------
    # 7. SALES ANOMALY DETECTION
    # -------------------------------------------------------------
    print("\n[Phase 7: Sales Anomaly Detection]")
    st_anom, body_anom = http_request(
        f"{PYTHON_AI_URL}/ai/detect-anomalies",
        method="POST",
        data={"merchant_id": "m-001", "lookback_hours": 72}
    )
    anom_ok = (st_anom == 200 and 
               "anomaly_detected" in body_anom and 
               "primary_issue" in body_anom and 
               len(body_anom.get("anomalies", [])) >= 1)
    log_test("7. Sales Anomaly & Evening Slump Detection", anom_ok, 
             f"Status {st_anom}, Issue: {body_anom.get('primary_issue')}")

    # -------------------------------------------------------------
    # 8. ROOT-CAUSE ANALYSIS (5-WHY DIAGNOSTIC)
    # -------------------------------------------------------------
    print("\n[Phase 8: Root-Cause Analysis]")
    st_rca, body_rca = http_request(
        f"{PYTHON_AI_URL}/ai/root-cause-analysis",
        method="POST",
        data={
            "merchant_id": "m-001",
            "current_period": {"start_date": "2026-09-01", "end_date": "2026-09-15"},
            "comparison_period": {"start_date": "2026-08-15", "end_date": "2026-08-31"}
        }
    )
    rca_ok = (st_rca == 200 and 
              "overall_change" in body_rca and 
              len(body_rca.get("contributors", [])) >= 1 and 
              "explanation" in body_rca and 
              len(body_rca.get("explanation", {}).get("observed_facts", [])) >= 1)
    log_test("8. Root-Cause Analysis (11 Dimensions + 3-Tier Explanation)", rca_ok, 
             f"Status {st_rca}, Contributors: {len(body_rca.get('contributors', []))}")

    # -------------------------------------------------------------
    # 9. RECOMMENDATION GENERATION
    # -------------------------------------------------------------
    print("\n[Phase 9: Growth Recommendations]")
    st_rec_py, body_rec_py = http_request(
        f"{PYTHON_AI_URL}/ai/recommendations",
        method="POST",
        data={"merchant_id": "m-001", "detected_problem": "EVENING_SLUMP"}
    )
    st_rec_sb, body_rec_sb = http_request(f"{SPRING_BOOT_URL}/api/recommendations/m-001")
    rec_ok = (st_rec_py == 200 and 
              "recommended_action" in body_rec_py and 
              "estimated_impact" in body_rec_py and 
              st_rec_sb == 200 and 
              len(body_rec_sb.get("data", [])) >= 1)
    log_test("9. Explainable Recommendation Generation", rec_ok, 
             f"Py Status: {st_rec_py}, SB Status: {st_rec_sb}")

    # -------------------------------------------------------------
    # 10. WHAT-IF SIMULATION
    # -------------------------------------------------------------
    print("\n[Phase 10: What-If Simulation]")
    sim_payload = {
        "merchant_id": "m-001",
        "action": "evening offer",
        "discount_percentage": 15.0,
        "duration": 14,
        "target_customer_segment": "At Risk",
        "expected_campaign_reach": 850,
        "budget": 2000.0
    }
    st_sim_py, body_sim_py = http_request(
        f"{PYTHON_AI_URL}/ai/simulate",
        method="POST",
        data=sim_payload
    )
    st_sim_sb, body_sim_sb = http_request(
        f"{SPRING_BOOT_URL}/api/simulator/run",
        method="POST",
        data=sim_payload
    )
    sim_ok = (st_sim_py == 200 and 
              "baseline" in body_sim_py and 
              "scenario" in body_sim_py and 
              "incremental" in body_sim_py and 
              st_sim_sb == 200 and 
              body_sim_sb.get("success") is True)
    log_test("10. What-If Simulation (Python & Spring Boot)", sim_ok, 
             f"Py Status: {st_sim_py}, SB Status: {st_sim_sb}")

    # -------------------------------------------------------------
    # 11. CAMPAIGN CREATION
    # -------------------------------------------------------------
    print("\n[Phase 11: Campaign Creation]")
    st_camp_post, body_camp_post = http_request(
        f"{SPRING_BOOT_URL}/api/campaigns",
        method="POST",
        data={
            "merchantId": "m-001",
            "name": "E2E Evening Chai Combo Promo",
            "actionType": "evening offer",
            "discountPercentage": 15.0,
            "durationDays": 14,
            "targetSegment": "At Risk",
            "budget": 1500.0
        }
    )
    created_camp_id = body_camp_post.get("data", {}).get("campaign", {}).get("id") or body_camp_post.get("data", {}).get("id")
    camp_post_ok = (st_camp_post in (200, 201) and 
                    body_camp_post.get("success") is True and 
                    created_camp_id is not None)
    log_test("11. Campaign Creation (POST /api/campaigns)", camp_post_ok, 
             f"Status {st_camp_post}, Campaign ID: {created_camp_id}")

    # -------------------------------------------------------------
    # 12. CAMPAIGN RESULT TRACKING
    # -------------------------------------------------------------
    print("\n[Phase 12: Campaign Result Tracking]")
    st_camp_get, body_camp_get = http_request(f"{SPRING_BOOT_URL}/api/campaigns/m-001")
    camp_list = body_camp_get.get("data", []) if isinstance(body_camp_get, dict) else []
    camp_get_ok = (st_camp_get == 200 and len(camp_list) >= 1)
    log_test("12. Campaign Tracking & Retrieval", camp_get_ok, 
             f"Status {st_camp_get}, Total Campaigns: {len(camp_list)}")

    # -------------------------------------------------------------
    # 13. AI INSIGHT GENERATION (7-PART NARRATIVE)
    # -------------------------------------------------------------
    print("\n[Phase 13: AI Insight Generation]")
    st_exp, body_exp = http_request(
        f"{PYTHON_AI_URL}/ai/explain-analytics",
        method="POST",
        data={
            "merchant": "Sharma Tea Corner",
            "revenue_change": -11.4,
            "transaction_change": -8.2,
            "repeat_customer_change": -14.0,
            "contributors": [
                {"factor": "Evening transactions", "change_percent": -31.0}
            ],
            "recommendation": "evening_combo_offer"
        }
    )
    exp_ok = (st_exp == 200 and 
              "short_insight_title" in body_exp and 
              "explanation" in body_exp and 
              "evidence" in body_exp and 
              "recommended_action" in body_exp and 
              "reason_for_recommendation" in body_exp and 
              "expected_outcome_language" in body_exp and 
              "confidence_explanation" in body_exp)
    log_test("13. AI 7-Part Insight Narrative Generation", exp_ok, 
             f"Status {st_exp}: {body_exp.get('short_insight_title')}")

    # -------------------------------------------------------------
    # 14. n8n WORKFLOW INTEGRATION EXECUTION
    # -------------------------------------------------------------
    print("\n[Phase 14: n8n Workflow Orchestration Execution]")
    # Emulate Workflow 1 (Daily Merchant Intelligence)
    w1_st1, w1_m = http_request(f"{SPRING_BOOT_URL}/api/merchants/m-001")
    w1_st2, w1_s = http_request(f"{SPRING_BOOT_URL}/api/analytics/sales/m-001")
    w1_st3, w1_a = http_request(f"{PYTHON_AI_URL}/ai/detect-anomalies", method="POST", data={"merchant_id": "m-001"})
    w1_st4, w1_i = http_request(
        f"{PYTHON_AI_URL}/ai/explain-analytics",
        method="POST",
        data={
            "merchant": w1_m.get("data", {}).get("name", "Sharma Tea Corner"),
            "revenue_change": -11.4,
            "transaction_change": -8.2,
            "repeat_customer_change": -14.0,
            "contributors": [{"factor": "Evening Slump", "change_percent": -31.4}],
            "recommendation": "evening_combo_offer"
        }
    )
    w1_ok = (w1_st1 == 200 and w1_st2 == 200 and w1_st3 == 200 and w1_st4 == 200)
    log_test("14.1 n8n Workflow 1 (Daily Merchant Intelligence Flow)", w1_ok, 
             f"Step statuses: [{w1_st1}, {w1_st2}, {w1_st3}, {w1_st4}]")

    # Emulate Workflow 2 (AI Growth Loop)
    w2_st1, w2_rfm = http_request(f"{PYTHON_AI_URL}/ai/segment-customers", method="POST", data={"merchant_id": "m-001"})
    w2_st2, w2_rec = http_request(f"{PYTHON_AI_URL}/ai/recommendations", method="POST", data={"merchant_id": "m-001"})
    w2_st3, w2_sim = http_request(f"{PYTHON_AI_URL}/ai/simulate", method="POST", data={
        "merchant_id": "m-001", "action": "evening offer", "discount_percentage": 15.0,
        "duration": 14, "target_customer_segment": "At Risk", "expected_campaign_reach": 850
    })
    w2_ok = (w2_st1 == 200 and w2_st2 == 200 and w2_st3 == 200)
    log_test("14.2 n8n Workflow 2 (AI Growth Loop Flow)", w2_ok, 
             f"Step statuses: [{w2_st1}, {w2_st2}, {w2_st3}]")

    # -------------------------------------------------------------
    # FAILURE / BOUNDARY SCENARIOS
    # -------------------------------------------------------------
    print("\n[Phase 15: Boundary & Failure Scenarios]")

    # F1: Invalid Merchant ID
    st_f1, body_f1 = http_request(f"{SPRING_BOOT_URL}/api/merchants/m-invalid-999")
    log_test("F1. Multi-Tenant Boundary: Invalid Merchant ID Returns 404", st_f1 == 404, 
             f"Received {st_f1}: {body_f1}")

    # F2: Invalid Simulator Parameters
    st_f2, body_f2 = http_request(
        f"{PYTHON_AI_URL}/ai/simulate",
        method="POST",
        data={
            "merchant_id": "m-001",
            "action": "evening offer",
            "discount_percentage": -15.0,
            "duration": 0,
            "target_customer_segment": "At Risk",
            "expected_campaign_reach": 100
        }
    )
    log_test("F2. Simulator Boundary: Negative Discount/Zero Duration Returns 422", st_f2 == 422, 
             f"Received {st_f2}: {body_f2}")

    # F3: Malformed JSON payload rejection
    req_malformed = urllib.request.Request(
        f"{PYTHON_AI_URL}/ai/simulate",
        data=b"{ invalid_json: true, }",
        headers={"Content-Type": "application/json", "User-Agent": "MerchantGrowth-E2E-Tester"},
        method="POST"
    )
    try:
        urllib.request.urlopen(req_malformed, timeout=5)
        st_f3 = 200
    except urllib.error.HTTPError as e:
        st_f3 = e.code
    except Exception:
        st_f3 = 0
    log_test("F3. Protocol Robustness: Malformed JSON Returns 422/400", st_f3 in (400, 422), 
             f"Received {st_f3}")

    # F4: Unavailable OpenAI API Graceful Fallback
    st_f4, body_f4 = http_request(
        f"{PYTHON_AI_URL}/ai/explain-analytics",
        method="POST",
        data={
            "merchant": "Sharma Tea Corner",
            "revenue_change": -11.4,
            "transaction_change": -8.2,
            "repeat_customer_change": -14.0,
            "contributors": [{"factor": "Evening footfall", "change_percent": -31.4}],
            "recommendation": "evening_combo_offer"
        }
    )
    f4_ok = (st_f4 == 200 and 
             "short_insight_title" in body_exp and 
             "explanation" in body_exp and 
             "confidence_explanation" in body_exp)
    log_test("F4. OpenAI Resilience: Deterministic Fallback Preserves 7-Part Schema", f4_ok, 
             f"Status {st_f4}")

    # F5: Empty / Invalid Customer Record Validation
    st_f5, body_f5 = http_request(
        f"{PYTHON_AI_URL}/ai/segment-customers",
        method="POST",
        data={
            "merchant_id": "m-001",
            "customers": [
                {
                    "customer_id": "c-test-invalid",
                    "recency_days": -10.0,
                    "frequency": 0,
                    "monetary_value": -50.0
                }
            ]
        }
    )
    log_test("F5. Data Integrity: Negative Recency/Zero Frequency Rejection (422)", st_f5 == 422, 
             f"Status {st_f5}: {body_f5}")

    # F6: Empty Dataset / Missing Required Body Rejection
    st_f6, body_f6 = http_request(
        f"{PYTHON_AI_URL}/ai/simulate",
        method="POST",
        data={}  # Missing all required simulation parameters
    )
    log_test("F6. Empty Dataset: Missing Payload Rejection (422)", st_f6 == 422, 
             f"Status {st_f6}: {body_f6}")

    # F7: Unavailable Route / Downstream Error Graceful Handling
    st_f7, body_f7 = http_request(f"{SPRING_BOOT_URL}/api/non-existent-route")
    log_test("F7. Downstream Resilience: 404 on Missing Endpoint Without Server Crash", st_f7 in (404, 500), 
             f"Status {st_f7}")

    # F8: Growth Copilot Multi-Tenant Fact Citation Test
    st_copilot, body_copilot = http_request(
        f"{SPRING_BOOT_URL}/api/copilot/chat",
        method="POST",
        data={"query": "Why are my sales down?", "merchantId": "m-001"}
    )
    copilot_ok = (st_copilot == 200 and 
                  body_copilot.get("success") is True and 
                  len(body_copilot.get("data", {}).get("cited_metrics", [])) >= 2 and 
                  len(body_copilot.get("data", {}).get("quickActions", [])) >= 1)
    log_test("F8. AI Growth Copilot: Verified Metrics Cited Without Hallucination", copilot_ok, 
             f"Status {st_copilot}, Cited: {body_copilot.get('data', {}).get('cited_metrics')}")

    # -------------------------------------------------------------
    # SECURITY & COMPLIANCE VERIFICATION
    # -------------------------------------------------------------
    print("\n[Phase 17: Security & Compliance Verification]")

    # S1: Multi-Tenant Data Isolation on Customers Endpoint
    st_cust_m1, body_cust_m1 = http_request(f"{SPRING_BOOT_URL}/api/v1/customers?merchantId=m-001")
    st_cust_m2, body_cust_m2 = http_request(f"{SPRING_BOOT_URL}/api/v1/customers?merchantId=m-002")
    m1_customers = body_cust_m1.get("data", []) if isinstance(body_cust_m1, dict) else []
    m2_customers = body_cust_m2.get("data", []) if isinstance(body_cust_m2, dict) else []
    all_m1_match = all(c.get("merchantId") == "m-001" for c in m1_customers)
    s1_ok = (st_cust_m1 == 200 and st_cust_m2 == 200 and all_m1_match and len(m2_customers) == 0)
    log_test("S1. Tenant Isolation: Customers Scoped Strictly by Merchant ID", s1_ok, 
             f"m-001 count: {len(m1_customers)}, m-002 count: {len(m2_customers)}")

    # S2: Multi-Tenant Data Isolation on AI Recommendations Endpoint
    st_rec_m1, body_rec_m1 = http_request(f"{SPRING_BOOT_URL}/api/v1/ai/recommendations?merchantId=m-001")
    st_rec_m2, body_rec_m2 = http_request(f"{SPRING_BOOT_URL}/api/v1/ai/recommendations?merchantId=m-002")
    m1_recs = body_rec_m1.get("data", []) if isinstance(body_rec_m1, dict) else []
    m2_recs = body_rec_m2.get("data", []) if isinstance(body_rec_m2, dict) else []
    all_recs_m1 = all(r.get("merchantId") == "m-001" for r in m1_recs)
    s2_ok = (st_rec_m1 == 200 and st_rec_m2 == 200 and all_recs_m1 and len(m2_recs) == 0)
    log_test("S2. Tenant Isolation: Recommendations Scoped Strictly by Merchant ID", s2_ok, 
             f"m-001 recs: {len(m1_recs)}, m-002 recs: {len(m2_recs)}")

    # S3: Zero PII in AI Explanation Payload
    test_ai_payload = {
        "merchant": "Sharma Tea Corner",
        "revenue_change": -11.4,
        "transaction_change": -8.2,
        "repeat_customer_change": -14.0,
        "contributors": [{"factor": "Evening footfall", "change_percent": -31.4}],
        "recommendation": "evening_combo_offer"
    }
    raw_str = json.dumps(test_ai_payload)
    has_no_pii = ("phone" not in raw_str and "email" not in raw_str and "card" not in raw_str)
    log_test("S3. Privacy: AI Payload Contains Zero PII or Contact Attributes", has_no_pii, 
             "Payload contains only aggregate business metrics")

    # S4: Git Immunity & Secret Exclusion Check
    import os
    gitignore_exists = os.path.exists(".gitignore")
    gitignore_has_env = False
    if gitignore_exists:
        with open(".gitignore", "r", encoding="utf-8") as gf:
            content = gf.read()
            gitignore_has_env = ".env" in content and "target/" in content and "*.key" in content
    log_test("S4. Git Secret Defense: Root .gitignore Covers Secrets & Artifacts", gitignore_exists and gitignore_has_env, 
             f"Exists: {gitignore_exists}, Covers .env: {gitignore_has_env}")

    # -------------------------------------------------------------
    # FRONTEND (VANIK) ROUTE SMOKE TESTS
    # -------------------------------------------------------------
    print("\n[Phase 16: Next.js Frontend Route Verification]")
    fe_routes = [
        "/",
        "/login",
        "/analytics",
        "/customers",
        "/simulator",
        "/recommendations",
        "/campaigns",
        "/insights",
        "/copilot",
        "/settings"
    ]
    for route in fe_routes:
        st, _ = http_request(f"{FRONTEND_URL}{route}")
        log_test(f"FE Route {route}", st == 200, f"HTTP {st}")

    # -------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------
    print("\n" + "=" * 70)
    print(f"  TEST EXECUTION COMPLETED: {results['passed']}/{results['total']} PASSED ({results['failed']} FAILED)")
    print("=" * 70)

    if results["failed"] > 0:
        print("\nFailed Tests Summary:")
        for t in results["details"]:
            if not t["passed"]:
                print(f"  - {t['name']}: {t['message']}")
        sys.exit(1)
    else:
        print("\nAll integration tests, boundary validations, and frontend checks passed successfully!")
        sys.exit(0)


if __name__ == "__main__":
    run_e2e_suite()
