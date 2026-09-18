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
public class AnomalyDetectionRequestDto {

    @JsonProperty("merchant_id")
    private String merchantId;

    @JsonProperty("telemetry")
    private List<HourlyTelemetryInputDto> telemetry;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyTelemetryInputDto {
        private String timestamp;
        private Integer hour;

        @JsonProperty("transactions_count")
        private int transactionsCount;

        @JsonProperty("total_revenue")
        private double totalRevenue;
    }
}
