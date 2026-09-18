-- ============================================================================
-- VANIK Merchant Growth AI — Supabase PostgreSQL Seed Dataset
-- File: database/supabase/seed.sql
-- ============================================================================

INSERT INTO merchants (
    id, name, owner_name, business_category, location, business_size,
    paytm_merchant_id, soundbox_id, qr_code_id, connection_status,
    currency, last_synced_at, monthly_revenue
) VALUES 
(
    'm-001',
    'Sharma Tea Corner',
    'Ramesh Sharma',
    'QSR / Cafe & Snacks',
    'Connaught Place, New Delhi',
    'Micro (1-5 staff)',
    'PAYTM-MERCH-98214-DL',
    'SB-4G-99218',
    'QR-CP-8841',
    'CONNECTED_DEMO',
    'INR',
    'Realtime Webhook Stream',
    284500.00
),
(
    'm-002',
    'Verma Sweets & Bakery',
    'Ashok Verma',
    'Bakery & Confectionery',
    'Karol Bagh, New Delhi',
    'Small (5-10 staff)',
    'PAYTM-MERCH-77412-DL',
    'SB-4G-44102',
    'QR-KB-3329',
    'CONNECTED_DEMO',
    'INR',
    'Realtime Webhook Stream',
    492000.00
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, merchant_id, sku, product_name, category, price, cost, stock_quantity, is_available) VALUES
('p-001', 'm-001', 'SKU-TEA-01', 'Special Masala Chai (Kulhad)', 'Tea & Beverages', 25.00, 11.00, 500, true),
('p-002', 'm-001', 'SKU-TEA-02', 'Ginger Elaichi Tea', 'Tea & Beverages', 20.00, 9.50, 450, true),
('p-003', 'm-001', 'SKU-SNK-01', 'Crispy Aloo Samosa (2 pcs)', 'Snacks & Savouries', 30.00, 15.00, 80, true),
('p-004', 'm-001', 'SKU-SNK-02', 'Bun Maska Butter Toast', 'Snacks & Savouries', 40.00, 21.00, 15, true),
('p-005', 'm-001', 'SKU-SNK-03', 'Paneer Bread Pakora', 'Snacks & Savouries', 35.00, 20.00, 25, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (
    id, merchant_id, masked_phone, name, segment,
    total_spend, visit_count, average_spend, last_visit, preferred_time, favorite_item, retention_risk
) VALUES
('c-001', 'm-001', '+91 98110 •••••', 'Rohit K. (IT Desk)', 'DORMANT', 2450.00, 18, 136.00, '22 days ago', '6:15 PM (Evening)', 'Special Masala Chai + Bun Maska', 'HIGH'),
('c-002', 'm-001', '+91 98712 •••••', 'Ananya S. (Fintech)', 'DORMANT', 3120.00, 24, 130.00, '25 days ago', '5:45 PM (Evening)', 'Ginger Lemon Tea + Samosa', 'HIGH'),
('c-003', 'm-001', '+91 99104 •••••', 'Vikram M. (Consultant)', 'AT_RISK', 4800.00, 31, 155.00, '11 days ago', '1:30 PM (Lunch)', 'Kulhad Chai + Paneer Pakora', 'MODERATE'),
('c-004', 'm-001', '+91 98290 •••••', 'Deepak V. (Banker)', 'LOYAL', 6850.00, 48, 142.00, 'Yesterday', '9:00 AM (Morning)', 'Cutting Chai + Butter Toast', 'LOW')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ai_insights (
    id, merchant_id, title, insight_type, severity, affected_window, impact_estimate, description, is_resolved, created_at
) VALUES
('ins-001', 'm-001', 'Acute Evening Sales Slump Detected', 'SLUMP', 'CRITICAL', '5:00 PM – 8:30 PM Daily', '-31.4% Revenue Drop (INR -5,974/month)', 'Transaction volume plunges by 31.4% between 5:00 PM and 8:30 PM compared to moving average baseline.', false, 'Today, 5:30 PM'),
('ins-002', 'm-001', '312 Regular Commuters Are Dormant', 'RETENTION', 'HIGH', 'Last 21 Days', 'INR 33,500 At-Risk Revenue', 'Repeat customer visits dropped 14.1%. 312 office regulars have not scanned the QR code in 21+ days.', false, 'Yesterday')
ON CONFLICT (id) DO NOTHING;

INSERT INTO recommendations (
    id, merchant_id, title, tagline, expected_impact, impact_metric, target_audience, target_count, duration, priority, cost_estimate, why_reason, suggested_offer, category
) VALUES
('rec-001', 'm-001', 'Launch Evening Happy Hour Combo (5 PM – 8 PM)', 'Special Masala Chai + 2 Samosas for ₹40 via Paytm Soundbox QR', '+22–28% evening footfall recovery', '+₹48,200 Est. Revenue', 'Evening office commuters & local shoppers', 850, '14 Days', 'CRITICAL', '₹1,200 (Digital push)', 'Evening transactions dropped 31.4% due to competitor combo pricing.', 'Chai + Samosa Combo at flat ₹40 (Save ₹15)', 'Demand Recovery'),
('rec-002', 'm-001', 'Target Inactive Regulars with ₹30 Cashback', 'Re-engage 312 dormant regulars on orders above ₹150', '+14% repeat visit recovery', '+₹33,500 Est. Revenue', 'Dormant regulars (0 visits in last 21 days)', 312, '7 Days', 'HIGH_IMPACT', '₹2,400', 'Repeat customer retention eroded by 14.1%.', '₹30 cashback on ₹150+ bill', 'Retention')
ON CONFLICT (id) DO NOTHING;
