-- ============================================================================
-- Merchant Growth AI - Complete Supabase PostgreSQL Schema
-- ============================================================================
-- Notice: This prototype uses realistic synthetic Indian merchant telemetry.
-- Designed for future direct integration with authorized Paytm Open APIs & Soundboxes.
-- Includes:
--   1. Extensions & Functions
--   2. All 11 Required Tables with Constraints & Foreign Keys
--   3. Query & Analytics Performance Indexes
--   4. Row Level Security (RLS) Multi-Tenant Policies
--   5. Auto-Updating Timestamp Triggers
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Extensions & Functions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION current_merchant_id() 
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        UNION
        SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'merchant_id', '')::uuid
        LIMIT 1
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. Core Tables (11 Tables)
-- ----------------------------------------------------------------------------

-- 1. merchants
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID,
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

-- 2. customers
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

-- 3. products
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

-- 4. transactions
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

-- 5. campaigns
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

-- 6. campaign_results
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

-- 7. customer_segments
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

-- 8. ai_insights
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

-- 9. recommendations
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

-- 10. simulation_results
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

-- 11. model_predictions
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

-- ----------------------------------------------------------------------------
-- 3. Query & Analytics Performance Indexes
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_merchants_paytm_id ON merchants(paytm_merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchants_auth_user_id ON merchants(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_customers_merchant_id ON customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(merchant_id, customer_status);
CREATE INDEX IF NOT EXISTS idx_customers_attributes ON customers USING GIN (attributes);

CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(merchant_id, category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(merchant_id, active_status);

CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(transaction_timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_time ON transactions(merchant_id, transaction_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_status_time ON transactions(merchant_id, transaction_status, transaction_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_hourly_telemetry ON transactions(merchant_id, payment_method, transaction_timestamp);

CREATE INDEX IF NOT EXISTS idx_campaigns_merchant_id ON campaigns(merchant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_campaign_results_campaign_id ON campaign_results(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_results_merchant_id ON campaign_results(merchant_id);

CREATE INDEX IF NOT EXISTS idx_customer_segments_customer_id ON customer_segments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_merchant_id ON customer_segments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_segment ON customer_segments(merchant_id, segment);
CREATE INDEX IF NOT EXISTS idx_customer_segments_calculated ON customer_segments(calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_insights_merchant_id ON ai_insights(merchant_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_status ON ai_insights(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_severity ON ai_insights(merchant_id, severity);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_metrics ON ai_insights USING GIN (supporting_metrics);

CREATE INDEX IF NOT EXISTS idx_recommendations_merchant_id ON recommendations(merchant_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON recommendations(merchant_id, priority);

CREATE INDEX IF NOT EXISTS idx_simulation_results_merchant_id ON simulation_results(merchant_id);
CREATE INDEX IF NOT EXISTS idx_simulation_results_action ON simulation_results(merchant_id, action_type);
CREATE INDEX IF NOT EXISTS idx_simulation_results_created ON simulation_results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_model_predictions_merchant_id ON model_predictions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_model_predictions_type_date ON model_predictions(merchant_id, model_type, prediction_date DESC);

-- ----------------------------------------------------------------------------
-- 4. Row Level Security (RLS) Multi-Tenant Policies
-- ----------------------------------------------------------------------------
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_predictions ENABLE ROW LEVEL SECURITY;

-- Service role bypass policies for all 11 tables
DO $$
DECLARE
    tbl text;
    tbls text[] := ARRAY[
        'merchants', 'customers', 'products', 'transactions', 'campaigns',
        'campaign_results', 'customer_segments', 'ai_insights', 'recommendations',
        'simulation_results', 'model_predictions'
    ];
BEGIN
    FOREACH tbl IN ARRAY tbls LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS "Service role bypass on %1$I" ON %1$I;
            CREATE POLICY "Service role bypass on %1$I"
            ON %1$I FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
        ', tbl);
    END LOOP;
END $$;

-- Merchants self-management policy
DROP POLICY IF EXISTS "Merchants can view their own profile" ON merchants;
CREATE POLICY "Merchants can view their own profile"
ON merchants FOR SELECT
TO authenticated
USING (id = current_merchant_id() OR auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Merchants can update their own profile" ON merchants;
CREATE POLICY "Merchants can update their own profile"
ON merchants FOR UPDATE
TO authenticated
USING (id = current_merchant_id() OR auth_user_id = auth.uid())
WITH CHECK (id = current_merchant_id() OR auth_user_id = auth.uid());

-- Tenant isolation policies across all tenant child tables
DO $$
DECLARE
    tbl text;
    tenant_tables text[] := ARRAY[
        'customers', 'products', 'transactions', 'campaigns', 'campaign_results',
        'customer_segments', 'ai_insights', 'recommendations', 'simulation_results',
        'model_predictions'
    ];
BEGIN
    FOREACH tbl IN ARRAY tenant_tables LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS "Merchants can select own %1$I" ON %1$I;
            CREATE POLICY "Merchants can select own %1$I"
            ON %1$I FOR SELECT
            TO authenticated
            USING (merchant_id = current_merchant_id());

            DROP POLICY IF EXISTS "Merchants can insert own %1$I" ON %1$I;
            CREATE POLICY "Merchants can insert own %1$I"
            ON %1$I FOR INSERT
            TO authenticated
            WITH CHECK (merchant_id = current_merchant_id());

            DROP POLICY IF EXISTS "Merchants can update own %1$I" ON %1$I;
            CREATE POLICY "Merchants can update own %1$I"
            ON %1$I FOR UPDATE
            TO authenticated
            USING (merchant_id = current_merchant_id())
            WITH CHECK (merchant_id = current_merchant_id());

            DROP POLICY IF EXISTS "Merchants can delete own %1$I" ON %1$I;
            CREATE POLICY "Merchants can delete own %1$I"
            ON %1$I FOR DELETE
            TO authenticated
            USING (merchant_id = current_merchant_id());
        ', tbl);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 5. Auto-Updating Timestamp Triggers
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    tbl text;
    updated_at_tables text[] := ARRAY[
        'merchants', 'customers', 'products', 'campaigns',
        'campaign_results', 'ai_insights', 'recommendations'
    ];
BEGIN
    FOREACH tbl IN ARRAY updated_at_tables LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_set_updated_at_%1$I ON %1$I;
            CREATE TRIGGER trg_set_updated_at_%1$I
            BEFORE UPDATE ON %1$I
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at_column();
        ', tbl);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 6. NPCI UPI Macroeconomic Statistics Tables (Separate from Merchant Telemetry)
-- ----------------------------------------------------------------------------
-- Real aggregated NPCI UPI monthly statistics for macroeconomic India context.
-- Kept strictly isolated from merchant/customer transactional datasets.

CREATE TABLE IF NOT EXISTS upi_market_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month VARCHAR(50) NOT NULL,
    year_month VARCHAR(7) NOT NULL,
    transaction_volume_million NUMERIC(14, 2) NOT NULL,
    avg_daily_transaction_volume_million NUMERIC(14, 4),
    transaction_value_crore NUMERIC(16, 2) NOT NULL,
    avg_daily_transaction_value_crore NUMERIC(16, 4),
    source VARCHAR(50) NOT NULL DEFAULT 'NPCI',
    source_file VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_upi_market_year_month_source UNIQUE (year_month, source)
);

CREATE INDEX IF NOT EXISTS idx_upi_market_year_month ON upi_market_statistics(year_month ASC);

CREATE TABLE IF NOT EXISTS upi_ecosystem_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month VARCHAR(50) NOT NULL,
    year_month VARCHAR(7) NOT NULL,
    banks_live_on_upi INT NOT NULL,
    transaction_volume_million NUMERIC(14, 2) NOT NULL,
    transaction_value_crore NUMERIC(16, 2) NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'NPCI',
    source_file VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_upi_ecosystem_year_month_source UNIQUE (year_month, source)
);

CREATE INDEX IF NOT EXISTS idx_upi_ecosystem_year_month ON upi_ecosystem_statistics(year_month ASC);

ALTER TABLE upi_market_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE upi_ecosystem_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to upi_market_statistics"
    ON upi_market_statistics FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to upi_ecosystem_statistics"
    ON upi_ecosystem_statistics FOR SELECT
    USING (true);

-- ----------------------------------------------------------------------------
-- 12. daily_reports (VANIK Daily Business Voice Brief)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_reports (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL,
    report_date VARCHAR(32) NOT NULL,
    revenue NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    transactions INT NOT NULL DEFAULT 0,
    average_order_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    profit NUMERIC(14, 2),
    profit_margin NUMERIC(8, 2),
    profit_label VARCHAR(64) NOT NULL DEFAULT 'Estimated Gross Profit',
    has_reliable_cost BOOLEAN NOT NULL DEFAULT FALSE,
    vs_yesterday NUMERIC(8, 2),
    vs_7_day_average NUMERIC(8, 2),
    top_product VARCHAR(255),
    peak_hours VARCHAR(255),
    insights_json TEXT,
    recommendations_json TEXT,
    voice_script TEXT NOT NULL,
    voice_script_hinglish TEXT,
    voice_script_hindi TEXT,
    voice_script_english TEXT,
    audio_url VARCHAR(255),
    language VARCHAR(32) NOT NULL DEFAULT 'hinglish',
    status VARCHAR(32) NOT NULL DEFAULT 'READY',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_daily_reports_merchant_date UNIQUE (merchant_id, report_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_reports_merchant_date ON daily_reports(merchant_id, report_date DESC);

-- 13. merchant_report_settings
CREATE TABLE IF NOT EXISTS merchant_report_settings (
    merchant_id VARCHAR(64) PRIMARY KEY,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    report_time VARCHAR(16) NOT NULL DEFAULT '22:30',
    language VARCHAR(32) NOT NULL DEFAULT 'hinglish',
    report_length VARCHAR(32) NOT NULL DEFAULT 'standard',
    include_sales BOOLEAN NOT NULL DEFAULT TRUE,
    include_profit BOOLEAN NOT NULL DEFAULT TRUE,
    include_products BOOLEAN NOT NULL DEFAULT TRUE,
    include_insights BOOLEAN NOT NULL DEFAULT TRUE,
    include_recommendations BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

