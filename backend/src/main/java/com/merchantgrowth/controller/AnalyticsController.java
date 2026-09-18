package com.merchantgrowth.controller;

import com.merchantgrowth.dto.*;
import com.merchantgrowth.dto.CustomerSegmentationDtos.CustomerSegmentationRequestDto;
import com.merchantgrowth.dto.CustomerSegmentationDtos.CustomerSegmentationResponseDto;
import com.merchantgrowth.dto.MlRecommendationDtos.MlRecommendationResponseDto;
import com.merchantgrowth.dto.RootCauseDtos.RootCauseRequestDto;
import com.merchantgrowth.dto.RootCauseDtos.RootCauseResponseDto;
import com.merchantgrowth.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Sales, customer segmentation, and product analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping({"/api/analytics/sales/{merchantId}", "/api/v1/analytics/sales/{merchantId}"})
    @Operation(summary = "Get merchant sales analytics", description = "Provides revenue breakdowns, weekday vs weekend patterns, and hourly heatmaps")
    public ApiResponse<SalesAnalyticsDto> getSalesAnalytics(@PathVariable String merchantId) {
        return ApiResponse.ok(analyticsService.getSalesAnalytics(merchantId));
    }

    @GetMapping({"/api/analytics/customers/{merchantId}", "/api/v1/analytics/customers/{merchantId}"})
    @Operation(summary = "Get merchant customer analytics", description = "Provides RFM segments, retention rates, and churn risk levels")
    public ApiResponse<CustomerAnalyticsDto> getCustomerAnalytics(@PathVariable String merchantId) {
        return ApiResponse.ok(analyticsService.getCustomerAnalytics(merchantId));
    }

    @GetMapping({"/api/analytics/products/{merchantId}", "/api/v1/analytics/products/{merchantId}"})
    @Operation(summary = "Get merchant product analytics", description = "Provides top-selling, declining, and inventory metrics")
    public ApiResponse<ProductAnalyticsDto> getProductAnalytics(@PathVariable String merchantId) {
        return ApiResponse.ok(analyticsService.getProductAnalytics(merchantId));
    }

    @GetMapping({"/api/analytics/kpis", "/api/v1/analytics/kpis"})
    @Operation(summary = "Get headline KPIs", description = "Retrieves high-level performance indicators")
    public ApiResponse<List<KpiMetricDto>> getKpis(@RequestParam(defaultValue = "30D") String timeframe) {
        return ApiResponse.ok(analyticsService.getKpiMetrics(timeframe));
    }

    @GetMapping({"/api/analytics/revenue-trend", "/api/v1/analytics/revenue-trend"})
    @Operation(summary = "Get revenue trend", description = "Retrieves current vs previous revenue timeline")
    public ApiResponse<List<RevenueTrendPointDto>> getRevenueTrend(@RequestParam(defaultValue = "30D") String timeframe) {
        return ApiResponse.ok(analyticsService.getRevenueTrend(timeframe));
    }

    @GetMapping({"/api/analytics/hourly-activity", "/api/v1/analytics/hourly-activity"})
    @Operation(summary = "Get hourly activity", description = "Retrieves transactions and volume by hour of day")
    public ApiResponse<List<HourlyActivityPointDto>> getHourlyActivity() {
        return ApiResponse.ok(analyticsService.getHourlyActivity());
    }

    @GetMapping({"/api/analytics/forecast/{merchantId}", "/api/v1/analytics/forecast/{merchantId}"})
    @Operation(summary = "Get ML sales forecast", description = "Retrieves 7-day or N-day projected sales from trained ML Ridge regression model")
    public ApiResponse<ForecastResponseDto> getSalesForecast(
            @PathVariable String merchantId,
            @RequestParam(defaultValue = "7") int horizonDays) {
        return ApiResponse.ok(analyticsService.getSalesForecast(merchantId, horizonDays));
    }

    @PostMapping({"/api/analytics/forecast", "/api/v1/analytics/forecast"})
    @Operation(summary = "Request ML sales forecast", description = "Retrieves sales forecast for requested merchant and horizon")
    public ApiResponse<ForecastResponseDto> requestSalesForecast(@RequestBody(required = false) ForecastRequestDto request) {
        String merchantId = (request != null && request.getMerchantId() != null) ? request.getMerchantId() : "m-001";
        int horizon = (request != null && request.getHorizonDays() > 0) ? request.getHorizonDays() : 7;
        return ApiResponse.ok(analyticsService.getSalesForecast(merchantId, horizon));
    }

    @GetMapping({"/api/analytics/anomalies/{merchantId}", "/api/v1/analytics/anomalies/{merchantId}", "/api/analytics/anomaly/{merchantId}"})
    @Operation(summary = "Get ML anomaly detection", description = "Retrieves detected transaction and revenue drop anomalies from ML model")
    public ApiResponse<AnomalyDetectionResponseDto> getAnomalies(@PathVariable String merchantId) {
        return ApiResponse.ok(analyticsService.getAnomalyDetection(merchantId));
    }

    @PostMapping({"/api/analytics/detect-anomalies", "/api/v1/analytics/detect-anomalies"})
    @Operation(summary = "Request ML anomaly detection", description = "Runs anomaly detection for specified merchant")
    public ApiResponse<AnomalyDetectionResponseDto> detectAnomalies(@RequestBody(required = false) AnomalyDetectionRequestDto request) {
        String merchantId = (request != null && request.getMerchantId() != null) ? request.getMerchantId() : "m-001";
        return ApiResponse.ok(analyticsService.getAnomalyDetection(merchantId));
    }

    @GetMapping({"/api/analytics/segmentation/{merchantId}", "/api/v1/analytics/segmentation/{merchantId}"})
    @Operation(summary = "Get ML customer segmentation", description = "Clusters customers into RFM cohorts using trained KMeans model")
    public ApiResponse<CustomerSegmentationResponseDto> getCustomerSegmentation(@PathVariable String merchantId) {
        return ApiResponse.ok(analyticsService.getCustomerSegmentation(merchantId, null));
    }

    @PostMapping({"/api/analytics/segmentation", "/api/v1/analytics/segmentation"})
    @Operation(summary = "Request ML customer segmentation", description = "Segments custom customer records or merchant dataset")
    public ApiResponse<CustomerSegmentationResponseDto> requestCustomerSegmentation(@RequestBody(required = false) CustomerSegmentationRequestDto request) {
        String merchantId = (request != null && request.getMerchantId() != null) ? request.getMerchantId() : "m-001";
        var customers = (request != null) ? request.getCustomers() : null;
        return ApiResponse.ok(analyticsService.getCustomerSegmentation(merchantId, customers));
    }

    @GetMapping({"/api/analytics/recommendations/{merchantId}", "/api/v1/analytics/recommendations/{merchantId}"})
    @Operation(summary = "Get ML-ranked growth recommendation", description = "Calculates non-fabricated growth recommendations using trained regression model")
    public ApiResponse<MlRecommendationResponseDto> getMlRecommendation(@PathVariable String merchantId) {
        return ApiResponse.ok(analyticsService.getMlRecommendation(merchantId));
    }

    @GetMapping({"/api/analytics/root-cause/{merchantId}", "/api/v1/analytics/root-cause/{merchantId}"})
    @Operation(summary = "Get root-cause diagnostics", description = "Decomposes performance across 11 operational dimensions")
    public ApiResponse<RootCauseResponseDto> getRootCause(@PathVariable String merchantId) {
        return ApiResponse.ok(analyticsService.getRootCauseAnalysis(merchantId));
    }

    @PostMapping({"/api/analytics/root-cause", "/api/v1/analytics/root-cause"})
    @Operation(summary = "Request root-cause diagnostics", description = "Executes two-period variance decomposition")
    public ApiResponse<RootCauseResponseDto> requestRootCause(@RequestBody(required = false) RootCauseRequestDto request) {
        String merchantId = (request != null && request.getMerchantId() != null) ? request.getMerchantId() : "m-001";
        return ApiResponse.ok(analyticsService.getRootCauseAnalysis(merchantId));
    }
}
