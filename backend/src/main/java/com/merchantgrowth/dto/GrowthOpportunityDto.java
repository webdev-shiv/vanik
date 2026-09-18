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
public class GrowthOpportunityDto {
    @JsonProperty("id")
    private String id;

    @JsonProperty("title")
    private String title;

    @JsonProperty("problem")
    private String problem;

    @JsonProperty("evidence")
    private String evidence;

    @JsonProperty("recommendedAction")
    private String recommendedAction;

    @JsonProperty("estimatedImpact")
    private String estimatedImpact;

    @JsonProperty("category")
    private String category;

    @JsonProperty("simulatedFixId")
    private String simulatedFixId;

    @JsonProperty("defaultDiscount")
    private Integer defaultDiscount;

    @JsonProperty("merchantId")
    private String merchantId;

    @JsonProperty("confidence")
    private String confidence;

    @JsonProperty("targetCustomerSegment")
    private String targetCustomerSegment;

    @JsonProperty("isMlGenerated")
    private Boolean isMlGenerated;

    @JsonProperty("sourceType")
    private String sourceType;

    // Entity backward compatibility fields
    @JsonProperty("whyReason")
    private String whyReason;

    @JsonProperty("suggestedOffer")
    private String suggestedOffer;

    @JsonProperty("tagline")
    private String tagline;

    @JsonProperty("expectedImpact")
    private String expectedImpact;

    @JsonProperty("impactMetric")
    private String impactMetric;

    @JsonProperty("targetAudience")
    private String targetAudience;

    @JsonProperty("priority")
    private String priority;

    @JsonProperty("costEstimate")
    private String costEstimate;

    @JsonProperty("duration")
    private String duration;
}
