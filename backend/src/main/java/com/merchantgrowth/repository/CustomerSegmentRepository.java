package com.merchantgrowth.repository;

import com.merchantgrowth.entity.CustomerSegmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerSegmentRepository extends JpaRepository<CustomerSegmentEntity, String> {
    List<CustomerSegmentEntity> findByMerchantId(String merchantId);
    List<CustomerSegmentEntity> findByMerchantIdAndSegmentName(String merchantId, String segmentName);
    Optional<CustomerSegmentEntity> findByMerchantIdAndCustomerId(String merchantId, String customerId);
}
