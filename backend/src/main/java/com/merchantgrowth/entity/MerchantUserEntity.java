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
@Table(name = "merchant_users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchantUserEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "merchant_id", length = 64, nullable = false)
    private String merchantId;

    @Column(name = "email", length = 255, nullable = false, unique = true)
    private String email;

    @Column(name = "username", length = 100, nullable = false, unique = true)
    private String username;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "salt", length = 64, nullable = false)
    private String salt;

    @Column(name = "role", length = 50, nullable = false)
    @Builder.Default
    private String role = "MERCHANT_ADMIN";

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_at")
    private String createdAt;
}
