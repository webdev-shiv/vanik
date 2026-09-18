# Merchant Growth AI - n8n Workflow Automation Layer

**n8n** serves as the scheduled and event-driven orchestration layer for **Merchant Growth AI**.
It coordinates API calls, data pipelines, human-in-the-loop approvals, and messaging between the **Spring Boot backend**, **Python ML microservice**, **OpenAI explanation layer**, and **Supabase PostgreSQL database**.

> **Architectural & Security Guardrails**:
> 1. **n8n is the orchestration layer, NOT the ML engine.** All statistical calculations, forecasts, and classifications are executed by the Python ML service and Spring Boot backend.
> 2. **Do not create automatic financial actions without merchant approval.** Every promotional discount or marketing budget allocation requires explicit merchant confirmation before campaign activation.
> 3. **Least-Privilege Supabase Access**: Read operations use `SUPABASE_ANON_KEY` governed by Row Level Security (RLS). Write operations use `SUPABASE_SERVICE_ROLE_KEY` isolated strictly inside n8n.
> 4. **Never expose Supabase service-role credentials to the frontend.** Frontend clients communicate strictly via Spring Boot or use `anon` keys with RLS.
> 5. **Zero Customer PII Sent to OpenAI**: Customer names, phone numbers, and individual transaction rows are stripped before reaching the OpenAI explanation layer.

---

## 1. Workflows Directory & Matrix

| Workflow | File Name | Trigger Type | Primary Role |
|---|---|---|---|
| **WORKFLOW 1** | `01_daily_merchant_intelligence.json` | Daily Schedule (`06:00 AM IST`) | End-to-end daily data fetch, analytics aggregation, anomaly check, OpenAI narrative generation, Supabase persistence, and dashboard alert dispatch. |
| **WORKFLOW 2** | `02_ai_growth_loop.json` | Webhook (`/webhook/merchant-data-updated`) | Reactive growth loop: analyzes new data, detects high-confidence opportunities, saves recommendations, halts for merchant approval, creates campaign, and tracks baseline. |
| **WORKFLOW 3** | `03_campaign_outcome.json` | Webhook / Cron (`/webhook/campaign-ended`) | Evaluates completed campaign: fetches actual revenue/transactions, compares against pre-campaign baseline, computes incremental lift and ROI, and closes loop. |
| **WORKFLOW 4** | `04_alert_workflow.json` | Event Webhook (`/webhook/metric-alert`) | Real-time threshold monitoring for sharp revenue drops, footfall slumps, repeat customer churn, and unusual dormancy; triggers OpenAI explanation and critical alerts. |
| **SUPABASE OPS** | `05_supabase_secure_integration.json` | Webhook Dispatcher (`/webhook/supabase/execute-operation`) | Dedicated least-privilege workflows for all 6 core Supabase read/write operations with data sanitization. |

---

## 2. Secure Supabase Operations (6 Core Workflows)

