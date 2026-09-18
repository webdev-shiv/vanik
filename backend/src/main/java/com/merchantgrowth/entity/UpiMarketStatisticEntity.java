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
@Table(name = "upi_market_statistics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpiMarketStatisticEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "\"month\"", nullable = false, length = 50)
    private String month;

    @Column(name = "year_month", nullable = false, length = 7)
    private String yearMonth;

    @Column(name = "transaction_volume_million", nullable = false)
    private Double transactionVolumeMillion;

    @Column(name = "avg_daily_transaction_volume_million")
    private Double avgDailyTransactionVolumeMillion;

    @Column(name = "transaction_value_crore", nullable = false)
    private Double transactionValueCrore;

    @Column(name = "avg_daily_transaction_value_crore")
    private Double avgDailyTransactionValueCrore;

    @Column(name = "source", nullable = false, length = 50)
    private String source;

    @Column(name = "source_file", nullable = false, length = 255)
    private String sourceFile;

    @Column(name = "created_at")
    private String createdAt;
}
