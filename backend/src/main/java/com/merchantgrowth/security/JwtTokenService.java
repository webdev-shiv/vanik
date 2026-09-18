package com.merchantgrowth.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.merchantgrowth.exception.UnauthorizedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Service
@Slf4j
public class JwtTokenService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private final String secretKey;
    private final long expirationSeconds;
    private final ObjectMapper objectMapper;

    public record JwtClaims(
            String sub,
            String email,
            String merchantId,
            String role,
            long issuedAt,
            long expiresAt
    ) {}

    public JwtTokenService(
            @Value("${security.jwt.secret:${SUPABASE_JWT_SECRET:vanik-merchant-growth-secure-jwt-secret-key-2026-min-32-chars}}") String secretKey,
            @Value("${security.jwt.expiration-seconds:86400}") long expirationSeconds,
            ObjectMapper objectMapper
    ) {
        this.secretKey = (secretKey == null || secretKey.isBlank())
                ? "vanik-merchant-growth-secure-jwt-secret-key-2026-min-32-chars"
                : secretKey.trim();
        this.expirationSeconds = expirationSeconds > 0 ? expirationSeconds : 86400L;
        this.objectMapper = objectMapper;
    }

    public String generateToken(String userId, String email, String merchantId, String role) {
        long now = Instant.now().getEpochSecond();
        long exp = now + expirationSeconds;

        String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String headerBase64 = base64UrlEncode(headerJson.getBytes(StandardCharsets.UTF_8));

        Map<String, Object> payloadMap = Map.of(
                "sub", userId,
                "email", email,
                "merchant_id", merchantId,
                "role", role,
                "iat", now,
                "exp", exp
        );

        try {
            String payloadJson = objectMapper.writeValueAsString(payloadMap);
            String payloadBase64 = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));
            String dataToSign = headerBase64 + "." + payloadBase64;
            String signatureBase64 = signHmac(dataToSign);

            return dataToSign + "." + signatureBase64;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate JWT token", e);
        }
    }

    public JwtClaims validateAndExtract(String token) {
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Authentication token is missing");
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new UnauthorizedException("Invalid JWT token format");
        }

        String dataToSign = parts[0] + "." + parts[1];
        String expectedSignature = signHmac(dataToSign);

        if (!MessageDigest.isEqual(parts[2].getBytes(StandardCharsets.UTF_8), expectedSignature.getBytes(StandardCharsets.UTF_8))) {
            throw new UnauthorizedException("Invalid JWT token signature");
        }

        try {
            byte[] payloadBytes = base64UrlDecode(parts[1]);
            JsonNode payloadNode = objectMapper.readTree(payloadBytes);

            long exp = payloadNode.has("exp") ? payloadNode.get("exp").asLong() : 0L;
            long now = Instant.now().getEpochSecond();
            if (exp > 0 && exp < now) {
                throw new UnauthorizedException("Authentication token has expired");
            }

            String sub = payloadNode.has("sub") ? payloadNode.get("sub").asText() : "";
            String email = payloadNode.has("email") ? payloadNode.get("email").asText() : "";
            String merchantId = payloadNode.has("merchant_id")
                    ? payloadNode.get("merchant_id").asText()
                    : (payloadNode.has("merchantId") ? payloadNode.get("merchantId").asText() : "");
            String role = payloadNode.has("role") ? payloadNode.get("role").asText() : "MERCHANT_ADMIN";
            long iat = payloadNode.has("iat") ? payloadNode.get("iat").asLong() : 0L;

            return new JwtClaims(sub, email, merchantId, role, iat, exp);
        } catch (UnauthorizedException ue) {
            throw ue;
        } catch (Exception e) {
            throw new UnauthorizedException("Failed to decode token claims: " + e.getMessage());
        }
    }

    private String signHmac(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
            mac.init(secretKeySpec);
            byte[] signedBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(signedBytes);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to compute HMAC signature", e);
        }
    }

    private static String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static byte[] base64UrlDecode(String base64Url) {
        return Base64.getUrlDecoder().decode(base64Url);
    }
}
