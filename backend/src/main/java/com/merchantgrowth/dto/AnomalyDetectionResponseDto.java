package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyDetectionResponseDto {

    @JsonProperty("merchant_id")
    private String merchantId;

    @JsonProperty("anomaly_detected")
    private boolean anomalyDetected;

    @JsonProperty("anomaly_count")
    private int anomalyCount;

    @JsonProperty("primary_issue")
    private String primaryIssue;

    @JsonProperty("peak_drop_percent")
    private double peakDropPercent;

    @JsonProperty("affected_window")
    private String affectedWindow;

    @JsonProperty("evidence_points")
    private List<String> evidencePoints;

    @JsonProperty("model_version")
    private String modelVersion;

    @JsonProperty("anomalies")
    private List<AnomalyEventDto> anomalies;

    @JsonProperty("available")
    @Builder.Default
    private boolean available = true;

    @JsonProperty("message")
    private String message;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnomalyEventDto {
        private String timestamp;
        private int hour;

        @JsonProperty("actual_revenue")
        private double actualRevenue;

        @JsonProperty("expected_revenue")
        private double expectedRevenue;

        @JsonProperty("drop_percentage")
        private double dropPercentage;

        @JsonProperty("z_score")
        private double zScore;

        private String severity;
        private String reason;
    }
}
