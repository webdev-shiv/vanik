package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public class RootCauseDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RootCauseRequestDto {
        @JsonProperty("merchant_id")
        private String merchantId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RootCauseResponseDto {
        @JsonProperty("merchant_id")
        private String merchantId;

        @JsonProperty("overall_change")
        private double overallChange;

        @JsonProperty("direction")
        private String direction;

        @JsonProperty("contributors")
        private List<ContributorItemDto> contributors;

        @JsonProperty("recommended_actions")
        private List<String> recommendedActions;

        @JsonProperty("explanation")
        private ExplanationTierDto explanation;

        @JsonProperty("detailed_metrics")
        private Map<String, Object> detailedMetrics;

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
    public static class ContributorItemDto {
        @JsonProperty("factor")
        private String factor;

        @JsonProperty("change_percent")
        private double changePercent;

        @JsonProperty("contribution")
        private String contribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExplanationTierDto {
        @JsonProperty("observed_facts")
        private List<String> observedFacts;

        @JsonProperty("inferred_contributors")
        private List<String> inferredContributors;

        @JsonProperty("recommendations")
        private List<String> recommendations;

        @JsonProperty("causality_disclaimer")
        private String causalityDisclaimer;
    }
}
