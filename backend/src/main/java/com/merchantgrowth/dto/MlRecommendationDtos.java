package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class MlRecommendationDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MlRecommendationRequestDto {
        @JsonProperty("merchant_id")
        private String merchantId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MlRecommendationResponseDto {
        @JsonProperty("merchant_id")
        private String merchantId;

        @JsonProperty("problem")
        private String problem;

        @JsonProperty("evidence")
        private List<String> evidence;

        @JsonProperty("recommended_action")
        private String recommendedAction;

        @JsonProperty("estimated_impact")
        private EstimatedImpactDto estimatedImpact;

        @JsonProperty("confidence")
        private double confidence;

        @JsonProperty("available")
        @Builder.Default
        private boolean available = true;

        @JsonProperty("message")
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EstimatedImpactDto {
        @JsonProperty("revenue_change_percent")
        private double revenueChangePercent;

        @JsonProperty("transaction_change_percent")
        private double transactionChangePercent;
    }
}