Implemented in [`workflows/05_supabase_secure_integration.json`](file:///c:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/n8n/workflows/05_supabase_secure_integration.json):

```
                       ┌──> 1. Read Transaction Summaries (Anon Key + PII Scrubbing)
                       ├──> 2. Read AI Analysis Inputs (Anon Key + Anonymized Assembly)
Incoming Operation ────┼──> 3. Save AI Insights (Service-Role Key + PostgREST)
     Dispatcher        ├──> 4. Save Recommendations (Service-Role Key + PostgREST)
                       ├──> 5. Save Simulation Results (Service-Role Key + PostgREST)
                       └──> 6. Save Campaign Results (Service-Role Key + PostgREST)
```

### 1. Reading Merchant Transaction Summaries
- **Trigger**: Webhook / Sub-workflow call (`operation: "READ_TRANSACTION_SUMMARY"`).
- **Supabase Operation**: PostgREST `GET /rest/v1/transactions?merchant_id=eq.{id}&status=eq.COMPLETED&select=id,amount,payment_method,channel,status,created_at&order=created_at.desc&limit=500`.
- **HTTP API Call**: `GET {{ $env.SUPABASE_URL }}/rest/v1/transactions...`.
- **Authentication**: `apikey: {{ $env.SUPABASE_ANON_KEY }}` (Least-privilege read).
- **Data Transformation (Zero PII Rule)**:
  - Aggregates total revenue, transaction count, average order value (AOV), and payment method distribution.
  - **Explicitly deletes individual transaction identifiers, customer names, and contact details.**
- **Error Handling & Retry**: 3 retries at 2000ms intervals on network failure or rate limit.

### 2. Reading AI Analysis Inputs
- **Trigger**: Webhook / Sub-workflow call (`operation: "READ_AI_INPUTS"`).
- **Supabase Operation**:
  - `GET /rest/v1/merchants?id=eq.{id}&select=id,name,business_category,monthly_revenue`
  - `GET /rest/v1/customer_segments?merchant_id=eq.{id}&select=segment_name,customer_count,share_percent,average_spend,churn_risk`
- **Authentication**: `apikey: {{ $env.SUPABASE_ANON_KEY }}` (Least-privilege read).
- **Data Transformation**:
  - Joins merchant metadata with RFM cohort distributions into a clean, normalized ML input dictionary.
  - Validates that no customer identifiers or personal attributes enter the feature pipeline.
- **Error Handling & Retry**: Retries up to 3 times; returns fallback default schema if merchant profile is incomplete.

### 3. Saving AI Insights
- **Trigger**: Upstream anomaly detection / OpenAI explanation step (`operation: "SAVE_AI_INSIGHT"`).
- **Supabase Operation**: PostgREST `POST /rest/v1/ai_insights`.
- **HTTP API Call**:
  ```json
  POST {{ $env.SUPABASE_URL }}/rest/v1/ai_insights
  Headers:
    apikey: {{ $env.SUPABASE_SERVICE_ROLE_KEY }}
    Authorization: Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}
    Prefer: return=representation
  Body:
  {
    "merchant_id": "m-001",
    "type": "ROOT_CAUSE_DIAGNOSIS",
    "severity": "HIGH",
    "title": "...",
    "summary": "...",
    "root_cause": "...",
    "recommended_action": "...",
    "expected_impact": "...",
    "confidence": 0.88,
    "is_resolved": false
  }
  ```
- **Authentication**: `SUPABASE_SERVICE_ROLE_KEY` (Server-side only).
- **Data Transformation**: Normalizes OpenAI output keys to Supabase snake_case columns.
- **Error Handling & Retry**: 3 retries at 2000ms. On persistent failure, logs alert to emergency Slack/Webhook without blocking.

### 4. Saving Recommendations
- **Trigger**: Opportunity detection step (`operation: "SAVE_RECOMMENDATION"`).
- **Supabase Operation**: PostgREST `POST /rest/v1/recommendations`.
- **Authentication**: `SUPABASE_SERVICE_ROLE_KEY` (Server-side only).
- **Data Transformation**: Enforces initial status `PENDING_MERCHANT_APPROVAL`. Attaches expected lift percentage and target audience.
- **Error Handling & Retry**: 3 retries at 2000ms.

### 5. Saving Simulation Results
- **Trigger**: What-If scenario execution (`operation: "SAVE_SIMULATION_RESULT"`).
- **Supabase Operation**: PostgREST `POST /rest/v1/simulation_results`.
- **Authentication**: `SUPABASE_SERVICE_ROLE_KEY` (Server-side only).
- **Data Transformation**: Stores baseline revenue/txns, projected scenario revenue/txns, incremental delta, discount %, and duration.
- **Error Handling & Retry**: 3 retries at 2000ms.

### 6. Saving Campaign Results
- **Trigger**: Campaign completion or telemetry milestone (`operation: "SAVE_CAMPAIGN_RESULT"`).
- **Supabase Operation**: PostgREST `POST /rest/v1/campaign_results`.
- **Authentication**: `SUPABASE_SERVICE_ROLE_KEY` (Server-side only).
- **Data Transformation**: Computes final observed lift %, ROI multiplier, and revenue generated from actual transaction logs.
- **Error Handling & Retry**: 3 retries at 2000ms.

---

## 3. End-to-End Workflow Specifications

### WORKFLOW 1: Daily Merchant Intelligence
**File**: [`workflows/01_daily_merchant_intelligence.json`](file:///c:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/n8n/workflows/01_daily_merchant_intelligence.json)

- **Trigger**: Schedule Trigger at 06:00 AM IST (`cron: 0 6 * * *`).
- **Nodes**: 11 nodes (Schedule $\rightarrow$ Fetch Merchant $\rightarrow$ Sales Analytics $\rightarrow$ Customer Analytics $\rightarrow$ Aggregate $\rightarrow$ Python Root-Cause $\rightarrow$ IF Meaningful Issue $\rightarrow$ OpenAI Insight $\rightarrow$ Save Supabase $\rightarrow$ Notification).
- **Privacy Enforcement**: Customer phone numbers and IDs are stripped during aggregation; only high-level shifts ($-11.4\%$ revenue, $-8.2\%$ volume, $-14.0\%$ repeat) are sent to OpenAI.
- **Error Path & Retries**: 3 retries with 3000ms backoff on external calls. Benign steady-state scans route to log node.
- **Authentication**: Internal service-to-service + Supabase service role key for persistence.

### WORKFLOW 2: AI Growth Loop
**File**: [`workflows/02_ai_growth_loop.json`](file:///c:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/n8n/workflows/02_ai_growth_loop.json)

- **Trigger**: Webhook `POST /webhook/merchant-data-updated`.
- **Nodes**: 9 nodes (Webhook $\rightarrow$ Analyze $\rightarrow$ Detect $\rightarrow$ Save Recommendation $\rightarrow$ **Approval Check** $\rightarrow$ Create Campaign $\rightarrow$ Track Baseline $\rightarrow$ Save Result).
- **Financial Protection Guard**: If `merchant_approved !== true`, campaign creation is strictly blocked, creating an approval request on the merchant dashboard.
- **Error Path & Retries**: 2 retries at 2000ms intervals.
- **Authentication**: Webhook secret header + Supabase service role key.

### WORKFLOW 3: Campaign Outcome
**File**: [`workflows/03_campaign_outcome.json`](file:///c:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/n8n/workflows/03_campaign_outcome.json)

- **Trigger**: Webhook `POST /webhook/campaign-ended`.
- **Nodes**: 6 nodes (Webhook $\rightarrow$ Fetch Results $\rightarrow$ Code: Compare with Baseline $\rightarrow$ Save Result to Supabase $\rightarrow$ Close Campaign $\rightarrow$ Close Recommendation).
- **Data Transformation**: Calculates incremental revenue, transaction lift %, and marketing ROI.
- **Error Path & Retries**: 3 retries at 2000ms.
- **Authentication**: Spring Boot bearer token + Supabase service role key.

### WORKFLOW 4: Alert Workflow
**File**: [`workflows/04_alert_workflow.json`](file:///c:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/n8n/workflows/04_alert_workflow.json)

- **Trigger**: Event Webhook `POST /webhook/metric-alert`.
- **Conditions Monitored**:
  - Revenue decline $\le -10.0\%$
  - Transaction drop $\le -15.0\%$ or anomaly score $\ge 0.70$
  - Repeat customer decline $\le -12.0\%$
  - Dormant customer surge $\ge 50$
- **Nodes**: 7 nodes (Webhook $\rightarrow$ IF Anomaly $\rightarrow$ Format Anonymized Payload $\rightarrow$ OpenAI $\rightarrow$ Save Supabase $\rightarrow$ Broadcast Alert).
- **Privacy Enforcement**: Formats verified metrics strictly without personal customer data.
- **Error Path & Retries**: Minor fluctuations below threshold bypass alert generation to prevent fatigue.
- **Authentication**: Webhook bearer token + Supabase service role key.

---

## 4. Setup & Deployment Guide

1. **Copy Environment Variables**:
   ```bash
   cp complete/n8n/.env.example complete/n8n/.env
   ```
2. **Start n8n**:
   ```bash
   npx n8n
   # or with docker:
   docker run -it --rm --name n8n -p 5678:5678 --env-file complete/n8n/.env -v ~/.n8n:/home/node/.n8n n8nio/n8n
   ```
3. **Import Workflows**:
   - In the n8n UI, navigate to **Workflows** $\rightarrow$ **Import from File**.
   - Select any JSON workflow from [`complete/n8n/workflows/`](file:///c:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/n8n/workflows/).
   - Click **Save** and toggle **Active**.
