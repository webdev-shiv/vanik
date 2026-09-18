package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueTrendPointDto {
    @JsonProperty("period")
    @JsonAlias({"day", "label"})
    private String period;

    @JsonProperty("currentRevenue")
    @JsonAlias({"thisMonth", "revenue"})
    private double currentRevenue;

    @JsonProperty("previousRevenue")
    @JsonAlias({"lastMonth"})
    private double previousRevenue;

    @JsonProperty("transactions")
    private int transactions;

    @JsonProperty("benchmarkRevenue")
    private Double benchmarkRevenue;

    public RevenueTrendPointDto(String day, double thisMonth, double lastMonth) {
        this.period = day;
        this.currentRevenue = thisMonth;
        this.previousRevenue = lastMonth;
        this.transactions = (int) Math.round(thisMonth / 75.0);
    }

    public String getDay() {
        return period;
    }

    public double getThisMonth() {
        return currentRevenue;
    }

    public double getLastMonth() {
        return previousRevenue;
    }
}
