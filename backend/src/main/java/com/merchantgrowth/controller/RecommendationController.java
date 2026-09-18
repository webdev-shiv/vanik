package com.merchantgrowth.controller;

import com.merchantgrowth.dto.ApiResponse;
import com.merchantgrowth.dto.GrowthOpportunityDto;
import com.merchantgrowth.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendations", description = "AI-recommended growth actions and ROI estimates")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/{merchantId}")
    @Operation(summary = "Get merchant recommendations", description = "Retrieves prioritized growth recommendations with evidence and impact estimates")
    public ApiResponse<List<GrowthOpportunityDto>> getRecommendations(@PathVariable String merchantId) {
        List<GrowthOpportunityDto> list = recommendationService.getOpportunityDtos(merchantId);
        return ApiResponse.ok(list);
    }
}
