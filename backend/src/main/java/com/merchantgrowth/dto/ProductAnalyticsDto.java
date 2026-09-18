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
public class ProductAnalyticsDto {
    private String merchantId;
    private int totalProducts;
    private int activeProducts;
    private int lowStockCount;
    private List<ProductPerformanceDto> topSellingProducts;
    private List<ProductPerformanceDto> topDecliningProducts;
    private Map<String, Double> categoryRevenueShare;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductPerformanceDto {
        private String productId;
        private String productName;
        private String category;
        private double price;
        private int unitsSold;
        private double totalRevenue;
        private double marginPercent;
        private double changePercent;
    }
}
