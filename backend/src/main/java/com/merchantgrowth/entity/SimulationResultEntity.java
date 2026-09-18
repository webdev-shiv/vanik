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
@Table(name = "simulation_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResultEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "merchant_id", nullable = false, length = 64)
    private String merchantId;

    @Column(name = "action", nullable = false)
    private String action;

    @Column(name = "discount_percentage", nullable = false)
    private double discountPercentage;

    @Column(name = "duration_days", nullable = false)
    private int durationDays;

    @Column(name = "target_segment", nullable = false)
    private String targetSegment;

    @Column(name = "baseline_revenue", nullable = false)
    private double baselineRevenue;

    @Column(name = "scenario_revenue", nullable = false)
    private double scenarioRevenue;

    @Column(name = "incremental_revenue", nullable = false)
    private double incrementalRevenue;

    @Column(name = "baseline_transactions", nullable = false)
    private int baselineTransactions;

    @Column(name = "scenario_transactions", nullable = false)
    private int scenarioTransactions;

    @Column(name = "incremental_transactions", nullable = false)
    private int incrementalTransactions;

    @Column(name = "confidence", nullable = false)
    private double confidence;

    @Column(name = "created_at")
    private String createdAt;
}
