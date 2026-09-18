-- ============================================================================
-- Migration 002: Create Core Tables (11 Tables)
-- Merchant Growth AI - Supabase PostgreSQL Schema
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Merchants Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID, -- Optional linkage to auth.users in Supabase
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    business_category VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    business_size VARCHAR(50) NOT NULL DEFAULT 'MICRO',
    paytm_merchant_id VARCHAR(100) NOT NULL UNIQUE,
    soundbox_id VARCHAR(100),
    qr_code_id VARCHAR(100),
    connection_status VARCHAR(50) NOT NULL DEFAULT 'CONNECTED_DEMO',
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    last_synced_at TIMESTAMPTZ,
    monthly_revenue NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_business_size CHECK (business_size IN ('MICRO', 'SMALL', 'MEDIUM', 'ENTERPRISE')),
    CONSTRAINT chk_connection_status CHECK (connection_status IN ('CONNECTED_DEMO', 'CONNECTED_LIVE', 'DISCONNECTED')),
    CONSTRAINT chk_monthly_revenue CHECK (monthly_revenue >= 0)
);

-- ----------------------------------------------------------------------------
-- 2. Customers Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    masked_phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    acquisition_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    preferred_shopping_time VARCHAR(100),
    favorite_category VARCHAR(100),
    city VARCHAR(100),
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_merchant_customer_code UNIQUE (merchant_id, customer_code),
    CONSTRAINT chk_customer_status CHECK (customer_status IN ('ACTIVE', 'INACTIVE', 'CHURNED', 'DORMANT', 'BLOCKED'))
);

-- ----------------------------------------------------------------------------
-- 3. Products Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    sku VARCHAR(64),
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    active_status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_merchant_sku UNIQUE (merchant_id, sku),
    CONSTRAINT chk_product_price CHECK (price >= 0),
    CONSTRAINT chk_product_cost CHECK (cost >= 0)
);

-- ----------------------------------------------------------------------------
-- 4. Transactions Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    transaction_code VARCHAR(64) UNIQUE,
    transaction_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    channel VARCHAR(50) NOT NULL DEFAULT 'SOUNDBOX',
    soundbox_announcement_done BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_quantity CHECK (quantity > 0),
    CONSTRAINT chk_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_total_amount CHECK (total_amount >= 0),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('SOUNDBOX_QR', 'SOUNDBOX_CARD', 'UPI', 'PAYTM_WALLET', 'CASH', 'NET_BANKING')),
    CONSTRAINT chk_transaction_status CHECK (transaction_status IN ('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED')),
    CONSTRAINT chk_channel CHECK (channel IN ('SOUNDBOX', 'QR_STAND', 'OFFLINE_STORE', 'ONLINE_PAYTM_MINI_APP', 'POS_TERMINAL'))
);

-- ----------------------------------------------------------------------------
-- 5. Campaigns Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    campaign_type VARCHAR(100) NOT NULL,
    campaign_name VARCHAR(255) NOT NULL,
    target_segment VARCHAR(100) NOT NULL,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'FLAT',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    spent_so_far NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    channel VARCHAR(255) NOT NULL DEFAULT 'WhatsApp + SMS + Paytm Soundbox Banner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_campaign_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_campaign_budget CHECK (budget >= 0),
    CONSTRAINT chk_campaign_spent CHECK (spent_so_far >= 0),
    CONSTRAINT chk_campaign_discount CHECK (discount >= 0),
    CONSTRAINT chk_discount_type CHECK (discount_type IN ('FLAT', 'PERCENTAGE')),
    CONSTRAINT chk_campaign_status CHECK (status IN ('DRAFT', 'SCHEDULED', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_campaign_type CHECK (campaign_type IN ('EVENING_REVIVAL', 'RETENTION_WINBACK', 'WEEKEND_SURGE', 'BASKET_SIZE_UPSELL', 'SEASONAL_SPECIAL', 'CUSTOM'))
);

-- ----------------------------------------------------------------------------
-- 6. Campaign Results Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    revenue_before NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    revenue_during_after NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    transaction_counts_before INT NOT NULL DEFAULT 0,
    transaction_counts_after INT NOT NULL DEFAULT 0,
    customer_counts_before INT NOT NULL DEFAULT 0,
    customer_counts_after INT NOT NULL DEFAULT 0,
    incremental_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    roi NUMERIC(10, 2),
    ai_learnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_campaign_results UNIQUE (campaign_id),
    CONSTRAINT chk_revenue_before CHECK (revenue_before >= 0),
    CONSTRAINT chk_revenue_after CHECK (revenue_during_after >= 0),
    CONSTRAINT chk_tx_before CHECK (transaction_counts_before >= 0),
    CONSTRAINT chk_tx_after CHECK (transaction_counts_after >= 0),
    CONSTRAINT chk_cust_before CHECK (customer_counts_before >= 0),
    CONSTRAINT chk_cust_after CHECK (customer_counts_after >= 0)
);

