package com.merchantgrowth.service;

import com.merchantgrowth.dto.CreateTransactionDto;
import com.merchantgrowth.entity.TransactionEntity;
import com.merchantgrowth.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final MemoryService memoryService;

    @Transactional
    public TransactionEntity createOrGetTransaction(String merchantId, CreateTransactionDto dto) {
        String effectiveMerchantId = (merchantId != null && !merchantId.isBlank()) ? merchantId : dto.getMerchantId();
        if (effectiveMerchantId == null || effectiveMerchantId.isBlank()) {
            effectiveMerchantId = "m-001";
        }

        String billId = (dto.getBillId() != null && !dto.getBillId().isBlank())
                ? dto.getBillId()
                : (dto.getReceiptNumber() != null ? dto.getReceiptNumber() : "TXN-" + System.currentTimeMillis());

        // Idempotency check: Return existing transaction if bill ID already exists
        Optional<TransactionEntity> existing = transactionRepository.findById(billId);
        if (existing.isPresent()) {
            log.info("Transaction with billId {} already exists for merchant {}. Returning existing record.", billId, effectiveMerchantId);
            return existing.get();
        }

        String channel = "SOUNDBOX";
        String pm = dto.getPaymentMethod() != null ? dto.getPaymentMethod().toUpperCase() : "UPI";
        if (pm.contains("CASH")) {
            channel = "OFFLINE_STORE";
        } else if (pm.contains("CARD") || pm.contains("POS")) {
            channel = "POS_TERMINAL";
        }

        TransactionEntity entity = TransactionEntity.builder()
                .id(billId)
                .merchantId(effectiveMerchantId)
                .amount(dto.getAmount())
                .timestamp(Instant.now())
                .paymentMethod(pm)
                .category(dto.getCategory() != null ? dto.getCategory() : "Food")
                .status("SUCCESS")
                .soundboxAnnouncementDone(true)
                .build();

        TransactionEntity saved = transactionRepository.save(entity);
        log.info("Successfully created new transaction {} for merchant {}, amount: ₹{}", saved.getId(), effectiveMerchantId, saved.getAmount());

        // Non-blocking episodic memory ingestion
        try {
            java.util.Map<String, Object> eventPayload = new java.util.HashMap<>();
            eventPayload.put("billId", saved.getId());
            eventPayload.put("amount", saved.getAmount());
            eventPayload.put("paymentMethod", saved.getPaymentMethod());
            eventPayload.put("category", saved.getCategory());
            memoryService.recordEventAsync(effectiveMerchantId, "BILL_COMPLETED", eventPayload);
        } catch (Exception e) {
            log.debug("Non-blocking memory event note: {}", e.getMessage());
        }

        return saved;
    }
}
