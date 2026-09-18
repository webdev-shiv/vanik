"""
Training pipeline for Merchant Growth Recommendations.
Fits an empirical lift estimator on campaign interventions to predict expected lift %,
transaction delta, and confidence scores from merchant baseline telemetry.
"""
import os
import sys
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.utils.logger import logger
from app.utils.model_registry import model_registry, MODELS_DIR

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'task4_recommendation_ranking.csv'))
FEATURES = [
    'discount_value',
    'proposed_budget',
    'campaign_duration_days',
    'baseline_revenue_before',
    'baseline_transactions_before',
    'baseline_aov'
]
TARGET = 'observed_lift_percent'

def train_recommendations():
    logger.info("Starting Recommendation lift model training...")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Training data not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    train_df = df[df['split'] == 'train'].dropna(subset=[TARGET] + FEATURES)
    test_df = df[df['split'] == 'test'].dropna(subset=[TARGET] + FEATURES)

    if len(train_df) == 0:
        train_df = df.dropna(subset=[TARGET] + FEATURES)
        test_df = train_df.tail(int(len(train_df) * 0.2))

    X_train = train_df[FEATURES]
    y_train = train_df[TARGET]
    X_test = test_df[FEATURES]
    y_test = test_df[TARGET]

    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', Ridge(alpha=5.0, random_state=42))
    ])

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred)) if len(y_test) > 1 else 0.0

    logger.info(f"Recommendation lift model trained. Test MAE: {mae:.2f}% lift, R2: {r2:.4f}")

    # Action catalog with baseline business rules and observational impact anchors
    action_catalog = [
        {
            "action_type": "EVENING_FLASH_COMBO",
            "problem_type": "EVENING_SLUMP",
            "title": "Launch Evening Happy Hour Combo (5 PM - 8 PM)",
            "discount_value": 20.0,
            "target_segment": "Regular Customers",
            "channel": "Paytm QR Push Notification",
            "duration_days": 14,
            "typical_lift_pct": 24.5,
            "typical_txn_lift_pct": 31.0,
            "base_confidence": 0.91
        },
        {
            "action_type": "DORMANT_REGULAR_CASHBACK",
            "problem_type": "CHURN_RISK",
            "title": "Target Inactive Regulars with ₹30 Cashback on ₹150+ bill",
            "discount_value": 15.0,
            "target_segment": "At Risk",
            "channel": "SMS / Paytm App Alert",
            "duration_days": 7,
            "typical_lift_pct": 14.2,
            "typical_txn_lift_pct": 18.0,
            "base_confidence": 0.86
        },
        {
            "action_type": "ORGANIC_UPSELL_BUNDLE",
            "problem_type": "BASKET_SIZE",
            "title": "Curate Healthy Morning Snack Bundles (+15% AOV)",
            "discount_value": 10.0,
            "target_segment": "Champions",
            "channel": "Counter QR Display",
            "duration_days": 21,
            "typical_lift_pct": 18.0,
            "typical_txn_lift_pct": 12.5,
            "base_confidence": 0.84
        },
        {
            "action_type": "WEEKEND_LOYALTY_BOOST",
            "problem_type": "WEEKEND_COMPETITION",
            "title": "Double Loyalty Points on Weekend UPI payments",
            "discount_value": 5.0,
            "target_segment": "Loyal Customers",
            "channel": "Paytm Soundbox Audio Prompt",
            "duration_days": 30,
            "typical_lift_pct": 9.5,
            "typical_txn_lift_pct": 15.0,
            "base_confidence": 0.89
        }
    ]

    artifact = {
        "pipeline": pipeline,
        "features": FEATURES,
        "action_catalog": action_catalog,
        "is_observational": True,
        "version": "v1.0.0"
    }

    out_file = os.path.join(MODELS_DIR, "recommendation_v1.joblib")
    joblib.dump(artifact, out_file)
    logger.info(f"Exported recommendation artifact to {out_file}")

    metrics = {
        "mae_lift_percent": round(mae, 2),
        "r2_score": round(r2, 4),
        "catalog_size": len(action_catalog),
        "training_samples": len(train_df)
    }
    model_registry.register_metadata("recommendation", "v1.0.0", metrics, FEATURES)
    return metrics

if __name__ == "__main__":
    train_recommendations()
