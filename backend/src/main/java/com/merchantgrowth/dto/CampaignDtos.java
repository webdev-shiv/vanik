package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.merchantgrowth.entity.CampaignEntity;
import com.merchantgrowth.entity.CampaignResultEntity;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class CampaignDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateCampaignRequestDto {
        @NotBlank(message = "Merchant ID is required")
        @JsonProperty("merchant_id")
        @JsonAlias({"merchantId", "merchant_id"})
        private String merchantId;

        @NotBlank(message = "Campaign name is required")
        @JsonProperty("name")
        @JsonAlias({"name", "campaignName", "campaign_name"})
        private String name;

        @NotBlank(message = "Action type is required (e.g. evening offer, weekend offer, loyalty campaign)")
        @JsonProperty("action_type")
        @JsonAlias({"actionType", "action_type", "type", "action"})
        private String actionType;

        @Min(value = 0, message = "Discount percentage cannot be negative")
        @Max(value = 100, message = "Discount percentage cannot exceed 100")
        @JsonProperty("discount_percentage")
        @JsonAlias({"discountPercentage", "discount_percentage", "discount", "discountPercent"})
        private double discountPercentage;

        @Min(value = 1, message = "Duration must be at least 1 day")
        @Max(value = 365, message = "Duration cannot exceed 365 days")
        @JsonProperty("duration_days")
        @JsonAlias({"durationDays", "duration_days", "duration"})
        private int durationDays;

        @JsonProperty("target_segment")
        @JsonAlias({"targetSegment", "target_segment", "targetCustomerSegment"})
        private String targetSegment;

        @JsonProperty("budget")
        private double budget;

        @JsonProperty("reach")
        @JsonAlias({"reach", "audienceCount", "audience_count", "expectedReach"})
        private Integer reach;

        @JsonProperty("channel")
        private String channel;

        @JsonProperty("description")
        private String description;

        @JsonProperty("status")
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CampaignDetailsDto {
        private CampaignEntity campaign;
        private CampaignResultEntity result;
    }
}
