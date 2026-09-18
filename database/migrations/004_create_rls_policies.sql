-- ============================================================================
-- Migration 004: Row Level Security (RLS) Policies
-- Merchant Growth AI - Supabase PostgreSQL Schema
-- ============================================================================
-- Ensures strict tenant isolation: Merchants can only view, insert, update,
-- and delete records belonging to their own merchant_id.
-- Also grants full access to the Supabase backend 'service_role'.
-- ============================================================================

-- 1. Enable RLS on all 11 tables
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

-- ----------------------------------------------------------------------------
-- Service Role Administrative Access Policies (Spring Boot & Python backend)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Tenant Isolation Policies for Authenticated Merchants
-- ----------------------------------------------------------------------------

-- 1. Merchants Table Policies
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

-- Helper block to generate standard tenant isolation policies across tenant tables
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
        -- SELECT Policy
        EXECUTE format('
            DROP POLICY IF EXISTS "Merchants can select own %1$I" ON %1$I;
            CREATE POLICY "Merchants can select own %1$I"
            ON %1$I FOR SELECT
            TO authenticated
            USING (merchant_id = current_merchant_id());
        ', tbl);

        -- INSERT Policy
        EXECUTE format('
            DROP POLICY IF EXISTS "Merchants can insert own %1$I" ON %1$I;
            CREATE POLICY "Merchants can insert own %1$I"
            ON %1$I FOR INSERT
            TO authenticated
            WITH CHECK (merchant_id = current_merchant_id());
        ', tbl);

        -- UPDATE Policy
        EXECUTE format('
            DROP POLICY IF EXISTS "Merchants can update own %1$I" ON %1$I;
            CREATE POLICY "Merchants can update own %1$I"
            ON %1$I FOR UPDATE
            TO authenticated
            USING (merchant_id = current_merchant_id())
            WITH CHECK (merchant_id = current_merchant_id());
        ', tbl);

        -- DELETE Policy
        EXECUTE format('
            DROP POLICY IF EXISTS "Merchants can delete own %1$I" ON %1$I;
            CREATE POLICY "Merchants can delete own %1$I"
            ON %1$I FOR DELETE
            TO authenticated
            USING (merchant_id = current_merchant_id());
        ', tbl);
    END LOOP;
END $$;
