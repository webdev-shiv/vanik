package com.merchantgrowth.controller;

import com.merchantgrowth.dto.ApiResponse;
import com.merchantgrowth.dto.SimulationDtos.RunSimulationRequestDto;
import com.merchantgrowth.dto.SimulationDtos.RunSimulationResponseDto;
import com.merchantgrowth.service.SimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Simulator", description = "What-If scenario projection and predictive outcome simulation")
public class SimulatorController {

    private final SimulationService simulationService;

    @PostMapping({"/api/simulator/run", "/api/v1/simulator/run"})
    @Operation(summary = "Run What-If business growth simulation", description = "Projects estimated revenue, transaction volume, and customer impact for promotional scenarios")
    public ApiResponse<RunSimulationResponseDto> runSimulation(@Valid @RequestBody RunSimulationRequestDto request) {
        RunSimulationResponseDto result = simulationService.runSimulation(request);
        return ApiResponse.ok(result, "Simulation calculated successfully");
    }
}
