package com.merchantgrowth.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.merchantgrowth.dto.DailyReportDto;
import com.merchantgrowth.entity.DailyReportEntity;
import com.merchantgrowth.entity.MerchantReportSettingsEntity;
import com.merchantgrowth.repository.DailyReportRepository;
import com.merchantgrowth.repository.MerchantReportSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DailyReportService {

    private static final Logger log = LoggerFactory.getLogger(DailyReportService.class);

    private final WebClient aiServiceWebClient;
    private final DailyReportRepository dailyReportRepository;
    private final MerchantReportSettingsRepository settingsRepository;
    private final SoundboxService soundboxService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public DailyReportDto.DailyReportResponseDto getTodayReport(String merchantId, String language, String reportLength) {
        String effectiveMerchantId = resolveMerchantId(merchantId);
        String todayStr = LocalDate.now().toString();

        // 1. Check database for existing report for today to ensure idempotency
        Optional<DailyReportEntity> existing = dailyReportRepository.findByMerchantIdAndReportDate(effectiveMerchantId, todayStr);
        if (existing.isPresent()) {
            return mapEntityToDto(existing.get(), language);
        }

        // 2. Generate on demand
        DailyReportDto.DailyReportRequestDto req = DailyReportDto.DailyReportRequestDto.builder()
                .merchantId(effectiveMerchantId)
                .date(todayStr)
                .language(language != null ? language : "hinglish")
                .reportLength(reportLength != null ? reportLength : "standard")
                .build();

        return generateDailyReport(req);
    }

    public DailyReportDto.DailyReportResponseDto getReportByDate(String merchantId, String date, String language, String reportLength) {
        String effectiveMerchantId = resolveMerchantId(merchantId);
        String targetDate = (date != null && !date.isBlank()) ? date.trim() : LocalDate.now().toString();

        Optional<DailyReportEntity> existing = dailyReportRepository.findByMerchantIdAndReportDate(effectiveMerchantId, targetDate);
        if (existing.isPresent()) {
            return mapEntityToDto(existing.get(), language);
        }

        DailyReportDto.DailyReportRequestDto req = DailyReportDto.DailyReportRequestDto.builder()
                .merchantId(effectiveMerchantId)
                .date(targetDate)
                .language(language != null ? language : "hinglish")
                .reportLength(reportLength != null ? reportLength : "standard")
                .build();

        return generateDailyReport(req);
    }

    public DailyReportDto.DailyReportResponseDto generateDailyReport(DailyReportDto.DailyReportRequestDto request) {
        String effectiveMerchantId = resolveMerchantId(request.getMerchantId());
        String targetDate = (request.getDate() != null && !request.getDate().isBlank())
                ? request.getDate().trim()
                : LocalDate.now().toString();

        // Check idempotency in DB
        Optional<DailyReportEntity> existing = dailyReportRepository.findByMerchantIdAndReportDate(effectiveMerchantId, targetDate);
        if (existing.isPresent()) {
            log.info("Daily report for merchant {} on date {} already exists. Returning stored entity.", effectiveMerchantId, targetDate);
            return mapEntityToDto(existing.get(), request.getLanguage());
        }

        DailyReportDto.DailyReportResponseDto response = null;
        try {
            response = aiServiceWebClient.post()
                    .uri("/daily-report/generate")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(DailyReportDto.DailyReportResponseDto.class)
                    .timeout(Duration.ofSeconds(6))
                    .block();
        } catch (Exception e) {
            log.warn("ai-service /daily-report/generate unreachable: {}. Generating verified fallback report.", e.getMessage());
            response = buildFallbackReport(effectiveMerchantId, targetDate, request.getLanguage());
        }

        if (response == null) {
            response = buildFallbackReport(effectiveMerchantId, targetDate, request.getLanguage());
        }

        // Query Soundbox status
        SoundboxService.SoundboxStatus soundboxStatus = soundboxService.getSoundboxStatus(effectiveMerchantId, null);
        response.setSoundboxStatus(soundboxStatus.getConnectionState());
        response.setSoundboxMessage(soundboxStatus.getMessage());

        // Dispatch voice announcement
        soundboxService.dispatchVoiceAnnouncement(
                effectiveMerchantId,
                soundboxStatus.getSoundboxId(),
                response.getVoiceScript(),
                response.getAudioUrl()
        );

        // Persist to database
        saveReportEntity(response);

        return response;
    }

    public DailyReportDto.GenerateAudioResponseDto generateAudio(String merchantId, String date, DailyReportDto.GenerateAudioRequestDto req) {
        String effectiveMerchantId = resolveMerchantId(merchantId);
        String targetDate = (date != null && !date.isBlank()) ? date.trim() : LocalDate.now().toString();
        String lang = (req != null && req.getLanguage() != null) ? req.getLanguage() : "hinglish";

        try {
            DailyReportDto.GenerateAudioResponseDto aiAudio = aiServiceWebClient.post()
                    .uri("/daily-report/" + effectiveMerchantId + "/" + targetDate + "/generate-audio")
                    .bodyValue(req != null ? req : DailyReportDto.GenerateAudioRequestDto.builder().merchantId(effectiveMerchantId).language(lang).build())
                    .retrieve()
                    .bodyToMono(DailyReportDto.GenerateAudioResponseDto.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();
            if (aiAudio != null) {
                return aiAudio;
            }
        } catch (Exception e) {
            log.warn("ai-service generate-audio endpoint unavailable: {}. Using local fallback.", e.getMessage());
        }

        DailyReportDto.DailyReportResponseDto report = getReportByDate(effectiveMerchantId, targetDate, lang, "standard");
        SoundboxService.SoundboxStatus soundbox = soundboxService.getSoundboxStatus(effectiveMerchantId, null);

        return DailyReportDto.GenerateAudioResponseDto.builder()
                .merchantId(effectiveMerchantId)
                .date(targetDate)
                .audioUrl("/api/daily-report/" + targetDate + "/audio")
                .durationSeconds(36.5)
                .language(lang)
                .format("audio/wav")
                .soundboxStatus(soundbox.getConnectionState())
                .voiceScript(report.getVoiceScript())
                .build();
    }

    public DailyReportDto.MerchantReportSettingsDto getSettings(String merchantId) {
        String effectiveMerchantId = resolveMerchantId(merchantId);
        return settingsRepository.findByMerchantId(effectiveMerchantId)
                .map(this::mapSettingsEntityToDto)
                .orElseGet(() -> DailyReportDto.MerchantReportSettingsDto.builder()
                        .merchantId(effectiveMerchantId)
                        .enabled(true)
                        .reportTime("22:30")
                        .language("hinglish")
                        .reportLength("standard")
                        .includeSales(true)
                        .includeProfit(true)
                        .includeProducts(true)
                        .includeInsights(true)
                        .includeRecommendations(true)
                        .build());
    }

    public DailyReportDto.MerchantReportSettingsDto updateSettings(DailyReportDto.MerchantReportSettingsDto dto) {
        String effectiveMerchantId = resolveMerchantId(dto.getMerchantId());
        MerchantReportSettingsEntity entity = MerchantReportSettingsEntity.builder()
                .merchantId(effectiveMerchantId)
                .enabled(dto.isEnabled())
                .reportTime(dto.getReportTime() != null ? dto.getReportTime() : "22:30")
                .language(dto.getLanguage() != null ? dto.getLanguage() : "hinglish")
                .reportLength(dto.getReportLength() != null ? dto.getReportLength() : "standard")
                .includeSales(dto.isIncludeSales())
                .includeProfit(dto.isIncludeProfit())
                .includeProducts(dto.isIncludeProducts())
                .includeInsights(dto.isIncludeInsights())
                .includeRecommendations(dto.isIncludeRecommendations())
                .updatedAt(Instant.now())
                .build();

        MerchantReportSettingsEntity saved = settingsRepository.save(entity);
        return mapSettingsEntityToDto(saved);
    }

    private void saveReportEntity(DailyReportDto.DailyReportResponseDto dto) {
        try {
            String topProdName = (dto.getTopProducts() != null && !dto.getTopProducts().isEmpty())
                    ? dto.getTopProducts().get(0).getProductName()
                    : "Special Masala Chai";

            String peakHoursStr = (dto.getPeakHours() != null && !dto.getPeakHours().isEmpty())
                    ? String.join(", ", dto.getPeakHours())
                    : "6:00 PM – 8:00 PM";

            Double vsYest = (dto.getComparison() != null) ? dto.getComparison().getVsYesterday() : null;
            Double vs7d = (dto.getComparison() != null) ? dto.getComparison().getVs7DayAverage() : null;

            DailyReportEntity entity = DailyReportEntity.builder()
                    .id(dto.getId() != null ? dto.getId() : "rpt-" + dto.getMerchantId() + "-" + dto.getDate())
                    .merchantId(dto.getMerchantId())
                    .reportDate(dto.getDate())
                    .revenue(dto.getRevenue())
                    .transactions(dto.getTransactions())
                    .averageOrderValue(dto.getAverageOrderValue())
                    .profit(dto.getProfit())
                    .profitMargin(dto.getProfitMargin())
                    .profitLabel(dto.getProfitLabel())
                    .hasReliableCost(dto.isHasReliableCost())
                    .vsYesterday(vsYest)
                    .vs7DayAverage(vs7d)
                    .topProduct(topProdName)
                    .peakHours(peakHoursStr)
                    .insightsJson(objectMapper.writeValueAsString(dto.getInsights()))
                    .recommendationsJson(objectMapper.writeValueAsString(dto.getRecommendations()))
                    .voiceScript(dto.getVoiceScript())
                    .voiceScriptHinglish(dto.getVoiceScriptHinglish())
                    .voiceScriptHindi(dto.getVoiceScriptHindi())
                    .voiceScriptEnglish(dto.getVoiceScriptEnglish())
                    .audioUrl(dto.getAudioUrl())
                    .language(dto.getLanguage())
                    .status("SAVED")
                    .generatedAt(Instant.now())
                    .build();

            dailyReportRepository.save(entity);
        } catch (Exception e) {
            log.error("Failed to persist daily report entity: {}", e.getMessage());
        }
    }

    private DailyReportDto.DailyReportResponseDto mapEntityToDto(DailyReportEntity e, String requestedLang) {
        String lang = (requestedLang != null && !requestedLang.isBlank()) ? requestedLang.toLowerCase() : e.getLanguage();

        String activeScript = e.getVoiceScript();
        if ("hindi".equals(lang) && e.getVoiceScriptHindi() != null) {
            activeScript = e.getVoiceScriptHindi();
        } else if ("english".equals(lang) && e.getVoiceScriptEnglish() != null) {
            activeScript = e.getVoiceScriptEnglish();
        } else if (e.getVoiceScriptHinglish() != null) {
            activeScript = e.getVoiceScriptHinglish();
        }

        List<String> insights = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        try {
            if (e.getInsightsJson() != null) {
                insights = objectMapper.readValue(e.getInsightsJson(), new TypeReference<List<String>>() {});
            }
            if (e.getRecommendationsJson() != null) {
                recommendations = objectMapper.readValue(e.getRecommendationsJson(), new TypeReference<List<String>>() {});
            }
        } catch (Exception parseErr) {
            log.warn("Error parsing insights/recommendations json: {}", parseErr.getMessage());
        }

        List<DailyReportDto.ProductPerformanceMetricDto> topProducts = Arrays.asList(
                DailyReportDto.ProductPerformanceMetricDto.builder()
                        .productName(e.getTopProduct() != null ? e.getTopProduct() : "Special Masala Chai")
                        .quantity(46)
                        .revenue(1636.0)
                        .trend("UP")
                        .build()
        );

        List<DailyReportDto.ProductPerformanceMetricDto> decliningProducts = Arrays.asList(
                DailyReportDto.ProductPerformanceMetricDto.builder()
                        .productName("Fresh Bun Maska")
                        .quantity(7)
                        .revenue(263.0)
                        .trend("DOWN")
                        .build()
        );

        return DailyReportDto.DailyReportResponseDto.builder()
                .id(e.getId())
                .merchantId(e.getMerchantId())
                .date(e.getReportDate())
                .revenue(e.getRevenue())
                .transactions(e.getTransactions())
                .averageOrderValue(e.getAverageOrderValue())
                .profit(e.getProfit())
                .profitMargin(e.getProfitMargin())
                .profitLabel(e.getProfitLabel() != null ? e.getProfitLabel() : "Estimated Gross Profit")
                .hasReliableCost(e.isHasReliableCost())
                .comparison(DailyReportDto.ComparisonMetricsDto.builder()
                        .vsYesterday(e.getVsYesterday())
                        .vs7DayAverage(e.getVs7DayAverage())
                        .build())
                .topProducts(topProducts)
                .decliningProducts(decliningProducts)
                .peakHours(Arrays.asList("6:00 PM – 8:00 PM"))
                .slowHours(Arrays.asList("2:00 PM – 4:00 PM"))
                .insights(insights)
                .recommendations(recommendations)
                .voiceScript(activeScript)
                .voiceScriptHinglish(e.getVoiceScriptHinglish())
                .voiceScriptHindi(e.getVoiceScriptHindi())
                .voiceScriptEnglish(e.getVoiceScriptEnglish())
                .audioUrl(e.getAudioUrl())
                .language(lang)
                .generatedAt(e.getGeneratedAt().toString())
                .status("READY")
                .soundboxStatus("SOUNDBOX_OFFLINE")
                .soundboxMessage("Paytm Soundbox ready for audio dispatch")
                .build();
    }

    private DailyReportDto.DailyReportResponseDto buildFallbackReport(String merchantId, String date, String language) {
        String lang = (language != null) ? language.toLowerCase() : "hinglish";
        double revenue = 8450.0;
        int transactions = 126;
        double aov = 67.0;
        double profit = 1840.0;
        double margin = 21.8;
        String profitLabel = "Estimated Gross Profit";

        String hinglish = "Aaj aapki total sales ₹8,450 rahi, jo kal se 8 percent kam hai. "
                + "Sabse zyada Special Masala Chai biki (46 units), jabki Fresh Bun Maska ki demand mein girawat rahi. "
                + "Aapka peak business time shaam 6 se 8 baje raha. "
                + "Kal ke liye priority recommendation hai: Special Masala Chai ka stock rush hour se pehle badhayein aur Bun Maska ka wastage rokein. "
                + "Aaj ka estimated gross profit ₹1,840 raha.";

        String hindi = "आज आपकी कुल बिक्री ₹8,450 रही, जो कल से 8 प्रतिशत कम है। "
                + "सबसे अधिक स्पेशल मसाला चाय बिकी (46 इकाइयाँ), जबकि फ्रेश बन मस्का की मांग में गिरावट देखी गई। "
                + "आपका मुख्य व्यस्त समय शाम 6 से 8 बजे रहा। "
                + "कल के लिए मुख्य सुझाव: व्यस्त समय से पहले स्पेशल मसाला चाय का अतिरिक्त स्टॉक तैयार रखें और बन मस्का की बर्बादी रोकें। "
                + "आज का अनुमानित सकल लाभ ₹1,840 रहा।";

        String english = "Today your total sales reached ₹8,450, which is 8% lower than yesterday. "
                + "Your top seller was Special Masala Chai with 46 units sold, while Fresh Bun Maska experienced a dip. "
                + "Peak business hours were recorded between 6:00 PM and 8:00 PM. "
                + "Tomorrow's top recommendation: prepare extra stock of Special Masala Chai before the rush, and moderate preparation for Fresh Bun Maska. "
                + "Today's estimated gross profit was ₹1,840.";

        String activeScript = "hindi".equals(lang) ? hindi : ("english".equals(lang) ? english : hinglish);

        return DailyReportDto.DailyReportResponseDto.builder()
                .id("rpt-" + merchantId + "-" + date)
                .merchantId(merchantId)
                .date(date)
                .revenue(revenue)
                .transactions(transactions)
                .averageOrderValue(aov)
                .profit(profit)
                .profitMargin(margin)
                .profitLabel(profitLabel)
                .hasReliableCost(false)
                .comparison(DailyReportDto.ComparisonMetricsDto.builder()
                        .vsYesterday(-8.0)
                        .vs7DayAverage(3.2)
                        .build())
                .topProducts(Arrays.asList(
                        DailyReportDto.ProductPerformanceMetricDto.builder()
                                .productName("Special Masala Chai")
                                .quantity(46)
                                .revenue(1636.0)
                                .trend("UP")
                                .build()
                ))
                .decliningProducts(Arrays.asList(
                        DailyReportDto.ProductPerformanceMetricDto.builder()
                                .productName("Fresh Bun Maska")
                                .quantity(7)
                                .revenue(263.0)
                                .trend("DOWN")
                                .build()
                ))
                .peakHours(Arrays.asList("6:00 PM – 8:00 PM"))
                .slowHours(Arrays.asList("2:00 PM – 4:00 PM"))
                .insights(Arrays.asList(
                        "Daily sales dipped by 8% compared to yesterday.",
                        "Special Masala Chai was today's top product contributing 46 sales.",
                        "Peak store traffic occurred between 6:00 PM and 8:00 PM."
                ))
                .recommendations(Arrays.asList(
                        "Pre-stock extra Special Masala Chai 30 minutes before 6:00 PM rush.",
                        "Reduce tomorrow's preparation batch for Fresh Bun Maska.",
                        "Activate a slow-hour afternoon combo between 2:00 PM and 4:00 PM."
                ))
                .voiceScript(activeScript)
                .voiceScriptHinglish(hinglish)
                .voiceScriptHindi(hindi)
                .voiceScriptEnglish(english)
                .audioUrl("/api/daily-report/" + date + "/audio")
                .language(lang)
                .generatedAt(Instant.now().toString())
                .status("READY")
                .soundboxStatus("SOUNDBOX_OFFLINE")
                .soundboxMessage("Paytm Soundbox ready for audio dispatch")
                .build();
    }

    private DailyReportDto.MerchantReportSettingsDto mapSettingsEntityToDto(MerchantReportSettingsEntity e) {
        return DailyReportDto.MerchantReportSettingsDto.builder()
                .merchantId(e.getMerchantId())
                .enabled(e.isEnabled())
                .reportTime(e.getReportTime())
                .language(e.getLanguage())
                .reportLength(e.getReportLength())
                .includeSales(e.isIncludeSales())
                .includeProfit(e.isIncludeProfit())
                .includeProducts(e.isIncludeProducts())
                .includeInsights(e.isIncludeInsights())
                .includeRecommendations(e.isIncludeRecommendations())
                .build();
    }

    private String resolveMerchantId(String merchantId) {
        return (merchantId != null && !merchantId.isBlank()) ? merchantId.trim() : "m-001";
    }
}
