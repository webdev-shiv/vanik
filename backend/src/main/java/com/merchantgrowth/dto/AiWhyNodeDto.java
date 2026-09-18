package com.merchantgrowth.dto;

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
public class AiWhyNodeDto {
    private String id;
    private String title;
    private String subtitle;
    private String stat;
    private double percentChange;
    private double impactContribution;
    private double confidence;
    private String category;
    private String description;
    private List<String> evidence;
    private String recommendedFixId;
    private List<Map<String, Object>> supportingData;
    private List<String> childrenIds;
    private String parentId;
}
