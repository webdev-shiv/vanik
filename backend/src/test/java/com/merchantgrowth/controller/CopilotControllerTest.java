package com.merchantgrowth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.merchantgrowth.dto.CopilotRequestDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CopilotControllerTest extends BaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Query 1: Why are my sales down?")
    void testCopilotWhySalesDown() throws Exception {
        CopilotRequestDto request = CopilotRequestDto.builder()
                .query("Why are my sales down?")
                .merchantId("m-001")
                .build();

        mockMvc.perform(post("/api/copilot/chat")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sender").value("ai"))
                .andExpect(jsonPath("$.data.content").isNotEmpty())
                .andExpect(jsonPath("$.data.cited_metrics", not(empty())))
                .andExpect(jsonPath("$.data.intent", notNullValue()))
                .andExpect(jsonPath("$.data.quickActions", isA(java.util.List.class)));
    }

    @Test
    @DisplayName("Query 2: Which customers should I target?")
    void testCopilotWhichCustomersToTarget() throws Exception {
        CopilotRequestDto request = CopilotRequestDto.builder()
                .query("Which customers should I target?")
                .merchantId("m-001")
                .build();

        mockMvc.perform(post("/api/copilot/chat")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isNotEmpty())
                .andExpect(jsonPath("$.data.cited_metrics", not(empty())));
    }

    @Test
    @DisplayName("Query 3: What should I do this weekend?")
    void testCopilotWeekendStrategy() throws Exception {
        CopilotRequestDto request = CopilotRequestDto.builder()
                .query("What should I do this weekend?")
                .merchantId("m-001")
                .build();

        mockMvc.perform(post("/api/copilot/chat")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isNotEmpty())
                .andExpect(jsonPath("$.data.cited_metrics", not(empty())));
    }

    @Test
    @DisplayName("Query 4: Which campaign performed best?")
    void testCopilotBestCampaign() throws Exception {
        CopilotRequestDto request = CopilotRequestDto.builder()
                .query("Which campaign performed best?")
                .merchantId("m-001")
                .build();

        mockMvc.perform(post("/api/copilot/chat")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isNotEmpty())
                .andExpect(jsonPath("$.data.cited_metrics", not(empty())));
    }

    @Test
    @DisplayName("Query 5: What happens if I give 10% discount?")
    void testCopilotDiscountSimulation() throws Exception {
        CopilotRequestDto request = CopilotRequestDto.builder()
                .query("What happens if I give 10% discount?")
                .merchantId("m-001")
                .build();

        mockMvc.perform(post("/api/copilot/chat")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isNotEmpty())
                .andExpect(jsonPath("$.data.cited_metrics", not(empty())));
    }

    @Test
    @DisplayName("Query 6: Which products are declining?")
    void testCopilotDecliningProducts() throws Exception {
        CopilotRequestDto request = CopilotRequestDto.builder()
                .query("Which products are declining?")
                .merchantId("m-001")
                .build();

        mockMvc.perform(post("/api/copilot/chat")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isNotEmpty())
                .andExpect(jsonPath("$.data.cited_metrics", not(empty())));
    }

    @Test
    @DisplayName("Query 7: How can I improve repeat customers?")
    void testCopilotImproveRepeatCustomers() throws Exception {
        CopilotRequestDto request = CopilotRequestDto.builder()
                .query("How can I improve repeat customers?")
                .merchantId("m-001")
                .build();

        mockMvc.perform(post("/api/copilot/chat")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isNotEmpty())
                .andExpect(jsonPath("$.data.cited_metrics", not(empty())));
    }

    @Test
    @DisplayName("Strict Multi-Tenant Isolation - Unknown Merchant returns 404")
    void testMultiTenantIsolationUnknownMerchant() throws Exception {
        CopilotRequestDto request = CopilotRequestDto.builder()
                .query("Why are my sales down?")
                .merchantId("m-invalid-unauthorized-id")
                .build();

        mockMvc.perform(post("/api/copilot/chat")
                        .header("Authorization", "Bearer " + tokenFor("m-invalid-unauthorized-id"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Direct Merchant Path: POST /api/copilot/chat/{merchantId}")
    void testCopilotChatMerchantPath() throws Exception {
        CopilotRequestDto request = CopilotRequestDto.builder()
                .query("What should I do this weekend?")
                .build();

        mockMvc.perform(post("/api/copilot/chat/m-001")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isNotEmpty());
    }

    @Test
    @DisplayName("Backward Compatibility: POST /api/v1/ai/assistant/chat")
    void testLegacyAssistantChat() throws Exception {
        Map<String, String> body = Map.of("query", "Why are my sales down?");

        mockMvc.perform(post("/api/v1/ai/assistant/chat")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isNotEmpty())
                .andExpect(jsonPath("$.data.cited_metrics", not(empty())));
    }
}
