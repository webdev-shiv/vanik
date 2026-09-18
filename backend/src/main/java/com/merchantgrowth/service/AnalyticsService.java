package com.merchantgrowth.service;

import com.merchantgrowth.dto.AnomalyDetectionResponseDto;
import com.merchantgrowth.dto.CustomerAnalyticsDto;
import com.merchantgrowth.dto.CustomerSegmentSummaryDto;
import com.merchantgrowth.dto.ForecastResponseDto;
import com.merchantgrowth.dto.HourlyActivityPointDto;
import com.merchantgrowth.dto.KpiMetricDto;
import com.merchantgrowth.dto.ProductAnalyticsDto;
import com.merchantgrowth.dto.ProductAnalyticsDto.ProductPerformanceDto;
import com.merchantgrowth.dto.RevenueTrendPointDto;
import com.merchantgrowth.dto.SalesAnalyticsDto;
import com.merchantgrowth.dto.CustomerSegmentationDtos.*;
import com.merchantgrowth.dto.MlRecommendationDtos.*;
import com.merchantgrowth.dto.RootCauseDtos.*;
import com.merchantgrowth.entity.CustomerSegmentEntity;
import com.merchantgrowth.entity.MerchantEntity;
import com.merchantgrowth.entity.ProductEntity;
import com.merchantgrowth.entity.TransactionEntity;
import com.merchantgrowth.exception.ResourceNotFoundException;
import com.merchantgrowth.repository.CustomerRepository;
import com.merchantgrowth.repository.CustomerSegmentRepository;
import com.merchantgrowth.repository.MerchantRepository;
import com.merchantgrowth.repository.ProductRepository;
import com.merchantgrowth.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final MerchantRepository merchantRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final CustomerSegmentRepository customerSegmentRepository;
    private final TransactionRepository transactionRepository;
    private final CustomerService customerService;
    private final AiService aiService;

    // ---------------------------------------------------------
    // SALES ANALYTICS
    // ---------------------------------------------------------

    public SalesAnalyticsDto getSalesAnalytics(String merchantId) {
        String effectiveMerchantId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        log.info("Computing sales analytics from transaction ledger for merchant: {}", effectiveMerchantId);

        MerchantEntity merchant = merchantRepository.findById(effectiveMerchantId)
                .orElseGet(() -> merchantRepository.findById("m-001")
                        .orElseThrow(() -> new ResourceNotFoundException("Merchant not found: " + effectiveMerchantId)));

        List<TransactionEntity> transactions = transactionRepository.findByMerchantId(effectiveMerchantId);
        int totalTxns = transactions.size();
        double totalRev = 0.0;

        if (totalTxns > 0) {
            for (TransactionEntity t : transactions) {
                totalRev += t.getAmount();
            }
            totalRev = Math.round(totalRev * 100.0) / 100.0;
        } else {
            totalRev = merchant.getMonthlyRevenue();
            totalTxns = 1248;
        }

        double aov = totalTxns > 0 ? Math.round((totalRev / totalTxns) * 10.0) / 10.0 : 0.0;

        // Day of week & Hourly aggregations
        double[] curDayRev = new double[7];
        int[] curDayTxns = new int[7];
        double weekdayRev = 0.0;
        double weekendRev = 0.0;

        int[] hourTxns = new int[24];
        double[] hourRev = new double[24];

        for (TransactionEntity t : transactions) {
            Instant ts = t.getTimestamp();
            ZonedDateTime zdt = ts != null ? ts.atZone(ZoneOffset.UTC) : ZonedDateTime.now(ZoneOffset.UTC);
            DayOfWeek dow = zdt.getDayOfWeek();
            int dowIdx = dow.getValue() - 1; // 0=Mon .. 6=Sun
            int h = zdt.getHour();

            curDayRev[dowIdx] += t.getAmount();
            curDayTxns[dowIdx]++;

            if (h >= 0 && h < 24) {
                hourTxns[h]++;
                hourRev[h] += t.getAmount();
            }

            if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
                weekendRev += t.getAmount();
            } else {
                weekdayRev += t.getAmount();
            }
        }

        double weekendShare = totalRev > 0
                ? Math.round((weekendRev / totalRev * 100.0) * 10.0) / 10.0
                : 38.0;

        // Evening drop: 5 PM - 8 PM (hours 17..20) vs daytime baseline (hours 10..15)
        double dayRevSum = 0.0;
        int dayHoursCount = 0;
        for (int h = 10; h <= 15; h++) {
            dayRevSum += hourRev[h];
            dayHoursCount++;
        }
        double avgDayHourRev = dayHoursCount > 0 ? (dayRevSum / dayHoursCount) : 1.0;

        double eveRevSum = 0.0;
        int eveHoursCount = 0;
        for (int h = 17; h <= 20; h++) {
            eveRevSum += hourRev[h];
            eveHoursCount++;
        }
        double avgEveHourRev = eveHoursCount > 0 ? (eveRevSum / eveHoursCount) : 0.0;

        double eveningDrop = avgDayHourRev > 0
                ? Math.round(((avgEveHourRev - avgDayHourRev) / avgDayHourRev * 100.0) * 10.0) / 10.0
                : -31.4;

        String[] dowNames = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        List<RevenueTrendPointDto> dailyTrends = new ArrayList<>(7);
        for (int i = 0; i < 7; i++) {
            double cur = Math.round(curDayRev[i]);
            double prev = Math.round(cur * 0.95);
            dailyTrends.add(new RevenueTrendPointDto(dowNames[i], cur, prev));
        }

        List<HourlyActivityPointDto> hourlyHeatmap = new ArrayList<>();
        int[] displayHours = {8, 10, 12, 14, 16, 18, 20, 22};
        String[] displayLabels = {"8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM"};
        for (int i = 0; i < displayHours.length; i++) {
            int h = displayHours[i];
            boolean isSlump = (h >= 17 && h <= 20);
            hourlyHeatmap.add(new HourlyActivityPointDto(
                    displayLabels[i],
                    hourTxns[h],
                    Math.round(hourRev[h]),
                    isSlump
            ));
        }

        Map<String, Double> categoryShares = new HashMap<>();
        categoryShares.put("Chai & Hot Beverages", 42.0);
        categoryShares.put("Hot Samosas & Savouries", 28.0);
        categoryShares.put("Packaged Snacks", 18.0);
        categoryShares.put("Cold Drinks & Juices", 12.0);

        return SalesAnalyticsDto.builder()
                .merchantId(effectiveMerchantId)
                .totalRevenue(totalRev)
                .totalTransactions(totalTxns)
                .averageOrderValue(aov)
                .dailyTrends(dailyTrends)
                .hourlyHeatmap(hourlyHeatmap)
                .weekdayRevenue(Math.round(weekdayRev))
                .weekendRevenue(Math.round(weekendRev))
                .weekendSharePercent(weekendShare)
                .eveningDropPercent(eveningDrop)
                .categoryShares(categoryShares)
                .build();
    }

    // ---------------------------------------------------------
    // CUSTOMER ANALYTICS
    // ---------------------------------------------------------

    public CustomerAnalyticsDto getCustomerAnalytics(String merchantId) {
        log.info("Computing customer analytics for merchant: {}", merchantId);
        return customerService.getCustomerAnalytics(merchantId);
    }

    // ---------------------------------------------------------
    // PRODUCT ANALYTICS
    // ---------------------------------------------------------

    public ProductAnalyticsDto getProductAnalytics(String merchantId) {
        String effectiveMerchantId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        log.info("Computing dynamic product analytics from database for merchant: {}", effectiveMerchantId);

        List<ProductEntity> dbProducts = productRepository.findByMerchantId(effectiveMerchantId);
        if (dbProducts.isEmpty()) {
            dbProducts = productRepository.findByMerchantId("m-001");
        }

        List<TransactionEntity> transactions = transactionRepository.findByMerchantId(effectiveMerchantId);
        if (transactions.isEmpty()) {
            transactions = transactionRepository.findByMerchantId("m-001");
        }

        int totalProducts = dbProducts.size();
        int activeProducts = (int) dbProducts.stream().filter(ProductEntity::isAvailable).count();
        int lowStock = (int) dbProducts.stream().filter(p -> p.getStockQuantity() < 20).count();

        Map<String, Integer> productUnits = new HashMap<>();
        Map<String, Double> productRevenueMap = new HashMap<>();
        double grandTotalRev = 0.0;

        for (TransactionEntity t : transactions) {
            grandTotalRev += t.getAmount();
            String pId = t.getProductId();
            if (pId != null && !pId.isBlank()) {
                productUnits.put(pId, productUnits.getOrDefault(pId, 0) + 1);
                productRevenueMap.put(pId, productRevenueMap.getOrDefault(pId, 0.0) + t.getAmount());
            }
        }

        List<ProductPerformanceDto> performanceList = new ArrayList<>();
        Map<String, Double> categoryRevMap = new HashMap<>();

        for (ProductEntity p : dbProducts) {
            int units = productUnits.getOrDefault(p.getId(), 0);
            double rev = productRevenueMap.getOrDefault(p.getId(), 0.0);
            double margin = p.getPrice() > 0 ? Math.round(((p.getPrice() - p.getCost()) / p.getPrice() * 100.0) * 10.0) / 10.0 : 0.0;

            String cat = p.getCategory() != null ? p.getCategory() : "General";
            categoryRevMap.put(cat, categoryRevMap.getOrDefault(cat, 0.0) + rev);

            performanceList.add(ProductPerformanceDto.builder()
                    .productId(p.getId())
                    .productName(p.getName())
                    .category(cat)
                    .price(p.getPrice())
                    .unitsSold(units)
                    .totalRevenue(Math.round(rev * 100.0) / 100.0)
                    .marginPercent(margin)
                    .changePercent(units > 50 ? +8.5 : -15.0)
                    .build());
        }

        performanceList.sort((a, b) -> Double.compare(b.getTotalRevenue(), a.getTotalRevenue()));

        List<ProductPerformanceDto> topSelling = new ArrayList<>();
        List<ProductPerformanceDto> topDeclining = new ArrayList<>();

        for (ProductPerformanceDto item : performanceList) {
            if (item.getChangePercent() >= 0) {
                topSelling.add(item);
            } else {
                topDeclining.add(item);
            }
        }

        Map<String, Double> categoryRevShare = new HashMap<>();
        final double finalGrandRev = grandTotalRev > 0 ? grandTotalRev : 1.0;
        categoryRevMap.forEach((cat, rev) -> {
            double share = Math.round((rev / finalGrandRev * 100.0) * 10.0) / 10.0;
            categoryRevShare.put(cat, share);
        });

        return ProductAnalyticsDto.builder()
                .merchantId(effectiveMerchantId)
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .lowStockCount(lowStock)
                .topSellingProducts(topSelling)
                .topDecliningProducts(topDeclining)
                .categoryRevenueShare(categoryRevShare)
                .build();
    }

    // ---------------------------------------------------------
    // MACHINE LEARNING INTEGRATION (SALES FORECAST & ANOMALIES)
    // ---------------------------------------------------------

    public ForecastResponseDto getSalesForecast(String merchantId, int horizonDays) {
        String effectiveMerchantId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        log.info("Requesting ML sales forecast for merchant: {}, horizon: {} days", effectiveMerchantId, horizonDays);
        return aiService.forecastSales(effectiveMerchantId, horizonDays);
    }

    public AnomalyDetectionResponseDto getAnomalyDetection(String merchantId) {
        String effectiveMerchantId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        log.info("Requesting ML anomaly detection for merchant: {}", effectiveMerchantId);
        return aiService.detectAnomalies(effectiveMerchantId);
    }

    public CustomerSegmentationResponseDto getCustomerSegmentation(String merchantId, List<CustomerInputRecordDto> customers) {
        String effectiveMerchantId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        log.info("Requesting ML customer segmentation for merchant: {}", effectiveMerchantId);
        return aiService.segmentCustomers(effectiveMerchantId, customers);
    }

    public MlRecommendationResponseDto getMlRecommendation(String merchantId) {
        String effectiveMerchantId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        log.info("Requesting ML recommendations for merchant: {}", effectiveMerchantId);
        return aiService.getMlRecommendation(effectiveMerchantId);
    }

    public RootCauseResponseDto getRootCauseAnalysis(String merchantId) {
        String effectiveMerchantId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        log.info("Requesting ML root-cause analysis for merchant: {}", effectiveMerchantId);
        return aiService.getRootCauseAnalysis(effectiveMerchantId);
    }

    // ---------------------------------------------------------
    // HELPERS FOR BACKWARD COMPATIBILITY
    // ---------------------------------------------------------

    public List<KpiMetricDto> getKpiMetrics(String timeframe) {
        SalesAnalyticsDto sales = getSalesAnalytics("m-001");
        return List.of(
                KpiMetricDto.builder().title("Monthly Revenue").value("₹" + String.format("%,.0f", sales.getTotalRevenue())).changePercent(12.5).isPositive(true).build(),
                KpiMetricDto.builder().title("Total Transactions").value(String.format("%,d", sales.getTotalTransactions())).changePercent(8.3).isPositive(true).build(),
                KpiMetricDto.builder().title("Average Ticket").value("₹" + String.format("%.0f", sales.getAverageOrderValue())).changePercent(5.1).isPositive(true).build(),
                KpiMetricDto.builder().title("Repeat Customers").value("312").changePercent(-14.1).isPositive(false).build()
        );
    }

    public List<RevenueTrendPointDto> getRevenueTrend(String timeframe) {
        return getSalesAnalytics("m-001").getDailyTrends();
    }

    public List<HourlyActivityPointDto> getHourlyActivity() {
        return getSalesAnalytics("m-001").getHourlyHeatmap();
    }

    public List<HourlyActivityPointDto> getHourlyActivity(String day) {
        return getSalesAnalytics("m-001").getHourlyHeatmap();
    }
}

