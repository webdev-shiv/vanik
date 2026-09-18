package com.merchantgrowth.repository;

import com.merchantgrowth.entity.UpiMarketStatisticEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UpiMarketStatisticRepository extends JpaRepository<UpiMarketStatisticEntity, String> {

    List<UpiMarketStatisticEntity> findAllByOrderByYearMonthAsc();

    List<UpiMarketStatisticEntity> findAllByOrderByYearMonthDesc();

    Optional<UpiMarketStatisticEntity> findTopByOrderByYearMonthDesc();

    Optional<UpiMarketStatisticEntity> findByYearMonth(String yearMonth);

    Optional<UpiMarketStatisticEntity> findByMonth(String month);
}
