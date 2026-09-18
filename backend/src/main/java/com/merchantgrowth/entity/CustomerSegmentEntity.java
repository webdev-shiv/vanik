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
@Table(name = "customer_segments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSegmentEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "merchant_id", nullable = false, length = 64)
    private String merchantId;

    @Column(name = "customer_id", nullable = false, length = 64)
    private String customerId;

    @Column(name = "segment_name", nullable = false)
    private String segmentName;

    @Column(name = "rfm_score")
    private String rfmScore;

    @Column(name = "r_score")
    private int rScore;

    @Column(name = "f_score")
    private int fScore;

    @Column(name = "m_score")
    private int mScore;

    @Column(name = "churn_risk")
    private double churnRisk;

    @Column(name = "updated_at")
    private String updatedAt;
}
