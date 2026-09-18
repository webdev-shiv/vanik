package com.merchantgrowth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.merchantgrowth.entity.*;
import com.merchantgrowth.repository.*;
import com.merchantgrowth.security.PasswordHasher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializerService implements ApplicationRunner {

    private final MerchantRepository merchantRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final TransactionRepository transactionRepository;
    private final CampaignRepository campaignRepository;
    private final CampaignResultRepository campaignResultRepository;
    private final CustomerSegmentRepository customerSegmentRepository;
    private final AIInsightRepository aiInsightRepository;
    private final RecommendationRepository recommendationRepository;
    private final SimulationResultRepository simulationResultRepository;
    private final UpiMarketStatisticRepository upiMarketStatisticRepository;
    private final UpiEcosystemStatisticRepository upiEcosystemStatisticRepository;
    private final MerchantUserRepository merchantUserRepository;
    private final PasswordHasher passwordHasher;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        initNpciData();
        seedUsers();

        if (merchantRepository.count() > 0) {
            log.info("Database already initialized with merchant data.");
            ensureExtendedData();
            return;
        }

        log.info("Seeding initial benchmark Indian merchant data across all 10 domain entities...");

        // 1. Merchants (m-001 and merch-sharma-tea)
        MerchantEntity m001 = MerchantEntity.builder()
                .id("m-001")
                .name("Sharma Tea Corner")
                .ownerName("Ramesh Sharma")
                .category("Food & Beverage")
                .location("Connaught Place, New Delhi")
                .size("Micro (1-5 staff)")
                .paytmMerchantId("PAYTM-MERCH-98214-DL")
                .soundboxId("SB-4G-99218")
                .qrCodeId("QR-CP-8841")
                .connectionStatus("CONNECTED_ACTIVE")
                .lastSyncedAt("Realtime Webhook Stream")
                .monthlyRevenue(284500.0)
                .build();
        merchantRepository.save(m001);

        MerchantEntity mSharma = MerchantEntity.builder()
                .id("merch-sharma-tea")
                .name("Sharma Tea Corner")
                .ownerName("Ramesh Sharma")
                .category("QSR / Cafe & Snacks")
                .location("Connaught Place, New Delhi")
                .size("Micro (1-5 staff)")
                .paytmMerchantId("PAYTM-MERCH-98214-DL")
                .soundboxId("SB-4G-99218")
                .qrCodeId("QR-CP-8841")
                .connectionStatus("CONNECTED_DEMO")
                .lastSyncedAt("Just now (Realtime Webhook Stream)")
                .monthlyRevenue(284500.0)
                .build();
        merchantRepository.save(mSharma);

        // 2. Initial Customers
        List<CustomerEntity> customers = List.of(
                CustomerEntity.builder()
                        .id("c-001").merchantId("m-001").maskedPhone("+91 98110 •••••")
                        .name("Rohit K. (IT Desk)").segment("DORMANT").totalSpend(2450.0).visitCount(18)
                        .averageSpend(136.0).lastVisit("22 days ago").preferredTime("6:15 PM (Evening)")
                        .favoriteItem("Special Masala Chai + Bun Maska").retentionRisk("HIGH").build(),
                CustomerEntity.builder()
                        .id("c-002").merchantId("m-001").maskedPhone("+91 98712 •••••")
                        .name("Ananya S. (Fintech)").segment("DORMANT").totalSpend(3120.0).visitCount(24)
                        .averageSpend(130.0).lastVisit("25 days ago").preferredTime("5:45 PM (Evening)")
                        .favoriteItem("Ginger Lemon Tea + Samosa").retentionRisk("HIGH").build(),
                CustomerEntity.builder()
                        .id("c-003").merchantId("m-001").maskedPhone("+91 99104 •••••")
                        .name("Vikram M. (Consultant)").segment("AT_RISK").totalSpend(4800.0).visitCount(31)
                        .averageSpend(155.0).lastVisit("11 days ago").preferredTime("1:30 PM (Lunch)")
                        .favoriteItem("Kulhad Chai + Paneer Pakora").retentionRisk("MODERATE").build(),
                CustomerEntity.builder()
                        .id("c-004").merchantId("m-001").maskedPhone("+91 98290 •••••")
                        .name("Deepak V. (Banker)").segment("LOYAL").totalSpend(6850.0).visitCount(48)
                        .averageSpend(142.0).lastVisit("Yesterday").preferredTime("9:00 AM (Morning)")
                        .favoriteItem("Cutting Chai + Butter Toast").retentionRisk("LOW").build()
        );
        customerRepository.saveAll(customers);

        // 3. Products
        List<ProductEntity> products = List.of(
                ProductEntity.builder().id("p-001").merchantId("m-001").name("Special Masala Chai (Kulhad)").category("Tea & Beverages").price(25.0).cost(11.0).stockQuantity(500).isAvailable(true).createdAt("2025-09-01").build(),
                ProductEntity.builder().id("p-002").merchantId("m-001").name("Ginger Elaichi Tea").category("Tea & Beverages").price(20.0).cost(9.5).stockQuantity(450).isAvailable(true).createdAt("2025-09-01").build(),
                ProductEntity.builder().id("p-003").merchantId("m-001").name("Crispy Aloo Samosa (2 pcs)").category("Snacks & Savouries").price(30.0).cost(15.0).stockQuantity(80).isAvailable(true).createdAt("2025-09-01").build(),
                ProductEntity.builder().id("p-004").merchantId("m-001").name("Bun Maska Butter Toast").category("Snacks & Savouries").price(40.0).cost(21.0).stockQuantity(15).isAvailable(true).createdAt("2025-09-01").build(),
                ProductEntity.builder().id("p-005").merchantId("m-001").name("Paneer Bread Pakora").category("Snacks & Savouries").price(35.0).cost(20.0).stockQuantity(25).isAvailable(true).createdAt("2025-09-01").build()
        );
        productRepository.saveAll(products);

        // 4. Customer Segments
        List<CustomerSegmentEntity> segments = List.of(
                CustomerSegmentEntity.builder().id("cs-001").merchantId("m-001").customerId("c-001").segmentName("Dormant / Lost").rfmScore("121").rScore(1).fScore(2).mScore(1).churnRisk(0.88).updatedAt(LocalDate.now().toString()).build(),
                CustomerSegmentEntity.builder().id("cs-002").merchantId("m-001").customerId("c-002").segmentName("Dormant / Lost").rfmScore("132").rScore(1).fScore(3).mScore(2).churnRisk(0.85).updatedAt(LocalDate.now().toString()).build(),
                CustomerSegmentEntity.builder().id("cs-003").merchantId("m-001").customerId("c-003").segmentName("At Risk").rfmScore("243").rScore(2).fScore(4).mScore(3).churnRisk(0.62).updatedAt(LocalDate.now().toString()).build(),
                CustomerSegmentEntity.builder().id("cs-004").merchantId("m-001").customerId("c-004").segmentName("Champions").rfmScore("555").rScore(5).fScore(5).mScore(5).churnRisk(0.08).updatedAt(LocalDate.now().toString()).build()
        );
        customerSegmentRepository.saveAll(segments);

        // 5. AI Insights & Alerts
        List<AIInsightEntity> insights = List.of(
                AIInsightEntity.builder()
                        .id("ins-001")
                        .merchantId("m-001")
                        .title("Acute Evening Sales Slump Detected")
                        .insightType("SLUMP")
                        .severity("CRITICAL")
                        .affectedWindow("5:00 PM – 8:30 PM Daily")
                        .impactEstimate("-31.4% Revenue Drop (INR -5,974/month)")
                        .description("Transaction volume plunges by 31.4% between 5:00 PM and 8:30 PM compared to moving average baseline. Nearby competitor launched tea combo.")
                        .isResolved(false)
                        .createdAt("Today, 5:30 PM")
                        .build(),
                AIInsightEntity.builder()
                        .id("ins-002")
                        .merchantId("m-001")
                        .title("312 Regular Commuters Are Dormant")
                        .insightType("RETENTION")
                        .severity("HIGH")
                        .affectedWindow("Last 21 Days")
                        .impactEstimate("INR 33,500 At-Risk Revenue")
                        .description("Repeat customer visits dropped 14.1%. 312 office regulars have not scanned the QR code in 21+ days.")
                        .isResolved(false)
                        .createdAt("Yesterday")
                        .build(),
                AIInsightEntity.builder()
                        .id("ins-003")
                        .merchantId("m-001")
                        .title("Weekend Basket Upsell Opportunity")
                        .insightType("OPPORTUNITY")
                        .severity("MEDIUM")
                        .affectedWindow("Saturdays & Sundays")
                        .impactEstimate("+12% Estimated Weekend AOV Lift")
                        .description("Family and group visitors order individual items. Offering bundled snack platters could increase ticket size by ₹25.")
                        .isResolved(false)
                        .createdAt("3 days ago")
                        .build(),
                AIInsightEntity.builder()
                        .id("ins-004")
                        .merchantId("m-001")
                        .title("Bun Maska & Snack Attach Decoupling")
                        .insightType("PRODUCT")
                        .severity("WARNING")
                        .affectedWindow("Tea Break Hours (10 AM - 12 PM, 4 PM - 6 PM)")
                        .impactEstimate("-24.5% Bakery Attach Rate (₹18,500/month)")
                        .description("While Masala Chai volume remains high, attach rates for bakery and snack items dropped during tea breaks. Customers are buying solo chai without food.")
                        .isResolved(false)
                        .createdAt("2 days ago")
                        .build()
        );
        aiInsightRepository.saveAll(insights);

        // 6. Recommendations
        List<RecommendationEntity> recommendations = List.of(
                RecommendationEntity.builder()
                        .id("rec-001")
                        .merchantId("m-001")
                        .title("Launch Evening Happy Hour Combo (5 PM – 8 PM)")
                        .tagline("Special Masala Chai + 2 Samosas for ₹40 via Paytm Soundbox QR")
                        .expectedImpact("+22–28% evening footfall recovery")
                        .impactMetric("+₹48,200 Est. Revenue")
                        .targetAudience("Evening office commuters & local shoppers")
                        .targetCount(850)
                        .duration("14 Days")
                        .priority("CRITICAL")
                        .costEstimate("₹1,200 (Digital push)")
                        .whyReason("Evening transactions dropped 31.4% due to competitor combo pricing. Bundling chai with samosas recaptures commuter traffic.")
                        .suggestedOffer("Chai + Samosa Combo at flat ₹40 (Save ₹15)")
                        .category("Demand Recovery")
                        .build(),
                RecommendationEntity.builder()
                        .id("rec-002")
                        .merchantId("m-001")
                        .title("Target Inactive Regulars with ₹30 Cashback")
                        .tagline("Re-engage 312 dormant regulars on orders above ₹150")
                        .expectedImpact("+14% repeat visit recovery")
                        .impactMetric("+₹33,500 Est. Revenue")
                        .targetAudience("Dormant regulars (0 visits in last 21 days)")
                        .targetCount(312)
                        .duration("7 Days")
                        .priority("HIGH_IMPACT")
                        .costEstimate("₹2,400")
                        .whyReason("Repeat customer retention eroded by 14.1%. Automated Paytm push alert incentives reactivation before permanent churn.")
                        .suggestedOffer("₹30 cashback on ₹150+ bill")
                        .category("Retention")
                        .build(),
                RecommendationEntity.builder()
                        .id("rec-003")
                        .merchantId("m-001")
                        .title("Bundle High-Margin Bakery Attach")
                        .tagline("Masala Chai + Bun Maska combo at ₹55 via Paytm QR")
                        .expectedImpact("+18% bakery attach rate lift")
                        .impactMetric("+₹18,500 Est. Revenue")
                        .targetAudience("Solo tea commuters")
                        .targetCount(450)
                        .duration("10 Days")
                        .priority("MEDIUM")
                        .costEstimate("₹800")
                        .whyReason("Bakery and snack attach rates declined 24.5%. Bundling chai with bun maska encourages solo tea patrons to order snacks.")
                        .suggestedOffer("Bun Maska combo at flat ₹55 (Save ₹10)")
                        .category("Product")
                        .build(),
                RecommendationEntity.builder()
                        .id("rec-004")
                        .merchantId("m-001")
                        .title("Weekend Group Platter Upsell")
                        .tagline("Family snack platter for 3-4 patrons on Saturdays & Sundays")
                        .expectedImpact("+12% weekend ticket size lift")
                        .impactMetric("+₹14,200 Est. Revenue")
                        .targetAudience("Weekend groups and families")
                        .targetCount(220)
                        .duration("21 Days")
                        .priority("MEDIUM")
                        .costEstimate("₹600")
                        .whyReason("Weekend group visits buy individual samosas. Bundled platters raise average transaction value from ₹140 to ₹220+.")
                        .suggestedOffer("Snack Platter with 4 Kulhad Chais at ₹180")
                        .category("Sales")
                        .build()
        );
        recommendationRepository.saveAll(recommendations);

        // 7. Campaigns & Results
        CampaignEntity camp1 = CampaignEntity.builder()
                .id("camp-001")
                .merchantId("m-001")
                .name("Evening Happy Hour Flash Offer")
                .type("EVENING_OFFER")
                .status("ACTIVE")
                .targetSegment("At Risk")
                .discountType("PERCENTAGE")
                .discountValue(20.0)
                .budget(1000.0)
                .spentSoFar(380.0)
                .channel("Paytm Soundbox QR Push")
                .startDate(LocalDate.now().minusDays(3).toString())
                .endDate(LocalDate.now().plusDays(11).toString())
                .description("20% combo discount on tea and snacks between 5-8 PM")
                .revenueBefore(265000.0)
                .transactionsBefore(2340)
                .repeatCustomersBefore(312)
                .build();
        campaignRepository.save(camp1);

        CampaignResultEntity campResult1 = CampaignResultEntity.builder()
                .id("cres-001")
                .campaignId("camp-001")
                .merchantId("m-001")
                .impressions(1250)
                .clicks(480)
                .transactions(240)
                .revenueGenerated(18500.0)
                .liftPercent(24.5)
                .roi(4.8)
                .completedAt("In Progress")
                .build();
        campaignResultRepository.save(campResult1);

        // 8. Simulation Results
        SimulationResultEntity sim1 = SimulationResultEntity.builder()
                .id("sim-001")
                .merchantId("m-001")
                .action("evening offer")
                .discountPercentage(20.0)
                .durationDays(14)
                .targetSegment("At Risk")
                .baselineRevenue(127736.4)
                .scenarioRevenue(149244.96)
                .incrementalRevenue(21508.56)
                .baselineTransactions(1088)
                .scenarioTransactions(1589)
                .incrementalTransactions(501)
                .confidence(0.91)
                .createdAt(LocalDate.now().toString())
                .build();
        simulationResultRepository.save(sim1);

        ensureExtendedData();
        log.info("Benchmark Indian merchant data seeding completed successfully across all 10 entities.");
    }

    private void seedUsers() {
        if (merchantUserRepository.count() > 0) {
            return;
        }
        log.info("Seeding initial merchant user credentials with secure PBKDF2 hashes...");
        PasswordHasher.HashedPassword p1 = passwordHasher.hashPassword("password123");
        merchantUserRepository.save(MerchantUserEntity.builder()
                .id("usr-001")
                .merchantId("m-001")
                .username("m-001")
                .email("m001@merchantgrowth.ai")
                .passwordHash(p1.hashHex())
                .salt(p1.saltHex())
                .role("MERCHANT")
                .createdAt(Instant.now().toString())
                .build());

        PasswordHasher.HashedPassword p2 = passwordHasher.hashPassword("merchant123");
        merchantUserRepository.save(MerchantUserEntity.builder()
                .id("usr-002")
                .merchantId("m-001")
                .username("ramesh")
                .email("ramesh@sharmatea.com")
                .passwordHash(p2.hashHex())
                .salt(p2.saltHex())
                .role("MERCHANT")
                .createdAt(Instant.now().toString())
                .build());

        PasswordHasher.HashedPassword p3 = passwordHasher.hashPassword("verma123");
        merchantUserRepository.save(MerchantUserEntity.builder()
                .id("usr-003")
                .merchantId("m-002")
                .username("ashok")
                .email("ashok@vermasweets.com")
                .passwordHash(p3.hashHex())
                .salt(p3.saltHex())
                .role("MERCHANT")
                .createdAt(Instant.now().toString())
                .build());
        log.info("Seeded 3 merchant users successfully.");
    }

    private void ensureExtendedData() {
        if (!merchantRepository.existsById("m-002")) {
            merchantRepository.save(MerchantEntity.builder()
                    .id("m-002")
                    .name("Verma Sweets & Snacks")
                    .ownerName("Ashok Verma")
                    .category("Sweets & Confectionery")
                    .location("Karol Bagh, New Delhi")
                    .size("Small (5-10 staff)")
                    .paytmMerchantId("PAYTM-MERCH-88123-DL")
                    .soundboxId("SB-4G-55122")
                    .qrCodeId("QR-KB-3321")
                    .connectionStatus("CONNECTED_ACTIVE")
                    .lastSyncedAt("Realtime Webhook Stream")
                    .monthlyRevenue(350000.0)
                    .build());
        }
        if (!recommendationRepository.existsById("rec-003")) {
            recommendationRepository.save(RecommendationEntity.builder()
                    .id("rec-003")
                    .merchantId("m-001")
                    .title("Bundle High-Margin Bakery Attach")
                    .tagline("Masala Chai + Bun Maska combo at ₹55 via Paytm QR")
                    .expectedImpact("+18% bakery attach rate lift")
                    .impactMetric("+₹18,500 Est. Revenue")
                    .targetAudience("Solo tea commuters")
                    .targetCount(450)
                    .duration("10 Days")
                    .priority("MEDIUM")
                    .costEstimate("₹800")
                    .whyReason("Bakery and snack attach rates declined 24.5%. Bundling chai with bun maska encourages solo tea patrons to order snacks.")
                    .suggestedOffer("Bun Maska combo at flat ₹55 (Save ₹10)")
                    .category("Product")
                    .build());
        }
        if (!recommendationRepository.existsById("rec-004")) {
            recommendationRepository.save(RecommendationEntity.builder()
                    .id("rec-004")
                    .merchantId("m-001")
                    .title("Weekend Group Platter Upsell")
                    .tagline("Family snack platter for 3-4 patrons on Saturdays & Sundays")
                    .expectedImpact("+12% weekend ticket size lift")
                    .impactMetric("+₹14,200 Est. Revenue")
                    .targetAudience("Weekend groups and families")
                    .targetCount(220)
                    .duration("21 Days")
                    .priority("MEDIUM")
                    .costEstimate("₹600")
                    .whyReason("Weekend group visits buy individual samosas. Bundled platters raise average transaction value from ₹140 to ₹220+.")
                    .suggestedOffer("Snack Platter with 4 Kulhad Chais at ₹180")
                    .category("Sales")
                    .build());
        }

        seedTransactionsFromCsv();
        seedCustomersFromCsv();
        enrichCustomersFromRfmCsv();
    }

    private void seedTransactionsFromCsv() {
        if (transactionRepository.countTransactionsByMerchant("m-001") >= 10000) {
            log.info("Transactions already fully seeded for m-001 ({} records).", transactionRepository.countTransactionsByMerchant("m-001"));
            return;
        }

        File file = new File("data_generator/data/transactions.csv");
        if (!file.exists()) {
            file = new File("../data_generator/data/transactions.csv");
        }
        if (!file.exists()) {
            log.warn("transactions.csv not found, skipping full dataset ingestion.");
            return;
        }

        log.info("Ingesting full-year transaction records from {}...", file.getAbsolutePath());
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line = br.readLine(); // skip header
            List<Object[]> batch = new ArrayList<>(2000);
            String sql = "INSERT INTO transactions (id, merchant_id, customer_id, amount, timestamp, payment_method, category, status, soundbox_announcement_done) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            while ((line = br.readLine()) != null) {
                if (line.isEmpty()) continue;
                String[] p = line.split(",");
                if (p.length < 10) continue;
                String merchantId = p[1];
                if (!"m-001".equals(merchantId)) continue;

                String txId = p[0];
                String custId = p[2].isEmpty() ? null : p[2];
                double amount = Double.parseDouble(p[7]);
                Instant ts = LocalDateTime.parse(p[4], dtf).toInstant(ZoneOffset.UTC);
                String payMethod = p[8];
                String status = p[9];

                batch.add(new Object[]{txId, merchantId, custId, amount, ts, payMethod, "Food & Beverage", status, true});

                if (batch.size() >= 2000) {
                    jdbcTemplate.batchUpdate(sql, batch);
                    batch.clear();
                }
            }
            if (!batch.isEmpty()) {
                jdbcTemplate.batchUpdate(sql, batch);
            }
            log.info("Successfully ingested {} transactions for m-001 from CSV.", transactionRepository.countTransactionsByMerchant("m-001"));
        } catch (Exception e) {
            log.error("Failed to ingest transactions.csv: {}", e.getMessage(), e);
        }
    }

    private void seedCustomersFromCsv() {
        if (customerRepository.count() >= 1000) {
            return;
        }

        File file = new File("data_generator/data/customers.csv");
        if (!file.exists()) {
            file = new File("../data_generator/data/customers.csv");
        }
        if (!file.exists()) {
            return;
        }

        log.info("Ingesting customer profiles from {}...", file.getAbsolutePath());
        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line = br.readLine();
            List<Object[]> batch = new ArrayList<>(1000);
            String sql = "INSERT INTO customers (id, merchant_id, masked_phone, name, segment, total_spend, visit_count, average_spend, last_visit, preferred_time, favorite_item, retention_risk) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            while ((line = br.readLine()) != null) {
                if (line.isEmpty()) continue;
                String[] p = line.split(",");
                if (p.length < 10) continue;
                String merchantId = p[1];
                if (!"m-001".equals(merchantId)) continue;
                String custId = p[0];
                if (customerRepository.existsById(custId)) continue;

                String name = p[3];
                String phone = p[4];
                String cohort = p[8];
                String time = p[9];
                String status = p[7];
                String risk = "DORMANT".equalsIgnoreCase(status) ? "HIGH" : ("AT_RISK".equalsIgnoreCase(status) ? "MODERATE" : "LOW");

                batch.add(new Object[]{custId, merchantId, phone, name, cohort, 0.0, 1, 0.0, "Recent", time, "Special Masala Chai", risk});
                if (batch.size() >= 1000) {
                    jdbcTemplate.batchUpdate(sql, batch);
                    batch.clear();
                }
            }
            if (!batch.isEmpty()) {
                jdbcTemplate.batchUpdate(sql, batch);
            }
            log.info("Successfully ingested {} customers for m-001 from CSV.", customerRepository.count());
        } catch (Exception e) {
            log.error("Failed to ingest customers.csv: {}", e.getMessage(), e);
        }
    }

    private void enrichCustomersFromRfmCsv() {
        File file = new File("ai-service/data/customer_rfm.csv");
        if (!file.exists()) {
            file = new File("../ai-service/data/customer_rfm.csv");
        }
        if (!file.exists()) {
            file = new File("data_generator/ml_data/customer_rfm.csv");
        }
        if (!file.exists()) {
            file = new File("../data_generator/ml_data/customer_rfm.csv");
        }
        if (!file.exists()) {
            log.warn("customer_rfm.csv not found, skipping customer RFM enrichment.");
            return;
        }

        log.info("Enriching customer profiles with RFM data from {}...", file.getAbsolutePath());
        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line = br.readLine(); // skip header
            List<Object[]> batch = new ArrayList<>(1000);
            String sql = "UPDATE customers SET total_spend = ?, visit_count = ?, average_spend = ?, last_visit = ?, retention_risk = ? WHERE id = ? AND merchant_id = ?";

            while ((line = br.readLine()) != null) {
                if (line.isEmpty()) continue;
                String[] p = line.split(",");
                if (p.length < 9) continue;
                String custId = p[0].trim();
                String merchantId = p[1].trim();
                if (!"m-001".equals(merchantId)) continue;

                int recencyDays = Integer.parseInt(p[2].trim());
                int freq = Integer.parseInt(p[3].trim());
                double monetary = Double.parseDouble(p[4].trim());
                double avgTicket = Double.parseDouble(p[5].trim());
                double churnRisk = Double.parseDouble(p[8].trim());
                String risk = churnRisk > 50.0 ? "HIGH" : (churnRisk > 20.0 ? "MODERATE" : "LOW");
                String lastVisit = recencyDays <= 1 ? "Yesterday" : recencyDays + " days ago";

                batch.add(new Object[]{monetary, freq, avgTicket, lastVisit, risk, custId, merchantId});
                if (batch.size() >= 1000) {
                    jdbcTemplate.batchUpdate(sql, batch);
                    batch.clear();
                }
            }
            if (!batch.isEmpty()) {
                jdbcTemplate.batchUpdate(sql, batch);
            }
            log.info("Successfully enriched customers for m-001 from customer_rfm.csv.");
        } catch (Exception e) {
            log.error("Failed to enrich customers from RFM CSV: {}", e.getMessage(), e);
        }
    }

    private void initNpciData() {
        if (upiMarketStatisticRepository.count() > 0) {
            log.info("Database already initialized with official NPCI UPI statistics.");
            return;
        }

        log.info("Seeding official NPCI UPI macroeconomic statistics from classpath...");
        try {
            ClassPathResource resource = new ClassPathResource("seed_npci_data.json");
            if (!resource.exists()) {
                log.warn("seed_npci_data.json not found on classpath, skipping NPCI auto-seed.");
                return;
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(resource.getInputStream());

            JsonNode marketList = root.get("market_statistics");
            if (marketList != null && marketList.isArray()) {
                List<UpiMarketStatisticEntity> marketEntities = new ArrayList<>();
                for (JsonNode n : marketList) {
                    marketEntities.add(UpiMarketStatisticEntity.builder()
                            .id(n.has("id") ? n.get("id").asText() : UUID.randomUUID().toString())
                            .month(n.get("month").asText())
                            .yearMonth(n.get("year_month").asText())
                            .transactionVolumeMillion(n.get("transaction_volume_million").asDouble())
                            .avgDailyTransactionVolumeMillion(n.hasNonNull("avg_daily_transaction_volume_million") ? n.get("avg_daily_transaction_volume_million").asDouble() : null)
                            .transactionValueCrore(n.get("transaction_value_crore").asDouble())
                            .avgDailyTransactionValueCrore(n.hasNonNull("avg_daily_transaction_value_crore") ? n.get("avg_daily_transaction_value_crore").asDouble() : null)
                            .source(n.has("source") ? n.get("source").asText() : "NPCI")
                            .sourceFile(n.has("source_file") ? n.get("source_file").asText() : "NPCI-Official")
                            .createdAt(Instant.now().toString())
                            .build());
                }
                upiMarketStatisticRepository.saveAll(marketEntities);
                log.info("Seeded {} official NPCI market statistics records.", marketEntities.size());
            }

            JsonNode ecoList = root.get("ecosystem_statistics");
            if (ecoList != null && ecoList.isArray()) {
                List<UpiEcosystemStatisticEntity> ecoEntities = new ArrayList<>();
                for (JsonNode n : ecoList) {
                    ecoEntities.add(UpiEcosystemStatisticEntity.builder()
                            .id(n.has("id") ? n.get("id").asText() : UUID.randomUUID().toString())
                            .month(n.get("month").asText())
                            .yearMonth(n.get("year_month").asText())
                            .banksLiveOnUpi(n.get("banks_live_on_upi").asInt())
                            .transactionVolumeMillion(n.get("transaction_volume_million").asDouble())
                            .transactionValueCrore(n.get("transaction_value_crore").asDouble())
                            .source(n.has("source") ? n.get("source").asText() : "NPCI")
                            .sourceFile(n.has("source_file") ? n.get("source_file").asText() : "NPCI-Official")
                            .createdAt(Instant.now().toString())
                            .build());
                }
                upiEcosystemStatisticRepository.saveAll(ecoEntities);
            }
        } catch (Exception e) {
            log.error("Failed to seed NPCI statistics from seed_npci_data.json: {}", e.getMessage(), e);
        }
    }
}
