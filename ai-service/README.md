# Merchant Growth AI - Python ML Microservice

Production-grade Machine Learning microservice built with **FastAPI**, **Scikit-learn**, and **Pandas** for the Merchant Growth AI intelligence platform.

Provides deterministic, reproducible, and explainable models for merchant telemetry:
1. **RFM Customer Segmentation** (Quintile scoring + K-Means clustering)
2. **Multi-Step Sales Forecasting** (Autoregressive Ridge regression with 90% confidence bands)
3. **Sales Anomaly Detection** (Multi-tier rolling baselines + Isolation Forest)
4. **Actionable Recommendations** (Empirical lift estimation with non-fabricated impact metrics)
5. **What-If Growth Simulation** (Microeconomic price elasticity & variable margin math)

---

## Directory Structure

```text
ai-service/
├── app/
│   ├── main.py                 # FastAPI application, middleware, exception handlers
│   ├── api/                    # REST routers mounting /ai/* and legacy /ml/* endpoints
│   ├── models/                 # Serialized .joblib artifacts & model_metadata.json
│   ├── services/               # Inference services (segmentation, forecasting, anomaly, recs, simulation)
│   ├── features/               # Deterministic feature engineering (RFM, lags, rolling stats)
│   ├── utils/                  # Structured logger & ModelRegistry
│   └── schemas/                # Pydantic v2 validation models
├── training/                   # Offline training pipeline scripts
│   ├── train_segmentation.py
│   ├── train_forecasting.py
│   ├── train_anomaly.py
│   ├── train_recommendations.py
│   └── run_all_training.py
├── data/                       # Local training datasets (12-month synthetic telemetry)
├── tests/                      # Pytest unit & integration test suite
│   ├── test_features.py
│   ├── test_models.py
│   └── test_api.py
├── requirements.txt            # Pinned dependencies
└── README.md
```

---

## 1. Virtual Environment Setup

Ensure Python 3.10+ (tested through Python 3.14) is installed.

```bash
# Create virtual environment
python -m venv venv

# Activate on Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Activate on Linux/macOS:
source venv/bin/activate
```

---

## 2. Installation

Install all required dependencies:

```bash
pip install -r requirements.txt
```

Verify the environment:
```bash
python -c "import fastapi, sklearn, pandas, joblib; print('All core ML packages ready!')"
```

---

## 3. Dataset Preparation

If training datasets need to be regenerated from raw transactions:

```bash
# Generate base synthetic transactions & scenarios (from data_generator directory)
python ../data_generator/generator.py

# Build derived ML training datasets (Task 1 to 4)
python ../data_generator/build_ml_training_datasets.py

# Copy datasets into ai-service/data/
# Windows:
Copy-Item -Path ..\data_generator\ml_data\* -Destination data\ -Force
# Linux/macOS:
cp ../data_generator/ml_data/* data/
```

Datasets available in `data/`:
- `task1_customer_segmentation.csv` (9,616 rows, stratified split)
- `task2_sales_forecasting.csv` (18,200 rows, chronological split)
- `task3_anomaly_detection.csv` (68,844 rows, hourly telemetry with injected slumps)
- `task4_recommendation_ranking.csv` (120 campaign intervention outcomes)

---

## 4. Model Training & Versioning

Train all 4 models and export artifacts to `app/models/`:

```bash
python training/run_all_training.py
```

This generates:
- `app/models/segmentation_v1.joblib` (StandardScaler + KMeans k=5)
- `app/models/forecasting_v1.joblib` (StandardScaler + Ridge Regression + Residual Variance)
- `app/models/anomaly_v1.joblib` (IsolationForest + Statistical Z-Score Thresholds)
- `app/models/recommendation_v1.joblib` (Empirical Lift Pipeline + Action Catalog)
- `app/models/model_metadata.json` (Tracks version `v1.0.0`, training timestamps, and performance metrics)

---

## 5. Starting the FastAPI Service

Start the FastAPI application with auto-reload:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI Swagger UI will be live at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 6. Testing Endpoints

### Run Automated Test Suite
```bash
pytest tests/ -v
```
All 18 tests cover feature extraction, model inference, validation errors, and API contracts.

---

### Manual cURL Verification

#### 1. RFM Customer Segmentation (`POST /ai/segment-customers`)
```bash
curl -X POST "http://localhost:8000/ai/segment-customers" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "m-001",
    "customers": [
      {
        "customer_id": "c-001",
        "recency_days": 8.0,
        "frequency": 14,
        "monetary_value": 7800.0,
        "avg_order_value": 557.0
      },
      {
        "customer_id": "c-002",
        "recency_days": 82.0,
        "frequency": 2,
        "monetary_value": 350.0,
        "avg_order_value": 175.0
      }
    ]
  }'
```

#### 2. Sales Forecasting (`POST /ai/forecast-sales`)
```bash
curl -X POST "http://localhost:8000/ai/forecast-sales" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "m-001",
    "horizon_days": 7
  }'
```

#### 3. Anomaly Detection (`POST /ai/detect-anomalies`)
```bash
curl -X POST "http://localhost:8000/ai/detect-anomalies" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "m-001"
  }'
```

