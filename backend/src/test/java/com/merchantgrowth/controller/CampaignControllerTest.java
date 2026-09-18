package com.merchantgrowth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.merchantgrowth.dto.CampaignDtos.CreateCampaignRequestDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CampaignControllerTest extends BaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/campaigns/{merchantId} - Fetch merchant campaigns")
    void testGetCampaignsByMerchantId() throws Exception {
        mockMvc.perform(get("/api/campaigns/m-001")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("POST /api/campaigns - Launch valid campaign")
    void testCreateCampaign() throws Exception {
        CreateCampaignRequestDto dto = CreateCampaignRequestDto.builder()
                .merchantId("m-001")
                .name("Weekend Chai Festival")
                .actionType("weekend offer")
                .discountPercentage(15.0)
                .durationDays(7)
                .targetSegment("Loyal Customers")
                .budget(500.0)
                .build();

        mockMvc.perform(post("/api/campaigns")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNotEmpty())
                .andExpect(jsonPath("$.data.name").value("Weekend Chai Festival"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.discountValue").value(15.0))
                .andExpect(jsonPath("$.data.targetSegment").value("Loyal Customers"))
                .andExpect(jsonPath("$.data.budget").value(500.0))
                .andExpect(jsonPath("$.data.spentSoFar").value(0.0));
    }

    @Test
    @DisplayName("POST /api/campaigns - Reject invalid discount percentage")
    void testCreateCampaignInvalidDiscount() throws Exception {
        CreateCampaignRequestDto dto = CreateCampaignRequestDto.builder()
                .merchantId("m-001")
                .name("Excessive Discount Campaign")
                .actionType("flash offer")
                .discountPercentage(150.0) // Invalid: > 100
                .durationDays(7)
                .build();

        mockMvc.perform(post("/api/campaigns")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/campaigns - Reject non-existent merchant")
    void testCreateCampaignNonExistentMerchant() throws Exception {
        CreateCampaignRequestDto dto = CreateCampaignRequestDto.builder()
                .merchantId("m-999-invalid")
                .name("Ghost Merchant Campaign")
                .actionType("flash offer")
                .discountPercentage(10.0)
                .durationDays(7)
                .build();

        mockMvc.perform(post("/api/campaigns")
                        .header("Authorization", "Bearer " + tokenFor("m-999-invalid"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }
}
