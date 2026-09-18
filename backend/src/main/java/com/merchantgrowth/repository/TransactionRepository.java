package com.merchantgrowth.repository;

import com.merchantgrowth.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, String> {
    List<TransactionEntity> findByMerchantId(String merchantId);
    List<TransactionEntity> findByMerchantIdAndTimestampBetween(String merchantId, Instant start, Instant end);

    @Query("SELECT COUNT(t) FROM TransactionEntity t WHERE t.merchantId = :merchantId")
    long countTransactionsByMerchant(@Param("merchantId") String merchantId);

    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM TransactionEntity t WHERE t.merchantId = :merchantId")
    double sumRevenueByMerchant(@Param("merchantId") String merchantId);

    @Query("SELECT MAX(t.timestamp) FROM TransactionEntity t WHERE t.merchantId = :merchantId")
    Instant findMaxTimestampByMerchantId(@Param("merchantId") String merchantId);
}
