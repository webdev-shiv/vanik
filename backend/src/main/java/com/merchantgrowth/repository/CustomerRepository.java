package com.merchantgrowth.repository;

import com.merchantgrowth.entity.CustomerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerEntity, String> {
    List<CustomerEntity> findByMerchantId(String merchantId);
    List<CustomerEntity> findByMerchantIdAndSegment(String merchantId, String segment);
    long countByMerchantId(String merchantId);
    long countByMerchantIdAndSegment(String merchantId, String segment);
}
