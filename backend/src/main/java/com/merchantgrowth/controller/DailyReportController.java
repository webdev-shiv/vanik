package com.merchantgrowth.controller;

import com.merchantgrowth.dto.DailyReportDto;
import com.merchantgrowth.service.DailyReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/daily-report", "/api/v1/daily-report"})
@CrossOrigin(origins = "*")
@Tag(name = "Daily Business Voice Brief", description = "End-of-day AI voice report and Soundbox telemetry")
@RequiredArgsConstructor
public class DailyReportController {

    private final DailyReportService dailyReportService;

    @GetMapping("/today")
    @Operation(summary = "Get Today's Business Voice Brief")
    public ResponseEntity<DailyReportDto.DailyReportResponseDto> getTodayReport(
            @RequestParam(required = false, defaultValue = "m-001") String merchantId,
            @RequestParam(required = false, defaultValue = "hinglish") String language,
            @RequestParam(required = false, defaultValue = "standard") String reportLength
    ) {
        return ResponseEntity.ok(dailyReportService.getTodayReport(merchantId, language, reportLength));
    }

    @GetMapping("/{date}")
    @Operation(summary = "Get Business Voice Brief for Specific Date")
    public ResponseEntity<DailyReportDto.DailyReportResponseDto> getReportByDate(
            @PathVariable String date,
            @RequestParam(required = false, defaultValue = "m-001") String merchantId,
            @RequestParam(required = false, defaultValue = "hinglish") String language,
            @RequestParam(required = false, defaultValue = "standard") String reportLength
    ) {
        return ResponseEntity.ok(dailyReportService.getReportByDate(merchantId, date, language, reportLength));
    }

    @PostMapping("/generate")
    @Operation(summary = "Generate Daily Business Voice Brief")
    public ResponseEntity<DailyReportDto.DailyReportResponseDto> generateReport(
            @RequestBody DailyReportDto.DailyReportRequestDto request
    ) {
        return ResponseEntity.ok(dailyReportService.generateDailyReport(request));
    }

    @PostMapping("/{date}/generate-audio")
    @Operation(summary = "Generate Soundbox Audio for Daily Voice Brief")
    public ResponseEntity<DailyReportDto.GenerateAudioResponseDto> generateAudio(
            @PathVariable String date,
            @RequestParam(required = false, defaultValue = "m-001") String merchantId,
            @RequestBody(required = false) DailyReportDto.GenerateAudioRequestDto request
    ) {
        return ResponseEntity.ok(dailyReportService.generateAudio(merchantId, date, request));
    }

    @GetMapping("/settings")
    @Operation(summary = "Get Daily Report & Soundbox Settings")
    public ResponseEntity<DailyReportDto.MerchantReportSettingsDto> getSettings(
            @RequestParam(required = false, defaultValue = "m-001") String merchantId
    ) {
        return ResponseEntity.ok(dailyReportService.getSettings(merchantId));
    }

    @PutMapping("/settings")
    @Operation(summary = "Update Daily Report & Soundbox Settings")
    public ResponseEntity<DailyReportDto.MerchantReportSettingsDto> updateSettings(
            @RequestBody DailyReportDto.MerchantReportSettingsDto settings
    ) {
        return ResponseEntity.ok(dailyReportService.updateSettings(settings));
    }
}
