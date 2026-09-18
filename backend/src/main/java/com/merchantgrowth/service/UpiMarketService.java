package com.merchantgrowth.service;

import com.merchantgrowth.dto.UpiMarketDtos.*;
import com.merchantgrowth.entity.UpiEcosystemStatisticEntity;
import com.merchantgrowth.entity.UpiMarketStatisticEntity;
import com.merchantgrowth.repository.UpiEcosystemStatisticRepository;
import com.merchantgrowth.repository.UpiMarketStatisticRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UpiMarketService {

    private final UpiMarketStatisticRepository marketRepository;
    private final UpiEcosystemStatisticRepository ecosystemRepository;

    /**
     * Fetch the single latest available NPCI UPI statistics record.
     */
    public UpiRecordDto getLatestRecord() {
        Optional<UpiMarketStatisticEntity> latestOpt = marketRepository.findTopByOrderByYearMonthDesc();
        if (latestOpt.isEmpty()) {
            return null;
        }

        UpiMarketStatisticEntity latest = latestOpt.get();
        Map<String, Integer> bankMap = getEcosystemBankMap();

        return toRecordDto(latest, bankMap.get(latest.getYearMonth()));
    }

    /**
     * Fetch chronological monthly time-series trends across all imported NPCI periods.
     */
    public List<UpiMonthlyTrendPointDto> getMonthlyTrends() {
        List<UpiMarketStatisticEntity> entities = marketRepository.findAllByOrderByYearMonthAsc();
        Map<String, Integer> bankMap = getEcosystemBankMap();

        return entities.stream().map(e -> {
            Double volMn = e.getTransactionVolumeMillion();
            Double valCr = e.getTransactionValueCrore();

            Double volBn = volMn != null ? round(volMn / 1000.0, 2) : null;
            Double valLakhCr = valCr != null ? round(valCr / 100000.0, 2) : null;

            return UpiMonthlyTrendPointDto.builder()
                    .month(e.getMonth())
                    .yearMonth(e.getYearMonth())
                    .transactionVolumeMillion(volMn)
                    .transactionVolumeBillion(volBn)
                    .avgDailyTransactionVolumeMillion(e.getAvgDailyTransactionVolumeMillion())
                    .transactionValueCrore(valCr)
                    .transactionValueLakhCrore(valLakhCr)
                    .avgDailyTransactionValueCrore(e.getAvgDailyTransactionValueCrore())
                    .banksLiveOnUpi(bankMap.get(e.getYearMonth()))
                    .source(e.getSource())
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Calculate MoM and YoY growth trends strictly from actual available periods.
     * Does NOT interpolate or calculate when the comparative period is missing.
     */
    public UpiGrowthMetricsDto getGrowthMetrics() {
        List<UpiMarketStatisticEntity> entities = marketRepository.findAllByOrderByYearMonthAsc();
        if (entities.isEmpty()) {
            return null;
        }

        int size = entities.size();
        UpiMarketStatisticEntity current = entities.get(size - 1);

        Double momVol = null;
        Double momVal = null;
        String prevMonth = null;
        String volTrend = "STABLE";
        String valTrend = "STABLE";
        String avgDailyVolTrend = "STABLE";

        if (size >= 2) {
            UpiMarketStatisticEntity previous = entities.get(size - 2);
            prevMonth = previous.getMonth();
            if (previous.getTransactionVolumeMillion() != null && previous.getTransactionVolumeMillion() > 0) {
                momVol = round(((current.getTransactionVolumeMillion() - previous.getTransactionVolumeMillion())
                        / previous.getTransactionVolumeMillion()) * 100.0, 2);
                if (momVol > 0.05) volTrend = "UP";
                else if (momVol < -0.05) volTrend = "DOWN";
            }
            if (previous.getTransactionValueCrore() != null && previous.getTransactionValueCrore() > 0) {
                momVal = round(((current.getTransactionValueCrore() - previous.getTransactionValueCrore())
                        / previous.getTransactionValueCrore()) * 100.0, 2);
                if (momVal > 0.05) valTrend = "UP";
                else if (momVal < -0.05) valTrend = "DOWN";
            }
            if (current.getAvgDailyTransactionVolumeMillion() != null && previous.getAvgDailyTransactionVolumeMillion() != null) {
                double diff = current.getAvgDailyTransactionVolumeMillion() - previous.getAvgDailyTransactionVolumeMillion();
                if (diff > 0.1) avgDailyVolTrend = "UP";
                else if (diff < -0.1) avgDailyVolTrend = "DOWN";
            }
        }

        // Year-Over-Year Calculation: Find exact same month in previous year
        Double yoyVol = null;
        Double yoyVal = null;
        String prevYearMonth = null;

        String curYm = current.getYearMonth(); // e.g. "2026-09"
        if (curYm.length() == 7) {
            try {
                int curYear = Integer.parseInt(curYm.substring(0, 4));
                String monthPart = curYm.substring(4); // "-09"
                String targetPrevYearYm = (curYear - 1) + monthPart; // "2025-09"

                Optional<UpiMarketStatisticEntity> prevYearOpt = entities.stream()
                        .filter(e -> targetPrevYearYm.equals(e.getYearMonth()))
                        .findFirst();

                if (prevYearOpt.isPresent()) {
                    UpiMarketStatisticEntity py = prevYearOpt.get();
                    prevYearMonth = py.getMonth();
                    if (py.getTransactionVolumeMillion() != null && py.getTransactionVolumeMillion() > 0) {
                        yoyVol = round(((current.getTransactionVolumeMillion() - py.getTransactionVolumeMillion())
                                / py.getTransactionVolumeMillion()) * 100.0, 2);
                    }
                    if (py.getTransactionValueCrore() != null && py.getTransactionValueCrore() > 0) {
                        yoyVal = round(((current.getTransactionValueCrore() - py.getTransactionValueCrore())
                                / py.getTransactionValueCrore()) * 100.0, 2);
                    }
                }
            } catch (Exception ex) {
                log.warn("Error computing YoY for {}: {}", curYm, ex.getMessage());
            }
        }

        return UpiGrowthMetricsDto.builder()
                .currentMonth(current.getMonth())
                .previousMonth(prevMonth)
                .previousYearSameMonth(prevYearMonth)
                .momVolumeGrowthPct(momVol)
                .momValueGrowthPct(momVal)
                .yoyVolumeGrowthPct(yoyVol)
                .yoyValueGrowthPct(yoyVal)
                .volumeTrend(volTrend)
                .valueTrend(valTrend)
                .avgDailyVolumeTrend(avgDailyVolTrend)
                .source(current.getSource())
                .build();
    }

    /**
     * Comprehensive market summary aggregating latest figures, growth, peaks, and trends.
     */
    public UpiMarketSummaryDto getMarketSummary() {
        UpiRecordDto latest = getLatestRecord();
        UpiGrowthMetricsDto growth = getGrowthMetrics();
        List<UpiMonthlyTrendPointDto> trends = getMonthlyTrends();

        Double peakVol = trends.stream()
                .map(UpiMonthlyTrendPointDto::getTransactionVolumeMillion)
                .filter(Objects::nonNull)
                .max(Double::compareTo)
                .orElse(null);

        Double peakVal = trends.stream()
                .map(UpiMonthlyTrendPointDto::getTransactionValueCrore)
                .filter(Objects::nonNull)
                .max(Double::compareTo)
                .orElse(null);

        int totalMonths = trends.size();
        String earliest = totalMonths > 0 ? trends.get(0).getMonth() : null;
        String latestMonth = totalMonths > 0 ? trends.get(totalMonths - 1).getMonth() : null;

        // Last 12 months for quick widget display
        List<UpiMonthlyTrendPointDto> recent12 = totalMonths > 12
                ? trends.subList(totalMonths - 12, totalMonths)
                : trends;

        return UpiMarketSummaryDto.builder()
                .latest(latest)
                .growth(growth)
                .totalMonthsAvailable(totalMonths)
                .earliestMonth(earliest)
                .latestMonth(latestMonth)
                .allTimePeakVolumeMillion(peakVol)
                .allTimePeakValueCrore(peakVal)
                .recentTrends(recent12)
                .source("NPCI")
                .build();
    }

    private Map<String, Integer> getEcosystemBankMap() {
        return ecosystemRepository.findAllByOrderByYearMonthAsc().stream()
                .collect(Collectors.toMap(
                        UpiEcosystemStatisticEntity::getYearMonth,
                        UpiEcosystemStatisticEntity::getBanksLiveOnUpi,
                        (existing, replacement) -> existing
                ));
    }

    private UpiRecordDto toRecordDto(UpiMarketStatisticEntity e, Integer banks) {
        return UpiRecordDto.builder()
                .month(e.getMonth())
                .yearMonth(e.getYearMonth())
                .transactionVolumeMillion(e.getTransactionVolumeMillion())
                .avgDailyTransactionVolumeMillion(e.getAvgDailyTransactionVolumeMillion())
                .transactionValueCrore(e.getTransactionValueCrore())
                .avgDailyTransactionValueCrore(e.getAvgDailyTransactionValueCrore())
                .banksLiveOnUpi(banks)
                .source(e.getSource())
                .build();
    }

    private static Double round(Double val, int places) {
        if (val == null) return null;
        return BigDecimal.valueOf(val).setScale(places, RoundingMode.HALF_UP).doubleValue();
    }
}
