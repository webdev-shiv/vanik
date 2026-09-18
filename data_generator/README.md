# Merchant Growth AI - Synthetic Data Generator & ML Datasets

This module generates realistic, high-volume synthetic Indian merchant telemetry for machine learning model training, What-If simulation benchmarking, and hackathon demonstrations.

---

## 1. Dataset Overview

- **Merchants**: 50 Indian retail and F&B businesses across 7 major commercial categories.
- **Customers**: 10,000 customers with Indian name profiles, masked phone numbers (`+91 98110 •••••`), acquisition dates, and shopping preferences.
- **Products**: 500 catalog items with realistic Indian prices (₹20 to ₹4,500) and wholesale costs for margin analysis.
- **Transactions**: 116,000+ granular settlement logs spanning **12 full months (September 2025 – September 2026)** totaling **INR 56.5+ Million**.
- **Campaigns**: 120 marketing campaigns across WhatsApp, SMS, and Soundbox voice banners with before/during/after lift measurements and ROI metrics.
- **Derived ML Datasets**: Ready-to-train datasets for customer segmentation, sales forecasting, time-series anomaly detection, and recommendation ranking.

---

## 2. Realistic Indian Merchant Categories & Profiles

| Category | Typical Indian Businesses | Price Range (INR) | Primary Channels |
|---|---|---|---|
| **Food & Beverage** | Chai/Snack Kiosks, Sweet Shops, Cafes, Bakeries, QSRs | ₹20 – ₹250 | Soundbox QR (65%), Card (15%), UPI |
| **Grocery** | Local Kirana, Daily Needs, Supermarts, Organic Stores | ₹25 – ₹1,200 | Soundbox QR, UPI, Cash |
| **Fashion** | Ethnic Boutiques, Kurti Stores, Saree Emporiums, Garments | ₹400 – ₹4,500 | Soundbox Card, POS Swipes, QR |
| **Electronics** | Mobile Accessories, Audio Hubs, Repair Labs, Gadget Stores | ₹150 – ₹3,500 | Soundbox Card, UPI, POS Terminal |
| **Pharmacy** | Chemists & Druggists, Ayurvedic Dispensaries, Wellness | ₹20 – ₹700 | Soundbox QR, UPI |
| **Beauty & Personal Care** | Salons, Spas, Herbal Care Lounges | ₹95 – ₹1,200 | Soundbox QR, UPI |
| **Services** | Alteration Tailors, Dry Cleaners, Express Shoe Laundry | ₹40 – ₹450 | Soundbox QR, Cash |

---

## 3. Embedded Business Scenarios for ML Detection

The generator embeds real-world business dynamics with ground-truth records stored in `data/scenarios_ground_truth.json` (unlabeled in the transaction feature stream):

### Scenario 1: Acute Evening Sales Slump (Time-Series Anomaly Detection)
- **Target Merchant**: `m-001` (Sharma Tea Corner, Connaught Place, New Delhi).
- **Phenomenon**: During the last 45 days, transactions during the evening peak (**5:00 PM – 8:30 PM**) collapsed by **31.0%** compared to historical benchmarks (slip from 125 txns/hour to 52 txns/hour), accounting for **62% of top-line variance**.
- **ML Detection**: Time-series anomaly models (Z-score, Isolation Forest, Prophet counterfactuals) isolate the 5-8 PM window as an acute statistical anomaly.

### Scenario 2: Gradual Top-Line Sales Decline (Forecasting & Trend Analysis)
- **Target Merchant**: `m-002` (Gupta Electronics & Mobile, Nehru Place, New Delhi).
- **Phenomenon**: Steady linear decay of **25% over 12 months** due to surrounding e-commerce competition and market cannibalization.
- **ML Detection**: Trend decomposition models identify negative slope and declining month-over-month baseline.

### Scenario 3: Repeat Customer Retention Loss (RFM & Churn Propensity)
- **Target Merchant**: `m-001` (Sharma Tea Corner).
- **Phenomenon**: 312 frequent regulars who previously visited 3+ times per week stopped visiting in the last 21–30 days. Repeat customer contribution to revenue dropped from 48% to 34%.
- **ML Detection**: RFM clustering moves these patrons into the `INACTIVE` / `DORMANT` cluster, triggering the retention warning.

