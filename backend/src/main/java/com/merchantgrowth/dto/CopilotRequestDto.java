package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CopilotRequestDto {
    private String query;

    @JsonProperty("merchant_id")
    @JsonAlias({"merchantId", "merchant_id"})
    private String merchantId;

    @JsonProperty("context_data")
    @JsonAlias({"contextData", "context_data"})
    private Map<String, Object> contextData;
}
