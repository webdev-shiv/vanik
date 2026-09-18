# VANIK — Production Deployment & Supabase Setup Guide

This document provides complete operational procedures for deploying the **VANIK** platform to production across **Vercel** (Next.js Frontend), **Supabase** (PostgreSQL Database & Realtime Engine), and **Cloud Providers** (Spring Boot Backend & FastAPI ML Microservice).

---

## 1. Supabase PostgreSQL Project Creation

1. Log into your [Supabase Dashboard](https://database.supabase.com).
2. Click **New Project**, specify your organization, and choose project name `vanik-production`.
3. Set a strong, secure **Database Password** (store this in your password vault).
4. Select the region closest to your primary merchant userbase (e.g. `ap-south-1` Mumbai, India).
5. Note your project connection credentials:
   - **Database Connection String**: `jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require`
   - **Supabase URL**: `https://<project-ref>.supabase.co`
   - **Publishable Key (anon)**: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

---

## 2. SQL Schema & Seed Execution

1. Open the **SQL Editor** in your Supabase Dashboard.
2. Open `database/supabase/production.sql` from this repository.
3. Paste and execute `production.sql`. This will create:
   - 12 core tables (`merchants`, `merchant_users`, `customers`, `products`, `transactions`, `campaigns`, `campaign_results`, `customer_segments`, `ai_insights`, `recommendations`, `simulation_results`, `upi_market_statistics`)
   - Indexes for merchant-scoped queries (`idx_transactions_merchant`, `idx_customers_merchant`, etc.)
   - Row Level Security (RLS) policies enforcing multi-tenant isolation.
   - Supabase Realtime publication configuration.
4. Optional: If starting with baseline telemetry data, execute `database/supabase/seed.sql`.

---

## 3. RLS (Row Level Security) Verification

The database enforces tenant data isolation at the PostgreSQL row level via the `get_auth_merchant_id()` function and custom policies:

```sql
-- RLS Verification Test
-- Logged in as Merchant A ('m-001'), verify that queries for Merchant B ('m-002') return 0 rows:
SELECT * FROM transactions WHERE merchant_id = 'm-002';
```

- Standard database roles (`postgres`, `service_role`) bypass RLS for administrative backend processing.
- Application client tokens set `request.jwt.claims.merchant_id` to ensure merchants cannot read or mutate rival merchant data.

---

## 4. Supabase Realtime Synchronization Setup

1. In Supabase Dashboard, navigate to **Database** -> **Publications**.
2. Verify `supabase_realtime` contains the following tables:
   - `campaigns`
   - `ai_insights`
   - `recommendations`
   - `transactions`
3. In the Next.js frontend, subscriptions use `frontend/lib/supabaseClient.ts`:

```typescript
import { subscribeToMerchantRealtime } from "@/lib/supabaseClient";

// Automatically invalidates and refetches data when a database change occurs:
const unsubscribe = subscribeToMerchantRealtime(merchantId, ({ table }) => {
  if (table === "campaigns") fetchCampaigns();
  if (table === "ai_insights") fetchInsights();
});
```

---

## 5. Production Environment Variables Checklist

### Frontend (`frontend/.env.local` / Vercel Environment)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-publishable-key>
```

### Backend (`backend/.env` / Railway / Cloud Run)
```env
PORT=8080
DATABASE_URL=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=<your-database-password>
JWT_SECRET=<min-32-character-jwt-secret>
AI_SERVICE_URL=https://ai.yourdomain.com
CORS_ALLOWED_ORIGINS=https://vanik.vercel.app,https://yourdomain.com
```

### AI Service (`ai-service/.env` / Railway / Cloud Run)
```env
PORT=8000
OPENAI_API_KEY=<your-openai-api-key>
CORS_ALLOWED_ORIGINS=https://vanik.vercel.app,https://api.yourdomain.com
```

---

## 6. Deployment Instructions

### Next.js Frontend Deployment (Vercel)
1. Import repository into Vercel.
2. Set Root Directory to `frontend`.
3. Configure Build Settings:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Click **Deploy**.

### Spring Boot Backend Deployment (Docker / Cloud Run / Railway)
1. Build container or JAR:
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ```
2. Run via Docker container or container platform:
   ```bash
   docker build -t vanik-backend .
   docker run -p 8080:8080 --env-file .env vanik-backend
   ```
3. Verify health status: `GET https://api.yourdomain.com/health` -> `{"status": "UP"}`.

### FastAPI ML Microservice Deployment (Docker / Cloud Run / Railway)
1. Build container:
   ```bash
   cd ai-service
   docker build -t vanik-ai-service .
   docker run -p 8000:8000 --env-file .env vanik-ai-service
   ```
2. Verify health status: `GET https://ai.yourdomain.com/health` -> `{"status": "UP", "models_loaded": [...]}`.

---

## 7. Multi-Device Live Synchronization Test Procedure

1. Open Window A: Login to `https://vanik.vercel.app` as Merchant A (`Sharma Tea Corner`).
2. Open Window B: Login to `https://vanik.vercel.app` on a separate laptop or phone as the same Merchant A (`Sharma Tea Corner`).
3. Open Window C: Login to `https://vanik.vercel.app` as Merchant B (`Verma Sweets`).
4. Perform Action in Window A: Click **Create Campaign** and launch a new campaign.
5. Verification A: Window B instantly updates and displays the new campaign without a full manual page refresh.
6. Verification B: Window C (Merchant B) receives 0 events and experiences no layout change or cross-tenant leaks.

---

## 8. Rollback Procedure

1. Frontend: In Vercel Dashboard, select **Deployments** -> locate prior stable deployment -> click **Promote to Production**.
2. Backend: Revert container tag in deployment service (e.g. Cloud Run revision rollback / Railway rollback).
3. Database: SQL schema changes are non-destructive (`IF NOT EXISTS` / idempotent additions). Data rollbacks can be restored via Supabase Database Point-in-Time Recovery (PITR) backups if required.
