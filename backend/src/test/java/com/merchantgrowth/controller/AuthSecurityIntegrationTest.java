package com.merchantgrowth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.merchantgrowth.dto.AuthDtos.LoginRequestDto;
import com.merchantgrowth.security.JwtTokenService;
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
class AuthSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Test
    @DisplayName("1. POST /api/auth/login - Valid login returns signed JWT")
    void testValidLogin() throws Exception {
        LoginRequestDto req = LoginRequestDto.builder()
                .username("m-001")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isString())
                .andExpect(jsonPath("$.data.merchantId").value("m-001"))
                .andExpect(jsonPath("$.data.email").value("m001@merchantgrowth.ai"));
    }

    @Test
    @DisplayName("2. POST /api/auth/login - Login via email succeeds")
    void testLoginWithEmail() throws Exception {
        LoginRequestDto req = LoginRequestDto.builder()
                .username("ramesh@sharmatea.com")
                .password("merchant123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isString())
                .andExpect(jsonPath("$.data.merchantId").value("m-001"));
    }

    @Test
    @DisplayName("3. POST /api/auth/login - Wrong password returns 401 Unauthorized")
    void testInvalidPasswordReturns401() throws Exception {
        LoginRequestDto req = LoginRequestDto.builder()
                .username("m-001")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid username/email or password"));
    }

    @Test
    @DisplayName("4. POST /api/auth/login - Unknown username returns 401 Unauthorized")
    void testUnknownUserReturns401() throws Exception {
        LoginRequestDto req = LoginRequestDto.builder()
                .username("nonexistent_user")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid username/email or password"));
    }

    @Test
    @DisplayName("5. GET /api/dashboard/m-001 - Unauthenticated request returns 401 Unauthorized")
    void testUnauthenticatedAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/dashboard/m-001")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Unauthorized: Authentication token is required"));
    }

    @Test
    @DisplayName("6. GET /api/dashboard/m-001 - Invalid JWT token returns 401 Unauthorized")
    void testInvalidTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/dashboard/m-001")
                        .header("Authorization", "Bearer invalid.jwt.token")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("7. GET /api/dashboard/m-001 - Valid JWT for m-001 returns 200 OK")
    void testAuthenticatedAccessReturns200() throws Exception {
        String token = jwtTokenService.generateToken("usr-001", "m001@merchantgrowth.ai", "m-001", "MERCHANT");

        mockMvc.perform(get("/api/dashboard/m-001")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.merchant.id").value("m-001"));
    }

    @Test
    @DisplayName("8. GET /api/dashboard/m-002 - Cross-tenant access with m-001 token returns 403 Forbidden")
    void testCrossMerchantAccessReturns403() throws Exception {
        // User is authenticated as m-001, but attempts to access m-002's dashboard
        String token = jwtTokenService.generateToken("usr-001", "m001@merchantgrowth.ai", "m-001", "MERCHANT");

        mockMvc.perform(get("/api/dashboard/m-002")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Forbidden: You do not have permission to access resources for merchant m-002"));
    }

    @Test
    @DisplayName("9. GET /api/upi/latest - Public route accessible without token")
    void testPublicMarketRouteAccessibleWithoutToken() throws Exception {
        mockMvc.perform(get("/api/upi/latest")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
