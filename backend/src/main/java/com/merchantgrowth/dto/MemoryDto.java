package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public class MemoryDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IngestRequest {
        @JsonProperty("merchant_id")
        @JsonAlias({"merchantId", "merchant_id"})
        private String merchantId;

        @JsonProperty("force_refresh")
        @JsonAlias({"forceRefresh", "force_refresh"})
        private Boolean forceRefresh;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IngestResponse {
        private String status;

        @JsonProperty("merchant_id")
        private String merchantId;

        @JsonProperty("documents_ingested")
        private Integer documentsIngested;

        @JsonProperty("nodes_created")
        private Integer nodesCreated;

        @JsonProperty("edges_created")
        private Integer edgesCreated;

        @JsonProperty("cognee_active")
        private Boolean cogneeActive;

        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventRequest {
        @JsonProperty("merchant_id")
        @JsonAlias({"merchantId", "merchant_id"})
        private String merchantId;

        @JsonProperty("event_type")
        @JsonAlias({"eventType", "event_type"})
        private String eventType;

        private Map<String, Object> payload;

        private String timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecallRequest {
        @JsonProperty("merchant_id")
        @JsonAlias({"merchantId", "merchant_id"})
        private String merchantId;

        private String query;

        private String mode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecallResponse {
        private String query;
        private String answer;
        private List<String> sources;

        @JsonProperty("related_nodes")
        @JsonAlias({"relatedNodes", "related_nodes"})
        private List<String> relatedNodes;

        private Double confidence;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GraphNode {
        private String id;
        private String label;
        private String type;
        private Double weight;
        private Map<String, Object> details;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GraphEdge {
        private String source;
        private String target;
        private String relationship;
        private Double weight;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GraphResponse {
        @JsonProperty("merchant_id")
        private String merchantId;

        private List<GraphNode> nodes;
        private List<GraphEdge> edges;

        @JsonProperty("total_nodes")
        private Integer totalNodes;

        @JsonProperty("total_edges")
        private Integer totalEdges;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatsResponse {
        @JsonProperty("merchant_id")
        private String merchantId;

        @JsonProperty("node_count")
        @JsonAlias({"nodeCount", "node_count"})
        private Integer nodeCount;

        @JsonProperty("edge_count")
        @JsonAlias({"edgeCount", "edge_count"})
        private Integer edgeCount;

        @JsonProperty("document_count")
        @JsonAlias({"documentCount", "document_count"})
        private Integer documentCount;

        @JsonProperty("last_updated")
        @JsonAlias({"lastUpdated", "last_updated"})
        private String lastUpdated;

        @JsonProperty("top_entity_types")
        @JsonAlias({"topEntityTypes", "top_entity_types"})
        private Map<String, Integer> topEntityTypes;

        @JsonProperty("engine_status")
        @JsonAlias({"engineStatus", "engine_status"})
        private String engineStatus;
    }
}
