package com.merchantgrowth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransactionDto {
    private String billId;
    private String merchantId;
    private String customerName;
    private String customerPhone;
    private double amount;
    private String paymentMethod;
    private String category;
    private String orderType;
    private String receiptNumber;
}
