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
public class ForecastRequestDto {

    @JsonProperty("merchant_id")
    private String merchantId;

    @JsonProperty("horizon_days")
    @Builder.Default
    private int horizonDays = 7;

    @JsonProperty("history")
    private List<DailyRevenueRecordDto> history;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenueRecordDto {
        private String date;
        private double revenue;

        @JsonProperty("transaction_count")
        private Integer transactionCount;
    }
}
