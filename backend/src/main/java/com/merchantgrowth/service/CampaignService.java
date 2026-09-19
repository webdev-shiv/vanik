package com.merchantgrowth.service;

import com.merchantgrowth.dto.CampaignDtos.CreateCampaignRequestDto;
import com.merchantgrowth.entity.CampaignEntity;
import com.merchantgrowth.entity.CampaignResultEntity;
import com.merchantgrowth.entity.TransactionEntity;
import com.merchantgrowth.exception.ResourceNotFoundException;
import com.merchantgrowth.repository.CampaignRepository;
import com.merchantgrowth.repository.CampaignResultRepository;
import com.merchantgrowth.repository.CustomerRepository;
import com.merchantgrowth.repository.MerchantRepository;
import com.merchantgrowth.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignResultRepository campaignResultRepository;
    private final MerchantRepository merchantRepository;
    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;
    private final MemoryService memoryService;

    public List<CampaignEntity> getCampaignsByMerchantId(String merchantId) {
        log.info("Fetching campaigns for merchant: {}", merchantId);
        List<CampaignEntity> list = campaignRepository.findByMerchantIdOrderByStartDateDesc(merchantId);
        if (list.isEmpty()) {
            list = campaignRepository.findByMerchantId(merchantId);
        }

        // Enrich with outcome results from campaignResultRepository if available
        for (CampaignEntity entity : list) {
            campaignResultRepository.findByCampaignId(entity.getId()).ifPresent(res -> {
                if (entity.getRevenueAfter() == null) {
                    entity.setRevenueAfter(entity.getRevenueBefore() + res.getRevenueGenerated());
                }
                if (entity.getTransactionsAfter() == null) {
                    entity.setTransactionsAfter(res.getTransactions());
                }
                if (entity.getActualImpactPercent() == null) {
                    entity.setActualImpactPercent(res.getLiftPercent());
                }
                if (entity.getAudienceCount() == 0 && res.getImpressions() > 0) {
                    entity.setAudienceCount(res.getImpressions());
                }
            });
        }
        return list;
    }

    public List<CampaignEntity> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    public Optional<CampaignEntity> getCampaignById(String id) {
        return campaignRepository.findById(id);
    }

    public CampaignEntity createCampaignFromDto(CreateCampaignRequestDto dto) {
        String merchantId = (dto.getMerchantId() != null && !dto.getMerchantId().isBlank())
                ? dto.getMerchantId().trim()
                : "m-001";

        log.info("Creating new campaign '{}' for merchant: {}", dto.getName(), merchantId);

        // Server-side validation of merchant ownership/existence
        if (!merchantRepository.existsById(merchantId)) {
            throw new ResourceNotFoundException("Merchant not found with ID: " + merchantId);
        }

        // Compute baseline metrics from real ledger without fabricating future results
        List<TransactionEntity> txns = transactionRepository.findByMerchantId(merchantId);
        double revenueBefore = txns.stream().mapToDouble(TransactionEntity::getAmount).sum();
        int transactionsBefore = txns.size();
        int repeatCustomersBefore = (int) customerRepository.countByMerchantId(merchantId);

        String campId = "camp-" + UUID.randomUUID().toString().substring(0, 8);
        LocalDate start = LocalDate.now();
        int durationDays = dto.getDurationDays() > 0 ? dto.getDurationDays() : 14;
        LocalDate end = start.plusDays(durationDays);

        String actionType = dto.getActionType() != null && !dto.getActionType().isBlank()
                ? dto.getActionType().toUpperCase().replace(" ", "_")
                : "PROMO_CAMPAIGN";

        CampaignEntity entity = CampaignEntity.builder()
                .id(campId)
                .merchantId(merchantId)
                .name(dto.getName().trim())
                .type(actionType)
                .status(dto.getStatus() != null && !dto.getStatus().isBlank() ? dto.getStatus().toUpperCase() : "ACTIVE")
                .targetSegment(dto.getTargetSegment() != null ? dto.getTargetSegment() : "All Patrons")
                .targetAudience(dto.getTargetSegment())
                .discountType("PERCENTAGE")
                .discountValue(dto.getDiscountPercentage())
                .budget(dto.getBudget() > 0 ? dto.getBudget() : 500.0)
                .spentSoFar(0.0)
                .audienceCount(dto.getReach() != null && dto.getReach() > 0 ? dto.getReach() : 0)
                .channel(dto.getChannel() != null && !dto.getChannel().isBlank() ? dto.getChannel() : "Paytm Soundbox QR Push")
                .startDate(start.toString())
                .endDate(end.toString())
                .description(dto.getDescription() != null && !dto.getDescription().isBlank()
                        ? dto.getDescription()
                        : "Automated growth promotion targeting " + actionType)
                .expectedImpactPercent(0.0)
                .actualImpactPercent(null)
                .revenueBefore(revenueBefore)
                .revenueAfter(null)
                .transactionsBefore(transactionsBefore)
                .transactionsAfter(null)
                .repeatCustomersBefore(repeatCustomersBefore)
                .repeatCustomersAfter(null)
                .build();

        CampaignEntity saved = campaignRepository.save(entity);

        try {
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("campaignId", saved.getId());
            payload.put("name", saved.getName());
            payload.put("type", saved.getType());
            payload.put("targetSegment", saved.getTargetSegment());
            payload.put("budget", saved.getBudget());
            payload.put("discountValue", saved.getDiscountValue());
            memoryService.recordEventAsync(merchantId, "CAMPAIGN_LAUNCHED", payload);
        } catch (Exception e) {
            log.debug("Memory event skipped: {}", e.getMessage());
        }

        return saved;
    }

    public CampaignEntity createCampaign(CampaignEntity campaign) {
        if (campaign.getId() == null || campaign.getId().isEmpty()) {
            campaign.setId("camp-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (campaign.getStatus() == null) {
            campaign.setStatus("ACTIVE");
        }
        CampaignEntity saved = campaignRepository.save(campaign);

        try {
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("campaignId", saved.getId());
            payload.put("name", saved.getName());
            payload.put("type", saved.getType());
            memoryService.recordEventAsync(saved.getMerchantId(), "CAMPAIGN_LAUNCHED", payload);
        } catch (Exception e) {
            log.debug("Memory event skipped: {}", e.getMessage());
        }

        return saved;
    }

    public Optional<CampaignEntity> updateStatus(String id, String status) {
        return campaignRepository.findById(id).map(entity -> {
            entity.setStatus(status);
            CampaignEntity updated = campaignRepository.save(entity);

            try {
                java.util.Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("campaignId", updated.getId());
                payload.put("name", updated.getName());
                payload.put("status", updated.getStatus());
                payload.put("actualImpactPercent", updated.getActualImpactPercent());
                String eventType = "COMPLETED".equalsIgnoreCase(status) ? "CAMPAIGN_RESULT" : "CAMPAIGN_STATUS_CHANGED";
                memoryService.recordEventAsync(updated.getMerchantId(), eventType, payload);
            } catch (Exception e) {
                log.debug("Memory event skipped: {}", e.getMessage());
            }

            return updated;
        });
    }

    public List<CampaignResultEntity> getCampaignResults(String merchantId) {
        return campaignResultRepository.findByMerchantId(merchantId);
    }
}
