package com.merchantgrowth.repository;

import com.merchantgrowth.entity.MerchantReportSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MerchantReportSettingsRepository extends JpaRepository<MerchantReportSettingsEntity, String> {
    Optional<MerchantReportSettingsEntity> findByMerchantId(String merchantId);
}
