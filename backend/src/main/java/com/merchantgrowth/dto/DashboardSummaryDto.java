package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.merchantgrowth.entity.AIInsightEntity;
import com.merchantgrowth.entity.MerchantEntity;
import com.merchantgrowth.entity.RecommendationEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    @JsonProperty("merchant")
    private MerchantEntity merchant;

    @JsonProperty("kpis")
    private List<KpiMetricDto> kpis;

    @JsonProperty("healthScore")
    private GrowthHealthScoreDto healthScore;

    @JsonProperty("activeCampaignsCount")
    private int activeCampaignsCount;

    @JsonProperty("primaryInsight")
    private AIInsightDto primaryInsight;

    @JsonProperty("opportunities")
    private List<GrowthOpportunityDto> opportunities;

    @JsonProperty("revenueTrends")
    private List<RevenueTrendPointDto> revenueTrends;

    @JsonProperty("revenueTrends7D")
    private List<RevenueTrendPointDto> revenueTrends7D;

    @JsonProperty("recentAlerts")
    private List<AIInsightEntity> recentAlerts;

    @JsonProperty("topRecommendations")
    private List<RecommendationEntity> topRecommendations;
}
