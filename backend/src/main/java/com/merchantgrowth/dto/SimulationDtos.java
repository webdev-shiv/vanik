package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class SimulationDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RunSimulationRequestDto {
        @JsonProperty("merchant_id")
        @JsonAlias({"merchant_id", "merchantId"})
        private String merchantId;

        @NotBlank(message = "Action is required (e.g. evening offer, weekend offer, loyalty campaign, win-back campaign, bundle offer, targeted discount)")
        private String action;

        @Min(value = 0, message = "Discount percentage cannot be negative")
        @Max(value = 100, message = "Discount percentage cannot exceed 100")
        @JsonProperty("discount_percentage")
        @JsonAlias({"discount_percentage", "discountPercentage"})
        private double discountPercentage;

        @Min(value = 1, message = "Duration must be at least 1 day")
        @Max(value = 365, message = "Duration cannot exceed 365 days")
        @JsonProperty("duration")
        @JsonAlias({"duration", "durationDays", "duration_days"})
        private int duration;

        @NotBlank(message = "Target customer segment is required (e.g. Champions, Loyal Customers, At Risk, Dormant / Lost, All Customers)")
        @JsonProperty("target_customer_segment")
        @JsonAlias({"target_customer_segment", "targetCustomerSegment"})
        private String targetCustomerSegment;

        @Min(value = 1, message = "Expected campaign reach must be at least 1")
        @JsonProperty("expected_campaign_reach")
        @JsonAlias({"expected_campaign_reach", "expectedReach", "expected_reach"})
        private int expectedCampaignReach;

        private Double budget;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetricsDto {
        private double revenue;
        private int transactions;
        private int customers;
        @JsonProperty("average_order_value")
        @JsonAlias({"average_order_value", "averageOrderValue"})
        private double averageOrderValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IncrementalDto {
        private double revenue;
        private int transactions;
        private int customers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RunSimulationResponseDto {
        private MetricsDto baseline;
        private MetricsDto scenario;
        private IncrementalDto incremental;
        private double confidence;
        @JsonProperty("merchant_id")
        @JsonAlias({"merchant_id", "merchantId"})
        private String merchantId;
        private String action;
        @JsonProperty("duration_days")
        @JsonAlias({"duration_days", "durationDays", "duration"})
        private int durationDays;
        @JsonProperty("target_customer_segment")
        @JsonAlias({"target_customer_segment", "targetCustomerSegment"})
        private String targetCustomerSegment;
        private String disclaimer;
        @JsonProperty("simulation_notes")
        @JsonAlias({"simulation_notes", "simulationNotes"})
        private List<String> simulationNotes;
    }
}
