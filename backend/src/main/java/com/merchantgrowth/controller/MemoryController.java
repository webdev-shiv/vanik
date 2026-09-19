package com.merchantgrowth.controller;

import com.merchantgrowth.dto.ApiResponse;
import com.merchantgrowth.dto.MemoryDto.*;
import com.merchantgrowth.service.MemoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "VANIK Memory (Cognee)", description = "Merchant Long-Term Knowledge Graph and Explainable Memory")
public class MemoryController {

    private final MemoryService memoryService;

    @PostMapping({"/api/memory/ingest", "/api/v1/memory/ingest"})
    @Operation(summary = "Ingest merchant snapshot", description = "Builds knowledge graph from ML cohorts, anomalies, and transaction aggregates")
    public ApiResponse<IngestResponse> ingest(@RequestBody(required = false) IngestRequest request) {
        String merchantId = (request != null && request.getMerchantId() != null) ? request.getMerchantId() : "m-001";
        Boolean forceRefresh = (request != null) ? request.getForceRefresh() : false;
        IngestResponse response = memoryService.ingestMerchantSnapshot(merchantId, forceRefresh);
        return ApiResponse.ok(response);
    }

    @PostMapping({"/api/memory/event", "/api/v1/memory/event"})
    @Operation(summary = "Stream episodic event", description = "Records transaction, campaign, or chat event into memory")
    public ApiResponse<Map<String, String>> recordEvent(@RequestBody EventRequest request) {
        String merchantId = (request != null && request.getMerchantId() != null) ? request.getMerchantId() : "m-001";
        String eventType = (request != null && request.getEventType() != null) ? request.getEventType() : "GENERIC_EVENT";
        memoryService.recordEventAsync(merchantId, eventType, request != null ? request.getPayload() : null);
        return ApiResponse.ok(Map.of("status", "QUEUED", "event_type", eventType));
    }

    @PostMapping({"/api/memory/recall", "/api/v1/memory/recall"})
    @Operation(summary = "Recall memory with provenance", description = "Recalls grounded facts and graph nodes for a natural language inquiry")
    public ApiResponse<RecallResponse> recall(@RequestBody RecallRequest request) {
        String merchantId = (request != null && request.getMerchantId() != null) ? request.getMerchantId() : "m-001";
        String query = (request != null && request.getQuery() != null) ? request.getQuery() : "";
        String mode = (request != null && request.getMode() != null) ? request.getMode() : "graph";
        RecallResponse response = memoryService.recall(merchantId, query, mode);
        return ApiResponse.ok(response);
    }

    @GetMapping({"/api/memory/graph/{merchantId}", "/api/v1/memory/graph/{merchantId}"})
    @Operation(summary = "Get memory graph topology", description = "Returns nodes and edges for the interactive knowledge graph visualizer")
    public ApiResponse<GraphResponse> getGraph(@PathVariable String merchantId) {
        return ApiResponse.ok(memoryService.getGraph(merchantId));
    }

    @GetMapping({"/api/memory/stats/{merchantId}", "/api/v1/memory/stats/{merchantId}"})
    @Operation(summary = "Get memory statistics", description = "Returns node counts, edge counts, and entity distributions")
    public ApiResponse<StatsResponse> getStats(@PathVariable String merchantId) {
        return ApiResponse.ok(memoryService.getStats(merchantId));
    }

    @DeleteMapping({"/api/memory/{merchantId}", "/api/v1/memory/{merchantId}"})
    @Operation(summary = "Reset merchant memory", description = "Clears and resets memory dataset for the merchant")
    public ApiResponse<Map<String, Object>> reset(@PathVariable String merchantId) {
        return ApiResponse.ok(memoryService.reset(merchantId));
    }
}
