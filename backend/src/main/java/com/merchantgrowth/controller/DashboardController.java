package com.merchantgrowth.controller;

import com.merchantgrowth.dto.ApiResponse;
import com.merchantgrowth.dto.DashboardSummaryDto;
import com.merchantgrowth.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Merchant operational and growth dashboard APIs")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/{merchantId}")
    @Operation(summary = "Get full dashboard summary", description = "Aggregates revenue KPIs, health score, alerts, and active campaigns for a merchant")
    public ApiResponse<DashboardSummaryDto> getDashboardSummary(
            @PathVariable String merchantId,
            @RequestParam(required = false, defaultValue = "7D") String timeframe) {
        DashboardSummaryDto summary = dashboardService.getDashboardSummary(merchantId, timeframe);
        return ApiResponse.ok(summary);
    }
}
