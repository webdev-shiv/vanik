package com.merchantgrowth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private String timestamp;
    private Map<String, Object> meta;

    public static <T> ApiResponse<T> ok(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .timestamp(Instant.now().toString())
                .meta(Map.of(
                        "source", "PAYTM_SIMULATED_DATA_ENGINE",
                        "apiVersion", "v1.4-hackathon-preview",
                        "processingTimeMs", 25
                ))
                .build();
    }

    public static <T> ApiResponse<T> ok(T data) {
        return ok(data, "Success");
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .data(null)
                .message(message)
                .timestamp(Instant.now().toString())
                .meta(Map.of(
                        "source", "PAYTM_SIMULATED_DATA_ENGINE",
                        "apiVersion", "v1.4-hackathon-preview"
                ))
                .build();
    }
}
