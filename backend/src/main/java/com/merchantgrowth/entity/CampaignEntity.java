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
@Table(name = "campaigns")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "merchant_id", length = 64, nullable = false)
    private String merchantId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "target_audience")
    private String targetAudience;

    @Column(name = "target_segment")
    private String targetSegment;

    @Column(name = "discount_type")
    private String discountType;

    @Column(name = "discount_value")
    private Double discountValue;

    @Column(name = "description")
    private String description;

    @Column(name = "audience_count")
    private int audienceCount;

    @Column(name = "start_date", nullable = false)
    private String startDate;

    @Column(name = "end_date", nullable = false)
    private String endDate;

    @Column(name = "budget", nullable = false)
    private double budget;

    @Column(name = "spent_so_far", nullable = false)
    private double spentSoFar;

    @Column(name = "expected_impact_percent", nullable = false)
    private double expectedImpactPercent;

    @Column(name = "actual_impact_percent")
    private Double actualImpactPercent;

    @Column(name = "revenue_before", nullable = false)
    private double revenueBefore;

    @Column(name = "revenue_after")
    private Double revenueAfter;

    @Column(name = "transactions_before", nullable = false)
    private int transactionsBefore;

    @Column(name = "transactions_after")
    private Integer transactionsAfter;

    @Column(name = "repeat_customers_before", nullable = false)
    private int repeatCustomersBefore;

    @Column(name = "repeat_customers_after")
    private Integer repeatCustomersAfter;

    @Column(name = "channel", nullable = false)
    private String channel;
}
