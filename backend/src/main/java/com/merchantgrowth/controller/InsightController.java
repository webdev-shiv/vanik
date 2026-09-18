package com.merchantgrowth.controller;

import com.merchantgrowth.dto.ApiResponse;
import com.merchantgrowth.entity.AIInsightEntity;
import com.merchantgrowth.service.InsightService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.merchantgrowth.dto.AIInsightDto;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
@Tag(name = "AI Insights", description = "AI-detected patterns, root-cause anomalies, and alerts")
public class InsightController {

    private final InsightService insightService;

    @GetMapping("/{merchantId}")
    @Operation(summary = "Get AI insights and alerts", description = "Retrieves active alerts, detected root-causes, and business observations for a merchant")
    public ApiResponse<List<AIInsightDto>> getInsights(@PathVariable String merchantId) {
        List<AIInsightDto> insights = insightService.getInsightDtos(merchantId);
        return ApiResponse.ok(insights);
    }

    @org.springframework.web.bind.annotation.PostMapping({"/explain", "/explain-analytics"})
    @Operation(summary = "Generate OpenAI merchant insight narrative", description = "Translates structured analytics into 7-part merchant-friendly explanation adhering to strict numerical integrity rules")
    public ApiResponse<com.merchantgrowth.dto.OpenAIExplanationDtos.OpenAIInsightExplanationResponseDto> explainAnalytics(
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.merchantgrowth.dto.OpenAIExplanationDtos.AnalyticsExplanationRequestDto request) {
        var response = insightService.generateExplanation(request);
        return ApiResponse.ok(response, "OpenAI insight explanation generated successfully");
    }
}
