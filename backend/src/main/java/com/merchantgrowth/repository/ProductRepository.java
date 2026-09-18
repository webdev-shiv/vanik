package com.merchantgrowth.repository;

import com.merchantgrowth.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, String> {
    List<ProductEntity> findByMerchantId(String merchantId);
    List<ProductEntity> findByMerchantIdAndCategory(String merchantId, String category);
}
