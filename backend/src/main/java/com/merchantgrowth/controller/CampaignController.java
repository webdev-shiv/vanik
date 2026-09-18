package com.merchantgrowth.controller;

import com.merchantgrowth.dto.ApiResponse;
import com.merchantgrowth.dto.CampaignDtos.CreateCampaignRequestDto;
import com.merchantgrowth.entity.CampaignEntity;
import com.merchantgrowth.entity.CampaignResultEntity;
import com.merchantgrowth.service.CampaignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Campaigns", description = "Growth campaign creation, status management, and performance tracking")
public class CampaignController {

    private final CampaignService campaignService;

    @GetMapping({"/api/campaigns/{merchantId}", "/api/v1/campaigns/merchant/{merchantId}"})
    @Operation(summary = "Get merchant campaigns", description = "Retrieves all campaigns launched by a specific merchant")
    public ApiResponse<List<CampaignEntity>> getCampaignsByMerchantId(@PathVariable String merchantId) {
        return ApiResponse.ok(campaignService.getCampaignsByMerchantId(merchantId));
    }

    @GetMapping({"/api/campaigns", "/api/v1/campaigns"})
    @Operation(summary = "List all campaigns", description = "Lists all campaigns across merchants")
    public ApiResponse<List<CampaignEntity>> getAllCampaigns() {
        return ApiResponse.ok(campaignService.getAllCampaigns());
    }

    @GetMapping({"/api/campaigns/{id}/results", "/api/v1/campaigns/{id}/results"})
    @Operation(summary = "Get campaign performance results", description = "Retrieves incremental revenue, ROI, and transaction lift for a campaign")
    public ResponseEntity<ApiResponse<CampaignEntity>> getCampaignResults(@PathVariable String id) {
        return campaignService.getCampaignById(id)
                .map(campaign -> ResponseEntity.ok(ApiResponse.ok(campaign)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping({"/api/campaigns", "/api/v1/campaigns/create"})
    @Operation(summary = "Create and launch campaign", description = "Launches an AI-configured growth campaign")
    public ApiResponse<CampaignEntity> createCampaign(@Valid @RequestBody CreateCampaignRequestDto dto) {
        return ApiResponse.ok(campaignService.createCampaignFromDto(dto), "Campaign Approved & Launched Successfully");
    }

    @PostMapping("/api/v1/campaigns")
    @Operation(summary = "Launch campaign entity directly", description = "Launches pre-built campaign entity")
    public ApiResponse<CampaignEntity> launchCampaign(@RequestBody CampaignEntity newCampaign) {
        return ApiResponse.ok(campaignService.createCampaign(newCampaign), "Campaign Approved & Launched Successfully");
    }

    @PatchMapping({"/api/campaigns/{id}/status", "/api/v1/campaigns/{id}/status"})
    @Operation(summary = "Update campaign status", description = "Activates, pauses, or archives a campaign")
    public ResponseEntity<ApiResponse<CampaignEntity>> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "RUNNING");
        return campaignService.updateStatus(id, status)
                .map(campaign -> ResponseEntity.ok(ApiResponse.ok(campaign)))
                .orElse(ResponseEntity.notFound().build());
    }
}
