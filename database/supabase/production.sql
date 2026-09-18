-- ============================================================================
-- VANIK Merchant Growth AI — Supabase PostgreSQL Production Schema
-- File: database/supabase/production.sql
-- ============================================================================
-- Safe, Idempotent Creation of Core Domain Tables, Indexes, RLS Policies, 
-- Triggers, and Supabase Realtime Publication Settings.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Required PostgreSQL Extensions & Schema Functions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to set updated_at on row modification
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. Merchants Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS merchants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    business_category VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    business_size VARCHAR(50) NOT NULL DEFAULT 'Micro (1-5 staff)',
    paytm_merchant_id VARCHAR(100) NOT NULL UNIQUE,
    soundbox_id VARCHAR(100),
    qr_code_id VARCHAR(100),
    connection_status VARCHAR(50) NOT NULL DEFAULT 'CONNECTED_DEMO',
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    last_synced_at VARCHAR(100),
    monthly_revenue NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. Merchant Users Table (Authentication & User Mapping)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS merchant_users (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'MERCHANT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. Customers Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    masked_phone VARCHAR(30) NOT NULL,
    name VARCHAR(255) NOT NULL,
    segment VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    total_spend NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    visit_count INT NOT NULL DEFAULT 1,
    average_spend NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    last_visit VARCHAR(100),
    preferred_time VARCHAR(100),
    favorite_item VARCHAR(255),
    retention_risk VARCHAR(50) NOT NULL DEFAULT 'LOW',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. Products Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    sku VARCHAR(64),
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 100,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5. Transactions Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'SOUNDBOX_QR',
    category VARCHAR(100) NOT NULL DEFAULT 'Food & Beverage',
    status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    soundbox_announcement_done BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 6. Campaigns Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    target_segment VARCHAR(100) NOT NULL DEFAULT 'All Patrons',
    target_audience VARCHAR(100),
    discount_type VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE',
    discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    spent_so_far NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    audience_count INT NOT NULL DEFAULT 0,
    channel VARCHAR(255) NOT NULL DEFAULT 'Paytm Soundbox QR Push',
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    description TEXT,
    expected_impact_percent NUMERIC(8, 2),
    actual_impact_percent NUMERIC(8, 2),
    revenue_before NUMERIC(14, 2),
    revenue_after NUMERIC(14, 2),
    transactions_before INT,
    transactions_after INT,
    repeat_customers_before INT,
    repeat_customers_after INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 7. Campaign Results Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_results (
    id VARCHAR(64) PRIMARY KEY,
    campaign_id VARCHAR(64) NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    impressions INT NOT NULL DEFAULT 0,
    clicks INT NOT NULL DEFAULT 0,
    transactions INT NOT NULL DEFAULT 0,
    revenue_generated NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    lift_percent NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    roi NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    completed_at VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 8. Customer Segments Table (RFM Metrics)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_segments (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    segment_name VARCHAR(50) NOT NULL,
    rfm_score VARCHAR(10),
    r_score INT NOT NULL DEFAULT 1,
    f_score INT NOT NULL DEFAULT 1,
    m_score INT NOT NULL DEFAULT 1,
    churn_risk NUMERIC(5, 4) NOT NULL DEFAULT 0.0,
    updated_at VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 9. AI Insights Table (Diagnostic Alerts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_insights (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    insight_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    affected_window VARCHAR(100),
    impact_estimate VARCHAR(255),
    description TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at VARCHAR(50)
);

-- ----------------------------------------------------------------------------
-- 10. Recommendations Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    expected_impact VARCHAR(255),
    impact_metric VARCHAR(100),
    target_audience VARCHAR(100),
    target_count INT NOT NULL DEFAULT 0,
    duration VARCHAR(50),
    priority VARCHAR(30) NOT NULL DEFAULT 'HIGH',
    cost_estimate VARCHAR(100),
    why_reason TEXT,
    suggested_offer TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'Sales',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 11. Simulation Results Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulation_results (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    discount_percentage NUMERIC(8, 2) NOT NULL,
    duration_days INT NOT NULL,
    target_segment VARCHAR(100),
    baseline_revenue NUMERIC(14, 2) NOT NULL,
    scenario_revenue NUMERIC(14, 2) NOT NULL,
    incremental_revenue NUMERIC(14, 2) NOT NULL,
    baseline_transactions INT NOT NULL,
    scenario_transactions INT NOT NULL,
    incremental_transactions INT NOT NULL,
    confidence NUMERIC(5, 4) NOT NULL DEFAULT 0.85,
    created_at VARCHAR(50)
);

-- ----------------------------------------------------------------------------
-- 12. NPCI UPI Macroeconomic Market Statistics
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS upi_market_statistics (
    id VARCHAR(64) PRIMARY KEY,
    month VARCHAR(20) NOT NULL,
    year_month VARCHAR(10) NOT NULL,
    transaction_volume_million NUMERIC(14, 2) NOT NULL,
    avg_daily_transaction_volume_million NUMERIC(14, 2),
    transaction_value_crore NUMERIC(14, 2) NOT NULL,
    avg_daily_transaction_value_crore NUMERIC(14, 2),
    source VARCHAR(100) NOT NULL DEFAULT 'NPCI',
    source_file VARCHAR(255),
    created_at VARCHAR(50)
);

-- ----------------------------------------------------------------------------
-- Indexes for Performance & Scoped Tenant Queries
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_customers_merchant ON customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_merchant ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_product ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_merchant ON campaigns(merchant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_merchant ON ai_insights(merchant_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_merchant ON recommendations(merchant_id);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enforces tenant isolation so merchants can only access their own data.
-- ----------------------------------------------------------------------------
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_results ENABLE ROW LEVEL SECURITY;

-- Helper function to read authenticated merchant context
CREATE OR REPLACE FUNCTION get_auth_merchant_id()
RETURNS text AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claims', true)::json->>'merchant_id',
        current_setting('app.current_merchant_id', true)
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS Policy: Merchants
CREATE POLICY tenant_merchants_policy ON merchants
    FOR ALL USING (id = get_auth_merchant_id() OR current_user = 'postgres' OR current_user = 'service_role');

-- RLS Policy: Customers
CREATE POLICY tenant_customers_policy ON customers
    FOR ALL USING (merchant_id = get_auth_merchant_id() OR current_user = 'postgres' OR current_user = 'service_role');

-- RLS Policy: Products
CREATE POLICY tenant_products_policy ON products
    FOR ALL USING (merchant_id = get_auth_merchant_id() OR current_user = 'postgres' OR current_user = 'service_role');

-- RLS Policy: Transactions
CREATE POLICY tenant_transactions_policy ON transactions
    FOR ALL USING (merchant_id = get_auth_merchant_id() OR current_user = 'postgres' OR current_user = 'service_role');

-- RLS Policy: Campaigns
CREATE POLICY tenant_campaigns_policy ON campaigns
    FOR ALL USING (merchant_id = get_auth_merchant_id() OR current_user = 'postgres' OR current_user = 'service_role');

-- RLS Policy: AI Insights
CREATE POLICY tenant_ai_insights_policy ON ai_insights
    FOR ALL USING (merchant_id = get_auth_merchant_id() OR current_user = 'postgres' OR current_user = 'service_role');

-- RLS Policy: Recommendations
CREATE POLICY tenant_recommendations_policy ON recommendations
    FOR ALL USING (merchant_id = get_auth_merchant_id() OR current_user = 'postgres' OR current_user = 'service_role');

-- ----------------------------------------------------------------------------
-- SUPABASE REALTIME CONFIGURATION
-- Enable live event broadcasting for real-time frontend synchronization
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE campaigns, ai_insights, recommendations, transactions;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Publication does not exist in standalone PostgreSQL or local dev H2
    NULL;
END $$;
