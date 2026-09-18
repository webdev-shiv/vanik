package com.merchantgrowth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiMetricDto {
    @JsonProperty("id")
    private String id;

    @JsonProperty("label")
    @JsonAlias({"title"})
    private String label;

    @JsonProperty("title")
    private String title;

    @JsonProperty("value")
    private String value;

    @JsonProperty("numericValue")
    @JsonAlias({"rawNumericValue"})
    private double numericValue;

    @JsonProperty("changePercent")
    private double changePercent;

    @JsonProperty("isPositive")
    private boolean isPositive;

    @JsonProperty("changeDirection")
    private String changeDirection;

    @JsonProperty("trend")
    private String trend;

    @JsonProperty("comparisonPeriod")
    @JsonAlias({"timeframe"})
    private String comparisonPeriod;

    @JsonProperty("subLabel")
    @JsonAlias({"description"})
    private String subLabel;

    @JsonProperty("badge")
    private String badge;

    public String getTitle() {
        return title != null ? title : label;
    }

    public String getLabel() {
        return label != null ? label : title;
    }
}
