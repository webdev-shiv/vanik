package com.merchantgrowth.controller;

import com.merchantgrowth.dto.ApiResponse;
import com.merchantgrowth.dto.AiWhyNodeDto;
import com.merchantgrowth.dto.ChatMessageDto;
import com.merchantgrowth.dto.SimulationParamsDto;
import com.merchantgrowth.dto.SimulationResultDto;
import com.merchantgrowth.entity.RecommendationEntity;
import com.merchantgrowth.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @GetMapping("/why-tree")
    public ApiResponse<List<AiWhyNodeDto>> getWhyTree() {
        return ApiResponse.ok(aiService.getWhyTree());
    }

    @GetMapping("/insight-summary")
    public ApiResponse<Map<String, Object>> getInsightSummary() {
        return ApiResponse.ok(aiService.getInsightSummary());
    }

    @PostMapping("/simulate")
    public ApiResponse<SimulationResultDto> simulate(@RequestBody SimulationParamsDto params) {
        return ApiResponse.ok(aiService.simulate(params));
    }

    @GetMapping("/recommendations")
    public ApiResponse<List<RecommendationEntity>> getRecommendations(@RequestParam(value = "merchantId", required = false) String merchantId) {
        return ApiResponse.ok(aiService.getRecommendations(merchantId));
    }

    @PostMapping("/assistant/chat")
    public ApiResponse<ChatMessageDto> askAssistant(@RequestBody Map<String, String> body) {
        String query = body.getOrDefault("query", "");
        return ApiResponse.ok(aiService.askAssistant(query));
    }
}