-- ----------------------------------------------------------------------------
-- 7. Customer Segments Table (RFM Snapshot)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    recency INT NOT NULL,
    frequency INT NOT NULL,
    monetary_value NUMERIC(12, 2) NOT NULL,
    segment VARCHAR(50) NOT NULL,
    churn_risk_score NUMERIC(5, 2),
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_recency CHECK (recency >= 0),
    CONSTRAINT chk_frequency CHECK (frequency >= 0),
    CONSTRAINT chk_monetary CHECK (monetary_value >= 0),
    CONSTRAINT chk_segment_name CHECK (segment IN ('LOYAL', 'RETURNING', 'AT_RISK', 'INACTIVE', 'NEW')),
    CONSTRAINT chk_churn_risk CHECK (churn_risk_score IS NULL OR (churn_risk_score >= 0 AND churn_risk_score <= 100))
);

-- ----------------------------------------------------------------------------
-- 8. AI Insights Table (Diagnostic & Anomaly Alerts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    title VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    supporting_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommendation TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_insight_type CHECK (insight_type IN ('SLUMP_DETECTED', 'RETENTION_ALERT', 'PEAK_OPPORTUNITY', 'MARGIN_ANOMALY', 'BASKET_OPPORTUNITY')),
    CONSTRAINT chk_insight_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_insight_status CHECK (status IN ('NEW', 'ACKNOWLEDGED', 'ACTIONED', 'DISMISSED'))
);

-- ----------------------------------------------------------------------------
-- 9. Recommendations Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    target_segment VARCHAR(100) NOT NULL,
    recommended_action TEXT NOT NULL,
    estimated_impact TEXT NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL,
    priority VARCHAR(30) NOT NULL DEFAULT 'HIGH_IMPACT',
    cost_estimate NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    suggested_offer TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_rec_confidence CHECK (confidence >= 0 AND confidence <= 100),
    CONSTRAINT chk_rec_cost CHECK (cost_estimate >= 0),
    CONSTRAINT chk_rec_priority CHECK (priority IN ('HIGH_IMPACT', 'MEDIUM_IMPACT', 'LOW_EFFORT')),
    CONSTRAINT chk_rec_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
    CONSTRAINT chk_rec_type CHECK (recommendation_type IN ('EVENING_REVIVAL', 'RETENTION_WINBACK', 'WEEKEND_SURGE', 'BASKET_SIZE_UPSELL', 'SEASONAL_PROMO'))
);

-- ----------------------------------------------------------------------------
-- 10. Simulation Results Table (What-If Records)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    input_parameters JSONB NOT NULL,
    baseline_metrics JSONB NOT NULL,
    predicted_metrics JSONB NOT NULL,
    estimated_incremental_impact JSONB NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_sim_confidence CHECK (confidence >= 0 AND confidence <= 100),
    CONSTRAINT chk_sim_action_type CHECK (action_type IN ('EVENING_OFFER', 'WIN_BACK', 'WEEKEND_SPECIAL', 'AOV_BOOST', 'CUSTOM'))
);

-- ----------------------------------------------------------------------------
-- 11. Model Predictions Table (Forecasting & Propensity Scores)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    model_type VARCHAR(50) NOT NULL,
    prediction JSONB NOT NULL,
    prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    model_version VARCHAR(50) NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_pred_confidence CHECK (confidence >= 0 AND confidence <= 100),
    CONSTRAINT chk_model_type CHECK (model_type IN ('CHURN_PROPENSITY', 'SALES_FORECAST', 'TIME_SERIES_ANOMALY', 'OFFER_ELASTICITY', 'RFM_CLUSTER'))
);
