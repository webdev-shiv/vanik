# Merchant Growth AI - Spring Boot 3 Backend

The core enterprise-grade transactional and analytical REST backend for **Merchant Growth AI**, built with Spring Boot 3.3, Java 21, Spring Data JPA, and PostgreSQL/Supabase with embedded H2 fallback.

---

## 1. Architecture Overview

Clean layered enterprise architecture:
```
REST Controllers (11 Core Endpoints + OpenAPI 3.0 Docs)
       ↓
Service Layer (Business Logic & Aggregation)
       ↓  ↘ WebClient (Non-blocking HTTP Client) → Python FastAPI Microservice (:8000)
Repository Layer (Spring Data JPA - 10 Repositories)
       ↓
Supabase / PostgreSQL (Production) / In-Memory H2 (Testing & Offline Dev)
```

> **Strict Architectural Separation**:
> - No machine learning model logic lives inside the Spring Boot backend.
> - All ML capabilities (RFM segmentation, sales forecasting, anomaly diagnostics, recommendation ranking, What-If simulation) are delegated to the Python FastAPI microservice via `WebClient`.
> - If the AI service is restarting or unreachable, a resilient statistical fallback engine computes microeconomic baseline and lift estimates without blocking the merchant.

---

## 2. Domain Entities (10/10 Implemented)

All entities mapped with JPA annotations, UUID/String primary keys, audit timestamps, and relationships:

| # | Entity | Table Name | Key Attributes |
|---|---|---|---|
| 1 | `MerchantEntity` | `merchants` | id, name, category, city, state, monthlyRevenue, connectionStatus, lastSyncedAt |
| 2 | `CustomerEntity` | `customers` | id, merchantId, name, phone, email, rfmSegment, totalSpend, visitsCount, churnRisk |
| 3 | `ProductEntity` | `products` | id, merchantId, name, category, price, cost, stockQuantity, unitsSold, marginPercent |
| 4 | `TransactionEntity` | `transactions` | id, merchantId, customerId, customerName, amount, paymentMethod, status, channel, time |
| 5 | `CampaignEntity` | `campaigns` | id, merchantId, name, type, status, targetAudience, budget, spentSoFar, startDate, endDate |
| 6 | `CampaignResultEntity` | `campaign_results` | id, campaignId, merchantId, impressions, clicks, transactions, revenueGenerated, roi |
| 7 | `CustomerSegmentEntity` | `customer_segments`| id, merchantId, name, count, sharePercent, averageSpend, churnRisk, color |
| 8 | `AIInsightEntity` | `ai_insights` | id, merchantId, type, severity, title, summary, rootCause, confidence, isResolved |
| 9 | `RecommendationEntity` | `recommendations` | id, merchantId, title, impactMetric, targetAudience, duration, priority, costEstimate |
| 10| `SimulationResultEntity` | `simulation_results`| id, merchantId, action, discountPercentage, durationDays, baseline/scenario revenue |

---

## 3. REST API Specification (11/11 Endpoints)

All endpoints return a standardized `ApiResponse<T>` envelope:

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate merchant credentials and emit session token | `200 OK` / `400 Bad Request` |
| `GET` | `/api/merchants/{merchantId}` | Get merchant business profile, city, and status | `200 OK` / `404 Not Found` |
| `GET` | `/api/dashboard/{merchantId}` | Aggregated KPIs, growth health score, alerts & recommendations | `200 OK` / `404 Not Found` |
| `GET` | `/api/analytics/sales/{merchantId}` | Sales analytics, weekday vs weekend split, hourly heatmaps | `200 OK` / `404 Not Found` |
| `GET` | `/api/analytics/customers/{merchantId}` | RFM customer segmentation, retention & repeat visit rates | `200 OK` / `404 Not Found` |
| `GET` | `/api/analytics/products/{merchantId}` | Top-selling vs declining products, inventory alerts | `200 OK` / `404 Not Found` |
| `GET` | `/api/insights/{merchantId}` | AI root-cause alerts, footfall slump flags, observations | `200 OK` |
| `GET` | `/api/recommendations/{merchantId}` | Prioritized actionable growth interventions with ROI estimates | `200 OK` |
| `GET` | `/api/campaigns/{merchantId}` | List of campaigns for a specific merchant | `200 OK` |
| `POST` | `/api/campaigns` | Create and launch an AI growth campaign | `200 OK` / `400 Bad Request` |
| `POST` | `/api/simulator/run` | Run What-If promotional simulation (delegates to Python AI) | `200 OK` / `400 Bad Request` |

### Backward Compatibility Endpoints
For frontend ease of migration, the following legacy paths remain fully supported:
- `/api/v1/merchant/*`
- `/api/v1/analytics/*`
- `/api/v1/campaigns/*`
- `/api/v1/customers/*`
- `/api/v1/ai/*`

---

## 4. Environment Variables & Security

Configured in `src/main/resources/application.yml` via environment variable substitution:

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:${SUPABASE_DB_URL:jdbc:h2:mem:merchant_growth_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL}}
    username: ${DB_USERNAME:sa}
    password: ${DB_PASSWORD:}

ai-service:
  base-url: ${AI_SERVICE_URL:http://localhost:8000}

openai:
  api-key: ${OPENAI_API_KEY:}
```

- **Zero credential leaks**: No raw database credentials or secrets are exposed to the client or frontend.
- **Dual persistence**: Connects to Supabase PostgreSQL when credentials are provided in the environment, or falls back seamlessly to in-memory PostgreSQL-mode H2 for zero-configuration local runs and automated tests.

---

## 5. Running and Testing

### Build & Run Tests
```bash
mvn clean test
```
*Executes all 15 MockMvc integration and context unit tests.*

### Run the Application
```bash
mvn spring-boot:run
```
- Server: `http://localhost:8080`
- Swagger UI Documentation: `http://localhost:8080/swagger-ui.html`
- OpenAPI Specification JSON: `http://localhost:8080/v3/api-docs`
- H2 Console (Offline dev mode): `http://localhost:8080/h2-console`
