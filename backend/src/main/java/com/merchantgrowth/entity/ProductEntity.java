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
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "merchant_id", nullable = false, length = 64)
    private String merchantId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "price", nullable = false)
    private double price;

    @Column(name = "cost", nullable = false)
    private double cost;

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity;

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable;

    @Column(name = "created_at")
    private String createdAt;
}
