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
class MerchantControllerTest extends BaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/merchants/{merchantId} - Success for initialized merchant")
    void testGetMerchantByIdSuccess() throws Exception {
        mockMvc.perform(get("/api/merchants/m-001")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("m-001"))
                .andExpect(jsonPath("$.data.name").isNotEmpty());
    }

    @Test
    @DisplayName("GET /api/merchants/{merchantId} - 404 for non-existent merchant")
    void testGetMerchantByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/merchants/non-existent-id")
                        .header("Authorization", "Bearer " + tokenFor("non-existent-id"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
}
