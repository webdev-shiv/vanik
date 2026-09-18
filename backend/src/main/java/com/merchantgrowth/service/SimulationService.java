package com.merchantgrowth.service;

import com.merchantgrowth.dto.SimulationDtos.*;
import com.merchantgrowth.entity.SimulationResultEntity;
import com.merchantgrowth.repository.SimulationResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SimulationService {

    private final WebClient aiServiceWebClient;
    private final SimulationResultRepository simulationResultRepository;

    public RunSimulationResponseDto runSimulation(RunSimulationRequestDto request) {
        if (request.getMerchantId() == null || request.getMerchantId().isBlank()) {
            request.setMerchantId("m-001");
        }

        log.info("Executing What-If simulation for merchant {}: action='{}', discount={}%",
                request.getMerchantId(), request.getAction(), request.getDiscountPercentage());

        RunSimulationResponseDto response;
        try {
            response = aiServiceWebClient.post()
                    .uri("/ai/simulate")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(RunSimulationResponseDto.class)
                    .block();
        } catch (Exception e) {
            log.warn("Python AI service unreachable for /ai/simulate, computing resilient fallback: {}", e.getMessage());
            response = calculateFallbackSimulation(request);
        }

        if (response == null || response.getBaseline() == null) {
            log.info("Simulation response baseline is empty, calculating resilient fallback metrics");
            response = calculateFallbackSimulation(request);
        }

        if (response != null) {
            // Ensure derived metrics (averageOrderValue and incremental customers) are computed
            if (response.getBaseline() != null && response.getBaseline().getAverageOrderValue() == 0 && response.getBaseline().getTransactions() > 0) {
                response.getBaseline().setAverageOrderValue(Math.round((response.getBaseline().getRevenue() / response.getBaseline().getTransactions()) * 10.0) / 10.0);
            }
            if (response.getScenario() != null && response.getScenario().getAverageOrderValue() == 0 && response.getScenario().getTransactions() > 0) {
                response.getScenario().setAverageOrderValue(Math.round((response.getScenario().getRevenue() / response.getScenario().getTransactions()) * 10.0) / 10.0);
            }
            if (response.getIncremental() != null && response.getScenario() != null && response.getBaseline() != null) {
                if (response.getIncremental().getCustomers() == 0) {
                    response.getIncremental().setCustomers(response.getScenario().getCustomers() - response.getBaseline().getCustomers());
                }
            }

            // Persist run to simulation_results table
            try {
                SimulationResultEntity entity = SimulationResultEntity.builder()
                        .id("sim-" + UUID.randomUUID().toString().substring(0, 8))
                        .merchantId(request.getMerchantId())
                        .action(request.getAction())
                        .discountPercentage(request.getDiscountPercentage())
                        .durationDays(request.getDuration())
                        .targetSegment(request.getTargetCustomerSegment())
                        .baselineRevenue(response.getBaseline() != null ? response.getBaseline().getRevenue() : 0.0)
                        .scenarioRevenue(response.getScenario() != null ? response.getScenario().getRevenue() : 0.0)
                        .incrementalRevenue(response.getIncremental() != null ? response.getIncremental().getRevenue() : 0.0)
                        .baselineTransactions(response.getBaseline() != null ? response.getBaseline().getTransactions() : 0)
                        .scenarioTransactions(response.getScenario() != null ? response.getScenario().getTransactions() : 0)
                        .incrementalTransactions(response.getIncremental() != null ? response.getIncremental().getTransactions() : 0)
                        .confidence(response.getConfidence())
                        .createdAt(LocalDateTime.now().toString())
                        .build();
                simulationResultRepository.save(entity);
            } catch (Exception ex) {
                log.warn("Could not persist simulation record: {}", ex.getMessage());
            }
        }

        return response;
    }

    private RunSimulationResponseDto calculateFallbackSimulation(RunSimulationRequestDto req) {
        double dailyRev = 8800.0;
        int dailyTx = 77;
        int dailyCust = 35;

        double baseRev = Math.round(dailyRev * req.getDuration() * 100.0) / 100.0;
        int baseTx = Math.max(1, dailyTx * req.getDuration());
        int baseCust = Math.max(1, (int) (dailyCust * Math.pow(req.getDuration(), 0.65)));

        double elasticity = -1.35;
        double volumeLiftPct = Math.abs(elasticity) * req.getDiscountPercentage() + Math.log1p(req.getExpectedCampaignReach() / 50.0) * 3.0;
        if (req.getBudget() != null && req.getBudget() > 0) {
            volumeLiftPct += Math.log1p(req.getBudget() / 100.0) * 1.5;
        }

        int scenTx = Math.max(1, (int) Math.round(baseTx * (1.0 + (volumeLiftPct / 100.0))));
        double priceFactor = Math.max(0.05, 1.0 - (req.getDiscountPercentage() / 100.0));
        double baseAov = Math.round((baseRev / baseTx) * 10.0) / 10.0;
        double scenRev = Math.round(scenTx * (baseRev / baseTx * priceFactor) * 100.0) / 100.0;
        double scenAov = Math.round(scenTx > 0 ? (scenRev / scenTx) * 10.0 : 0.0) / 10.0;
        int scenCust = (int) Math.round(baseCust * (1.0 + volumeLiftPct / 250.0));

        double incRev = Math.round((scenRev - baseRev) * 100.0) / 100.0;
        int incTx = scenTx - baseTx;
        int incCust = scenCust - baseCust;

        return RunSimulationResponseDto.builder()
                .baseline(MetricsDto.builder().revenue(baseRev).transactions(baseTx).customers(baseCust).averageOrderValue(baseAov).build())
                .scenario(MetricsDto.builder().revenue(scenRev).transactions(scenTx).customers(scenCust).averageOrderValue(scenAov).build())
                .incremental(IncrementalDto.builder().revenue(incRev).transactions(incTx).customers(incCust).build())
                .confidence(0.85)
                .merchantId(req.getMerchantId())
                .action(req.getAction())
                .durationDays(req.getDuration())
                .targetCustomerSegment(req.getTargetCustomerSegment())
                .disclaimer("Simulated revenue, transactions, and customer metrics are forward-looking statistical estimates and do not guarantee future actual revenue.")
                .simulationNotes(List.of(
                        "Simulated metrics predicted via fallback microeconomic elasticity engine.",
                        "Estimated incremental revenue projected at INR " + incRev + "."
                ))
                .build();
    }
}
