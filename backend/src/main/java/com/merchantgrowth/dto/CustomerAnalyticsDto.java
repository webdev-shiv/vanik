package com.merchantgrowth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAnalyticsDto {
    private String merchantId;
    private int totalCustomers;
    private int activeCustomers;
    private int atRiskCustomers;
    private int dormantCustomers;
    private double retentionRatePercent;
    private double repeatPurchaseRatePercent;
    private List<CustomerSegmentSummaryDto> segments;
}
