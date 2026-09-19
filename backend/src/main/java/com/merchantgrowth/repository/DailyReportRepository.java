package com.merchantgrowth.repository;

import com.merchantgrowth.entity.DailyReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DailyReportRepository extends JpaRepository<DailyReportEntity, String> {
    Optional<DailyReportEntity> findByMerchantIdAndReportDate(String merchantId, String reportDate);
    List<DailyReportEntity> findByMerchantIdOrderByReportDateDesc(String merchantId);
}
