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
@Table(name = "daily_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyReportEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "merchant_id", length = 64, nullable = false)
    private String merchantId;

    @Column(name = "report_date", length = 32, nullable = false)
    private String reportDate;

    @Column(name = "revenue", nullable = false)
    private double revenue;

    @Column(name = "transactions", nullable = false)
    private int transactions;

    @Column(name = "average_order_value", nullable = false)
    private double averageOrderValue;

    @Column(name = "profit")
    private Double profit;

    @Column(name = "profit_margin")
    private Double profitMargin;

    @Column(name = "profit_label", length = 64)
    private String profitLabel;

    @Column(name = "has_reliable_cost")
    private boolean hasReliableCost;

    @Column(name = "vs_yesterday")
    private Double vsYesterday;

    @Column(name = "vs_7_day_average")
    private Double vs7DayAverage;

    @Column(name = "top_product", length = 255)
    private String topProduct;

    @Column(name = "peak_hours", length = 255)
    private String peakHours;

    @Column(name = "insights_json", columnDefinition = "TEXT")
    private String insightsJson;

    @Column(name = "recommendations_json", columnDefinition = "TEXT")
    private String recommendationsJson;

    @Column(name = "voice_script", columnDefinition = "TEXT")
    private String voiceScript;

    @Column(name = "voice_script_hinglish", columnDefinition = "TEXT")
    private String voiceScriptHinglish;

    @Column(name = "voice_script_hindi", columnDefinition = "TEXT")
    private String voiceScriptHindi;

    @Column(name = "voice_script_english", columnDefinition = "TEXT")
    private String voiceScriptEnglish;

    @Column(name = "audio_url", length = 255)
    private String audioUrl;

    @Column(name = "language", length = 32)
    private String language;

    @Column(name = "status", length = 32)
    private String status;

    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;
}
