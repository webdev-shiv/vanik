package com.merchantgrowth.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI merchantGrowthOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Merchant Growth AI - REST API")
                        .description("Backend REST service powering Merchant Growth AI analytics, campaigns, recommendations, and simulations.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Merchant Growth AI Engineering Team")
                                .email("dev@merchantgrowth.ai"))
                        .license(new License().name("Apache 2.0")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server")
                ));
    }
}
