"""
What-If Microeconomic Simulation Engine
Calculates projected revenue uplift, transaction volume, campaign execution cost,
and net return on investment (ROI) across merchant decision levers.
"""

import math
from typing import List, Dict, Any
from app.schemas import SimulationRequest, SimulationResponse, SimulationScenario, SensitivityItem

BASELINE_REVENUE = 284500.0
BASELINE_TRANSACTIONS = 1248

PRESET_SCENARIOS: List[SimulationScenario] = [
    SimulationScenario(
        id='scen-baseline',
        name='Current Baseline (No Action)',
        type='BASELINE',
        projectedRevenue=284500.0,
        projectedGrowthPercent=0.0,
        estimatedTransactions=1248,
        projectedCost=0.0,
        netGain=0.0,
        riskLevel='LOW',
        reasoning='Continuing current trajectory without intervention. Evening slump is expected to continue dragging monthly potential by ~₹37,000.'
    ),
    SimulationScenario(
        id='scen-evening-offer',
        name='Evening Combo Offer (₹49 Chai+Snack)',
        type='EVENING_OFFER',
        projectedRevenue=325000.0,
        projectedGrowthPercent=14.2,
        estimatedTransactions=1540,
        projectedCost=4200.0,
        netGain=36300.0,
        isRecommended=True,
        riskLevel='LOW',
        reasoning='Highest estimated incremental revenue with moderate campaign cost. Directly attacks the 5:00 PM – 8:30 PM valley where transaction density dropped 31%.'
    ),
    SimulationScenario(
        id='scen-winback',
        name='Win-Back Dormant Regulars',
        type='WIN_BACK',
        projectedRevenue=318000.0,
        projectedGrowthPercent=11.8,
        estimatedTransactions=1485,
        projectedCost=3600.0,
        netGain=29900.0,
        isRecommended=False,
        riskLevel='LOW',
        reasoning='Re-engages the 312 inactive customers with a personalized WhatsApp/SMS voucher. High conversion probability (28%) but slightly lower new footfall.'
    ),
    SimulationScenario(
        id='scen-weekend',
        name='Weekend Special Family Combo',
        type='WEEKEND_SPECIAL',
        projectedRevenue=305000.0,
        projectedGrowthPercent=7.2,
        estimatedTransactions=1390,
        projectedCost=2800.0,
        netGain=17700.0,
        isRecommended=False,
        riskLevel='MEDIUM',
        reasoning='Increases weekend group orders. Useful, but leaves the bigger Monday-Friday evening deficit largely unresolved.'
    )
]

class GrowthSimulatorEngine:
    def __init__(self):
        pass

    def get_preset_scenarios(self) -> List[SimulationScenario]:
        return PRESET_SCENARIOS

    def run_simulation(self, req: SimulationRequest) -> SimulationResponse:
        base_rev = BASELINE_REVENUE
        customer_multiplier = req.targetCustomerCount / 312.0
        duration_multiplier = req.durationDays / 7.0

        if req.actionType == 'EVENING_OFFER':
            uplift_factor = 0.142
        elif req.actionType == 'WIN_BACK':
            uplift_factor = 0.118
        elif req.actionType == 'WEEKEND_SPECIAL':
            uplift_factor = 0.072
        else:
            uplift_factor = 0.085

        scaled_factor = customer_multiplier * 0.7 + duration_multiplier * 0.3
        bounded_scale = min(1.4, max(0.6, scaled_factor))
        dynamic_uplift = uplift_factor * bounded_scale

        projected_rev = round(base_rev * (1.0 + dynamic_uplift), 2)
        projected_growth_percent = round(dynamic_uplift * 100.0, 1)
        projected_cost = round(req.targetCustomerCount * 12.0 + req.durationDays * 150.0, 2)
        net_gain = round(projected_rev - base_rev - projected_cost, 2)
        estimated_txns = int(round(BASELINE_TRANSACTIONS * (1.0 + dynamic_uplift * 1.1)))

        custom_scenario = SimulationScenario(
            id=f"scen-custom-{req.actionType.lower()}",
            name=f"Custom {req.actionType.replace('_', ' ')} ({req.timeWindow})",
            type='CUSTOM',
            projectedRevenue=projected_rev,
            projectedGrowthPercent=projected_growth_percent,
            estimatedTransactions=estimated_txns,
            projectedCost=projected_cost,
            netGain=net_gain,
            riskLevel='MEDIUM' if projected_cost > 6000 else 'LOW',
            reasoning=f"Tailored simulation targeting {req.targetCustomerCount} customers over {req.durationDays} days."
        )

        comparison = [
            PRESET_SCENARIOS[0],
            custom_scenario,
            PRESET_SCENARIOS[1],
            PRESET_SCENARIOS[2]
        ]

        sensitivity_matrix = [
            SensitivityItem(discount=39.0, projectedRevenue=round(base_rev * 1.11, 2), roi=7.8),
            SensitivityItem(discount=49.0, projectedRevenue=round(base_rev * 1.142, 2), roi=9.6),
            SensitivityItem(discount=59.0, projectedRevenue=round(base_rev * 1.12, 2), roi=8.2),
            SensitivityItem(discount=69.0, projectedRevenue=round(base_rev * 1.08, 2), roi=5.4)
        ]

        return SimulationResponse(
            scenario=custom_scenario,
            comparison=comparison,
            sensitivityMatrix=sensitivity_matrix
        )
