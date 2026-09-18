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
public class ForecastResponseDto {

    @JsonProperty("merchant_id")
    private String merchantId;

    @JsonProperty("horizon_days")
    private int horizonDays;

    @JsonProperty("total_projected_revenue")
    private double totalProjectedRevenue;

    @JsonProperty("avg_daily_revenue")
    private double avgDailyRevenue;

    @JsonProperty("model_version")
    private String modelVersion;

    @JsonProperty("confidence_interval")
    @Builder.Default
    private String confidenceInterval = "90%";

    @JsonProperty("daily_forecasts")
    private List<DailyForecastDto> dailyForecasts;

    @JsonProperty("available")
    @Builder.Default
    private boolean available = true;

    @JsonProperty("message")
    private String message;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyForecastDto {
        private String date;

        @JsonProperty("day_of_week")
        private String dayOfWeek;

        @JsonProperty("predicted_revenue")
        private double predictedRevenue;

        @JsonProperty("lower_bound_90")
        private double lowerBound90;

        @JsonProperty("upper_bound_90")
        private double upperBound90;

        private String trend;
    }
}
