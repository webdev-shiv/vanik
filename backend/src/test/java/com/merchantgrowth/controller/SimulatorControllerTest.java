package com.merchantgrowth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.merchantgrowth.dto.SimulationDtos.RunSimulationRequestDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SimulatorControllerTest extends BaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/simulator/run - Run What-If Simulation")
    void testRunSimulationSuccess() throws Exception {
        RunSimulationRequestDto req = RunSimulationRequestDto.builder()
                .merchantId("m-001")
                .action("evening offer")
                .discountPercentage(20.0)
                .duration(14)
                .targetCustomerSegment("At Risk")
                .expectedCampaignReach(300)
                .budget(1000.0)
                .build();

        mockMvc.perform(post("/api/simulator/run")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.baseline.revenue").isNumber())
                .andExpect(jsonPath("$.data.scenario.revenue").isNumber())
                .andExpect(jsonPath("$.data.incremental.revenue").isNumber())
                .andExpect(jsonPath("$.data.confidence").isNumber())
                .andExpect(jsonPath("$.data.disclaimer").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/simulator/run - 400 Bad Request on negative discount")
    void testRunSimulationNegativeDiscount() throws Exception {
        RunSimulationRequestDto req = RunSimulationRequestDto.builder()
                .merchantId("m-001")
                .action("evening offer")
                .discountPercentage(-10.0)
                .duration(14)
                .targetCustomerSegment("At Risk")
                .expectedCampaignReach(300)
                .build();

        mockMvc.perform(post("/api/simulator/run")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
