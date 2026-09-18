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
@Table(name = "upi_ecosystem_statistics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpiEcosystemStatisticEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "\"month\"", nullable = false, length = 50)
    private String month;

    @Column(name = "year_month", nullable = false, length = 7)
    private String yearMonth;

    @Column(name = "banks_live_on_upi", nullable = false)
    private Integer banksLiveOnUpi;

    @Column(name = "transaction_volume_million", nullable = false)
    private Double transactionVolumeMillion;

    @Column(name = "transaction_value_crore", nullable = false)
    private Double transactionValueCrore;

    @Column(name = "source", nullable = false, length = 50)
    private String source;

    @Column(name = "source_file", nullable = false, length = 255)
    private String sourceFile;

    @Column(name = "created_at")
    private String createdAt;
}
