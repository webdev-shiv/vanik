package com.merchantgrowth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrowthHealthScoreDto {
    private int overallScore;
    private int score;
    private String grade;
    private String summary;
    private String revenueHealth;
    private String retentionHealth;
    private String footfallHealth;
    private String marginHealth;
    private String primaryBottleneck;
    private Map<String, Integer> breakdown;
}
