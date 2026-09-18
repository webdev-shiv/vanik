package com.merchantgrowth.repository;

import com.merchantgrowth.entity.SimulationResultEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimulationResultRepository extends JpaRepository<SimulationResultEntity, String> {
    List<SimulationResultEntity> findByMerchantIdOrderByCreatedAtDesc(String merchantId);
}
