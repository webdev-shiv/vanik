# Merchant Growth AI - Supabase PostgreSQL Database Architecture Documentation

## 1. Executive Summary

This document specifies the relational data model, indexing strategy, and Row Level Security (RLS) policies for **Merchant Growth AI** implemented on **Supabase / PostgreSQL**.

The schema is built to turn granular merchant transaction telemetry into reproducible analytical insights, What-If microeconomic simulations, and AI-driven growth campaigns.

---

## 2. Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    merchants ||--o{ customers : "has"
    merchants ||--o{ products : "offers"
    merchants ||--o{ transactions : "records"
    merchants ||--o{ campaigns : "launches"
    merchants ||--o{ customer_segments : "analyzes"
    merchants ||--o{ ai_insights : "receives"
    merchants ||--o{ recommendations : "evaluates"
    merchants ||--o{ simulation_results : "runs"
    merchants ||--o{ model_predictions : "generates"

    customers ||--o{ transactions : "performs"
    customers ||--o{ customer_segments : "segmented_into"
    products ||--o{ transactions : "purchased_in"
    campaigns ||--|| campaign_results : "measured_by"
    campaigns ||--o{ recommendations : "derives_from"

    merchants {
        UUID id PK
        UUID auth_user_id
        VARCHAR name
        VARCHAR paytm_merchant_id UK
        VARCHAR soundbox_id
        NUMERIC monthly_revenue
    }

    customers {
        UUID id PK
        UUID merchant_id FK
        VARCHAR customer_code
        VARCHAR masked_phone
        VARCHAR customer_status
        JSONB attributes
    }

    products {
        UUID id PK
        UUID merchant_id FK
        VARCHAR product_name
        VARCHAR category
        NUMERIC price
        NUMERIC cost
        BOOLEAN active_status
    }

    transactions {
        UUID id PK
        UUID merchant_id FK
        UUID customer_id FK
        UUID product_id FK
        TIMESTAMPTZ transaction_timestamp
        NUMERIC total_amount
        VARCHAR payment_method
        VARCHAR transaction_status
        VARCHAR channel
    }

    campaigns {
        UUID id PK
        UUID merchant_id FK
        VARCHAR campaign_name
        VARCHAR campaign_type
        VARCHAR target_segment
        NUMERIC discount
        NUMERIC budget
        VARCHAR status
    }

    campaign_results {
        UUID id PK
        UUID campaign_id FK
        UUID merchant_id FK
        NUMERIC revenue_before
        NUMERIC revenue_during_after
        JSONB incremental_metrics
        NUMERIC roi
        JSONB ai_learnings
    }

    customer_segments {
        UUID id PK
        UUID customer_id FK
        UUID merchant_id FK
        INT recency
        INT frequency
        NUMERIC monetary_value
        VARCHAR segment
        NUMERIC churn_risk_score
    }

    ai_insights {
        UUID id PK
        UUID merchant_id FK
        VARCHAR insight_type
        VARCHAR severity
        VARCHAR title
        JSONB supporting_metrics
        VARCHAR status
    }

    recommendations {
        UUID id PK
        UUID merchant_id FK
        VARCHAR recommendation_type
        VARCHAR target_segment
        TEXT recommended_action
        NUMERIC confidence
        VARCHAR priority
    }

    simulation_results {
        UUID id PK
        UUID merchant_id FK
        VARCHAR action_type
        JSONB input_parameters
        JSONB baseline_metrics
        JSONB predicted_metrics
        NUMERIC confidence
    }

    model_predictions {
        UUID id PK
        UUID merchant_id FK
        VARCHAR model_type
        JSONB prediction
        DATE prediction_date
        NUMERIC confidence
    }
```

---

## 3. Table Specifications & Relationships

### 3.1 `merchants`
- **Purpose**: Represents the merchant's business profile and hardware identifiers.
- **Key Columns**:
  - `id`: Primary key (`UUID`).
  - `auth_user_id`: Optional reference to Supabase Auth (`auth.users.id`).
  - `paytm_merchant_id`: Unique Paytm business identifier (e.g. `PAYTM-MERCH-98214-DL`).
  - `soundbox_id` & `qr_code_id`: Hardware linkages (e.g. `SB-4G-99218`, `QR-CP-8841`).
  - `connection_status`: Mode (`CONNECTED_DEMO`, `CONNECTED_LIVE`, `DISCONNECTED`).

### 3.2 `customers`
- **Purpose**: Profiles merchant customers with privacy-safe attributes.
- **Key Columns**:
  - `masked_phone`: Privacy-preserving identifier (e.g. `+91 98110 •••••`).
  - `customer_status`: `ACTIVE`, `INACTIVE`, `CHURNED`, `DORMANT`, `BLOCKED`.
  - `attributes`: JSONB column storing business-safe parameters (e.g. `office_corridor`, `past_frequency`).
- **Relationship**: `merchant_id` $\rightarrow$ `merchants(id)` (`ON DELETE CASCADE`).

### 3.3 `products`
- **Purpose**: Catalog of items sold, supporting item-level profitability and margin calculations.
- **Key Columns**:
  - `price`: Retail selling price.
  - `cost`: Raw ingredient/wholesale cost (enables gross margin computation).
  - `active_status`: Active flag for inventory.
- **Relationship**: `merchant_id` $\rightarrow$ `merchants(id)` (`ON DELETE CASCADE`).

### 3.4 `transactions`
- **Purpose**: Granular transactional telemetry from Paytm Soundbox announcements, QR stands, and POS swiping.
- **Key Columns**:
  - `customer_id`: Nullable foreign key for walk-ins versus tracked regular customers.
  - `product_id`: Nullable foreign key for catalog versus open-amount transactions.
  - `transaction_timestamp`: Exact settlement timestamp with time-zone.
  - `payment_method`: `SOUNDBOX_QR`, `SOUNDBOX_CARD`, `UPI`, `PAYTM_WALLET`, `CASH`, `NET_BANKING`.
  - `channel`: `SOUNDBOX`, `QR_STAND`, `OFFLINE_STORE`, `ONLINE_PAYTM_MINI_APP`, `POS_TERMINAL`.
  - `soundbox_announcement_done`: Confirms IoT audio voice playback.
- **Indexes**:
  - `(merchant_id, transaction_timestamp DESC)` for rapid dashboard time-series slicing.
  - `(merchant_id, payment_method, transaction_timestamp)` for hourly density analysis.

### 3.5 `campaigns`
- **Purpose**: Marketing campaigns executed by the merchant across digital channels.
- **Key Columns**:
  - `campaign_type`: `EVENING_REVIVAL`, `RETENTION_WINBACK`, `WEEKEND_SURGE`, `BASKET_SIZE_UPSELL`, `SEASONAL_SPECIAL`, `CUSTOM`.
  - `target_segment`: Inactive regulars, morning commuter, weekend shoppers, etc.
  - `discount` & `discount_type`: Flat ₹ discount or % rate.
  - `status`: `DRAFT`, `SCHEDULED`, `RUNNING`, `PAUSED`, `COMPLETED`, `CANCELLED`.
  - `channel`: Execution route (e.g. WhatsApp, SMS, Soundbox audio banner).

### 3.6 `campaign_results`
- **Purpose**: Performance telemetry and before/after comparisons for closed-loop evaluation.
- **Key Columns**:
  - `revenue_before` vs `revenue_during_after`.
  - `transaction_counts_before` vs `transaction_counts_after`.
  - `incremental_metrics`: JSONB containing incremental revenue, lift %, and transactions.
  - `roi`: Computed financial return multiplier (e.g., 9.6x).
  - `ai_learnings`: Narrative post-mortem learnings derived by AI.

### 3.7 `customer_segments`
- **Purpose**: Point-in-time snapshot of RFM (Recency, Frequency, Monetary) segmentation.
- **Key Columns**:
  - `recency`: Days elapsed since last transaction.
  - `frequency`: Total visits in benchmark window.
  - `monetary_value`: Total spend in benchmark window.
  - `segment`: `LOYAL`, `RETURNING`, `AT_RISK`, `INACTIVE`, `NEW`.
  - `churn_risk_score`: 0.00 to 100.00 estimated probability of defection.

### 3.8 `ai_insights`
- **Purpose**: Algorithmic alerts generated by anomaly detection and diagnostics.
- **Key Columns**:
  - `insight_type`: `SLUMP_DETECTED`, `RETENTION_ALERT`, `PEAK_OPPORTUNITY`, `MARGIN_ANOMALY`.
  - `severity`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
  - `supporting_metrics`: JSONB evidence (e.g., -31% drop, 5:00 PM – 8:30 PM, 62% impact contribution).
  - `status`: `NEW`, `ACKNOWLEDGED`, `ACTIONED`, `DISMISSED`.

### 3.9 `recommendations`
- **Purpose**: Actionable growth proposals surfaced to the merchant for 1-click execution.
- **Key Columns**:
  - `recommendation_type`: Categorical grouping.
  - `recommended_action`: Descriptive proposal (e.g., Run ₹49 Evening Combo).
  - `estimated_impact`: Expected revenue and footfall increase.
  - `confidence`: Statistical confidence score (e.g. 94.00%).
  - `priority`: `HIGH_IMPACT`, `MEDIUM_IMPACT`, `LOW_EFFORT`.
  - `status`: `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`.

### 3.10 `simulation_results`
- **Purpose**: Persisted outcomes of What-If scenario simulations before money is spent.
- **Key Columns**:
  - `action_type`: Levers tested (`EVENING_OFFER`, `WIN_BACK`, `WEEKEND_SPECIAL`).
  - `input_parameters`: Offer discount, duration, target count, channel.
  - `baseline_metrics` vs `predicted_metrics`.
  - `estimated_incremental_impact`: Net gain and campaign cost.

### 3.11 `model_predictions`
- **Purpose**: Machine learning model inference logs.
- **Key Columns**:
  - `model_type`: `CHURN_PROPENSITY`, `SALES_FORECAST`, `TIME_SERIES_ANOMALY`, `OFFER_ELASTICITY`.
  - `prediction`: Detailed output tensor/dictionary.
  - `prediction_date`: Valuation date.
  - `model_version`: Pipeline identifier (e.g. `v2.0-rfm-churn`).
  - `confidence`: Prediction certainty percentage.

---

## 4. Row Level Security (RLS) Multi-Tenant Model

All 11 tables have **Row Level Security enabled**:
1. **Multi-Tenant Protection**:
   - Every read and write is scoped to `merchant_id = current_merchant_id()`.
   - `current_merchant_id()` dynamically inspects:
     1. The merchant linked to the Supabase authenticated user (`merchants.auth_user_id = auth.uid()`).
     2. Custom claims embedded in the Supabase JWT (`request.jwt.claims -> 'merchant_id'`).
2. **Service Role Full Access**:
   - Internal backend microservices (Spring Boot & Python FastAPI) authenticate via the Supabase `service_role` key to bypass RLS for batch jobs, cron triggers, and aggregations.
3. **No Leaks Across Businesses**:
   - A merchant from Karol Bagh cannot read or modify transactions or customer data from Connaught Place.

---

## 5. Setup and Deployment in Supabase

### In Supabase Cloud Dashboard
1. Open your Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Copy and paste the contents of `schema.sql` and click **Run**.
4. To populate benchmark data, open a new query, paste `seed.sql`, and click **Run**.

### Via Supabase CLI (Local Development)
```bash
# Apply schema
supabase db push

# Or run psql directly:
psql "postgresql://postgres:postgrespassword@localhost:5432/merchant_growth_db" -f schema.sql
psql "postgresql://postgres:postgrespassword@localhost:5432/merchant_growth_db" -f seed.sql
```

---

## 6. Important Compliance Disclosure
> **Data Rule**: This prototype does not use private Paytm merchant data. All transaction streams, Soundbox identifiers, and customer phone numbers are generated using realistic synthetic distributions matching Indian retail and QSR patterns. The system is designed to plug directly into authorized Paytm Open APIs and Soundbox webhook streams when permissions are granted.

---

## 7. NPCI UPI Macroeconomic Statistics Tables

To contextualize merchant performance against national payments velocity, two dedicated tables store official National Payments Corporation of India (NPCI) statistics.

### Strict Data Segregation Architecture
```
              VANIK
                │
       ┌────────┴─────────┐
       │                  │
  MERCHANT DATA        NPCI DATA
  Demo/Synthetic         REAL
       │                  │
       ↓                  ↓
    Supabase          Supabase
(transactions, etc.) (upi_market_statistics)
       │                  │
       ↓                  ↓
   Vanik AI          UPI Context
       │                  │
       └────────┬─────────┘
                ↓
          VANIK DASHBOARD
```

### Table Specifications

#### 1. `upi_market_statistics`
- **Purpose**: Monthly volume, daily average volume, transaction value, and daily average value.
- **Fields**:
  - `id` (UUID PK)
  - `month` (VARCHAR, e.g. "March 2022")
  - `year_month` (VARCHAR(7) UK, e.g. "2022-03")
  - `transaction_volume_million` (NUMERIC)
  - `avg_daily_transaction_volume_million` (NUMERIC, NULL if unavailable)
  - `transaction_value_crore` (NUMERIC)
  - `avg_daily_transaction_value_crore` (NUMERIC, NULL if unavailable)
  - `source` (VARCHAR, default 'NPCI')
  - `source_file` (VARCHAR)
  - `created_at` (TIMESTAMPTZ)
- **Constraint**: `UNIQUE (year_month, source)`

#### 2. `upi_ecosystem_statistics`
- **Purpose**: Ecosystem metrics such as participating banks live on UPI.
- **Fields**:
  - `id` (UUID PK)
  - `month` (VARCHAR)
  - `year_month` (VARCHAR(7) UK)
  - `banks_live_on_upi` (INT)
  - `transaction_volume_million` (NUMERIC)
  - `transaction_value_crore` (NUMERIC)
  - `source` (VARCHAR, default 'NPCI')
  - `source_file` (VARCHAR)
  - `created_at` (TIMESTAMPTZ)
- **Constraint**: `UNIQUE (year_month, source)`

