package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private String id;
    private String sender;
    private String timestamp;
    private String content;

    @JsonProperty("cited_metrics")
    @JsonAlias({"citedMetrics", "cited_metrics"})
    private List<String> citedMetrics;

    private String intent;

    private List<QuickActionDto> quickActions;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuickActionDto {
        private String label;
        private String action;
        private String target;
        private Map<String, Object> payload;
    }
}
