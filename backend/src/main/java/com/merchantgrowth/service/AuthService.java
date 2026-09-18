package com.merchantgrowth.service;

import com.merchantgrowth.dto.AuthDtos.LoginRequestDto;
import com.merchantgrowth.dto.AuthDtos.LoginResponseDto;
import com.merchantgrowth.entity.MerchantEntity;
import com.merchantgrowth.entity.MerchantUserEntity;
import com.merchantgrowth.exception.UnauthorizedException;
import com.merchantgrowth.repository.MerchantRepository;
import com.merchantgrowth.repository.MerchantUserRepository;
import com.merchantgrowth.security.JwtTokenService;
import com.merchantgrowth.security.PasswordHasher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final MerchantUserRepository merchantUserRepository;
    private final MerchantRepository merchantRepository;
    private final PasswordHasher passwordHasher;
    private final JwtTokenService jwtTokenService;

    public LoginResponseDto login(LoginRequestDto req) {
        String identifier = req.getUsername() != null ? req.getUsername().trim() : "";
        log.info("Processing login request for identifier: {}", identifier);

        MerchantUserEntity user = merchantUserRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() -> {
                    log.warn("Authentication failed: User identifier '{}' not found", identifier);
                    return new UnauthorizedException("Invalid username/email or password");
                });

        boolean passwordValid = passwordHasher.verifyPassword(req.getPassword(), user.getSalt(), user.getPasswordHash());
        if (!passwordValid) {
            log.warn("Authentication failed: Invalid credentials for user '{}'", identifier);
            throw new UnauthorizedException("Invalid username/email or password");
        }

        if (!user.isActive()) {
            log.warn("Authentication failed: Account '{}' is deactivated", identifier);
            throw new UnauthorizedException("Account is disabled. Please contact system support.");
        }

        MerchantEntity merchant = merchantRepository.findById(user.getMerchantId())
                .orElseGet(() -> MerchantEntity.builder()
                        .id(user.getMerchantId())
                        .name(user.getFullName() != null ? user.getFullName() : "Merchant Business")
                        .build());

        String token = jwtTokenService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getMerchantId(),
                user.getRole()
        );

        long expiresIn = 86400L; // 24 hours

        return LoginResponseDto.builder()
                .token(token)
                .merchantId(merchant.getId())
                .merchantName(merchant.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .expiresIn(expiresIn)
                .build();
    }
}
