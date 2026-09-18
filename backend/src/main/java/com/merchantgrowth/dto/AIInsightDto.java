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
public class AIInsightDto {
    @JsonProperty("id")
    private String id;

    @JsonProperty("category")
    private String category;

    @JsonProperty("severity")
    private String severity;

    @JsonProperty("title")
    private String title;

    @JsonProperty("observedMetric")
    private String observedMetric;

    @JsonProperty("explanation")
    private String explanation;

    @JsonProperty("recommendation")
    private String recommendation;

    @JsonProperty("timestamp")
    private String timestamp;

    @JsonProperty("evidence")
    private List<String> evidence;

    @JsonProperty("simulatedScenarioAction")
    private String simulatedScenarioAction;

    @JsonProperty("merchantId")
    private String merchantId;

    @JsonProperty("expectedImpact")
    private String expectedImpact;

    @JsonProperty("confidence")
    private String confidence;

    @JsonProperty("insightType")
    private String insightType;

    @JsonProperty("description")
    private String description;

    @JsonProperty("affectedWindow")
    private String affectedWindow;

    @JsonProperty("impactEstimate")
    private String impactEstimate;

    @JsonProperty("isResolved")
    private Boolean isResolved;

    @JsonProperty("createdAt")
    private String createdAt;
}
