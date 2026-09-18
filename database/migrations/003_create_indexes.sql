-- ============================================================================
-- Migration 003: Indexes for Query Performance & Analytics
-- Merchant Growth AI - Supabase PostgreSQL Schema
-- ============================================================================

-- 1. Merchants Indexes
CREATE INDEX IF NOT EXISTS idx_merchants_paytm_id ON merchants(paytm_merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchants_auth_user_id ON merchants(auth_user_id);

-- 2. Customers Indexes
CREATE INDEX IF NOT EXISTS idx_customers_merchant_id ON customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(merchant_id, customer_status);
CREATE INDEX IF NOT EXISTS idx_customers_attributes ON customers USING GIN (attributes);

-- 3. Products Indexes
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(merchant_id, category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(merchant_id, active_status);

-- 4. Transactions Indexes (High Volume Core Telemetry)
-- Core requirement: merchant_id, customer_id, transaction_timestamp
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(transaction_timestamp);

-- High-performance composite indexes for dashboard aggregation & time-slice windowing
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_time ON transactions(merchant_id, transaction_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_status_time ON transactions(merchant_id, transaction_status, transaction_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_hourly_telemetry ON transactions(merchant_id, payment_method, transaction_timestamp);

-- 5. Campaigns Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_merchant_id ON campaigns(merchant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);

-- 6. Campaign Results Indexes
-- Core requirement: campaign_id
CREATE INDEX IF NOT EXISTS idx_campaign_results_campaign_id ON campaign_results(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_results_merchant_id ON campaign_results(merchant_id);

-- 7. Customer Segments Indexes
-- Core requirement: customer_id, segment
CREATE INDEX IF NOT EXISTS idx_customer_segments_customer_id ON customer_segments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_merchant_id ON customer_segments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_segment ON customer_segments(merchant_id, segment);
CREATE INDEX IF NOT EXISTS idx_customer_segments_calculated ON customer_segments(calculated_at DESC);

-- 8. AI Insights Indexes
-- Core requirement: insight status
CREATE INDEX IF NOT EXISTS idx_ai_insights_merchant_id ON ai_insights(merchant_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_status ON ai_insights(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_severity ON ai_insights(merchant_id, severity);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_metrics ON ai_insights USING GIN (supporting_metrics);

-- 9. Recommendations Indexes
CREATE INDEX IF NOT EXISTS idx_recommendations_merchant_id ON recommendations(merchant_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON recommendations(merchant_id, priority);

-- 10. Simulation Results Indexes
CREATE INDEX IF NOT EXISTS idx_simulation_results_merchant_id ON simulation_results(merchant_id);
CREATE INDEX IF NOT EXISTS idx_simulation_results_action ON simulation_results(merchant_id, action_type);
CREATE INDEX IF NOT EXISTS idx_simulation_results_created ON simulation_results(created_at DESC);

-- 11. Model Predictions Indexes
CREATE INDEX IF NOT EXISTS idx_model_predictions_merchant_id ON model_predictions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_model_predictions_type_date ON model_predictions(merchant_id, model_type, prediction_date DESC);
