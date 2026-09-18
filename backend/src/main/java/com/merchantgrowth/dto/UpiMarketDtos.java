package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class UpiMarketDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UpiRecordDto {
        private String month;
        private String yearMonth;
        private Double transactionVolumeMillion;
        private Double avgDailyTransactionVolumeMillion;
        private Double transactionValueCrore;
        private Double avgDailyTransactionValueCrore;
        private Integer banksLiveOnUpi;
        private String source;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UpiGrowthMetricsDto {
        private String currentMonth;
        private String previousMonth;
        private String previousYearSameMonth;
        private Double momVolumeGrowthPct;
        private Double momValueGrowthPct;
        private Double yoyVolumeGrowthPct;
        private Double yoyValueGrowthPct;
        private String volumeTrend;
        private String valueTrend;
        private String avgDailyVolumeTrend;
        private String source;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UpiMonthlyTrendPointDto {
        private String month;
        private String yearMonth;
        private Double transactionVolumeMillion;
        private Double transactionVolumeBillion;
        private Double avgDailyTransactionVolumeMillion;
        private Double transactionValueCrore;
        private Double transactionValueLakhCrore;
        private Double avgDailyTransactionValueCrore;
        private Integer banksLiveOnUpi;
        private String source;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UpiMarketSummaryDto {
        private UpiRecordDto latest;
        private UpiGrowthMetricsDto growth;
        private Integer totalMonthsAvailable;
        private String earliestMonth;
        private String latestMonth;
        private Double allTimePeakVolumeMillion;
        private Double allTimePeakValueCrore;
        private List<UpiMonthlyTrendPointDto> recentTrends;
        private String source;
    }
}
