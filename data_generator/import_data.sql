-- ============================================================================
-- Fast Bulk Ingestion Script for Supabase / PostgreSQL
-- Run with: psql "postgresql://postgres:password@host:5432/db" -f import_data.sql
-- ============================================================================

-- Disable triggers temporarily for high-speed loading
SET session_replication_role = 'replica';

BEGIN;

-- 1. Ingest Merchants
\echo 'Importing merchants...'
\copy merchants(id, name, owner_name, business_category, location, business_size, paytm_merchant_id, soundbox_id, qr_code_id, connection_status, created_at) FROM 'C:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/data_generator/data/merchants.csv' WITH (FORMAT csv, HEADER true);

-- 2. Ingest Products
\echo 'Importing products...'
\copy products(id, merchant_id, sku, product_name, category, price, cost, active_status, created_at) FROM 'C:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/data_generator/data/products.csv' WITH (FORMAT csv, HEADER true);

-- 3. Ingest Customers
\echo 'Importing customers...'
\copy customers(id, merchant_id, customer_code, name, masked_phone, email, acquisition_date, customer_status, preferred_shopping_time, created_at) FROM 'C:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/data_generator/data/customers.csv' WITH (FORMAT csv, HEADER true);

-- 4. Ingest Campaigns
\echo 'Importing campaigns...'
\copy campaigns(id, merchant_id, campaign_type, campaign_name, target_segment, discount, discount_type, start_date, end_date, budget, spent_so_far, status, channel, created_at) FROM 'C:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/data_generator/data/campaigns.csv' WITH (FORMAT csv, HEADER true);

-- 5. Ingest Campaign Results
\echo 'Importing campaign results...'
\copy campaign_results(id, campaign_id, merchant_id, revenue_before, revenue_during_after, transaction_counts_before, transaction_counts_after, customer_counts_before, customer_counts_after, incremental_metrics, roi) FROM 'C:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/data_generator/data/campaign_results.csv' WITH (FORMAT csv, HEADER true);

-- 6. Ingest Transactions (100,000+ rows)
\echo 'Importing 100,000+ transactions...'
\copy transactions(id, merchant_id, customer_id, product_id, transaction_timestamp, quantity, unit_price, total_amount, payment_method, transaction_status, channel) FROM 'C:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/data_generator/data/transactions.csv' WITH (FORMAT csv, HEADER true);

COMMIT;

-- Re-enable triggers
SET session_replication_role = 'origin';

\echo 'Bulk ingestion completed successfully!'
