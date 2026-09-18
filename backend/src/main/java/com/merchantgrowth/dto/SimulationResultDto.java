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
public class SimulationResultDto {
    private SimulationScenarioDto scenario;
    private List<SimulationScenarioDto> comparison;
    private List<Map<String, Object>> sensitivityMatrix;
}
