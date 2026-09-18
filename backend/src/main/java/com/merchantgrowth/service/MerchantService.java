package com.merchantgrowth.service;

import com.merchantgrowth.dto.GrowthHealthScoreDto;
import com.merchantgrowth.entity.MerchantEntity;
import com.merchantgrowth.repository.MerchantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MerchantService {

    private final MerchantRepository merchantRepository;
    private String activeMerchantId = "merch-sharma-tea";

    public MerchantEntity getCurrentMerchant() {
        return merchantRepository.findById(activeMerchantId)
                .orElseGet(() -> merchantRepository.findAll().stream().findFirst().orElse(null));
    }

    public MerchantEntity getMerchantById(String merchantId) {
        return merchantRepository.findById(merchantId)
                .orElseThrow(() -> new com.merchantgrowth.exception.ResourceNotFoundException("Merchant not found with ID: " + merchantId));
    }

    public List<MerchantEntity> getAllMerchants() {
        return merchantRepository.findAll();
    }

    public MerchantEntity switchMerchant(String merchantId) {
        Optional<MerchantEntity> found = merchantRepository.findById(merchantId);
        if (found.isPresent()) {
            this.activeMerchantId = merchantId;
            return found.get();
        }
        return getCurrentMerchant();
    }

    public MerchantEntity updateConnectionMode(String mode) {
        MerchantEntity current = getCurrentMerchant();
        if (current != null) {
            current.setConnectionStatus(mode);
            current.setLastSyncedAt("Updated just now");
            return merchantRepository.save(current);
        }
        return null;
    }

    public MerchantEntity updateMerchantProfile(String merchantId, Map<String, Object> body) {
        MerchantEntity entity = getMerchantById(merchantId);
        if (body.containsKey("name") && body.get("name") != null) {
            entity.setName(body.get("name").toString().trim());
        }
        if (body.containsKey("ownerName") && body.get("ownerName") != null) {
            entity.setOwnerName(body.get("ownerName").toString().trim());
        }
        if (body.containsKey("category") && body.get("category") != null) {
            entity.setCategory(body.get("category").toString().trim());
        }
        if (body.containsKey("location") && body.get("location") != null) {
            entity.setLocation(body.get("location").toString().trim());
        }
        if (body.containsKey("size") && body.get("size") != null) {
            entity.setSize(body.get("size").toString().trim());
        }
        entity.setLastSyncedAt("Updated just now");
        return merchantRepository.save(entity);
    }

    public GrowthHealthScoreDto getGrowthHealth() {
        return GrowthHealthScoreDto.builder()
                .overallScore(72)
                .grade("Good")
                .summary("Solid top-line momentum, but customer retention is dragging overall potential.")
                .breakdown(Map.of(
                        "salesGrowth", 82,
                        "customerRetention", 61,
                        "transactionFrequency", 75,
                        "customerActivity", 65,
                        "campaignPerformance", 85
                ))
                .build();
    }
}
