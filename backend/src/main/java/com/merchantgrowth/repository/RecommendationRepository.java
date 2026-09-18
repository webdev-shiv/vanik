package com.merchantgrowth.repository;

import com.merchantgrowth.entity.RecommendationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<RecommendationEntity, String> {
    List<RecommendationEntity> findByMerchantId(String merchantId);
}
