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
@Table(name = "merchants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchantEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "size", nullable = false)
    private String size;

    @Column(name = "paytm_merchant_id", nullable = false)
    private String paytmMerchantId;

    @Column(name = "soundbox_id")
    private String soundboxId;

    @Column(name = "qr_code_id")
    private String qrCodeId;

    @Column(name = "connection_status", nullable = false)
    private String connectionStatus;

    @Column(name = "last_synced_at")
    private String lastSyncedAt;

    @Column(name = "monthly_revenue", nullable = false)
    private double monthlyRevenue;
}
