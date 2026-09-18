package com.merchantgrowth.service;

import com.merchantgrowth.dto.CustomerAnalyticsDto;
import com.merchantgrowth.dto.CustomerSegmentSummaryDto;
import com.merchantgrowth.entity.CustomerEntity;
import com.merchantgrowth.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<CustomerEntity> getAllCustomers() {
        return getCustomersByMerchant("m-001");
    }

    public List<CustomerEntity> getCustomersByMerchant(String merchantId) {
        if (merchantId == null || merchantId.isBlank()) {
            return customerRepository.findByMerchantId("m-001");
        }
        return customerRepository.findByMerchantId(merchantId.trim());
    }

    public List<CustomerSegmentSummaryDto> getSegmentSummaries() {
        return getSegmentSummaries("m-001");
    }

    public List<CustomerSegmentSummaryDto> getSegmentSummaries(String merchantId) {
        return getCustomerAnalytics(merchantId).getSegments();
    }

    public CustomerAnalyticsDto getCustomerAnalytics(String merchantId) {
        String effectiveMerchantId = (merchantId == null || merchantId.isBlank()) ? "m-001" : merchantId.trim();
        List<CustomerEntity> customers = getCustomersByMerchant(effectiveMerchantId);

        if (customers.isEmpty()) {
            log.warn("No customers found for merchantId: {}, returning fallback analytics", effectiveMerchantId);
            return buildFallbackAnalytics(effectiveMerchantId);
        }

        int totalCust = customers.size();

        // Segregate customers into 5 standard RFM cohorts
        List<CustomerEntity> loyalList = new ArrayList<>();
        List<CustomerEntity> regularList = new ArrayList<>();
        List<CustomerEntity> newList = new ArrayList<>();
        List<CustomerEntity> atRiskList = new ArrayList<>();
        List<CustomerEntity> inactiveList = new ArrayList<>();

        for (CustomerEntity c : customers) {
            String seg = c.getSegment() != null ? c.getSegment().trim().toUpperCase() : "";
            if (seg.equals("LOYAL") || seg.equals("CHAMPIONS")) {
                loyalList.add(c);
            } else if (seg.equals("RETURNING") || seg.equals("REGULAR") || seg.equals("ACTIVE")) {
                regularList.add(c);
            } else if (seg.equals("NEW")) {
                newList.add(c);
            } else if (seg.equals("AT_RISK") || seg.equals("AT RISK")) {
                atRiskList.add(c);
            } else {
                // INACTIVE, DORMANT, or others
                inactiveList.add(c);
            }
        }

        CustomerSegmentSummaryDto loyalDto = buildCohortSummary(
                "seg-loyal", "Loyal", "LOYAL",
                loyalList, totalCust,
                266.0, 2.1, 4.2,
                "Offer early-access seasonal Chai specials",
                "High-frequency daily patrons with dependable morning & evening habits.",
                "#10B981", "Very Low Churn (<5%)", "LOW"
        );

        CustomerSegmentSummaryDto regularDto = buildCohortSummary(
                "seg-regular", "Regular", "RETURNING",
                regularList, totalCust,
                242.0, 4.6, 12.5,
                "Introduce Paytm Soundbox stamp loyalty card",
                "Consistent 2-3 visits weekly, strong response to snack bundles.",
                "#0052CC", "Low Churn (10-15%)", "LOW"
        );

        CustomerSegmentSummaryDto newDto = buildCohortSummary(
                "seg-new", "New", "NEW",
                newList, totalCust,
                200.0, 1.2, 28.0,
                "Send second-visit Paytm coupon (\u20B920 off on \u20B9100+)",
                "First-time visitors over the last 14 days; onboarding critical.",
                "#00B9F5", "Moderate Churn (25-30%)", "MEDIUM"
        );

        CustomerSegmentSummaryDto atRiskDto = buildCohortSummary(
                "seg-at-risk", "At Risk", "AT_RISK",
                atRiskList, totalCust,
                194.0, 9.4, 68.4,
                "Dispatch automated WhatsApp reactivation reminder",
                "Previously regular customers whose visit interval stretched from 3 to 9+ days.",
                "#F59E0B", "High Churn (60-70%)", "HIGH"
        );

        CustomerSegmentSummaryDto inactiveDto = buildCohortSummary(
                "seg-inactive", "Inactive", "INACTIVE",
                inactiveList, totalCust,
                228.0, 24.8, 94.0,
                "Run high-incentive Win-Back campaign (\u20B930 cashback on \u20B9150)",
                "Zero visits in past 21 days; represents \u20B938k\u2013\u20B942k recoverable revenue.",
                "#F43F5E", "Severe Churn (>90%)", "CRITICAL"
        );

        List<CustomerSegmentSummaryDto> segmentSummaries = List.of(
                loyalDto, regularDto, newDto, atRiskDto, inactiveDto
        );

        int activeCustomers = loyalList.size() + regularList.size();
        int atRiskCustomers = atRiskList.size();
        int dormantCustomers = inactiveList.size();
        double retentionRate = Math.round((activeCustomers * 100.0 / totalCust) * 10.0) / 10.0;
        double repeatPurchaseRate = Math.round(((totalCust - newList.size()) * 100.0 / totalCust) * 10.0) / 10.0;

        return CustomerAnalyticsDto.builder()
                .merchantId(effectiveMerchantId)
                .totalCustomers(totalCust)
                .activeCustomers(activeCustomers)
                .atRiskCustomers(atRiskCustomers)
                .dormantCustomers(dormantCustomers)
                .retentionRatePercent(retentionRate)
                .repeatPurchaseRatePercent(repeatPurchaseRate)
                .segments(segmentSummaries)
                .build();
    }

    private CustomerSegmentSummaryDto buildCohortSummary(
            String id,
            String displayName,
            String legacySegmentCode,
            List<CustomerEntity> cohortCustomers,
            int totalBaseCount,
            double benchmarkAov,
            double benchmarkLastDays,
            double benchmarkChurnRisk,
            String recommendedAction,
            String description,
            String color,
            String riskProfile,
            String churnRiskTier
    ) {
        int count = cohortCustomers.size();
        double percentage = totalBaseCount > 0
                ? Math.round((count * 100.0 / totalBaseCount) * 10.0) / 10.0
                : 0.0;

        double sumSpend = 0.0;
        int sumVisits = 0;
        double sumLastDays = 0.0;
        int lastDaysCount = 0;
        double sumRisk = 0.0;
        int riskCount = 0;

        for (CustomerEntity c : cohortCustomers) {
            sumSpend += c.getTotalSpend();
            sumVisits += Math.max(1, c.getVisitCount());

            double days = parseDaysSinceLastVisit(c.getLastVisit());
            if (days > 0) {
                sumLastDays += days;
                lastDaysCount++;
            }

            double r = parseChurnRisk(c.getRetentionRisk());
            if (r > 0) {
                sumRisk += r;
                riskCount++;
            }
        }

        // Inactive cohort by definition has 0 recent active revenue contribution, though historical spend exists
        double revenueContribution;
        if ("Inactive".equalsIgnoreCase(displayName)) {
            revenueContribution = 0.0;
        } else if (sumSpend > 0.0) {
            revenueContribution = Math.round(sumSpend);
        } else {
            revenueContribution = Math.round(count * benchmarkAov);
        }

        double aov;
        if (sumSpend > 0.0 && sumVisits > 0) {
            aov = Math.round(sumSpend / sumVisits);
        } else {
            aov = benchmarkAov;
        }

        double avgLastDays = lastDaysCount > 0
                ? Math.round((sumLastDays / lastDaysCount) * 10.0) / 10.0
                : benchmarkLastDays;

        double churnRisk = riskCount > 0
                ? Math.round((sumRisk / riskCount) * 10.0) / 10.0
                : benchmarkChurnRisk;

        return CustomerSegmentSummaryDto.builder()
                .id(id)
                .segmentName(displayName)
                .customerCount(count)
                .percentageOfTotal(percentage)
                .revenueContribution(revenueContribution)
                .averageOrderValue(aov)
                .lastPurchaseAvgDays(avgLastDays)
                .churnRiskPercent(churnRisk)
                .recommendedAction(recommendedAction)
                .description(description)
                // Backward-compatible properties
                .segment(legacySegmentCode)
                .name(displayName)
                .label(displayName)
                .count(count)
                .percentage(percentage)
                .sharePercent(percentage)
                .averageSpend(aov)
                .riskProfile(riskProfile)
                .churnRisk(churnRiskTier)
                .color(color)
                .build();
    }

    private double parseDaysSinceLastVisit(String lastVisit) {
        if (lastVisit == null || lastVisit.isBlank()) return -1.0;
        String s = lastVisit.trim().toLowerCase();
        if (s.contains("yesterday")) return 1.0;
        if (s.contains("today")) return 0.5;
        if (s.contains("recent")) return 2.0;
        try {
            String numStr = s.replaceAll("[^0-9.]", "");
            if (!numStr.isEmpty()) {
                return Double.parseDouble(numStr);
            }
        } catch (Exception ignored) {}
        return -1.0;
    }

    private double parseChurnRisk(String retentionRisk) {
        if (retentionRisk == null || retentionRisk.isBlank()) return -1.0;
        String r = retentionRisk.trim().toUpperCase();
        if (r.contains("VERY_HIGH") || r.contains("CRITICAL")) return 94.0;
        if (r.contains("HIGH")) return 75.0;
        if (r.contains("MODERATE") || r.contains("MEDIUM")) return 50.0;
        if (r.contains("LOW")) return 10.0;
        try {
            String numStr = r.replaceAll("[^0-9.]", "");
            if (!numStr.isEmpty()) {
                return Double.parseDouble(numStr);
            }
        } catch (Exception ignored) {}
        return -1.0;
    }

    private CustomerAnalyticsDto buildFallbackAnalytics(String merchantId) {
        return CustomerAnalyticsDto.builder()
                .merchantId(merchantId)
                .totalCustomers(0)
                .activeCustomers(0)
                .atRiskCustomers(0)
                .dormantCustomers(0)
                .retentionRatePercent(0.0)
                .repeatPurchaseRatePercent(0.0)
                .segments(List.of())
                .build();
    }
}

