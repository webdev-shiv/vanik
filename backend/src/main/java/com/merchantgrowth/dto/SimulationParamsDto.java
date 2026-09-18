package com.merchantgrowth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationParamsDto {
    private String actionType;
    private double offerAmount;
    private int targetCustomerCount;
    private int durationDays;
    private String timeWindow;
    private String channel;
}
