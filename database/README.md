# Merchant Growth AI - Database Layer (Supabase / PostgreSQL)

This directory contains the production database schema, migrations, Row Level Security (RLS) policies, and seed dataset for **Merchant Growth AI**.

## Structure
- **`schema.sql`**: Consolidated master DDL containing all 11 tables, constraints, indexes, triggers, and RLS policies.
- **`migrations/`**:
  - `001_extensions_and_types.sql`: PostgreSQL extensions (`uuid-ossp`, `pgcrypto`) and helper functions.
  - `002_create_tables.sql`: Core definitions for all 11 tables.
  - `003_create_indexes.sql`: High-performance B-tree and GIN indexes.
  - `004_create_rls_policies.sql`: Row Level Security multi-tenant isolation policies.
  - `005_audit_triggers.sql`: Automated `updated_at` triggers.
- **`seed.sql`**: Realistic synthetic Indian merchant benchmark data populating all 11 tables.
- **`seed_synthetic_data.py`**: Python generator script for synthetic Indian merchant telemetry.
- **`DATABASE_DOCUMENTATION.md`**: Architectural documentation with Mermaid ER diagrams, table specifications, and security model.

## 11 Database Tables
1. `merchants` - Business profile, Soundbox ID, QR ID, monthly revenue
2. `customers` - Customer records, masked phone (`+91 98110 •••••`), status, attributes
3. `products` - Catalog items, selling price, ingredient cost for margin math
4. `transactions` - Settlement logs, quantity, unit price, total amount, payment method, channel
5. `campaigns` - Growth marketing campaigns, discount, budget, status
6. `campaign_results` - Pre/post telemetry, incremental lift, ROI, AI learnings
7. `customer_segments` - RFM recency, frequency, monetary value, churn risk score
8. `ai_insights` - Slump alerts (-31% evening drop), retention warnings, severity
9. `recommendations` - Prioritized growth proposals, estimated impact, confidence
10. `simulation_results` - What-If simulation records, baseline vs predicted metrics
11. `model_predictions` - ML inference outputs, model version, prediction dates

## Deployment Instructions
1. In the Supabase SQL Editor, run `schema.sql`.
2. Run `seed.sql` to populate benchmark Indian merchant data.
3. For local Docker testing:
   ```bash
   psql -h localhost -U postgres -d merchant_growth_db -f schema.sql
   psql -h localhost -U postgres -d merchant_growth_db -f seed.sql
   ```
