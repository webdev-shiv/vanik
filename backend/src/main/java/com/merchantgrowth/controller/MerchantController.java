package com.merchantgrowth.controller;

import com.merchantgrowth.dto.ApiResponse;
import com.merchantgrowth.dto.GrowthHealthScoreDto;
import com.merchantgrowth.entity.MerchantEntity;
import com.merchantgrowth.service.MerchantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Merchants", description = "Merchant profiles and configurations")
public class MerchantController {

    private final MerchantService merchantService;

    @GetMapping({"/api/merchants/{merchantId}", "/api/v1/merchant/{merchantId}"})
    @Operation(summary = "Get merchant by ID", description = "Retrieves merchant business details, city, and status")
    public ApiResponse<MerchantEntity> getMerchantById(@PathVariable String merchantId) {
        return ApiResponse.ok(merchantService.getMerchantById(merchantId));
    }

    @GetMapping({"/api/merchants", "/api/v1/merchant/all"})
    @Operation(summary = "List all merchants", description = "Retrieves all registered merchants for platform administration")
    public ApiResponse<List<MerchantEntity>> getAllMerchants() {
        return ApiResponse.ok(merchantService.getAllMerchants());
    }

    @GetMapping({"/api/merchants/profile", "/api/merchants/current/profile", "/api/v1/merchant/profile"})
    @Operation(summary = "Get active merchant profile", description = "Retrieves active merchant profile session")
    public ApiResponse<MerchantEntity> getProfile(jakarta.servlet.http.HttpServletRequest request) {
        String merchantId = (String) request.getAttribute("authenticatedMerchantId");
        if (merchantId != null && !merchantId.isBlank()) {
            return ApiResponse.ok(merchantService.getMerchantById(merchantId));
        }
        return ApiResponse.ok(merchantService.getCurrentMerchant());
    }

    @PutMapping({"/api/merchants/profile", "/api/v1/merchant/profile"})
    @Operation(summary = "Update authenticated merchant profile", description = "Updates profile attributes for authenticated merchant")
    public ApiResponse<MerchantEntity> updateProfile(
            jakarta.servlet.http.HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        String merchantId = (String) request.getAttribute("authenticatedMerchantId");
        if (merchantId == null || merchantId.isBlank()) {
            merchantId = merchantService.getCurrentMerchant().getId();
        }
        MerchantEntity updated = merchantService.updateMerchantProfile(merchantId, body);
        return ApiResponse.ok(updated, "Merchant profile updated successfully");
    }

    @PostMapping({"/api/merchants/switch/{id}", "/api/v1/merchant/switch/{id}"})
    @Operation(summary = "Switch active demo merchant", description = "Switches active merchant context for demo purposes")
    public ApiResponse<MerchantEntity> switchMerchant(@PathVariable String id) {
        return ApiResponse.ok(merchantService.switchMerchant(id));
    }

    @PostMapping({"/api/merchants/connection-mode", "/api/v1/merchant/connection-mode"})
    @Operation(summary = "Update data connection mode", description = "Updates live or simulated connection mode")
    public ApiResponse<MerchantEntity> updateConnectionMode(@RequestBody Map<String, String> body) {
        String mode = body.getOrDefault("mode", "CONNECTED_DEMO");
        return ApiResponse.ok(merchantService.updateConnectionMode(mode));
    }

    @GetMapping({"/api/merchants/health-score", "/api/v1/merchant/health-score"})
    @Operation(summary = "Get merchant growth health score", description = "Retrieves AI calculated growth health score and diagnostic breakdown")
    public ApiResponse<GrowthHealthScoreDto> getHealthScore() {
        return ApiResponse.ok(merchantService.getGrowthHealth());
    }
}
