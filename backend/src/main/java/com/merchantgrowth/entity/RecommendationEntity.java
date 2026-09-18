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
@Table(name = "recommendations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "merchant_id", length = 64, nullable = false)
    private String merchantId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "tagline", nullable = false)
    private String tagline;

    @Column(name = "expected_impact", nullable = false)
    private String expectedImpact;

    @Column(name = "impact_metric", nullable = false)
    private String impactMetric;

    @Column(name = "target_audience", nullable = false)
    private String targetAudience;

    @Column(name = "target_count", nullable = false)
    private int targetCount;

    @Column(name = "duration", nullable = false)
    private String duration;

    @Column(name = "priority", nullable = false)
    private String priority;

    @Column(name = "cost_estimate", nullable = false)
    private String costEstimate;

    @Column(name = "why_reason", length = 1000, nullable = false)
    private String whyReason;

    @Column(name = "suggested_offer", nullable = false)
    private String suggestedOffer;

    @Column(name = "category", nullable = false)
    private String category;
}
