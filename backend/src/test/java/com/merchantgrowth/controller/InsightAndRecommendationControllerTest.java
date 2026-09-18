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
class InsightAndRecommendationControllerTest extends BaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/insights/{merchantId} - Fetch AI insights")
    void testGetInsights() throws Exception {
        mockMvc.perform(get("/api/insights/m-001")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/recommendations/{merchantId} - Fetch merchant recommendations")
    void testGetRecommendations() throws Exception {
        mockMvc.perform(get("/api/recommendations/m-001")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title").isNotEmpty())
                .andExpect(jsonPath("$.data[0].problem").isNotEmpty())
                .andExpect(jsonPath("$.data[0].recommendedAction").isNotEmpty())
                .andExpect(jsonPath("$.data[0].estimatedImpact").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/insights/explain - Generate OpenAI narrative explanation")
    void testExplainAnalytics() throws Exception {
        String payload = """
        {
          "merchant": "Sharma Tea Corner",
          "revenue_change": -11.4,
          "transaction_change": -8.2,
          "repeat_customer_change": -14.0,
          "contributors": [
            {
              "factor": "Evening transactions",
              "change_percent": -31.0
            }
          ],
          "recommendation": "evening_combo_offer"
        }
        """;

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/insights/explain")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.short_insight_title").isNotEmpty())
                .andExpect(jsonPath("$.data.explanation").isNotEmpty())
                .andExpect(jsonPath("$.data.evidence").isArray())
                .andExpect(jsonPath("$.data.recommended_action").isNotEmpty())
                .andExpect(jsonPath("$.data.reason_for_recommendation").isNotEmpty())
                .andExpect(jsonPath("$.data.expected_outcome_language").isNotEmpty())
                .andExpect(jsonPath("$.data.confidence_explanation").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/insights/explain - 400 Bad Request on missing merchant")
    void testExplainAnalyticsValidationFailure() throws Exception {
        String invalidPayload = """
        {
          "merchant": "",
          "revenue_change": -11.4,
          "transaction_change": -8.2,
          "repeat_customer_change": -14.0,
          "contributors": [],
          "recommendation": "evening_combo_offer"
        }
        """;

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/insights/explain")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
