package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSegmentSummaryDto {
    @JsonProperty("id")
    private String id;

    @JsonProperty("segmentName")
    private String segmentName;

    @JsonProperty("customerCount")
    private int customerCount;

    @JsonProperty("percentageOfTotal")
    private double percentageOfTotal;

    @JsonProperty("revenueContribution")
    private double revenueContribution;

    @JsonProperty("averageOrderValue")
    private double averageOrderValue;

    @JsonProperty("lastPurchaseAvgDays")
    private double lastPurchaseAvgDays;

    @JsonProperty("churnRiskPercent")
    private double churnRiskPercent;

    @JsonProperty("recommendedAction")
    private String recommendedAction;

    @JsonProperty("description")
    private String description;

    // Backward-compatible properties
    @JsonProperty("segment")
    private String segment;

    @JsonProperty("name")
    private String name;

    @JsonProperty("label")
    private String label;

    @JsonProperty("count")
    private int count;

    @JsonProperty("percentage")
    private double percentage;

    @JsonProperty("sharePercent")
    private double sharePercent;

    @JsonProperty("averageSpend")
    private double averageSpend;

    @JsonProperty("riskProfile")
    private String riskProfile;

    @JsonProperty("churnRisk")
    private String churnRisk;

    @JsonProperty("color")
    private String color;
}
