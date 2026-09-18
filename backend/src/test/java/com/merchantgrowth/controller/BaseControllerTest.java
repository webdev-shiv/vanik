package com.merchantgrowth.controller;

import com.merchantgrowth.security.JwtTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;

public abstract class BaseControllerTest {

    @Autowired
    protected JwtTokenService jwtTokenService;

    protected String tokenM001;

    @BeforeEach
    void initToken() {
        tokenM001 = jwtTokenService.generateToken("usr-001", "m001@merchantgrowth.ai", "m-001", "MERCHANT");
    }

    protected String tokenFor(String merchantId) {
        return jwtTokenService.generateToken("usr-test", merchantId + "@test.com", merchantId, "MERCHANT");
    }
}
