package com.merchantgrowth.controller;

import com.merchantgrowth.dto.ApiResponseDto;
import com.merchantgrowth.dto.CreateTransactionDto;
import com.merchantgrowth.entity.TransactionEntity;
import com.merchantgrowth.security.SecurityUtils;
import com.merchantgrowth.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Transactions API", description = "Endpoints for recorded payment transactions and bill settlement")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping({"/api/transactions", "/api/v1/transactions"})
    @Operation(summary = "Create or record a bill transaction idempotently", description = "Records a finalized bill transaction using authenticated merchant context.")
    public ResponseEntity<ApiResponseDto<TransactionEntity>> createTransaction(@RequestBody CreateTransactionDto dto) {
        String authMerchantId = SecurityUtils.getCurrentMerchantId();
        TransactionEntity result = transactionService.createOrGetTransaction(authMerchantId, dto);
        return ResponseEntity.ok(ApiResponseDto.success(result, "Transaction processed successfully"));
    }
}
