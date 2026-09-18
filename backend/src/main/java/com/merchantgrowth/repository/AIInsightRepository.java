package com.merchantgrowth.repository;

import com.merchantgrowth.entity.AIInsightEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIInsightRepository extends JpaRepository<AIInsightEntity, String> {
    List<AIInsightEntity> findByMerchantId(String merchantId);
    List<AIInsightEntity> findByMerchantIdAndIsResolvedFalse(String merchantId);
}
