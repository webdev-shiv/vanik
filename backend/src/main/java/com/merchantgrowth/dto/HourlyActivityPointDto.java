package com.merchantgrowth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HourlyActivityPointDto {
    private String time;
    private int hour;
    private int transactions;
    private int lastMonthTransactions;
    private double revenue;
    private boolean isPeak;
    private Boolean dropAlert;

    public HourlyActivityPointDto(String time, int transactions, double revenue, boolean isPeak) {
        this.time = time;
        this.transactions = transactions;
        this.revenue = revenue;
        this.isPeak = isPeak;
        this.dropAlert = isPeak;
    }
}
