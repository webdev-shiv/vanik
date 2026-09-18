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