### Scenario 4: High-Growth Product Category Surge
- **Target Merchant**: `m-003` (Annapurna Fresh Kirana, Mumbai).
- **Phenomenon**: Over the last 90 days, the "Organic & Superfoods" product category experienced a **+140% surge in volume**, outperforming baseline staples.
- **ML Detection**: Product affinity & growth velocity models highlight the emerging hero category.

### Scenario 5: High Customer Churn Post-Season
- **Target Merchant**: `m-004` (Mehra Silk & Ethnic Sarees, Jaipur).
- **Phenomenon**: Following the festive/wedding season, inactive customer count surged by 65%.
- **ML Detection**: Survival analysis and cohort retention heatmaps capture customer dormancy.

### Scenario 6: High-Performing Campaign Outcomes
- **Campaign**: `camp-0001` (Evening Combo Special ₹49 Chai + Bun Maska).
- **Impact**: Delivered **+27.2% actual lift** vs +25.0% expected lift, generating **9.6x ROI**.

### Scenario 7: Weak / Negative ROI Campaigns
- **Campaign**: `camp-0004` (Flat Clearance Push for Mehra Silk).
- **Impact**: Delivered only **+3.2% actual lift** against a 30% discount margin cut, generating **-0.45x ROI**.

### Scenario 8: Injected Transaction Anomalies & Outliers
- **Frequency**: 0.15% of all transactions.
- **Types**:
  1. Ticket size spikes (>10x merchant median AOV).
  2. Odd-hour swipes (processed between 2:00 AM – 4:30 AM).
  3. Bulk quantity transactions (unusually large batch swipes).

---

## 4. Generated File Structure

```
data_generator/
├── data/                                # Primary Relational Tables
│   ├── merchants.csv                    # 50 merchants
│   ├── products.csv                     # 500 products with prices & margins
│   ├── customers.csv                    # 10,000 customers with masked phones
│   ├── transactions.csv                 # 116,000+ settlement logs
│   ├── campaigns.csv                    # 120 marketing campaigns
│   ├── campaign_results.csv             # Pre/post revenue, lift, and ROI
│   └── scenarios_ground_truth.json      # Ground-truth evaluation benchmarks
│
├── ml_data/                             # Derived ML Datasets
│   ├── customer_rfm.csv                 # Recency, Frequency, Monetary, Churn Risk
│   ├── sales_daily.csv                  # Daily revenue, AOV, festival & weekend flags
│   ├── anomaly_training.csv             # Hourly volume, rolling Z-scores, anomaly labels
│   └── recommendation_training.csv      # Contextual campaign features & outcome success
│
├── generator.py                         # Master generator script
├── import_to_supabase.py                # Supabase bulk loading generator
├── import_data.sql                      # psql \copy ingestion script
├── requirements.txt
└── README.md
```

---

## 5. Instructions for Regenerating the Dataset

To regenerate the entire dataset from scratch:

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the deterministic generator
python generator.py
```

The script will:
1. Seed the random number generators (`random.seed(42)`, `np.random.seed(42)`).
2. Generate all 6 primary relational CSVs in `data/`.
3. Run strict automated validation checks (zero duplicates, 100% foreign key referential integrity, exact mathematical amount calculations, and zero illegal nulls).
4. Build the 4 derived ML training datasets in `ml_data/`.

---

## 6. Instructions for Importing into Supabase

### Option A: Ultra-Fast Bulk Import via `psql` (Recommended)

Generate the import script:
```bash
python import_to_supabase.py
```

Run the generated `import_data.sql` script directly into your Supabase database:
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f import_data.sql
```
*Note: Uses PostgreSQL `\copy` with session replication temporarily set to replica, loading all 116,000+ rows in under 15 seconds.*

### Option B: Supabase Dashboard UI
1. In the Supabase Dashboard, navigate to the **Table Editor**.
2. Select the target table (e.g. `merchants`).
3. Click **Insert** $\rightarrow$ **Import data from CSV**.
4. Drag and drop the corresponding CSV from `data/merchants.csv`.
5. Repeat in order of dependency:
   1. `merchants.csv`
   2. `products.csv`
   3. `customers.csv`
   4. `campaigns.csv`
   5. `campaign_results.csv`
   6. `transactions.csv`

---

## 7. Data Privacy & Compliance Notice
> **Notice**: No real people's personal data or confidential Paytm merchant transaction records are included in this dataset. All transaction telemetry, customer phone numbers (`+91 98XXX •••••`), and Soundbox identifiers are synthetically generated for hackathon prototyping and ML model benchmarking.
