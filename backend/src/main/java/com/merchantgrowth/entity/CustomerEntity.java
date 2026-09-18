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
@Table(name = "customers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "merchant_id", length = 64, nullable = false)
    private String merchantId;

    @Column(name = "masked_phone", nullable = false)
    private String maskedPhone;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "segment", nullable = false)
    private String segment;

    @Column(name = "total_spend", nullable = false)
    private double totalSpend;

    @Column(name = "visit_count", nullable = false)
    private int visitCount;

    @Column(name = "average_spend", nullable = false)
    private double averageSpend;

    @Column(name = "last_visit")
    private String lastVisit;

    @Column(name = "preferred_time")
    private String preferredTime;

    @Column(name = "favorite_item")
    private String favoriteItem;

    @Column(name = "retention_risk", nullable = false)
    private String retentionRisk;
}
