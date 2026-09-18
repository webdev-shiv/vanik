package com.merchantgrowth.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=true"
})
@AutoConfigureMockMvc
class UpiMarketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/upi/latest - Latest official NPCI monthly statistics")
    void testGetLatest() throws Exception {
        mockMvc.perform(get("/api/upi/latest")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.month").isNotEmpty())
                .andExpect(jsonPath("$.transactionVolumeMillion").isNumber())
                .andExpect(jsonPath("$.transactionValueCrore").isNumber())
                .andExpect(jsonPath("$.source").value("NPCI"));
    }

    @Test
    @DisplayName("GET /api/upi/monthly-trends - Chronological monthly time-series")
    void testGetMonthlyTrends() throws Exception {
        mockMvc.perform(get("/api/upi/monthly-trends")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(10))))
                .andExpect(jsonPath("$[0].source").value("NPCI"))
                .andExpect(jsonPath("$[0].transactionVolumeMillion").isNumber());
    }

    @Test
    @DisplayName("GET /api/upi/growth - Calculated MoM and YoY trends")
    void testGetGrowth() throws Exception {
        mockMvc.perform(get("/api/upi/growth")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentMonth").isNotEmpty())
                .andExpect(jsonPath("$.source").value("NPCI"));
    }

    @Test
    @DisplayName("GET /api/upi/market-summary - Aggregated summary with latest & growth")
    void testGetMarketSummary() throws Exception {
        mockMvc.perform(get("/api/upi/market-summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.latest.month").isNotEmpty())
                .andExpect(jsonPath("$.growth").isNotEmpty())
                .andExpect(jsonPath("$.totalMonthsAvailable", greaterThanOrEqualTo(10)))
                .andExpect(jsonPath("$.source").value("NPCI"));
    }
}
