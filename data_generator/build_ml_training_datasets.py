"""
Merchant Growth AI - Production ML Training Datasets Builder
============================================================
Builds the 4 primary machine learning training datasets:
1. Task 1: Customer Segmentation (RFM + Behavior features, Unsupervised & Clusters)
2. Task 2: Sales Forecasting (Daily merchant-level time-series with lag features, Chronological split)
3. Task 3: Anomaly Detection (Hourly time-series with rolling stats, Z-scores, and scenario ground-truth)
4. Task 4: Recommendation Ranking (Merchant context + Candidate actions, Rank targets, Observational disclaimer)

Strict Engineering Principles:
- No data leakage across temporal boundaries
- Chronological train/val/test splits for time-series tasks
- Feature engineering strictly backwards-looking
- Explicit documentation of observational vs causal status
"""

import os
import datetime
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
ML_DATA_DIR = os.path.join(BASE_DIR, "ml_data")
os.makedirs(ML_DATA_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------
def load_base_data():
    print("Loading base synthetic relational datasets...")
    merchants = pd.read_csv(os.path.join(DATA_DIR, "merchants.csv"))
    customers = pd.read_csv(os.path.join(DATA_DIR, "customers.csv"))
    products = pd.read_csv(os.path.join(DATA_DIR, "products.csv"))
    transactions = pd.read_csv(os.path.join(DATA_DIR, "transactions.csv"))
    campaigns = pd.read_csv(os.path.join(DATA_DIR, "campaigns.csv"))
    campaign_results = pd.read_csv(os.path.join(DATA_DIR, "campaign_results.csv"))

    transactions["timestamp_dt"] = pd.to_datetime(transactions["timestamp"])
    transactions["date"] = transactions["timestamp_dt"].dt.date
    transactions["hour"] = transactions["timestamp_dt"].dt.hour
    return merchants, customers, products, transactions, campaigns, campaign_results

# -----------------------------------------------------------------------------
# TASK 1: Customer Segmentation Dataset
# -----------------------------------------------------------------------------
def build_task1_segmentation(customers, transactions, products):
    print("\n[Task 1] Building Customer Segmentation Dataset...")
    
    # Restrict to successful transactions
    success_tx = transactions[transactions["status"] == "SUCCESS"].copy()
    success_tx = success_tx.merge(products[["product_id", "category"]], on="product_id", how="left")
    
    # Snapshot reference date: max transaction date
    snapshot_date = success_tx["timestamp_dt"].max()

    # Time-of-day bucket
    def categorize_time_of_day(hour):
        if 6 <= hour < 12:
            return "MORNING"
        elif 12 <= hour < 16:
            return "LUNCH"
        elif 16 <= hour < 21:
            return "EVENING"
        else:
            return "NIGHT"
    
    success_tx["time_of_day"] = success_tx["hour"].apply(categorize_time_of_day)
    success_tx["is_weekend"] = success_tx["timestamp_dt"].dt.weekday >= 5

    # Group by customer & merchant
    grouped = success_tx.groupby(["customer_id", "merchant_id"])

    # 1. Base RFM metrics
    rfm_df = grouped.agg(
        recency_days=("timestamp_dt", lambda x: (snapshot_date - x.max()).days),
        frequency=("transaction_id", "count"),
        monetary_value=("total_amount", "sum"),
        avg_order_value=("total_amount", "mean"),
        min_order_value=("total_amount", "min"),
        max_order_value=("total_amount", "max"),
        first_transaction=("timestamp_dt", "min"),
        last_transaction=("timestamp_dt", "max"),
        distinct_products_bought=("product_id", "nunique"),
        distinct_categories_bought=("category", "nunique"),
        weekend_tx_count=("is_weekend", "sum")
    ).reset_index()

    # 2. Advanced Feature Engineering
    rfm_df["customer_tenure_days"] = (snapshot_date - rfm_df["first_transaction"]).dt.days
    # Average purchase interval (days)
    rfm_df["avg_purchase_interval_days"] = np.where(
        rfm_df["frequency"] > 1,
        (rfm_df["customer_tenure_days"] - rfm_df["recency_days"]) / np.maximum(1, rfm_df["frequency"] - 1),
        rfm_df["customer_tenure_days"]
    ).round(1)

    rfm_df["weekend_tx_ratio"] = (rfm_df["weekend_tx_count"] / rfm_df["frequency"]).round(3)
    rfm_df["monetary_value"] = rfm_df["monetary_value"].round(2)
    rfm_df["avg_order_value"] = rfm_df["avg_order_value"].round(2)

    # 3. Preferred shopping time share (Evening share specifically valuable for F&B detection)
    evening_counts = success_tx[success_tx["time_of_day"] == "EVENING"].groupby(["customer_id", "merchant_id"])["transaction_id"].count().reset_index(name="evening_tx_count")
    rfm_df = rfm_df.merge(evening_counts, on=["customer_id", "merchant_id"], how="left")
    rfm_df["evening_tx_count"] = rfm_df["evening_tx_count"].fillna(0).astype(int)
    rfm_df["evening_tx_ratio"] = (rfm_df["evening_tx_count"] / rfm_df["frequency"]).round(3)

    # 4. Target Customer Segment Label (Ground Truth for supervised evaluation / validation)
    # Rules:
    # LOYAL: F >= 15 and R <= 14 (High frequency, high recency)
    # REGULAR: F >= 4 and R <= 30
    # AT_RISK: F >= 4 and R between 31 and 60 (Past frequent, drifting)
    # INACTIVE: R > 60 or (F >= 3 and R > 45)
    # NEW: F <= 3 and R <= 30
    def assign_segment(row):
        r = row["recency_days"]
        f = row["frequency"]
        if f >= 15 and r <= 14:
            return "LOYAL"
        elif f >= 4 and r <= 30:
            return "REGULAR"
        elif f >= 4 and 30 < r <= 60:
            return "AT_RISK"
        elif r > 60 or (f >= 3 and r > 45):
            return "INACTIVE"
        else:
            return "NEW"

    rfm_df["target_segment"] = rfm_df.apply(assign_segment, axis=1)

    # Churn Risk Probability Score (0.00 to 100.00)
    rfm_df["churn_risk_score"] = np.clip(
        (rfm_df["recency_days"] / (rfm_df["customer_tenure_days"] + 1.0)) * 75.0 +
        np.maximum(0, (rfm_df["recency_days"] - rfm_df["avg_purchase_interval_days"]) * 1.5),
        0.0, 100.0
    ).round(2)

    # 5. Train / Validation / Test Split (Customer-level stratified split: 70% Train, 15% Val, 15% Test)
    np.random.seed(42)
    shuffled_idx = np.random.permutation(len(rfm_df))
    train_end = int(0.70 * len(rfm_df))
    val_end = int(0.85 * len(rfm_df))

    split = np.empty(len(rfm_df), dtype=object)
    split[shuffled_idx[:train_end]] = "TRAIN"
    split[shuffled_idx[train_end:val_end]] = "VALIDATION"
    split[shuffled_idx[val_end:]] = "TEST"
    rfm_df["split"] = split

    # Drop temporary datetime objects
    rfm_df = rfm_df.drop(columns=["first_transaction", "last_transaction", "weekend_tx_count", "evening_tx_count"])

    out_path = os.path.join(ML_DATA_DIR, "task1_customer_segmentation.csv")
    rfm_df.to_csv(out_path, index=False)
    print(f"Task 1 Dataset written to {out_path} ({len(rfm_df)} rows, {rfm_df.shape[1]} columns)")
    return rfm_df

# -----------------------------------------------------------------------------
# TASK 2: Sales Forecasting Dataset (Daily Merchant-Level Time Series)
# -----------------------------------------------------------------------------
def build_task2_forecasting(merchants, transactions, campaigns):
    print("\n[Task 2] Building Sales Forecasting Dataset...")
    
    # 1. Base daily aggregation per merchant
    success_tx = transactions[transactions["status"] == "SUCCESS"].copy()
    
    daily_sales = success_tx.groupby(["merchant_id", "date"]).agg(
        revenue=("total_amount", "sum"),
        transaction_count=("transaction_id", "count"),
        unique_customers=("customer_id", "nunique"),
        avg_ticket_size=("total_amount", "mean")
    ).reset_index()

    daily_sales["revenue"] = daily_sales["revenue"].round(2)
    daily_sales["avg_ticket_size"] = daily_sales["avg_ticket_size"].round(2)

    # Generate full calendar grid to ensure no missing days
    all_merchants = merchants["merchant_id"].unique()
    all_dates = pd.date_range(start=daily_sales["date"].min(), end=daily_sales["date"].max(), freq="D").date
    grid = pd.MultiIndex.from_product([all_merchants, all_dates], names=["merchant_id", "date"]).to_frame().reset_index(drop=True)

    df_merged = grid.merge(daily_sales, on=["merchant_id", "date"], how="left").fillna({
        "revenue": 0.0,
        "transaction_count": 0,
        "unique_customers": 0,
        "avg_ticket_size": 0.0
    })

    df_merged = df_merged.merge(merchants[["merchant_id", "category", "business_size"]], on="merchant_id", how="left")
    df_merged["date_dt"] = pd.to_datetime(df_merged["date"])
    df_merged = df_merged.sort_values(by=["merchant_id", "date_dt"]).reset_index(drop=True)

    # 2. Calendar Features
    df_merged["day_of_week"] = df_merged["date_dt"].dt.day_name()
    df_merged["day_of_week_num"] = df_merged["date_dt"].dt.weekday
    df_merged["month"] = df_merged["date_dt"].dt.month
    df_merged["day_of_month"] = df_merged["date_dt"].dt.day
    df_merged["is_weekend"] = (df_merged["day_of_week_num"] >= 5).astype(int)

    # Cyclical encodings for day of week and month
    df_merged["dow_sin"] = np.sin(2 * np.pi * df_merged["day_of_week_num"] / 7.0).round(4)
    df_merged["dow_cos"] = np.cos(2 * np.pi * df_merged["day_of_week_num"] / 7.0).round(4)
    df_merged["month_sin"] = np.sin(2 * np.pi * df_merged["month"] / 12.0).round(4)
    df_merged["month_cos"] = np.cos(2 * np.pi * df_merged["month"] / 12.0).round(4)

    # Indian Festival Indicator
    indian_festival_dates = {
        datetime.date(2025, 10, 20), datetime.date(2025, 10, 21), datetime.date(2025, 10, 22),
        datetime.date(2025, 12, 25), datetime.date(2025, 12, 31), datetime.date(2026, 1, 1),
        datetime.date(2026, 1, 14), datetime.date(2026, 3, 4), datetime.date(2026, 3, 20),
        datetime.date(2026, 8, 15), datetime.date(2026, 8, 28)
    }
    df_merged["is_holiday_festival"] = df_merged["date"].apply(lambda d: 1 if d in indian_festival_dates else 0)

    # 3. Active Campaign Indicator (Strictly checking if date falls between start and end)
    campaigns["start_dt"] = pd.to_datetime(campaigns["start_date"]).dt.date
    campaigns["end_dt"] = pd.to_datetime(campaigns["end_date"]).dt.date

    def check_active_campaign(row):
        mid = row["merchant_id"]
        dt = row["date"]
        active = campaigns[(campaigns["merchant_id"] == mid) & (campaigns["start_dt"] <= dt) & (dt <= campaigns["end_dt"])]
        return 1 if len(active) > 0 else 0

    df_merged["has_active_campaign"] = df_merged.apply(check_active_campaign, axis=1)

    # 4. Lag Features & Rolling Averages (Strictly Backwards-Looking - Zero Leakage)
    grouped_m = df_merged.groupby("merchant_id")

    df_merged["lag_1_revenue"] = grouped_m["revenue"].shift(1).fillna(0.0).round(2)
    df_merged["lag_2_revenue"] = grouped_m["revenue"].shift(2).fillna(0.0).round(2)
    df_merged["lag_7_revenue"] = grouped_m["revenue"].shift(7).fillna(0.0).round(2)  # Same day last week
    df_merged["lag_14_revenue"] = grouped_m["revenue"].shift(14).fillna(0.0).round(2) # Same day two weeks ago

    df_merged["lag_1_transactions"] = grouped_m["transaction_count"].shift(1).fillna(0).astype(int)
    df_merged["lag_7_transactions"] = grouped_m["transaction_count"].shift(7).fillna(0).astype(int)
    df_merged["lag_1_aov"] = grouped_m["avg_ticket_size"].shift(1).fillna(0.0).round(2)

    # Rolling backward means (shifted by 1 so current day is NOT included in rolling stats)
    df_merged["rolling_7_revenue_mean"] = grouped_m["revenue"].transform(lambda x: x.shift(1).rolling(7, min_periods=1).mean()).fillna(0.0).round(2)
    df_merged["rolling_7_revenue_std"] = grouped_m["revenue"].transform(lambda x: x.shift(1).rolling(7, min_periods=1).std()).fillna(0.0).round(2)
    df_merged["rolling_30_revenue_mean"] = grouped_m["revenue"].transform(lambda x: x.shift(1).rolling(30, min_periods=1).mean()).fillna(0.0).round(2)

    # 5. Target / Output: Next-Day Revenue (T+1) and Next-7-Day Revenue Total
    df_merged["target_revenue_next_day"] = grouped_m["revenue"].shift(-1)
    df_merged["target_revenue_next_7d"] = grouped_m["revenue"].transform(lambda x: x.iloc[::-1].rolling(7, min_periods=1).sum().iloc[::-1].shift(-1)).round(2)

    # Drop rows without target (last 7 days of 12-month span)
    forecasting_df = df_merged.dropna(subset=["target_revenue_next_day"]).copy()

    # 6. Chronological Train / Validation / Test Split (Time-series strict rule)
    # Train: Months 1 to 8 (2025-09-18 to 2026-05-15) (~65% of days)
    # Validation: Months 9 to 10 (2026-05-16 to 2026-07-15) (~18% of days)
    # Test: Months 11 to 12 (2026-07-16 to 2026-09-10) (~17% of days)
    train_cutoff = datetime.date(2026, 5, 15)
    val_cutoff = datetime.date(2026, 7, 15)

    def assign_chronological_split(d):
        if d <= train_cutoff:
            return "TRAIN"
        elif d <= val_cutoff:
            return "VALIDATION"
        else:
            return "TEST"

    forecasting_df["split"] = forecasting_df["date"].apply(assign_chronological_split)
    forecasting_df = forecasting_df.drop(columns=["date_dt"])

    out_path = os.path.join(ML_DATA_DIR, "task2_sales_forecasting.csv")
    forecasting_df.to_csv(out_path, index=False)
    print(f"Task 2 Dataset written to {out_path} ({len(forecasting_df)} rows, {forecasting_df.shape[1]} columns)")
    return forecasting_df

# -----------------------------------------------------------------------------
# TASK 3: Sales Anomaly Detection Dataset (Hourly Merchant-Level Telemetry)
# -----------------------------------------------------------------------------
def build_task3_anomaly_detection(merchants, transactions):
    print("\n[Task 3] Building Anomaly Detection Dataset...")
    
    # Flag anomalies from odd-hours or price spikes if is_anomaly column not in base CSV
    if "is_anomaly" not in transactions.columns:
        transactions["is_anomaly"] = (transactions["total_amount"] > 3500) | (transactions["hour"].isin([2, 3, 4]))

    hourly = transactions.groupby(["merchant_id", "date", "hour"]).agg(
        transactions_count=("transaction_id", "count"),
        total_revenue=("total_amount", "sum"),
        avg_order_value=("total_amount", "mean"),
        refund_count=("status", lambda x: (x == "REFUNDED").sum()),
        injected_anomaly_count=("is_anomaly", "sum")
    ).reset_index()

    hourly["total_revenue"] = hourly["total_revenue"].round(2)
    hourly["avg_order_value"] = hourly["avg_order_value"].round(2)

    hourly["date_dt"] = pd.to_datetime(hourly["date"])
    hourly["day_of_week"] = hourly["date_dt"].dt.day_name()
    hourly["day_of_week_num"] = hourly["date_dt"].dt.weekday
    hourly["is_weekend"] = (hourly["day_of_week_num"] >= 5).astype(int)

    # Sort chronological per merchant
    hourly = hourly.sort_values(by=["merchant_id", "date_dt", "hour"]).reset_index(drop=True)
    grouped_m = hourly.groupby("merchant_id")

    # Rolling statistics: Backward-looking 24 hours
    hourly["rolling_24h_tx_mean"] = grouped_m["transactions_count"].transform(lambda x: x.shift(1).rolling(24, min_periods=1).mean()).fillna(1.0).round(2)
    hourly["rolling_24h_tx_std"] = grouped_m["transactions_count"].transform(lambda x: x.shift(1).rolling(24, min_periods=1).std()).fillna(1.0).round(2)
    hourly["rolling_24h_rev_mean"] = grouped_m["total_revenue"].transform(lambda x: x.shift(1).rolling(24, min_periods=1).mean()).fillna(1.0).round(2)
    hourly["rolling_24h_rev_std"] = grouped_m["total_revenue"].transform(lambda x: x.shift(1).rolling(24, min_periods=1).std()).fillna(1.0).round(2)

    # Z-scores
    hourly["z_score_tx"] = ((hourly["transactions_count"] - hourly["rolling_24h_tx_mean"]) / hourly["rolling_24h_tx_std"].replace(0, 1.0)).round(2)
    hourly["z_score_revenue"] = ((hourly["total_revenue"] - hourly["rolling_24h_rev_mean"]) / hourly["rolling_24h_rev_std"].replace(0, 1.0)).round(2)

    # Volume drop ratio vs expected
    hourly["drop_ratio_vs_expected"] = ((hourly["transactions_count"] - hourly["rolling_24h_tx_mean"]) / hourly["rolling_24h_tx_mean"].replace(0, 1.0)).round(3)

    # Ground-truth scenario anomaly tagging
    # 1. Injected transaction anomaly (e.g. price spike, 2 AM swipe)
    # 2. Sharma Tea Corner (m-001) acute 5-8 PM slump in last 45 days
    max_d = hourly["date_dt"].max()
    is_m001_slump = (
        (hourly["merchant_id"] == "m-001") &
        ((max_d - hourly["date_dt"]).dt.days <= 45) &
        (hourly["hour"].between(17, 20))
    )

    is_anomaly_ground_truth = (hourly["injected_anomaly_count"] > 0) | is_m001_slump | (hourly["z_score_tx"] < -2.5) | (hourly["z_score_revenue"] > 4.0)
    hourly["is_anomaly"] = is_anomaly_ground_truth.astype(int)

    # Anomaly type classification
    def classify_anomaly_type(row):
        if not row["is_anomaly"]:
            return "NORMAL"
        if row["drop_ratio_vs_expected"] < -0.28:
            return "SLUMP_DROP"
        elif row["z_score_revenue"] > 3.0:
            return "REVENUE_SPIKE"
        elif row["hour"] in [1, 2, 3, 4]:
            return "ODD_HOURS_ACTIVITY"
        else:
            return "VOLUME_VARIANCE"

    hourly["anomaly_type"] = hourly.apply(classify_anomaly_type, axis=1)

    # Severity Level
    def assign_severity(row):
        if not row["is_anomaly"]:
            return "NONE"
        if row["anomaly_type"] == "SLUMP_DROP" and row["merchant_id"] == "m-001":
            return "HIGH"
        elif abs(row["z_score_tx"]) > 3.5 or abs(row["z_score_revenue"]) > 4.5:
            return "CRITICAL"
        elif abs(row["z_score_tx"]) > 2.5:
            return "MEDIUM"
        else:
            return "LOW"

    hourly["severity"] = hourly.apply(assign_severity, axis=1)

    # Chronological Split
    train_cutoff = datetime.date(2026, 5, 15)
    val_cutoff = datetime.date(2026, 7, 15)

    def assign_chronological_split(d):
        if d <= train_cutoff:
            return "TRAIN"
        elif d <= val_cutoff:
            return "VALIDATION"
        else:
            return "TEST"

    hourly["split"] = hourly["date"].apply(assign_chronological_split)
    hourly = hourly.drop(columns=["date_dt", "injected_anomaly_count"])

    out_path = os.path.join(ML_DATA_DIR, "task3_anomaly_detection.csv")
    hourly.to_csv(out_path, index=False)
    print(f"Task 3 Dataset written to {out_path} ({len(hourly)} rows, {hourly.shape[1]} columns)")
    return hourly

# -----------------------------------------------------------------------------
# TASK 4: Recommendation Ranking Dataset
# -----------------------------------------------------------------------------
def build_task4_recommendation_ranking(merchants, campaigns, campaign_results):
    print("\n[Task 4] Building Recommendation Ranking Dataset...")

    # Join campaign execution records with results and merchant baseline context
    joined = campaigns.merge(campaign_results, on=["campaign_id", "merchant_id"]).merge(
        merchants[["merchant_id", "category", "business_size", "location"]], on="merchant_id"
    )

    joined["start_dt"] = pd.to_datetime(joined["start_date"])
    joined["end_dt"] = pd.to_datetime(joined["end_date"])
    joined["duration_days"] = (joined["end_dt"] - joined["start_dt"]).dt.days

    # Features describing the merchant's operational context at decision time:
    rec_df = pd.DataFrame({
        "campaign_id": joined["campaign_id"],
        "merchant_id": joined["merchant_id"],
        "merchant_category": joined["category"],
        "merchant_size": joined["business_size"],
        # Candidate action features:
        "candidate_action_type": joined["campaign_type"],
        "target_segment": joined["target_segment"],
        "discount_type": joined["discount_type"],
        "discount_value": joined["discount"],
        "proposed_budget": joined["budget"],
        "campaign_duration_days": joined["duration_days"],
        "channel": joined["channel"],
        # Pre-campaign merchant situation features (Baseline):
        "baseline_revenue_before": joined["revenue_before"],
        "baseline_transactions_before": joined["transaction_counts_before"],
        "baseline_customers_before": joined["customer_counts_before"],
        "baseline_aov": (joined["revenue_before"] / np.maximum(1, joined["transaction_counts_before"])).round(2),
        # Historical outcome targets:
        "observed_lift_percent": joined["actual_lift_percent"],
        "observed_revenue_after": joined["revenue_during_after"],
        "observed_roi": joined["roi"],
        "is_positive_growth": joined["is_successful"].astype(int),
        # Continuous recommendation ranking score (0.0 to 100.0) based on normalized ROI & lift
        "recommendation_score": np.clip(
            (joined["actual_lift_percent"] * 2.0) + (joined["roi"] * 5.0) + 20.0,
            0.0, 100.0
        ).round(2),
        # Explicit Observational / Non-Causal Attribution Notice
        "is_observational_estimate": True,
        "causal_guarantee_disclaimer": "Observational outcome; represents correlational recommendation estimate."
    })

    # Group-stratified train/val/test split by merchant_id
    # Ensures the recommendation ranker is evaluated on completely unseen merchants!
    unique_merchants = rec_df["merchant_id"].unique()
    np.random.seed(42)
    shuffled_m = np.random.permutation(unique_merchants)
    train_m = set(shuffled_m[:int(0.70 * len(shuffled_m))])
    val_m = set(shuffled_m[int(0.70 * len(shuffled_m)):int(0.85 * len(shuffled_m))])

    def assign_merchant_split(mid):
        if mid in train_m:
            return "TRAIN"
        elif mid in val_m:
            return "VALIDATION"
        else:
            return "TEST"

    rec_df["split"] = rec_df["merchant_id"].apply(assign_merchant_split)

    out_path = os.path.join(ML_DATA_DIR, "task4_recommendation_ranking.csv")
    rec_df.to_csv(out_path, index=False)
    print(f"Task 4 Dataset written to {out_path} ({len(rec_df)} rows, {rec_df.shape[1]} columns)")
    return rec_df

# -----------------------------------------------------------------------------
# Main Runner
# -----------------------------------------------------------------------------
def main():
    print("="*75)
    print("STARTING ML TRAINING DATASET GENERATION PIPELINE")
    print("="*75)

    merchants, customers, products, transactions, campaigns, campaign_results = load_base_data()

    # Build the 4 ML Datasets
    t1_df = build_task1_segmentation(customers, transactions, products)
    t2_df = build_task2_forecasting(merchants, transactions, campaigns)
    t3_df = build_task3_anomaly_detection(merchants, transactions)
    t4_df = build_task4_recommendation_ranking(merchants, campaigns, campaign_results)

    print("\n" + "="*75)
    print("DATASET GENERATION COMPLETED SUCCESSFULLY!")
    print("="*75)
    print(f"1. Task 1 (Segmentation):    {len(t1_df):,} rows -> ml_data/task1_customer_segmentation.csv")
    print(f"2. Task 2 (Forecasting):     {len(t2_df):,} rows -> ml_data/task2_sales_forecasting.csv")
    print(f"3. Task 3 (Anomaly):         {len(t3_df):,} rows -> ml_data/task3_anomaly_detection.csv")
    print(f"4. Task 4 (Recommendation):  {len(t4_df):,} rows -> ml_data/task4_recommendation_ranking.csv")
    print("="*75)

if __name__ == "__main__":
    main()
