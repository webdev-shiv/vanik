package com.merchantgrowth.repository;

import com.merchantgrowth.entity.CampaignResultEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampaignResultRepository extends JpaRepository<CampaignResultEntity, String> {
    List<CampaignResultEntity> findByMerchantId(String merchantId);
    Optional<CampaignResultEntity> findByCampaignId(String campaignId);
}
