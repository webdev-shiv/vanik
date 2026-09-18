package com.merchantgrowth.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DashboardControllerTest extends BaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/dashboard/{merchantId} - Aggregated dashboard metrics")
    void testGetDashboardSummary() throws Exception {
        mockMvc.perform(get("/api/dashboard/m-001")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.merchant.id").value("m-001"))
                .andExpect(jsonPath("$.data.kpis").isArray())
                .andExpect(jsonPath("$.data.healthScore.score").isNumber())
                .andExpect(jsonPath("$.data.recentAlerts").isArray())
                .andExpect(jsonPath("$.data.topRecommendations").isArray());
    }
}
