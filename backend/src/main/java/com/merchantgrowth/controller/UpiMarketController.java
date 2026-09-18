package com.merchantgrowth.controller;

import com.merchantgrowth.dto.UpiMarketDtos.*;
import com.merchantgrowth.service.UpiMarketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/upi")
@RequiredArgsConstructor
@Tag(name = "NPCI UPI Market Statistics", description = "Official NPCI macroeconomic payment ecosystem statistics and growth analytics")
public class UpiMarketController {

    private final UpiMarketService upiMarketService;

    @GetMapping("/latest")
    @Operation(summary = "Get latest NPCI UPI monthly statistics", description = "Returns the single most recent monthly statistics record published by NPCI")
    public ResponseEntity<UpiRecordDto> getLatest() {
        UpiRecordDto latest = upiMarketService.getLatestRecord();
        if (latest == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(latest);
    }

    @GetMapping("/monthly-trends")
    @Operation(summary = "Get NPCI UPI monthly trend time-series", description = "Returns chronological monthly volume, value, and average daily metrics")
    public ResponseEntity<List<UpiMonthlyTrendPointDto>> getMonthlyTrends() {
        return ResponseEntity.ok(upiMarketService.getMonthlyTrends());
    }

    @GetMapping("/growth")
    @Operation(summary = "Get NPCI UPI growth metrics", description = "Returns calculated MoM and YoY transaction volume and value growth percentages")
    public ResponseEntity<UpiGrowthMetricsDto> getGrowth() {
        UpiGrowthMetricsDto growth = upiMarketService.getGrowthMetrics();
        if (growth == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(growth);
    }

    @GetMapping("/market-summary")
    @Operation(summary = "Get comprehensive NPCI UPI market summary", description = "Aggregates latest figures, growth indicators, peaks, and recent 12-month trends")
    public ResponseEntity<UpiMarketSummaryDto> getMarketSummary() {
        return ResponseEntity.ok(upiMarketService.getMarketSummary());
    }
}
