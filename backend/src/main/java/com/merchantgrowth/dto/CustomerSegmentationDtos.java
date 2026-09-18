package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class CustomerSegmentationDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerSegmentationRequestDto {
        @JsonProperty("merchant_id")
        private String merchantId;

        @JsonProperty("customers")
        private List<CustomerInputRecordDto> customers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerInputRecordDto {
        @JsonProperty("customer_id")
        private String customerId;

        @JsonProperty("recency_days")
        private double recencyDays;

        @JsonProperty("frequency")
        private int frequency;

        @JsonProperty("monetary_value")
        private double monetaryValue;

        @JsonProperty("avg_order_value")
        private Double avgOrderValue;

        @JsonProperty("customer_tenure_days")
        private Double customerTenureDays;

        @JsonProperty("weekend_tx_ratio")
        private Double weekendTxRatio;

        @JsonProperty("evening_tx_ratio")
        private Double eveningTxRatio;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerSegmentationResponseDto {
        @JsonProperty("merchant_id")
        private String merchantId;

        @JsonProperty("total_customers")
        private int totalCustomers;

        @JsonProperty("model_version")
        private String modelVersion;

        @JsonProperty("silhouette_score")
        private Double silhouetteScore;

        @JsonProperty("cohort_distribution")
        private List<SegmentCohortSummaryDto> cohortDistribution;

        @JsonProperty("customer_assignments")
        private List<CustomerAssignmentDto> customerAssignments;

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
    public static class SegmentCohortSummaryDto {
        @JsonProperty("segment_name")
        private String segmentName;

        @JsonProperty("customer_count")
        private int customerCount;

        @JsonProperty("percent_of_total")
        private double percentOfTotal;

        @JsonProperty("avg_monetary")
        private double avgMonetary;

        @JsonProperty("avg_frequency")
        private double avgFrequency;

        @JsonProperty("avg_recency")
        private double avgRecency;

        @JsonProperty("recommended_strategy")
        private String recommendedStrategy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerAssignmentDto {
        @JsonProperty("customer_id")
        private String customerId;

        @JsonProperty("cluster_id")
        private int clusterId;

        @JsonProperty("segment_name")
        private String segmentName;

        @JsonProperty("r_score")
        private int rScore;

        @JsonProperty("f_score")
        private int fScore;

        @JsonProperty("m_score")
        private int mScore;

        @JsonProperty("rfm_score")
        private String rfmScore;

        @JsonProperty("churn_risk")
        private double churnRisk;
    }
}
