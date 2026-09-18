-- ============================================================================
-- Seed Dataset: Merchant Growth AI (Supabase PostgreSQL)
-- ============================================================================
-- Populates all 11 tables with realistic synthetic Indian merchant telemetry
-- Centered on Sharma Tea Corner (Connaught Place, New Delhi)
-- Benchmark Metrics:
--   Monthly Gross Revenue: ₹2,84,500
--   Total Transactions: 1,248
--   Average Ticket Size: ₹228
--   Repeat Customers: 312
--   Evening Slump Window: 5:00 PM – 8:30 PM (-31% volume drop)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Merchants
-- ----------------------------------------------------------------------------
INSERT INTO merchants (
    id, name, owner_name, business_category, location, business_size,
    paytm_merchant_id, soundbox_id, qr_code_id, connection_status,
    currency, last_synced_at, monthly_revenue
) VALUES 
(
    'a0000000-0000-0000-0000-000000000001',
    'Sharma Tea Corner',
    'Ramesh Sharma',
    'QSR / Cafe & Snacks',
    'Connaught Place, New Delhi',
    'MICRO',
    'PAYTM-MERCH-98214-DL',
    'SB-4G-99218',
    'QR-CP-8841',
    'CONNECTED_DEMO',
    'INR',
    CURRENT_TIMESTAMP,
    284500.00
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Verma Sweets & Bakery',
    'Ashok Verma',
    'Bakery & Confectionery',
    'Karol Bagh, New Delhi',
    'SMALL',
    'PAYTM-MERCH-77412-DL',
    'SB-4G-44102',
    'QR-KB-3329',
    'CONNECTED_DEMO',
    'INR',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes',
    492000.00
),
(
    'a0000000-0000-0000-0000-000000000003',
    'QuickBite Fast Food',
    'Pooja Nair',
    'Casual Dining',
    'Sector 62, Noida',
    'SMALL',
    'PAYTM-MERCH-66129-UP',
    'SB-4G-10934',
    'QR-NOIDA-5541',
    'CONNECTED_DEMO',
    'INR',
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    340000.00
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Products (Indian QSR items with prices and costs for margin calculations)
-- ----------------------------------------------------------------------------
INSERT INTO products (id, merchant_id, sku, product_name, category, price, cost, active_status) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'SKU-TEA-01', 'Special Masala Chai', 'Hot Beverages', 40.00, 18.00, true),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'SKU-TEA-02', 'Ginger Lemon Tea', 'Hot Beverages', 45.00, 19.00, true),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'SKU-TEA-03', 'Kullad Chai', 'Hot Beverages', 50.00, 22.00, true),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'SKU-SNK-01', 'Fresh Bun Maska', 'Bakery & Breads', 35.00, 14.00, true),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'SKU-SNK-02', 'Crispy Samosa (2 pcs)', 'Snacks', 30.00, 12.00, true),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'SKU-SNK-03', 'Paneer Pakora Platter', 'Snacks', 90.00, 42.00, true),
('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'SKU-CMB-01', 'Evening Special Combo (Chai + Bun Maska)', 'Combos', 65.00, 30.00, true),
('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'SKU-CMB-02', 'Weekend Family Chai Pot (Serves 4)', 'Combos', 160.00, 70.00, true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Customers (Cohort representatives with masked phone numbers)
-- ----------------------------------------------------------------------------
INSERT INTO customers (
    id, merchant_id, customer_code, name, masked_phone, email,
    acquisition_date, customer_status, preferred_shopping_time, favorite_category, city, attributes
) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'CUST-DL-01',
    'Rohit K. (IT Park Desk)',
    '+91 98110 •••••',
    'rohit.k@corp.example.in',
    '2026-03-15',
    'DORMANT',
    '6:15 PM (Evening)',
    'Hot Beverages',
    'New Delhi',
    '{"office_corridor": "Barakhamba Road", "past_visit_frequency_weekly": 3.5, "days_since_last_seen": 22}'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'CUST-DL-02',
    'Ananya S. (Fintech Associate)',
    '+91 98712 •••••',
    'ananya.s@fin.example.in',
    '2026-02-10',
    'DORMANT',
    '5:45 PM (Evening)',
    'Snacks',
    'New Delhi',
    '{"office_corridor": "KG Marg", "past_visit_frequency_weekly": 4.0, "days_since_last_seen": 25}'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'CUST-DL-03',
    'Vikram M. (Legal Consultant)',
    '+91 99104 •••••',
    'vikram.legal@law.example.in',
    '2026-01-20',
    'ACTIVE',
    '1:30 PM (Lunch)',
    'Hot Beverages',
    'New Delhi',
    '{"office_corridor": "Janpath", "days_since_last_seen": 11, "visit_interval_drift": "+8 days"}'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'CUST-DL-04',
    'Deepak T. (Retail Store Mgr)',
    '+91 98290 •••••',
    'deepak.t@store.example.in',
    '2025-11-05',
    'ACTIVE',
    '9:15 AM (Morning)',
    'Breakfast',
    'New Delhi',
    '{"office_corridor": "Inner Circle CP", "days_since_last_seen": 1, "is_vip": true}'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'CUST-DL-05',
    'Pooja R. (Banking Officer)',
    '+91 97188 •••••',
    'pooja.r@bank.example.in',
    '2026-04-02',
    'ACTIVE',
    '4:30 PM (Evening)',
    'Hot Beverages',
    'New Delhi',
    '{"office_corridor": "Parliament Street", "days_since_last_seen": 3}'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    'CUST-DL-06',
    'Arjun V. (Freelance Designer)',
    '+91 96541 •••••',
    'arjun.v@design.example.in',
    '2026-09-12',
    'ACTIVE',
    '7:00 PM (Evening)',
    'Snacks',
    'New Delhi',
    '{"office_corridor": "Remote / Coworking", "days_since_last_seen": 2, "visit_count_total": 2}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Customer Segments (RFM Clustering Baseline)
-- ----------------------------------------------------------------------------
INSERT INTO customer_segments (
    id, customer_id, merchant_id, recency, frequency, monetary_value,
    segment, churn_risk_score, calculated_at
) VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    22, 18, 2450.00,
    'INACTIVE', 78.50, CURRENT_TIMESTAMP
),
(
    'd0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    25, 24, 3120.00,
    'INACTIVE', 82.00, CURRENT_TIMESTAMP
),
(
    'd0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    11, 31, 4800.00,
    'AT_RISK', 48.00, CURRENT_TIMESTAMP
),
(
    'd0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    1, 52, 8400.00,
    'LOYAL', 2.50, CURRENT_TIMESTAMP
),
(
    'd0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    3, 12, 1950.00,
    'RETURNING', 8.20, CURRENT_TIMESTAMP
),
(
    'd0000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    2, 2, 420.00,
    'NEW', 15.00, CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. Transactions (Sample showing morning surge and evening slump)
-- ----------------------------------------------------------------------------
INSERT INTO transactions (
    id, merchant_id, customer_id, product_id, transaction_code,
    transaction_timestamp, quantity, unit_price, total_amount,
    payment_method, transaction_status, channel, soundbox_announcement_done
) VALUES
-- Morning rush (9:15 AM)
(
    'e0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001',
    'TXN-20260917-091501',
    CURRENT_TIMESTAMP - INTERVAL '8 hours',
    2, 40.00, 80.00,
    'SOUNDBOX_QR', 'SUCCESS', 'SOUNDBOX', true
),
-- Lunch rush (1:30 PM)
(
    'e0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000006',
    'TXN-20260917-133015',
    CURRENT_TIMESTAMP - INTERVAL '4 hours',
    1, 90.00, 90.00,
    'SOUNDBOX_CARD', 'SUCCESS', 'POS_TERMINAL', true
),
-- Evening slump period (6:30 PM)
(
    'e0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000007',
    'TXN-20260917-183042',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    1, 65.00, 65.00,
    'SOUNDBOX_QR', 'SUCCESS', 'SOUNDBOX', true
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. Campaigns
-- ----------------------------------------------------------------------------
INSERT INTO campaigns (
    id, merchant_id, campaign_type, campaign_name, target_segment,
    discount, discount_type, start_date, end_date, budget, spent_so_far, status, channel
) VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'EVENING_REVIVAL',
    'Evening Combo Campaign (₹49 Special)',
    'Inactive Regulars (312 customers) + Evening commuters',
    16.00, 'FLAT',
    CURRENT_TIMESTAMP - INTERVAL '6 days',
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    4200.00, 3600.00, 'RUNNING',
    'WhatsApp + SMS + Paytm Soundbox Banner'
),
(
    'f0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'SEASONAL_SPECIAL',
    'Monsoon Special Ginger Tea Push',
    'All Paytm QR Payers in August',
    10.00, 'PERCENTAGE',
    CURRENT_TIMESTAMP - INTERVAL '35 days',
    CURRENT_TIMESTAMP - INTERVAL '25 days',
    2500.00, 2500.00, 'COMPLETED',
    'Paytm App Geo-Fence Push'
),
(
    'f0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'WEEKEND_SURGE',
    'Weekend Platter Pilot',
    'Weekend leisure visitors & shopping crowds in CP',
    20.00, 'PERCENTAGE',
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    CURRENT_TIMESTAMP + INTERVAL '10 days',
    3000.00, 0.00, 'SCHEDULED',
    'SMS + QR Standee at Counter'
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. Campaign Results
-- ----------------------------------------------------------------------------
INSERT INTO campaign_results (
    id, campaign_id, merchant_id, revenue_before, revenue_during_after,
    transaction_counts_before, transaction_counts_after,
    customer_counts_before, customer_counts_after,
    incremental_metrics, roi, ai_learnings
) VALUES
(
    '01000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    284500.00, 321800.00,
    142, 192,
    312, 368,
    '{"expected_impact_percent": 25.0, "actual_impact_percent": 27.2, "incremental_revenue": 37300.0, "incremental_transactions": 50}'::jsonb,
    9.60,
    '[
        "The campaign performed better than expected (+27.2% actual vs +25.0% expected).",
        "Customers responded strongest between 5:00 PM – 7:00 PM, generating secondary demand for snacks.",
        "Soundbox voice announcement confirmation increased customer redemption confidence by 42%.",
        "Recommendation for next campaign: Test the same offer on weekends with a group bundle size."
    ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. AI Insights
-- ----------------------------------------------------------------------------
INSERT INTO ai_insights (
    id, merchant_id, insight_type, severity, title, explanation,
    supporting_metrics, recommendation, status
) VALUES
(
    '02000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'SLUMP_DETECTED',
    'HIGH',
    'Evening Transactions Slump (-31%)',
    'Settled transaction density between 5:00 PM and 8:30 PM dropped from 507 last month to 215 this month, accounting for 62% of observed top-line variance.',
    '{"drop_percent": 31.0, "impact_contribution": 62.0, "confidence": 94.0, "time_window": "5:00 PM - 8:30 PM", "revenue_lost": 37200}'::jsonb,
    'Launch targeted ₹49 Evening Combo campaign to re-engage office commuters during 5:00 PM – 8:30 PM.',
    'ACTIONED'
),
(
    '02000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'RETENTION_ALERT',
    'HIGH',
    'Repeat Customer Retention Drop (-14%)',
    '312 registered regular phone numbers recorded zero transactions in the last 21 days. Repeat customer contribution to revenue slipped from 48% to 34%.',
    '{"repeat_drop_percent": 14.1, "inactive_regular_count": 312, "impact_contribution": 26.0, "confidence": 91.0}'::jsonb,
    'Send automated WhatsApp/SMS voucher offering 20% discount on next purchase.',
    'NEW'
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. Recommendations
-- ----------------------------------------------------------------------------
INSERT INTO recommendations (
    id, merchant_id, recommendation_type, target_segment, recommended_action,
    estimated_impact, confidence, priority, cost_estimate, suggested_offer, status
) VALUES
(
    '03000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'EVENING_REVIVAL',
    'Inactive Regulars (312 customers) + Evening commuters',
    'Run a ₹49 Evening Combo (Special Masala Chai + Hot Samosa/Bun Maska) during 5:00 PM – 8:30 PM',
    '+20–30% evening transactions (+₹40,500 Est. Revenue)',
    94.00,
    'HIGH_IMPACT',
    4200.00,
    '₹49 Evening Special (Regular value ₹65)',
    'APPROVED'
),
(
    '03000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'RETENTION_WINBACK',
    'Customers with zero visits in the last 21 days',
    'Deploy personalized "We miss you" WhatsApp & SMS message with an instant 20% discount coupon',
    '+12–18% repeat visit recovery (+₹33,500 Est. Revenue)',
    91.00,
    'HIGH_IMPACT',
    3600.00,
    'Flat 20% off on your next visit (Max ₹50)',
    'PENDING'
),
(
    '03000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'WEEKEND_SURGE',
    'Weekend leisure visitors & shopping crowds in CP',
    'Launch Family/Group Tea Pot & Mixed Pakora platter on Saturdays & Sundays',
    '+8–12% weekend ticket size (+₹20,500 Est. Revenue)',
    88.00,
    'MEDIUM_IMPACT',
    2800.00,
    'Kullad Chai Pot (Serves 4) + Mixed Platter for ₹149',
    'PENDING'
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 10. Simulation Results
-- ----------------------------------------------------------------------------
INSERT INTO simulation_results (
    id, merchant_id, action_type, input_parameters, baseline_metrics,
    predicted_metrics, estimated_incremental_impact, confidence
) VALUES
(
    '04000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'EVENING_OFFER',
    '{"offer_amount": 49, "target_customer_count": 312, "duration_days": 7, "time_window": "5:00 PM - 8:30 PM", "channel": "SMS_AND_WHATSAPP"}'::jsonb,
    '{"revenue": 284500.0, "transactions": 1248, "average_ticket": 228.0}'::jsonb,
    '{"projected_revenue": 325000.0, "projected_growth_percent": 14.2, "estimated_transactions": 1540}'::jsonb,
    '{"projected_cost": 4200.0, "net_gain": 36300.0, "roi": 8.64, "risk_level": "LOW"}'::jsonb,
    94.00
),
(
    '04000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'WIN_BACK',
    '{"offer_amount": 50, "target_customer_count": 312, "duration_days": 10, "time_window": "All Day", "channel": "WHATSAPP"}'::jsonb,
    '{"revenue": 284500.0, "transactions": 1248, "average_ticket": 228.0}'::jsonb,
    '{"projected_revenue": 318000.0, "projected_growth_percent": 11.8, "estimated_transactions": 1485}'::jsonb,
    '{"projected_cost": 3600.0, "net_gain": 29900.0, "roi": 8.30, "risk_level": "LOW"}'::jsonb,
    91.00
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. Model Predictions
-- ----------------------------------------------------------------------------
INSERT INTO model_predictions (
    id, merchant_id, model_type, prediction, prediction_date, model_version, confidence
) VALUES
(
    '05000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'TIME_SERIES_ANOMALY',
    '{"anomaly_detected": true, "slump_window": "17:00-20:30", "expected_hourly_volume": 125, "actual_hourly_volume": 52, "drop_ratio": 0.31}'::jsonb,
    CURRENT_DATE,
    'v1.2-ts-anomaly',
    94.00
),
(
    '05000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'CHURN_PROPENSITY',
    '{"high_risk_count": 312, "medium_risk_count": 147, "low_risk_count": 625, "dominant_factor": "visit_interval_exceeded_21_days"}'::jsonb,
    CURRENT_DATE,
    'v2.0-rfm-churn',
    91.00
),
(
    '05000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'OFFER_ELASTICITY',
    '{"optimal_price_point": 49.0, "elasticity_coefficient": -1.45, "margin_preservation_threshold": 38.0}'::jsonb,
    CURRENT_DATE,
    'v1.0-elasticity-opt',
    89.50
)
ON CONFLICT (id) DO NOTHING;
