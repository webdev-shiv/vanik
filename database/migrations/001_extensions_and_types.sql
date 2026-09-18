-- ============================================================================
-- Migration 001: Extensions and Shared Helper Functions
-- Merchant Growth AI - Supabase PostgreSQL Schema
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Helper function to extract current authenticated merchant_id
-- Checks both Supabase auth.uid() mapping and JWT claims (for service-role / custom claims)
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

-- 3. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
