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
@Table(name = "ai_insights")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIInsightEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "merchant_id", nullable = false, length = 64)
    private String merchantId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "insight_type", nullable = false)
    private String insightType;

    @Column(name = "description", length = 2000, nullable = false)
    private String description;

    @Column(name = "severity", nullable = false)
    private String severity;

    @Column(name = "affected_window")
    private String affectedWindow;

    @Column(name = "impact_estimate")
    private String impactEstimate;

    @Column(name = "is_resolved", nullable = false)
    private boolean isResolved;

    @Column(name = "created_at")
    private String createdAt;
}
