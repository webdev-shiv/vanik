package com.merchantgrowth.controller;

import com.merchantgrowth.dto.ApiResponse;
import com.merchantgrowth.dto.CustomerAnalyticsDto;
import com.merchantgrowth.dto.CustomerSegmentSummaryDto;
import com.merchantgrowth.entity.CustomerEntity;
import com.merchantgrowth.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/customers", "/api/customers"})
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Merchant customer profiles and segmentation")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @Operation(summary = "Get all customers for merchant")
    public ApiResponse<List<CustomerEntity>> getAllCustomers(@RequestParam(value = "merchantId", required = false) String merchantId) {
        return ApiResponse.ok(customerService.getCustomersByMerchant(merchantId));
    }

    @GetMapping("/segments")
    @Operation(summary = "Get customer segment summaries")
    public ApiResponse<List<CustomerSegmentSummaryDto>> getSegmentSummaries(@RequestParam(value = "merchantId", required = false) String merchantId) {
        String effectiveMerchantId = (merchantId != null && !merchantId.isBlank()) ? merchantId : "m-001";
        return ApiResponse.ok(customerService.getSegmentSummaries(effectiveMerchantId));
    }

    @GetMapping("/segments/{merchantId}")
    @Operation(summary = "Get customer segment summaries by merchant ID")
    public ApiResponse<List<CustomerSegmentSummaryDto>> getSegmentSummariesByMerchant(@PathVariable String merchantId) {
        return ApiResponse.ok(customerService.getSegmentSummaries(merchantId));
    }

    @GetMapping("/analytics/{merchantId}")
    @Operation(summary = "Get customer analytics overview by merchant ID")
    public ApiResponse<CustomerAnalyticsDto> getCustomerAnalytics(@PathVariable String merchantId) {
        return ApiResponse.ok(customerService.getCustomerAnalytics(merchantId));
    }
}

