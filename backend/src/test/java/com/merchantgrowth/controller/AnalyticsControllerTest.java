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
class AnalyticsControllerTest extends BaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/analytics/sales/{merchantId} - Sales Analytics Breakdown")
    void testGetSalesAnalytics() throws Exception {
        mockMvc.perform(get("/api/analytics/sales/m-001")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.merchantId").value("m-001"))
                .andExpect(jsonPath("$.data.totalRevenue").isNumber())
                .andExpect(jsonPath("$.data.dailyTrends").isArray())
                .andExpect(jsonPath("$.data.hourlyHeatmap").isArray());
    }

    @Test
    @DisplayName("GET /api/analytics/customers/{merchantId} - RFM & Churn Segmentation")
    void testGetCustomerAnalytics() throws Exception {
        mockMvc.perform(get("/api/analytics/customers/m-001")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.merchantId").value("m-001"))
                .andExpect(jsonPath("$.data.totalCustomers").isNumber())
                .andExpect(jsonPath("$.data.segments").isArray());
    }

    @Test
    @DisplayName("GET /api/analytics/products/{merchantId} - Top & Declining Products")
    void testGetProductAnalytics() throws Exception {
        mockMvc.perform(get("/api/analytics/products/m-001")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.merchantId").value("m-001"))
                .andExpect(jsonPath("$.data.topSellingProducts").isArray())
                .andExpect(jsonPath("$.data.topDecliningProducts").isArray());
    }

    @Test
    @DisplayName("GET /api/analytics/forecast/{merchantId} - ML Sales Forecast")
    void testGetSalesForecast() throws Exception {
        mockMvc.perform(get("/api/analytics/forecast/m-001")
                        .header("Authorization", "Bearer " + tokenM001)
                        .param("horizonDays", "7")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.merchant_id").value("m-001"))
                .andExpect(jsonPath("$.data.daily_forecasts").isArray());
    }

    @Test
    @DisplayName("GET /api/analytics/anomalies/{merchantId} - ML Anomaly Detection")
    void testGetAnomalyDetection() throws Exception {
        mockMvc.perform(get("/api/analytics/anomalies/m-001")
                        .header("Authorization", "Bearer " + tokenM001)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.merchant_id").value("m-001"))
                .andExpect(jsonPath("$.data.anomalies").isArray());
    }
}
