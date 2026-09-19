package com.merchantgrowth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "merchant_report_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchantReportSettingsEntity {

    @Id
    @Column(name = "merchant_id", length = 64)
    private String merchantId;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Column(name = "report_time", length = 16, nullable = false)
    private String reportTime; // "22:30"

    @Column(name = "language", length = 32, nullable = false)
    private String language; // "hinglish", "hindi", "english"

    @Column(name = "report_length", length = 32, nullable = false)
    private String reportLength; // "short", "standard"

    @Column(name = "include_sales", nullable = false)
    private boolean includeSales;

    @Column(name = "include_profit", nullable = false)
    private boolean includeProfit;

    @Column(name = "include_products", nullable = false)
    private boolean includeProducts;

    @Column(name = "include_insights", nullable = false)
    private boolean includeInsights;

    @Column(name = "include_recommendations", nullable = false)
    private boolean includeRecommendations;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
