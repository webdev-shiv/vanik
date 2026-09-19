package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class DailyReportDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DailyReportRequestDto {
        @JsonProperty("merchant_id")
        private String merchantId;

        @JsonProperty("date")
        private String date;

        @JsonProperty("language")
        private String language;

        @JsonProperty("report_length")
        private String reportLength;

        @JsonProperty("includes")
        private List<String> includes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ProductPerformanceMetricDto {
        @JsonProperty("product_name")
        private String productName;

        @JsonProperty("quantity")
        private int quantity;

        @JsonProperty("revenue")
        private double revenue;

        @JsonProperty("trend")
        private String trend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ComparisonMetricsDto {
        @JsonProperty("vs_yesterday")
        private Double vsYesterday;

        @JsonProperty("vs_7_day_average")
        private Double vs7DayAverage;

        @JsonProperty("yesterday_revenue")
        private Double yesterdayRevenue;

        @JsonProperty("seven_day_avg_revenue")
        private Double sevenDayAvgRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DailyReportResponseDto {
        @JsonProperty("id")
        private String id;

        @JsonProperty("merchant_id")
        private String merchantId;

        @JsonProperty("date")
        private String date;

        @JsonProperty("revenue")
        private double revenue;

        @JsonProperty("transactions")
        private int transactions;

        @JsonProperty("average_order_value")
        private double averageOrderValue;

        @JsonProperty("profit")
        private Double profit;

        @JsonProperty("profit_margin")
        private Double profitMargin;

        @JsonProperty("profit_label")
        private String profitLabel;

        @JsonProperty("has_reliable_cost")
        private boolean hasReliableCost;

        @JsonProperty("comparison")
        private ComparisonMetricsDto comparison;

        @JsonProperty("top_products")
        private List<ProductPerformanceMetricDto> topProducts;

        @JsonProperty("declining_products")
        private List<ProductPerformanceMetricDto> decliningProducts;

        @JsonProperty("peak_hours")
        private List<String> peakHours;

        @JsonProperty("slow_hours")
        private List<String> slowHours;

        @JsonProperty("insights")
        private List<String> insights;

        @JsonProperty("recommendations")
        private List<String> recommendations;

        @JsonProperty("voice_script")
        private String voiceScript;

        @JsonProperty("voice_script_hinglish")
        private String voiceScriptHinglish;

        @JsonProperty("voice_script_hindi")
        private String voiceScriptHindi;

        @JsonProperty("voice_script_english")
        private String voiceScriptEnglish;

        @JsonProperty("audio_url")
        private String audioUrl;

        @JsonProperty("language")
        private String language;

        @JsonProperty("generated_at")
        private String generatedAt;

        @JsonProperty("status")
        private String status;

        @JsonProperty("soundbox_status")
        private String soundboxStatus;

        @JsonProperty("soundbox_message")
        private String soundboxMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GenerateAudioRequestDto {
        @JsonProperty("merchant_id")
        private String merchantId;

        @JsonProperty("language")
        private String language;

        @JsonProperty("voice_name")
        private String voiceName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GenerateAudioResponseDto {
        @JsonProperty("merchant_id")
        private String merchantId;

        @JsonProperty("date")
        private String date;

        @JsonProperty("audio_url")
        private String audioUrl;

        @JsonProperty("duration_seconds")
        private double durationSeconds;

        @JsonProperty("language")
        private String language;

        @JsonProperty("format")
        private String format;

        @JsonProperty("soundbox_status")
        private String soundboxStatus;

        @JsonProperty("voice_script")
        private String voiceScript;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MerchantReportSettingsDto {
        @JsonProperty("merchant_id")
        private String merchantId;

        @JsonProperty("enabled")
        private boolean enabled;

        @JsonProperty("report_time")
        private String reportTime; // e.g. "22:30"

        @JsonProperty("language")
        private String language; // "hinglish", "hindi", "english"

        @JsonProperty("report_length")
        private String reportLength; // "short", "standard"

        @JsonProperty("include_sales")
        private boolean includeSales;

        @JsonProperty("include_profit")
        private boolean includeProfit;

        @JsonProperty("include_products")
        private boolean includeProducts;

        @JsonProperty("include_insights")
        private boolean includeInsights;

        @JsonProperty("include_recommendations")
        private boolean includeRecommendations;
    }
}
