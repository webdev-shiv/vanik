-- ============================================================================
-- Migration 005: Audit & Timestamp Triggers
-- Merchant Growth AI - Supabase PostgreSQL Schema
-- ============================================================================

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