#### 4. Growth Recommendations (`POST /ai/recommendations`)
```bash
curl -X POST "http://localhost:8000/ai/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "m-001"
  }'
```

*Response follows exact requested structure:*
```json
{
  "merchant_id": "m-001",
  "problem": "Acute Evening Sales Slump: Revenue plunged 38.0% during 17:00 - 21:30 Daily",
  "evidence": [
    "Evening revenue dropped by 38.0% relative to 4-week moving average baseline",
    "Recorded 5 continuous hours below the 2.0-sigma expected demand boundary",
    "Footfall loss identified between 17:00 and 21:00 due to nearby competitor tea combos",
    "Regular commuter retention decreased by 31.4% during peak evening tea hours"
  ],
  "recommended_action": "Launch Evening Happy Hour 20% Combo Deal (Chai + Snack combo) between 5:00 PM and 8:00 PM",
  "estimated_impact": {
    "revenue_change_percent": 18.5,
    "transaction_change_percent": 24.1
  },
  "confidence": 0.88
}
```

#### 5. What-If Scenario Simulation (`POST /ai/simulate`)
```bash
curl -X POST "http://localhost:8000/ai/simulate" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "m-001",
    "action": "evening offer",
    "discount_percentage": 20.0,
    "duration": 14,
    "target_customer_segment": "At Risk",
    "expected_campaign_reach": 500,
    "budget": 1000.0
  }'
```

*Response structure:*
```json
{
  "baseline": {
    "revenue": 127736.4,
    "transactions": 1088,
    "customers": 194
  },
  "scenario": {
    "revenue": 149244.96,
    "transactions": 1589,
    "customers": 225
  },
  "incremental": {
    "revenue": 21508.56,
    "transactions": 501
  },
  "confidence": 0.91,
  "disclaimer": "Simulated revenue, transactions, and customer metrics are forward-looking statistical estimates and do not guarantee future actual revenue.",
  "simulation_notes": [
    "Simulated transactions are predicted to shift from 1,088 to 1,589 (+46.1% volume response).",
    "Estimated revenue is projected at INR 149,244.96, representing a simulated incremental change of INR +21,508.56.",
    "Predicted customer participation spans approximately 225 unique shoppers (vs. 194 baseline).",
    "Scenario confidence is estimated at 91% based on historical response patterns for the 'evening offer' intervention."
  ]
}
```

#### 6. Root-Cause Analysis (`POST /ai/root-cause-analysis`)
```bash
curl -X POST "http://localhost:8000/ai/root-cause-analysis" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "m-001",
    "current_period": {
      "start_date": "2026-08-01",
      "end_date": "2026-08-31",
      "label": "August 2026"
    },
    "comparison_period": {
      "start_date": "2026-07-01",
      "end_date": "2026-07-31",
      "label": "July 2026"
    }
  }'
```

*Response structure:*
```json
{
  "merchant_id": "m-001",
  "overall_change": -11.4,
  "direction": "down",
  "contributors": [
    {
      "factor": "Evening transactions",
      "change_percent": -31.8,
      "contribution": "high"
    },
    {
      "factor": "Repeat customer frequency",
      "change_percent": -14.2,
      "contribution": "high"
    },
    {
      "factor": "Weekend transactions",
      "change_percent": -9.1,
      "contribution": "medium"
    }
  ],
  "recommended_actions": [
    "Launch an Evening Happy Hour combo deal (Chai + Snack combo) between 5:00 PM and 8:00 PM with 20% promotional discount.",
    "Send automated WhatsApp/Paytm cashback alerts (₹30 off ₹150+) to re-engage dormant regulars.",
    "Introduce weekend bonus loyalty points on Paytm Soundbox QR payments."
  ],
  "explanation": {
    "observed_facts": [
      "Total sales moved by -11.4% from INR 52,400 to INR 46,426 between the two periods.",
      "Transaction count shifted by -14.8% (860 -> 733 transactions).",
      "Average order value (AOV) held steady at INR 58.",
      "Customer retention tracking identified 312 regular customers who transacted in the prior period but were dormant in the current period."
    ],
    "inferred_contributors": [
      "Observational variance attribution ranks 'Evening transactions' as a high-impact driver, exhibiting a -31.8% shift.",
      "Observational variance attribution ranks 'Repeat customer frequency' as a high-impact driver, exhibiting a -14.2% shift."
    ],
    "recommendations": [
      "Launch an Evening Happy Hour combo deal between 5:00 PM and 8:00 PM.",
      "Re-engage dormant customers with targeted ₹30 cashback."
    ],
    "causality_disclaimer": "Attributions are based on observational telemetry variance decomposition and correlation; they do not establish unconfounded counterfactual causality."
  }
}
```

---

## 7. Model Versioning & Governance

- All model artifacts are serialized using `joblib` with versioning prefixes (e.g., `segmentation_v1.joblib`).
- Metadata is tracked centrally in `app/models/model_metadata.json`, accessible via `GET /models/metadata`.
- **Zero Metric Fabrication & Methodological Honesty**: Every metric is calculated from actual telemetry features. Causal claims are restricted to verified observational variance decomposition with explicit statistical disclaimer.

