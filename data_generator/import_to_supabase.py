"""
Merchant Growth AI - Supabase Import Utility
============================================
Imports the generated synthetic CSV datasets into Supabase / PostgreSQL.
Supports:
1. Direct PostgreSQL connection via connection string
2. Generation of fast psql \copy scripts for bulk ingestion
"""

import os
import sys
import argparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

def generate_psql_copy_script(output_file: str = "import_data.sql"):
    """
    Generates a psql script using \\copy for blazing fast local or cloud ingestion.
    """
    script_path = os.path.join(BASE_DIR, output_file)
    
    merchants_csv = os.path.join(DATA_DIR, "merchants.csv").replace("\\", "/")
    products_csv = os.path.join(DATA_DIR, "products.csv").replace("\\", "/")
    customers_csv = os.path.join(DATA_DIR, "customers.csv").replace("\\", "/")
    campaigns_csv = os.path.join(DATA_DIR, "campaigns.csv").replace("\\", "/")
    campaign_results_csv = os.path.join(DATA_DIR, "campaign_results.csv").replace("\\", "/")
    transactions_csv = os.path.join(DATA_DIR, "transactions.csv").replace("\\", "/")

    sql_commands = f"""-- ============================================================================
-- Fast Bulk Ingestion Script for Supabase / PostgreSQL
-- Run with: psql "postgresql://postgres:password@host:5432/db" -f import_data.sql
-- ============================================================================

-- Disable triggers temporarily for high-speed loading
SET session_replication_role = 'replica';

BEGIN;

-- 1. Ingest Merchants
\\echo 'Importing merchants...'
\\copy merchants(id, name, owner_name, business_category, location, business_size, paytm_merchant_id, soundbox_id, qr_code_id, connection_status, created_at) FROM '{merchants_csv}' WITH (FORMAT csv, HEADER true);

-- 2. Ingest Products
\\echo 'Importing products...'
\\copy products(id, merchant_id, sku, product_name, category, price, cost, active_status, created_at) FROM '{products_csv}' WITH (FORMAT csv, HEADER true);

-- 3. Ingest Customers
\\echo 'Importing customers...'
\\copy customers(id, merchant_id, customer_code, name, masked_phone, email, acquisition_date, customer_status, preferred_shopping_time, created_at) FROM '{customers_csv}' WITH (FORMAT csv, HEADER true);

-- 4. Ingest Campaigns
\\echo 'Importing campaigns...'
\\copy campaigns(id, merchant_id, campaign_type, campaign_name, target_segment, discount, discount_type, start_date, end_date, budget, spent_so_far, status, channel, created_at) FROM '{campaigns_csv}' WITH (FORMAT csv, HEADER true);

-- 5. Ingest Campaign Results
\\echo 'Importing campaign results...'
\\copy campaign_results(id, campaign_id, merchant_id, revenue_before, revenue_during_after, transaction_counts_before, transaction_counts_after, customer_counts_before, customer_counts_after, incremental_metrics, roi) FROM '{campaign_results_csv}' WITH (FORMAT csv, HEADER true);

-- 6. Ingest Transactions (100,000+ rows)
\\echo 'Importing 100,000+ transactions...'
\\copy transactions(id, merchant_id, customer_id, product_id, transaction_timestamp, quantity, unit_price, total_amount, payment_method, transaction_status, channel) FROM '{transactions_csv}' WITH (FORMAT csv, HEADER true);

COMMIT;

-- Re-enable triggers
SET session_replication_role = 'origin';

\\echo 'Bulk ingestion completed successfully!'
"""

    with open(script_path, "w", encoding="utf-8") as f:
        f.write(sql_commands)

    print(f"Generated psql import script at: {script_path}")
    print("\nTo load directly into your Supabase database, run:")
    print(f'psql "YOUR_SUPABASE_CONNECTION_STRING" -f import_data.sql')

if __name__ == "__main__":
    generate_psql_copy_script()
