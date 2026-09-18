package com.merchantgrowth.service;

import com.merchantgrowth.dto.AiWhyNodeDto;
import com.merchantgrowth.dto.AnomalyDetectionRequestDto;
import com.merchantgrowth.dto.AnomalyDetectionResponseDto;
import com.merchantgrowth.dto.ChatMessageDto;
import com.merchantgrowth.dto.ForecastRequestDto;
import com.merchantgrowth.dto.ForecastResponseDto;
import com.merchantgrowth.dto.SimulationParamsDto;
import com.merchantgrowth.dto.SimulationResultDto;
import com.merchantgrowth.dto.SimulationScenarioDto;
import com.merchantgrowth.dto.CustomerSegmentationDtos.*;
import com.merchantgrowth.dto.MlRecommendationDtos.*;
import com.merchantgrowth.dto.RootCauseDtos.*;
import com.merchantgrowth.entity.RecommendationEntity;
import com.merchantgrowth.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final WebClient aiServiceWebClient;
    private final RecommendationRepository recommendationRepository;

    public List<AiWhyNodeDto> getWhyTree() {
        try {
            return aiServiceWebClient.get()
                    .uri("/ml/why-tree")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<AiWhyNodeDto>>() {})
                    .block();
        } catch (Exception e) {
            log.warn("Python AI service unreachable for /ml/why-tree, using fallback: {}", e.getMessage());
            return getFallbackWhyTree();
        }
    }

    public Map<String, Object> getInsightSummary() {
        return Map.of(
                "title", "Your sales are down 11.4% this month.",
                "description", "The biggest contributor is your evening segment. Morning and lunch slots are healthy.",
                "dropPercent", 11.4,
                "reasons", List.of(
                        "Evening transactions are down 31%",
                        "Repeat customers dropped 14%",
                        "Weekend transactions decreased"
                ),
                "opportunity", "Your biggest opportunity is customer retention and evening footfall recovery."
        );
    }

    public SimulationResultDto simulate(SimulationParamsDto params) {
        try {
            return aiServiceWebClient.post()
                    .uri("/ml/simulate-growth")
                    .bodyValue(params)
                    .retrieve()
                    .bodyToMono(SimulationResultDto.class)
                    .block();
        } catch (Exception e) {
            log.warn("Python AI service unreachable for /ml/simulate-growth, using fallback: {}", e.getMessage());
            return getFallbackSimulation(params);
        }
    }

    public List<RecommendationEntity> getRecommendations() {
        return getRecommendations("m-001");
    }

    public List<RecommendationEntity> getRecommendations(String merchantId) {
        String mId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        return recommendationRepository.findByMerchantId(mId);
    }

    public ChatMessageDto askAssistant(String query) {
        try {
            return aiServiceWebClient.post()
                    .uri("/ai/copilot/chat")
                    .bodyValue(Map.of("query", query, "merchant_id", "m-001"))
                    .retrieve()
                    .bodyToMono(ChatMessageDto.class)
                    .block();
        } catch (Exception e) {
            log.warn("Python AI service unreachable for /ai/copilot/chat, trying legacy route: {}", e.getMessage());
            try {
                return aiServiceWebClient.post()
                        .uri("/ml/copilot-chat")
                        .bodyValue(Map.of("query", query, "merchantId", "m-001"))
                        .retrieve()
                        .bodyToMono(ChatMessageDto.class)
                        .block();
            } catch (Exception ex) {
                log.warn("Fallback to local response: {}", ex.getMessage());
                return getFallbackChatMessage(query);
            }
        }
    }

    public ForecastResponseDto forecastSales(String merchantId, int horizonDays) {
        String effectiveMerchantId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        int effectiveHorizon = (horizonDays >= 1 && horizonDays <= 30) ? horizonDays : 7;
        try {
            ForecastRequestDto request = ForecastRequestDto.builder()
                    .merchantId(effectiveMerchantId)
                    .horizonDays(effectiveHorizon)
                    .build();

            ForecastResponseDto response = aiServiceWebClient.post()
                    .uri("/ai/forecast-sales")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ForecastResponseDto.class)
                    .block();

            if (response != null) {
                response.setAvailable(true);
                return response;
            }
            throw new IllegalStateException("Empty response from ML forecasting microservice");
        } catch (Exception e) {
            log.warn("Python AI service unreachable for /ai/forecast-sales: {}", e.getMessage());
            return ForecastResponseDto.builder()
                    .merchantId(effectiveMerchantId)
                    .horizonDays(effectiveHorizon)
                    .available(false)
                    .message("ML Forecasting service is currently unavailable: " + e.getMessage())
                    .build();
        }
    }

    public AnomalyDetectionResponseDto detectAnomalies(String merchantId) {
        String effectiveMerchantId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        try {
            AnomalyDetectionRequestDto request = AnomalyDetectionRequestDto.builder()
                    .merchantId(effectiveMerchantId)
                    .build();

            AnomalyDetectionResponseDto response = aiServiceWebClient.post()
                    .uri("/ai/detect-anomalies")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AnomalyDetectionResponseDto.class)
                    .block();

            if (response != null) {
                response.setAvailable(true);
                return response;
            }
            throw new IllegalStateException("Empty response from ML anomaly microservice");
        } catch (Exception e) {
            log.warn("Python AI service unreachable for /ai/detect-anomalies: {}", e.getMessage());
            return AnomalyDetectionResponseDto.builder()
                    .merchantId(effectiveMerchantId)
                    .anomalyDetected(false)
                    .available(false)
                    .message("ML Anomaly detection service is currently unavailable: " + e.getMessage())
                    .build();
        }
    }

    public CustomerSegmentationResponseDto segmentCustomers(String merchantId, List<CustomerInputRecordDto> customers) {
        String effectiveMerchantId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        try {
            CustomerSegmentationRequestDto request = CustomerSegmentationRequestDto.builder()
                    .merchantId(effectiveMerchantId)
                    .customers(customers)
                    .build();

            CustomerSegmentationResponseDto response = aiServiceWebClient.post()
                    .uri("/ai/segment-customers")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(CustomerSegmentationResponseDto.class)
                    .block();

            if (response != null) {
                response.setAvailable(true);
                return response;
            }
            throw new IllegalStateException("Empty response from ML customer segmentation microservice");
        } catch (Exception e) {
            log.warn("Python AI service unreachable for /ai/segment-customers: {}", e.getMessage());
            return CustomerSegmentationResponseDto.builder()
                    .merchantId(effectiveMerchantId)
                    .available(false)
                    .message("ML Customer Segmentation service is currently unavailable: " + e.getMessage())
                    .build();
        }
    }

    public MlRecommendationResponseDto getMlRecommendation(String merchantId) {
        String effectiveMerchantId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        try {
            MlRecommendationRequestDto request = MlRecommendationRequestDto.builder()
                    .merchantId(effectiveMerchantId)
                    .build();

            MlRecommendationResponseDto response = aiServiceWebClient.post()
                    .uri("/ai/recommendations")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(MlRecommendationResponseDto.class)
                    .block();

            if (response != null) {
                response.setAvailable(true);
                return response;
            }
            throw new IllegalStateException("Empty response from ML recommendations microservice");
        } catch (Exception e) {
            log.warn("Python AI service unreachable for /ai/recommendations: {}", e.getMessage());
            return MlRecommendationResponseDto.builder()
                    .merchantId(effectiveMerchantId)
                    .available(false)
                    .message("ML Recommendation service is currently unavailable: " + e.getMessage())
                    .build();
        }
    }

    public RootCauseResponseDto getRootCauseAnalysis(String merchantId) {
        String effectiveMerchantId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        try {
            RootCauseRequestDto request = RootCauseRequestDto.builder()
                    .merchantId(effectiveMerchantId)
                    .build();

            RootCauseResponseDto response = aiServiceWebClient.post()
                    .uri("/ai/root-cause-analysis")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(RootCauseResponseDto.class)
                    .block();

            if (response != null) {
                response.setAvailable(true);
                return response;
            }
            throw new IllegalStateException("Empty response from ML root-cause analysis microservice");
        } catch (Exception e) {
            log.warn("Python AI service unreachable for /ai/root-cause-analysis: {}", e.getMessage());
            return RootCauseResponseDto.builder()
                    .merchantId(effectiveMerchantId)
                    .available(false)
                    .message("Root Cause Analysis service is currently unavailable: " + e.getMessage())
                    .build();
        }
    }



    private List<AiWhyNodeDto> getFallbackWhyTree() {
        return List.of(
                AiWhyNodeDto.builder()
                        .id("node-root-sales")
                        .title("Recent Segment Sales Slump")
                        .subtitle("Primary observed variance in current billing cycle")
                        .stat("11.4% Drop")
                        .percentChange(-11.4)
                        .impactContribution(100.0)
                        .confidence(96.0)
                        .category("REVENUE")
                        .description("While top-line gross revenue shows annual baseline growth, recent peak evening periods suffered an acute 11.4% reduction in settled volume compared to the historical benchmark.")
                        .evidence(List.of(
                                "Settled receipts during 5:00 PM - 8:30 PM slipped by ₹37,200",
                                "Average evening ticket size softened from ₹245 to ₹218",
                                "Morning and lunch peaks remained robust (+4.2% and +3.8%)"
                        ))
                        .recommendedFixId("scen-evening-offer")
                        .supportingData(List.of(
                                Map.of("label", "Morning (7-11 AM)", "before", 82000, "current", 85500),
                                Map.of("label", "Lunch (12-3 PM)", "before", 94000, "current", 97600),
                                Map.of("label", "Evening (5-9 PM)", "before", 118000, "current", 80800),
                                Map.of("label", "Night (9-11 PM)", "before", 18000, "current", 17200)
                        ))
                        .childrenIds(List.of("node-evening-txns", "node-repeat-drop"))
                        .build(),
                AiWhyNodeDto.builder()
                        .id("node-evening-txns")
                        .title("Evening Transactions Slump")
                        .subtitle("Primary operational bottleneck during 5:00 PM – 8:30 PM")
                        .stat("31% Reduction")
                        .percentChange(-31.0)
                        .impactContribution(62.0)
                        .confidence(94.0)
                        .category("TIME_WINDOW")
                        .parentId("node-root-sales")
                        .description("Evening transactions contributed approximately 62% of the observed decline. Between 5 PM and 8 PM, transaction density dropped from 507 transactions last month to only 215 transactions this month.")
                        .evidence(List.of(
                                "Evening footfall is down 31% consistently across weekdays and weekends",
                                "Paytm Soundbox voice announcements in evening dropped from ~17/hour to ~7/hour",
                                "Nearby tea & snack competition introduced student evening snack bundles"
                        ))
                        .recommendedFixId("scen-evening-offer")
                        .childrenIds(List.of("node-repeat-drop", "node-inactive-growth"))
                        .build()
        );
    }

    private SimulationResultDto getFallbackSimulation(SimulationParamsDto params) {
        double baseRev = 284500.0;
        double customerMultiplier = params.getTargetCustomerCount() / 312.0;
        double durationMultiplier = params.getDurationDays() / 7.0;
        double dynamicUplift = 0.142 * Math.min(1.4, Math.max(0.6, (customerMultiplier * 0.7 + durationMultiplier * 0.3)));
        double projectedRev = Math.round(baseRev * (1.0 + dynamicUplift));
        double projectedCost = Math.round(params.getTargetCustomerCount() * 12.0 + params.getDurationDays() * 150.0);
        double netGain = projectedRev - baseRev - projectedCost;

        SimulationScenarioDto customScenario = SimulationScenarioDto.builder()
                .id("scen-custom-" + System.currentTimeMillis())
                .name("Custom " + params.getActionType() + " (" + params.getTimeWindow() + ")")
                .type("CUSTOM")
                .projectedRevenue(projectedRev)
                .projectedGrowthPercent(Math.round(dynamicUplift * 1000.0) / 10.0)
                .estimatedTransactions((int) Math.round(1248 * (1.0 + dynamicUplift * 1.1)))
                .projectedCost(projectedCost)
                .netGain(netGain)
                .riskLevel(projectedCost > 6000 ? "MEDIUM" : "LOW")
                .reasoning("Tailored simulation targeting " + params.getTargetCustomerCount() + " customers.")
                .build();

        return SimulationResultDto.builder()
                .scenario(customScenario)
                .comparison(List.of(customScenario))
                .sensitivityMatrix(List.of(
                        Map.of("discount", 49.0, "projectedRevenue", Math.round(baseRev * 1.142), "roi", 9.6)
                ))
                .build();
    }

    private ChatMessageDto getFallbackChatMessage(String query) {
        String nowStr = LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"));
        return ChatMessageDto.builder()
                .id("msg-" + System.currentTimeMillis())
                .sender("ai")
                .timestamp(nowStr)
                .intent("SALES_DOWN_ROOT_CAUSE")
                .content("Your sales are down **11.4%** compared with last month.\n\n" +
                        "The biggest contributor is your evening segment:\n" +
                        "• **Evening transactions ↓ 31%** (5:00 PM – 8:30 PM)\n" +
                        "• **Repeat customers ↓ 14%** (312 regulars haven't visited in 21 days)\n\n" +
                        "The strongest opportunity is launching the ₹49 Evening Combo.")
                .citedMetrics(List.of(
                        "Monthly Revenue: -11.4%",
                        "Evening Transactions: -31.0%",
                        "Repeat Customer Visits: -14.0%",
                        "Inactive Regulars: 312"
                ))
                .quickActions(List.of(
                        ChatMessageDto.QuickActionDto.builder().label("See Detailed Root-Cause Tree").action("navigate").target("why").build(),
                        ChatMessageDto.QuickActionDto.builder().label("Run What-If Analysis").action("simulate").target("simulator").build()
                ))
                .build();

    }
}
