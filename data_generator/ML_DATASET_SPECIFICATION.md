# Merchant Growth AI - Machine Learning Dataset Specification

This document details the architecture, feature engineering, split methodology, and modeling strategies for the four primary machine learning tasks powering **Merchant Growth AI**.

---

## Task 1: Customer Segmentation & Churn Risk

### 1.1 Objective & Overview
Segment merchant patrons into actionable behavioral tiers to drive targeted retention offers, VIP recognition on Paytm Soundbox, and re-engagement campaigns.

### 1.2 Dataset File
- **File**: [`ml_data/task1_customer_segmentation.csv`](file:///c:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/data_generator/ml_data/task1_customer_segmentation.csv)
- **Granularity**: 1 row per `(customer_id, merchant_id)` pair (9,616 rows).

### 1.3 Schema & Feature Engineering
| Feature Name | Type | Description / Engineering Logic |
|---|---|---|
| `customer_id` | Identifier | Unique customer identifier |
| `merchant_id` | Identifier | Scoped merchant identifier |
| `recency_days` | Continuous (Int) | Days elapsed between customer's last successful transaction and snapshot date $T$ |
| `frequency` | Continuous (Int) | Total count of settled purchases within the observation window |
| `monetary_value` | Continuous (INR) | Total cumulative spend settled by the customer |
| `avg_order_value` | Continuous (INR) | Mean ticket size ($\text{monetary\_value} / \text{frequency}$) |
| `min_order_value` | Continuous (INR) | Minimum ticket size observed |
| `max_order_value` | Continuous (INR) | Maximum ticket size observed |
| `distinct_products_bought` | Integer | Count of unique SKU identifiers purchased |
| `distinct_categories_bought` | Integer | Breadth of product categories explored |
| `customer_tenure_days` | Continuous (Int) | Days elapsed since the customer's first recorded transaction |
| `avg_purchase_interval_days`| Continuous (Float)| Mean inter-visit duration: $(\text{tenure} - \text{recency}) / (\text{frequency} - 1)$ |
| `weekend_tx_ratio` | Ratio (Float) | Proportion of visits occurring on Saturday or Sunday |
| `evening_tx_ratio` | Ratio (Float) | Proportion of visits occurring during the evening commute window (16:00 – 21:00) |
| `churn_risk_score` | Score (0–100) | Probabilistic churn score derived from recency vs inter-purchase interval drift |
| `split` | Categorical | `TRAIN` (70%), `VALIDATION` (15%), `TEST` (15%) |

### 1.4 Target / Output
- **Target Label**: `target_segment` (`LOYAL`, `REGULAR`, `AT_RISK`, `INACTIVE`, `NEW`).
- **Cluster Definition**:
  - `LOYAL`: High frequency ($F \ge 15$), high recency ($R \le 14$ days).
  - `REGULAR`: Consistent visits ($F \ge 4$), recent activity ($R \le 30$ days).
  - `AT_RISK`: Historical regulars ($F \ge 4$) whose visit interval has stretched into dormancy ($30 < R \le 60$).
  - `INACTIVE`: Regulars absent for $>60$ days (or $>45$ days for past frequent patrons).
  - `NEW`: First-time walk-ins ($F \le 3, R \le 30$).

### 1.5 Train / Validation / Test Split
- **Method**: Stratified customer-level random split (70% Train, 15% Validation, 15% Test).
- **Rationale**: Preserves cohort distribution proportions across splits while evaluating cluster stability and churn predictability on held-out customers.

### 1.6 Leakage Risks
- **Temporal Leakage**: Calculating features using transactions occurring *after* the snapshot timestamp $T$.
  - *Mitigation*: Strictly filter transaction logs to $t \le T$ before aggregating RFM metrics.
- **Target Leakage**: Including future churn/retention events inside input feature aggregations.

### 1.7 Baseline Model vs Final MVP Model
- **Baseline Model**: Deterministic RFM Quantile scoring (independent 5-bin quantiles for $R, F, M$).
- **Final MVP Model**: **K-Means / Gaussian Mixture Models (GMM)** trained on log-transformed, StandardScaled RFM features ($\ln(R+1), \ln(F), \ln(M), \text{interval}, \text{evening\_ratio}$) with rule-constrained cluster boundaries.
- **Evaluation Metrics**: Silhouette Coefficient, Davies-Bouldin Index, Churn Classification AUC-ROC.

---

## Task 2: Daily Sales Forecasting

### 2.1 Objective & Overview
Forecast daily top-line merchant revenue for next-day ($T+1$) and next-week ($T+1 \dots T+7$) to alert merchants of upcoming cashflow dips and optimize inventory stock.

### 2.2 Dataset File
- **File**: [`ml_data/task2_sales_forecasting.csv`](file:///c:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/data_generator/ml_data/task2_sales_forecasting.csv)
- **Granularity**: 1 row per `(merchant_id, date)` pair (18,200 rows spanning 365 calendar days).

### 2.3 Schema & Feature Engineering
| Feature Name | Type | Description / Engineering Logic |
|---|---|---|
| `merchant_id` | Identifier | Merchant identifier |
| `date` | Date | Valuation date $T$ |
| `category` | Categorical | Merchant domain (Food & Beverage, Grocery, etc.) |
| `business_size` | Categorical | `MICRO`, `SMALL`, `MEDIUM` |
| `day_of_week` | Categorical | Monday through Sunday |
| `month` | Integer | Calendar month (1–12) |
| `day_of_month` | Integer | Day in month (1–31) |
| `is_weekend` | Binary (0/1) | Flag indicating Saturday or Sunday |
| `dow_sin`, `dow_cos` | Continuous | Cyclical trigonometric encoding of day-of-week: $\sin(2\pi d / 7)$, $\cos(2\pi d / 7)$ |
| `month_sin`, `month_cos` | Continuous | Cyclical trigonometric encoding of month: $\sin(2\pi m / 12)$, $\cos(2\pi m / 12)$ |
| `is_holiday_festival` | Binary (0/1) | Calendar flag for major Indian festivals (Diwali, Holi, Eid, Independence Day) |
| `has_active_campaign` | Binary (0/1) | Indicator if merchant had a live marketing campaign running on date $T$ |
| `lag_1_revenue` | Continuous (INR) | Revenue settled on previous day $T-1$ |
| `lag_2_revenue` | Continuous (INR) | Revenue settled on day $T-2$ |
| `lag_7_revenue` | Continuous (INR) | Revenue settled on same day last week $T-7$ (Seasonal weekly anchor) |
| `lag_14_revenue` | Continuous (INR) | Revenue settled two weeks ago $T-14$ |
| `lag_1_transactions` | Integer | Transaction count on previous day $T-1$ |
| `lag_7_transactions` | Integer | Transaction count on same day last week $T-7$ |
| `lag_1_aov` | Continuous (INR) | Average ticket size on previous day $T-1$ |
| `rolling_7_revenue_mean` | Continuous (INR) | 7-day backward-looking rolling average revenue (strictly shifted: $t-7 \dots t-1$) |
| `rolling_7_revenue_std` | Continuous (INR) | 7-day backward-looking rolling standard deviation |
| `rolling_30_revenue_mean`| Continuous (INR) | 30-day backward-looking rolling baseline revenue |
| `split` | Categorical | `TRAIN`, `VALIDATION`, `TEST` |

### 2.4 Target / Output
- **Primary Target**: `target_revenue_next_day` (Exact total revenue in INR on day $T+1$).
- **Secondary Target**: `target_revenue_next_7d` (Cumulative gross revenue across days $T+1 \dots T+7$).

### 2.5 Train / Validation / Test Split
- **Method**: **Strict Chronological Splitting** (Zero Random Shuffling).
  - `TRAIN`: September 18, 2025 to May 15, 2026 (Months 1–8, ~65% of calendar).
  - `VALIDATION`: May 16, 2026 to July 15, 2026 (Months 9–10, ~18% of calendar).
  - `TEST`: July 16, 2026 to September 10, 2026 (Months 11–12, ~17% of calendar).
- **Rationale**: Time-series models must be trained strictly on the past and evaluated on future unseen periods to prevent lookahead bias.

### 2.6 Leakage Risks
- **Contemporaneous Feature Leakage**: Using day $T$'s revenue, transactions, or AOV to predict day $T$'s or $T+1$'s target.
  - *Mitigation*: All lag features and rolling aggregations are explicitly shifted by 1 day ($shift(1)$).
- **Future Window Leakage**: Using centered rolling averages ($t-3 \dots t+3$).
  - *Mitigation*: All rolling windows are strictly backward-looking.

### 2.7 Baseline Model vs Final MVP Model
- **Baseline Model**: 7-day Seasonal Naïve Forecast ($\hat{y}_{T+1} = y_{T-6}$).
- **Final MVP Model**: **LightGBM Regressor / Ridge Regression** combining lag features, cyclical calendar transforms, and festival interaction terms.
- **Evaluation Metrics**:
  - WAPE (Weighted Absolute Percentage Error): $\frac{\sum |y - \hat{y}|}{\sum y}$
  - MAE (Mean Absolute Error in INR)
  - RMSE (Root Mean Squared Error)

---

## Task 3: Sales Anomaly & Slump Detection

### 3.1 Objective & Overview
Detect statistically significant hourly demand slumps, revenue collapse windows (such as the 5:00 PM – 8:30 PM slump for Sharma Tea Corner), and fraud/outlier spikes.

### 3.2 Dataset File
- **File**: [`ml_data/task3_anomaly_detection.csv`](file:///c:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/data_generator/ml_data/task3_anomaly_detection.csv)
- **Granularity**: 1 row per `(merchant_id, date, hour)` (68,844 rows).

### 3.3 Schema & Feature Engineering
| Feature Name | Type | Description / Engineering Logic |
|---|---|---|
| `merchant_id` | Identifier | Merchant identifier |
| `date` | Date | Operational date |
| `hour` | Integer | Hour of day (0–23) |
| `day_of_week` | Categorical | Day of week string |
| `is_weekend` | Binary (0/1) | Saturday / Sunday indicator |
| `transactions_count` | Integer | Successful transactions recorded within the hour |
| `total_revenue` | Continuous (INR) | Total volume settled within the hour |
| `avg_order_value` | Continuous (INR) | Average order value for the hour |
| `refund_count` | Integer | Total refunds processed |
| `rolling_24h_tx_mean` | Continuous | Backward-looking 24-hour rolling mean transaction count |
| `rolling_24h_tx_std` | Continuous | Backward-looking 24-hour rolling standard deviation |
| `rolling_24h_rev_mean` | Continuous | Backward-looking 24-hour rolling mean revenue |
| `rolling_24h_rev_std` | Continuous | Backward-looking 24-hour rolling standard deviation |
| `z_score_tx` | Continuous (Float) | Statistical standard score for transaction density: $(tx - \mu_{24}) / \sigma_{24}$ |
| `z_score_revenue` | Continuous (Float) | Statistical standard score for hourly revenue: $(rev - \mu_{24}) / \sigma_{24}$ |
| `drop_ratio_vs_expected` | Ratio (Float) | Percentage departure from moving baseline: $(tx - \mu_{24}) / \mu_{24}$ |
| `split` | Categorical | `TRAIN`, `VALIDATION`, `TEST` (Chronological) |

### 3.4 Target / Output
- **Primary Binary Target**: `is_anomaly` (1 if statistically anomalous slump or spike, 0 if normal).
- **Secondary Classification**: `anomaly_type` (`SLUMP_DROP`, `REVENUE_SPIKE`, `ODD_HOURS_ACTIVITY`, `NORMAL`).
- **Severity**: `NONE`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.

### 3.5 Train / Validation / Test Split
- **Method**: Chronological split across the 12-month timeline:
  - `TRAIN`: Months 1–8 ($t \le \text{2026-05-15}$).
  - `VALIDATION`: Months 9–10 ($\text{2026-05-16} \le t \le \text{2026-07-15}$).
  - `TEST`: Months 11–12 ($t > \text{2026-07-15}$), containing the acute 45-day evening slump injection for Sharma Tea Corner (`m-001`).

### 3.6 Leakage Risks
- **Rolling Window Center Leakage**: Using hours $t+1 \dots t+12$ to compute the expected baseline for hour $t$.
  - *Mitigation*: Strictly backward-looking rolling buffers ($shift(1)$).
- **Scenario Label Leakage**: Using ground-truth scenario tags (`m-001 slump`) inside feature columns.

### 3.7 Baseline Model vs Final MVP Model
- **Baseline Model**: Heuristic Business Rule Threshold ($|Z_{\text{tx}}| > 2.5$ or $\text{drop\_ratio} < -0.30$).
- **Final MVP Model**: **Isolation Forest / One-Class SVM** trained on normalized volume, AOV, and Z-scores, paired with an ensemble rule threshold for business explainability.
- **Evaluation Metrics**: Precision@K, Recall on known injected scenario windows, F1-Score, False Positive Rate (FPR) during normal peak hours.

---

## Task 4: Recommendation Ranking & Action Scoring

### 4.1 Objective & Overview
Rank candidate growth interventions (e.g. ₹49 Evening Combo vs 20% Win-back vs Weekend Family Platter) based on the merchant's current operational profile, maximizing expected incremental revenue lift and ROI.

### 4.2 Dataset File
- **File**: [`ml_data/task4_recommendation_ranking.csv`](file:///c:/Users/admin/OneDrive/Desktop/PROJECTS/paytm_hack/complete/data_generator/ml_data/task4_recommendation_ranking.csv)
- **Granularity**: 1 row per historical candidate campaign intervention across merchants (120 rows).

### 4.3 Schema & Feature Engineering
| Feature Name | Type | Description / Engineering Logic |
|---|---|---|
| `campaign_id` | Identifier | Unique campaign identifier |
| `merchant_id` | Identifier | Merchant identifier |
| `merchant_category` | Categorical | Domain (Food & Beverage, Grocery, etc.) |
| `merchant_size` | Categorical | `MICRO`, `SMALL`, `MEDIUM` |
| `candidate_action_type` | Categorical | `EVENING_REVIVAL`, `RETENTION_WINBACK`, `WEEKEND_SURGE`, `BASKET_SIZE_UPSELL`, `CUSTOM` |
| `target_segment` | Categorical | Target customer cohort |
| `discount_type` | Categorical | `FLAT` or `PERCENTAGE` |
| `discount_value` | Continuous | Discount magnitude (e.g. ₹16 flat or 15% off) |
| `proposed_budget` | Continuous (INR) | Campaign execution budget |
| `campaign_duration_days`| Integer | Duration in days (7, 10, 14, 21) |
| `channel` | Categorical | Broadcast channels |
| `baseline_revenue_before`| Continuous (INR) | Merchant's 30-day baseline revenue prior to action |
| `baseline_transactions_before`| Integer | Transaction volume prior to action |
| `baseline_customers_before`| Integer | Active customer count prior to action |
| `baseline_aov` | Continuous (INR) | Historical ticket size prior to action |
| `is_observational_estimate`| Boolean | Set to `True` (Explicit observational attribution) |
| `causal_guarantee_disclaimer`| Text | Disclaimer stating model predicts estimated association rather than causal guarantee |
| `split` | Categorical | `TRAIN`, `VALIDATION`, `TEST` (Merchant-grouped) |

### 4.4 Target / Output
- **Ranking Target**: `recommendation_score` (Continuous score 0.0 to 100.0, combining actual lift % and ROI).
- **Classification Target**: `is_positive_growth` (Binary 0/1: 1 if actual lift $\ge 10\%$ and $\text{ROI} \ge 2.0$, 0 otherwise).
- **Numerical Targets**: `observed_lift_percent` (Percentage uplift) and `observed_roi` (Financial return multiple).

### 4.5 Train / Validation / Test Split
- **Method**: **Group-Stratified Split by `merchant_id`** (70% Train merchants, 15% Validation merchants, 15% Test merchants).
- **Rationale**: Group-splitting ensures the ranking model is evaluated on completely unseen merchants, proving it learns cross-merchant business patterns rather than memorizing merchant IDs.

### 4.6 Causality & Leakage Risks
- **Observational Confounding (Crucial Principle)**:
  - Observational campaign telemetry reflects self-selection (merchants only run evening combos when evenings are down).
  - *Mitigation*: The dataset explicitly stores `is_observational_estimate = True` and disclaimers. Outputs are framed as **estimated recommendations** rather than causal guarantees.
- **Post-Outcome Leakage**: Using `revenue_during_after` or post-campaign customer counts in feature columns.
  - *Mitigation*: Only pre-campaign baseline features (`revenue_before`, `transactions_before`, `baseline_aov`) are exposed as model inputs.

### 4.7 Baseline Model vs Final MVP Model
- **Baseline Model**: Category-Average Heuristic (e.g. always rank Evening Revival highest for F&B, Weekend Surge highest for Fashion).
- **Final MVP Model**: **Gradient Boosted Ranking (LambdaMART / LightGBM Ranker)** optimizing NDCG, or **Logistic Regression / Random Forest Scorer** outputting calibrated probability of campaign success ($P(\text{lift} \ge 15\%)$) multiplied by estimated ROI.
- **Evaluation Metrics**:
  - NDCG@3 (Normalized Discounted Cumulative Gain at Top 3 recommendations)
  - Precision@1 (Top recommendation success rate)
  - Spearman Rank Correlation between predicted score and realized ROI.

---

## 5. Summary of Built Datasets

| Task | Output File | Rows | Features | Primary Target | Split Strategy |
|---|---|---|---|---|---|
| **1. Customer Segmentation** | `task1_customer_segmentation.csv` | **9,616** | 17 | `target_segment`, `churn_risk_score` | Stratified Random (70/15/15) |
| **2. Sales Forecasting** | `task2_sales_forecasting.csv` | **18,200** | 32 | `target_revenue_next_day` (INR) | Strict Chronological (65/18/17) |
| **3. Anomaly Detection** | `task3_anomaly_detection.csv` | **68,844** | 21 | `is_anomaly`, `anomaly_type` | Strict Chronological (65/18/17) |
| **4. Recommendation Ranking** | `task4_recommendation_ranking.csv` | **120** | 23 | `recommendation_score`, `is_positive_growth` | Group-Stratified by Merchant (70/15/15) |
