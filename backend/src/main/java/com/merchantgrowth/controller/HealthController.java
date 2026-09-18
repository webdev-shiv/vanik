package com.merchantgrowth.controller;

import com.merchantgrowth.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@Tag(name = "Health", description = "System operational health monitoring")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "System Health Status", description = "Returns operational status of the Spring Boot backend service")
    public ApiResponse<Map<String, Object>> checkHealth() {
        return ApiResponse.ok(Map.of(
                "status", "UP",
                "service", "VANIK Spring Boot Backend",
                "version", "1.0.0",
                "timestamp", java.time.Instant.now().toString()
        ));
    }
}
