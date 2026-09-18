package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class OpenAIExplanationDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContributorItemDto {
        @NotBlank(message = "Contributor factor is required")
        private String factor;

        @JsonProperty("change_percent")
        private double changePercent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalyticsExplanationRequestDto {
        @NotBlank(message = "Merchant name is required")
        private String merchant;

        @JsonProperty("revenue_change")
        private double revenueChange;

        @JsonProperty("transaction_change")
        private double transactionChange;

        @JsonProperty("repeat_customer_change")
        private double repeatCustomerChange;

        @NotEmpty(message = "At least one contributor factor is required")
        private List<ContributorItemDto> contributors;

        @NotBlank(message = "Recommendation is required")
        private String recommendation;

        private String timeframe;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OpenAIInsightExplanationResponseDto {
        @JsonProperty("short_insight_title")
        private String shortInsightTitle;

        private String explanation;

        private List<String> evidence;

        @JsonProperty("recommended_action")
        private String recommendedAction;

        @JsonProperty("reason_for_recommendation")
        private String reasonForRecommendation;

        @JsonProperty("expected_outcome_language")
        private String expectedOutcomeLanguage;

        @JsonProperty("confidence_explanation")
        private String confidenceExplanation;
    }
}
