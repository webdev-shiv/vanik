-- ============================================================================
-- Migration 006: Create Dedicated NPCI UPI Market & Ecosystem Statistics Tables
-- ============================================================================
-- NOTE:
-- This data contains REAL AGGREGATED NPCI UPI macroeconomic statistics.
-- It is strictly separated from the synthetic merchant/customer 'transactions' table.
-- Do NOT mix or insert NPCI data into customer transaction tables.
-- ============================================================================

-- 1. Table: upi_market_statistics
-- Stores official NPCI monthly UPI volume, daily average volume, value, and daily average value.
CREATE TABLE IF NOT EXISTS upi_market_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month VARCHAR(50) NOT NULL,
    year_month VARCHAR(7) NOT NULL, -- e.g. '2022-03' for chronological sorting
    transaction_volume_million NUMERIC(14, 2) NOT NULL,
    avg_daily_transaction_volume_million NUMERIC(14, 4),
    transaction_value_crore NUMERIC(16, 2) NOT NULL,
    avg_daily_transaction_value_crore NUMERIC(16, 4),
    source VARCHAR(50) NOT NULL DEFAULT 'NPCI',
    source_file VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_upi_market_year_month_source UNIQUE (year_month, source)
);

-- Index for fast chronological time-series retrieval
CREATE INDEX IF NOT EXISTS idx_upi_market_year_month ON upi_market_statistics(year_month ASC);

-- 2. Table: upi_ecosystem_statistics
-- Stores ecosystem metrics such as 'No. of Banks live on UPI' alongside monthly volume and value.
CREATE TABLE IF NOT EXISTS upi_ecosystem_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month VARCHAR(50) NOT NULL,
    year_month VARCHAR(7) NOT NULL,
    banks_live_on_upi INT NOT NULL,
    transaction_volume_million NUMERIC(14, 2) NOT NULL,
    transaction_value_crore NUMERIC(16, 2) NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'NPCI',
    source_file VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_upi_ecosystem_year_month_source UNIQUE (year_month, source)
);

CREATE INDEX IF NOT EXISTS idx_upi_ecosystem_year_month ON upi_ecosystem_statistics(year_month ASC);

-- Enable Row Level Security (RLS) with public read access
ALTER TABLE upi_market_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE upi_ecosystem_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to upi_market_statistics"
    ON upi_market_statistics FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to upi_ecosystem_statistics"
    ON upi_ecosystem_statistics FOR SELECT
    USING (true);
