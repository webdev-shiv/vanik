package com.merchantgrowth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationScenarioDto {
    private String id;
    private String name;
    private String type;
    private double projectedRevenue;
    private double projectedGrowthPercent;
    private int estimatedTransactions;
    private double projectedCost;
    private double netGain;
    private Boolean isRecommended;
    private String reasoning;
    private String riskLevel;
}
