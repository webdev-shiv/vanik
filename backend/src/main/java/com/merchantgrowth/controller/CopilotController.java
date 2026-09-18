package com.merchantgrowth.controller;

import com.merchantgrowth.dto.ApiResponse;
import com.merchantgrowth.dto.ChatMessageDto;
import com.merchantgrowth.dto.CopilotRequestDto;
import com.merchantgrowth.service.CopilotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/copilot")
@RequiredArgsConstructor
@Slf4j
public class CopilotController {

    private final CopilotService copilotService;

    @PostMapping("/chat")
    public ApiResponse<ChatMessageDto> chat(@RequestBody CopilotRequestDto request) {
        String query = request.getQuery() != null ? request.getQuery() : "";
        String merchantId = request.getMerchantId();
        ChatMessageDto answer = copilotService.askCopilot(query, merchantId);
        return ApiResponse.ok(answer);
    }

    @PostMapping("/chat/{merchantId}")
    public ApiResponse<ChatMessageDto> chatForMerchant(
            @PathVariable String merchantId,
            @RequestBody CopilotRequestDto request) {
        String query = request.getQuery() != null ? request.getQuery() : "";
        ChatMessageDto answer = copilotService.askCopilot(query, merchantId);
        return ApiResponse.ok(answer);
    }
}
