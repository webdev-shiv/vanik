package com.merchantgrowth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequestDto {
        @NotBlank(message = "Username or email is required")
        private String username;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponseDto {
        private String token;
        private String merchantId;
        private String merchantName;
        private String email;
        private String role;
        private long expiresIn;
    }
}
