"""
What-If Scenario Simulation Engine for Merchant Growth AI.
Calculates historical baselines, models intervention-specific elasticity,
and projects estimated, predicted, and simulated campaign outcomes with non-guarantee guardrails.
"""
import os
import numpy as np
import pandas as pd
from typing import List, Optional, Tuple, Dict, Any

from app.utils.logger import logger
from app.utils.model_registry import model_registry
from app.schemas.simulation import (
    WhatIfSimulateRequest,
    WhatIfSimulateResponse,
    MetricsTrio,
    IncrementalTrio,
    SimulationRequest,
    SimulationResponse,
    SimulationImpact,
    SimulationScenario,
)

TRANSACTIONS_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "data_generator", "data", "transactions.csv")
)


class SimulationService:
    def __init__(self):
        self.rec_artifact = model_registry.load_model("recommendation", "recommendation_v1.joblib")
        # Action elasticity & baseline multipliers
        self.action_profiles = {
            "evening offer": {
                "elasticity": -1.40,
                "base_awareness_lift": 8.0,
                "reach_sensitivity": 3.4,
                "segment_weights": {"at risk": 1.25, "potential loyalists": 1.20, "dormant / lost": 1.15, "regular customers": 1.10}
            },
            "weekend offer": {
                "elasticity": -1.20,
                "base_awareness_lift": 7.0,
                "reach_sensitivity": 2.8,
                "segment_weights": {"loyal customers": 1.20, "champions": 1.15, "regular customers": 1.10}
            },
            "loyalty campaign": {
                "elasticity": -0.85,
                "base_awareness_lift": 6.0,
                "reach_sensitivity": 2.2,
                "segment_weights": {"champions": 1.35, "loyal customers": 1.30}
            },
            "win-back campaign": {
                "elasticity": -1.50,
                "base_awareness_lift": 10.0,
                "reach_sensitivity": 4.0,
                "segment_weights": {"dormant / lost": 1.45, "at risk": 1.40}
            },
            "bundle offer": {
                "elasticity": -1.05,
                "base_awareness_lift": 8.5,
                "reach_sensitivity": 3.0,
                "segment_weights": {"potential loyalists": 1.20, "champions": 1.15}
            },
            "targeted discount": {
                "elasticity": -1.25,
                "base_awareness_lift": 6.5,
                "reach_sensitivity": 2.6,
                "segment_weights": {"at risk": 1.20, "loyal customers": 1.10}
            },
        }

    # ---------------------------------------------------------
    # PRIMARY WHAT-IF SIMULATION METHOD
    # ---------------------------------------------------------

    def simulate_what_if(self, req: WhatIfSimulateRequest) -> WhatIfSimulateResponse:
        merchant_id = req.merchant_id or "m-001"
        logger.info(
            f"Simulating What-If scenario: merchant={merchant_id}, action='{req.action}', "
            f"discount={req.discount_percentage}%, duration={req.duration}d, segment='{req.target_customer_segment}', reach={req.expected_campaign_reach}"
        )

        # 1. Calculate baseline from historical merchant data
        base_rev, base_txns, base_cust = self._calculate_historical_baseline(merchant_id, req.duration)

        # 2. Extract action parameters
        profile = self.action_profiles.get(req.action.lower(), self.action_profiles["targeted discount"])
        base_elasticity = profile["elasticity"]

        # Segment affinity multiplier
        seg_lower = req.target_customer_segment.lower()
        seg_multiplier = profile["segment_weights"].get(seg_lower, 1.0)
        effective_elasticity = base_elasticity * seg_multiplier

        # 3. Model volume response (%ΔQ)
        # 3a. Organic discount demand lift (subject to saturation)
        discount_frac = req.discount_percentage / 100.0
        if req.discount_percentage == 0.0:
            discount_volume_lift_pct = 0.0
        elif req.discount_percentage <= 50.0:
            # Linear microeconomic elasticity: %ΔQ = ε * %ΔP
            discount_volume_lift_pct = abs(effective_elasticity) * req.discount_percentage
        else:
            # Diminishing returns & operational ceiling above 50% discount
            normal_lift = abs(effective_elasticity) * 50.0
            excess_discount = req.discount_percentage - 50.0
            excess_lift = np.log1p(excess_discount) * 6.5
            discount_volume_lift_pct = min(85.0, normal_lift + excess_lift)

        # 3b. Reach awareness lift
        reach_lift_pct = np.log1p(req.expected_campaign_reach / 80.0) * profile["reach_sensitivity"]

        # 3c. Optional budget lift
        budget_lift_pct = 0.0
        if req.budget and req.budget > 0:
            budget_lift_pct = float(np.log1p(req.budget / 100.0) * 1.8)

        total_volume_lift_pct = discount_volume_lift_pct + reach_lift_pct + budget_lift_pct

        # 4. Projected scenario transactions and revenue
        # Price multiplier per transaction
        price_factor = max(0.05, 1.0 - discount_frac)

        # Bundle offers lift basket units
        if req.action.lower() == "bundle offer":
            price_factor *= 1.12

        projected_txns = max(1, int(round(base_txns * (1.0 + (total_volume_lift_pct / 100.0)))))
        baseline_aov = base_rev / max(1, base_txns)
        scenario_aov = baseline_aov * price_factor

        projected_revenue = round(projected_txns * scenario_aov, 2)

        # 5. Customer conversion lift
        cust_lift_factor = 1.0 + (reach_lift_pct / 150.0) + (discount_volume_lift_pct / 300.0)
        projected_customers = max(1, int(round(base_cust * cust_lift_factor)))

        # 6. Incremental calculations
        inc_revenue = round(projected_revenue - base_rev, 2)
        inc_transactions = projected_txns - base_txns

        # 7. Confidence estimation
        # Higher reach and typical discount ranges yield higher model confidence
        discount_penalty = abs(req.discount_percentage - 20.0) * 0.002
        duration_penalty = min(0.08, req.duration * 0.0008)
        confidence = float(np.clip(0.88 - discount_penalty - duration_penalty + min(0.04, req.expected_campaign_reach / 5000.0), 0.65, 0.94))
        confidence = round(confidence, 2)

        # 8. Non-guaranteed simulation notes with required terminology
        simulation_notes = [
            f"Simulated transactions are predicted to shift from {base_txns:,} to {projected_txns:,} (+{total_volume_lift_pct:.1f}% volume response).",
            f"Estimated revenue is projected at INR {projected_revenue:,.2f}, representing a simulated incremental change of INR {inc_revenue:+,.2f}.",
            f"Predicted customer participation spans approximately {projected_customers:,} unique shoppers (vs. {base_cust:,} baseline).",
            f"Scenario confidence is estimated at {confidence * 100:.0f}% based on historical response patterns for the '{req.action}' intervention."
        ]

        base_aov = round(base_rev / max(1, base_txns), 2)
        scen_aov = round(projected_revenue / max(1, projected_txns), 2)
        inc_cust = max(0, projected_customers - base_cust)

        return WhatIfSimulateResponse(
            baseline=MetricsTrio(
                revenue=base_rev,
                transactions=base_txns,
                customers=base_cust,
                average_order_value=base_aov
            ),
            scenario=MetricsTrio(
                revenue=projected_revenue,
                transactions=projected_txns,
                customers=projected_customers,
                average_order_value=scen_aov
            ),
            incremental=IncrementalTrio(
                revenue=inc_revenue,
                transactions=inc_transactions,
                customers=inc_cust
            ),
            confidence=confidence,
            merchant_id=merchant_id,
            action=req.action,
            duration_days=req.duration,
            target_customer_segment=req.target_customer_segment,
            disclaimer="Simulated revenue, transactions, and customer metrics are forward-looking statistical estimates and do not guarantee future actual revenue.",
            simulation_notes=simulation_notes
        )

    # ---------------------------------------------------------
    # HISTORICAL BASELINE EXTRACTION
    # ---------------------------------------------------------

    def _calculate_historical_baseline(self, merchant_id: str, duration_days: int) -> Tuple[float, int, int]:
        """
        Computes baseline revenue, transactions, and unique customers normalized to duration_days
        from historical transaction logs.
        """
        if os.path.exists(TRANSACTIONS_PATH):
            try:
                df = pd.read_csv(TRANSACTIONS_PATH)
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                m_tx = df[df['merchant_id'] == merchant_id]
                if len(m_tx) > 0:
                    total_days = max(1.0, (m_tx['timestamp'].max() - m_tx['timestamp'].min()).total_seconds() / 86400.0)
                    daily_rev = float(m_tx['total_amount'].sum()) / total_days
                    daily_txns = float(len(m_tx)) / total_days
                    daily_cust = float(m_tx['customer_id'].nunique()) / max(1.0, (total_days ** 0.65))

                    base_rev = round(daily_rev * duration_days, 2)
                    base_tx = max(1, int(round(daily_txns * duration_days)))
                    base_cu = max(1, int(round(daily_cust * (duration_days ** 0.65))))
                    return base_rev, base_tx, base_cu
            except Exception as e:
                logger.warning(f"Error computing historical baseline from transactions: {e}")

        # Benchmark baseline fallback for Sharma Tea Corner (m-001)
        daily_rev = 8800.0
        daily_txns = 77.0
        daily_cust = 35.0

        base_rev = round(daily_rev * duration_days, 2)
        base_tx = max(1, int(round(daily_txns * duration_days)))
        base_cu = max(1, int(round(daily_cust * (duration_days ** 0.65))))
        return base_rev, base_tx, base_cu

    # ---------------------------------------------------------
    # BACKWARD COMPATIBILITY METHODS (/ml/simulate-growth)
    # ---------------------------------------------------------

    def simulate_growth(self, req: SimulationRequest) -> SimulationResponse:
        """
        Legacy endpoint for Spring Boot backend compatibility.
        """
        baseline_revenue = 65000.0
        baseline_transactions = 1200
        baseline_aov = baseline_revenue / baseline_transactions
        default_margin = 0.40
        baseline_cost_of_goods = baseline_revenue * (1.0 - default_margin)
        baseline_net_profit = baseline_revenue - baseline_cost_of_goods

        net_price_factor = (1.0 + (req.price_change_percent / 100.0)) * (1.0 - (req.discount_percent / 100.0))
        effective_price_change_pct = (net_price_factor - 1.0) * 100.0

        organic_volume_change_pct = -1.35 * effective_price_change_pct
        marketing_volume_lift_pct = float(np.log1p(req.marketing_spend / 100.0) * 4.2) if req.marketing_spend > 0 else 0.0
        capacity_factor = 1.0 + min(0.3, req.staff_hours_increase * 0.05)

        total_volume_change_pct = max(-80.0, (organic_volume_change_pct + marketing_volume_lift_pct) * capacity_factor)

        projected_transactions = max(10, int(round(baseline_transactions * (1.0 + (total_volume_change_pct / 100.0)))))
        transactions_delta = projected_transactions - baseline_transactions

        new_aov = baseline_aov * net_price_factor
        projected_revenue = round(projected_transactions * new_aov, 2)
        revenue_delta = round(projected_revenue - baseline_revenue, 2)
        revenue_change_percent = round((revenue_delta / baseline_revenue) * 100.0, 2)
        transaction_change_percent = round((transactions_delta / baseline_transactions) * 100.0, 2)

        projected_cogs = baseline_cost_of_goods * (1.0 + (total_volume_change_pct / 100.0))
        projected_net_profit = round(projected_revenue - projected_cogs - req.marketing_spend, 2)
        profit_delta = round(projected_net_profit - baseline_net_profit, 2)
        profit_margin_change_percent = round((profit_delta / max(1.0, baseline_net_profit)) * 100.0, 2)

        estimated_roi = round(profit_delta / max(1.0, req.marketing_spend), 2) if req.marketing_spend > 0 else 0.0

        if profit_delta > 0 and revenue_delta > 0:
            verdict = "STRONG_GROWTH: Both revenue and net margin expand profitably."
        elif revenue_delta > 0 and profit_delta <= 0:
            verdict = "VOLUME_ACQUISITION: Topline revenue increases, but margins compress due to promo depth."
        else:
            verdict = "NEGATIVE_MARGIN: Price increase or promo cost dampens total net returns."

        reasoning = [
            f"Effective price per item shifts by {effective_price_change_pct:+.1f}%.",
            f"Demand volume adjusts by {total_volume_change_pct:+.1f}% based on price elasticity of -1.35.",
            f"Marketing spend contributes +{marketing_volume_lift_pct:.1f}% estimated incremental footfall.",
            f"Projected net monthly profit shifts by INR {profit_delta:+.0f} ({profit_margin_change_percent:+.1f}%)."
        ]

        return SimulationResponse(
            merchant_id=req.merchant_id,
            scenario_name="Custom Growth Lever Simulation",
            price_elasticity=-1.35,
            baseline_revenue=round(baseline_revenue, 2),
            projected_revenue=projected_revenue,
            revenue_delta=revenue_delta,
            baseline_transactions=baseline_transactions,
            projected_transactions=projected_transactions,
            transactions_delta=transactions_delta,
            baseline_net_profit=round(baseline_net_profit, 2),
            projected_net_profit=projected_net_profit,
            profit_delta=profit_delta,
            impact=SimulationImpact(
                revenue_change_percent=revenue_change_percent,
                transaction_change_percent=transaction_change_percent,
                profit_margin_change_percent=profit_margin_change_percent,
                estimated_roi=estimated_roi
            ),
            recommendation_verdict=verdict,
            reasoning=reasoning
        )

    def get_preset_scenarios(self) -> List[SimulationScenario]:
        return [
            SimulationScenario(
                id="preset-happy-hour",
                title="Evening Happy Hour (20% Off)",
                description="20% promotional discount on tea snacks combo between 5-8 PM with INR 500 promo spend.",
                discount_percent=20.0,
                price_change_percent=0.0,
                marketing_spend=500.0,
                expected_lift_pct=24.5
            ),
            SimulationScenario(
                id="preset-premium-upsell",
                title="Premium Snack Bundle (+10% Price, 15% Cashback)",
                description="Bundle premium organic snacks with 15% cashback for orders over ₹150.",
                discount_percent=15.0,
                price_change_percent=10.0,
                marketing_spend=300.0,
                expected_lift_pct=16.8
            ),
            SimulationScenario(
                id="preset-loyalty-push",
                title="Weekend Loyalty Boost (5% Discount, ₹1000 Ad)",
                description="Double points and 5% off on Paytm Soundbox QR payments during Saturday and Sunday.",
                discount_percent=5.0,
                price_change_percent=0.0,
                marketing_spend=1000.0,
                expected_lift_pct=12.2
            )
        ]

    # Alias for legacy compatibility
    simulate = simulate_growth


simulation_service = SimulationService()
