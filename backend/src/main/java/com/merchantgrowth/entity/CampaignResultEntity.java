package com.merchantgrowth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "campaign_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignResultEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "campaign_id", nullable = false, length = 64)
    private String campaignId;

    @Column(name = "merchant_id", nullable = false, length = 64)
    private String merchantId;

    @Column(name = "impressions", nullable = false)
    private int impressions;

    @Column(name = "clicks", nullable = false)
    private int clicks;

    @Column(name = "transactions", nullable = false)
    private int transactions;

    @Column(name = "revenue_generated", nullable = false)
    private double revenueGenerated;

    @Column(name = "lift_percent", nullable = false)
    private double liftPercent;

    @Column(name = "roi", nullable = false)
    private double roi;

    @Column(name = "completed_at")
    private String completedAt;
}
