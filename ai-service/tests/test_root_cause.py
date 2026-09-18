"""
Unit tests for Root-Cause Analysis Service and 11-dimension metric decomposition.
"""
import pytest
from app.schemas.root_cause import RootCauseRequest, PeriodSpec
from app.services.root_cause_service import root_cause_service


def test_root_cause_default_merchant():
    req = RootCauseRequest(merchant_id="m-001")
    res = root_cause_service.analyze_root_cause(req)

    # 1. Top-level response schema
    assert res.merchant_id == "m-001"
    assert isinstance(res.overall_change, (int, float))
    assert res.direction in ["up", "down", "flat"]
    assert isinstance(res.contributors, list)
    assert len(res.contributors) > 0
    assert isinstance(res.recommended_actions, list)
    assert len(res.recommended_actions) > 0

    # 2. Contributors format
    for c in res.contributors:
        assert isinstance(c.factor, str)
        assert isinstance(c.change_percent, (int, float))
        assert c.contribution in ["high", "medium", "low"]

    # 3. Three-tier explanation structure
    exp = res.explanation
    assert len(exp.observed_facts) > 0
    assert len(exp.inferred_contributors) > 0
    assert len(exp.recommendations) > 0
    assert "observational" in exp.causality_disclaimer.lower()
    assert "causality" in exp.causality_disclaimer.lower()

    # 4. Detailed 11-dimension metrics
    metrics = res.detailed_metrics
    assert metrics is not None
    # Dimension 1: Revenue
    assert metrics.revenue.dimension_name == "Revenue"
    assert metrics.revenue.comparison_value > 0
    assert metrics.revenue.current_value > 0
    # Dimension 2: Transactions
    assert metrics.transactions.dimension_name == "Transactions"
    assert metrics.transactions.comparison_value > 0
    # Dimension 3: AOV
    assert metrics.average_transaction_value.dimension_name == "Average Transaction Value"
    assert metrics.average_transaction_value.current_value > 0
    # Dimension 4, 5, 6: Customer Cohorts
    assert isinstance(metrics.customers.new_customers_current, int)
    assert isinstance(metrics.customers.repeat_customers_current, int)
    assert metrics.customers.inactive_regular_customers_count >= 0
    # Dimension 7: Category breakdown
    assert len(metrics.category_breakdown) > 0
    # Dimension 8: Product breakdown
    assert len(metrics.product_breakdown_top_decliners) > 0
    # Dimension 9: Time of day
    assert len(metrics.time_of_day_breakdown) == 4
    # Dimension 10: Weekday / Weekend
    assert len(metrics.weekday_weekend_breakdown) == 2
    # Dimension 11: Campaign performance
    assert isinstance(metrics.campaign_performance, list)


def test_root_cause_custom_periods():
    req = RootCauseRequest(
        merchant_id="m-001",
        current_period=PeriodSpec(start_date="2026-08-01", end_date="2026-08-31", label="August 2026"),
        comparison_period=PeriodSpec(start_date="2026-07-01", end_date="2026-07-31", label="July 2026")
    )
    res = root_cause_service.analyze_root_cause(req)
    assert res.merchant_id == "m-001"
    assert res.detailed_metrics is not None
    assert len(res.detailed_metrics.time_of_day_breakdown) > 0
