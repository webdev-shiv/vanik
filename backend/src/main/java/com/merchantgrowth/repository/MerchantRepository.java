package com.merchantgrowth.repository;

import com.merchantgrowth.entity.MerchantEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MerchantRepository extends JpaRepository<MerchantEntity, String> {
    Optional<MerchantEntity> findByPaytmMerchantId(String paytmMerchantId);
}
