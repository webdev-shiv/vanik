package com.merchantgrowth.repository;

import com.merchantgrowth.entity.CampaignEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<CampaignEntity, String> {
    List<CampaignEntity> findByMerchantId(String merchantId);
    List<CampaignEntity> findByMerchantIdOrderByStartDateDesc(String merchantId);
    List<CampaignEntity> findByMerchantIdAndStatus(String merchantId, String status);
}
