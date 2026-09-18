package com.merchantgrowth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesAnalyticsDto {
    private String merchantId;
    private double totalRevenue;
    private int totalTransactions;
    private double averageOrderValue;
    private List<RevenueTrendPointDto> dailyTrends;
    private List<HourlyActivityPointDto> hourlyHeatmap;
    private double weekdayRevenue;
    private double weekendRevenue;
    private double weekendSharePercent;
    private double eveningDropPercent;
    private Map<String, Double> categoryShares;

    public List<RevenueTrendPointDto> getRevenueTrends7D() {
        return dailyTrends;
    }

    public List<HourlyActivityPointDto> getHourlyActivity() {
        return hourlyHeatmap;
    }
}
