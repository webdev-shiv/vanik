package com.merchantgrowth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.merchantgrowth.dto.ApiResponse;
import com.merchantgrowth.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtTokenService jwtTokenService;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Allow CORS pre-flight OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: Authentication token is required");
            return false;
        }

        String token = authHeader.substring(7).trim();
        JwtTokenService.JwtClaims claims;
        try {
            claims = jwtTokenService.validateAndExtract(token);
        } catch (UnauthorizedException ue) {
            writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: " + ue.getMessage());
            return false;
        } catch (Exception e) {
            writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: Invalid authentication token");
            return false;
        }

        // Enforce Merchant Ownership Check
        String targetMerchantId = extractTargetMerchantId(request);
        if (targetMerchantId != null && !targetMerchantId.isBlank()) {
            String tokenMerchantId = claims.merchantId();
            if (tokenMerchantId != null && !tokenMerchantId.equalsIgnoreCase(targetMerchantId)
                    && !"SYSTEM_ADMIN".equalsIgnoreCase(claims.role())) {
                log.warn("Cross-tenant access blocked: User {} (merchant {}) attempted access to merchant {}",
                        claims.email(), tokenMerchantId, targetMerchantId);
                writeErrorResponse(response, HttpServletResponse.SC_FORBIDDEN,
                        "Forbidden: You do not have permission to access resources for merchant " + targetMerchantId);
                return false;
            }
        }

        // Attach verified claims to request attributes for downstream handlers
        request.setAttribute("authenticatedUserId", claims.sub());
        request.setAttribute("authenticatedMerchantId", claims.merchantId());
        request.setAttribute("authenticatedRole", claims.role());
        request.setAttribute("authenticatedEmail", claims.email());

        return true;
    }

    private String extractTargetMerchantId(HttpServletRequest request) {
        // 1. Check path variables resolved by Spring MVC
        @SuppressWarnings("unchecked")
        Map<String, String> pathVariables = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (pathVariables != null && pathVariables.containsKey("merchantId")) {
            return pathVariables.get("merchantId");
        }

        // 2. Check query parameter
        String queryMerchantId = request.getParameter("merchantId");
        if (queryMerchantId != null && !queryMerchantId.isBlank()) {
            return queryMerchantId.trim();
        }

        String queryMerchant_id = request.getParameter("merchant_id");
        if (queryMerchant_id != null && !queryMerchant_id.isBlank()) {
            return queryMerchant_id.trim();
        }

        // 3. Check direct URI segment if matches merchant ID pattern (e.g. /api/dashboard/m-001)
        String uri = request.getRequestURI();
        if (uri != null) {
            String[] segments = uri.split("/");
            for (int i = 0; i < segments.length; i++) {
                if ("dashboard".equals(segments[i]) || "campaigns".equals(segments[i]) ||
                    "insights".equals(segments[i]) || "recommendations".equals(segments[i]) ||
                    "customers".equals(segments[i]) || "sales".equals(segments[i]) ||
                    "forecast".equals(segments[i]) || "anomalies".equals(segments[i]) ||
                    "root-cause".equals(segments[i]) || "segmentation".equals(segments[i])) {
                    if (i + 1 < segments.length && !segments[i + 1].isBlank() && !segments[i + 1].startsWith("v1")) {
                        String candidate = segments[i + 1].trim();
                        // Ignore action endpoints
                        if ("explain".equalsIgnoreCase(candidate) ||
                            "explain-analytics".equalsIgnoreCase(candidate) ||
                            "chat".equalsIgnoreCase(candidate) ||
                            "run".equalsIgnoreCase(candidate) ||
                            "batch".equalsIgnoreCase(candidate)) {
                            continue;
                        }
                        return candidate;
                    }
                }
            }
        }

        return null;
    }

    private void writeErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");

        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(false)
                .message(message)
                .timestamp(Instant.now().toString())
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}
