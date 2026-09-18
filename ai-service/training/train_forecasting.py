"""
Training pipeline for Daily Merchant Sales Forecasting.
Trains Ridge Regression with lag and rolling features on chronological data splits.
Exports forecasting_v1.joblib and prediction interval parameters.
"""
import os
import sys
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.utils.logger import logger
from app.utils.model_registry import model_registry, MODELS_DIR

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'task2_sales_forecasting.csv'))
FEATURES = [
    'lag_1_revenue',
    'lag_2_revenue',
    'lag_7_revenue',
    'lag_14_revenue',
    'lag_1_transactions',
    'rolling_7_revenue_mean',
    'rolling_7_revenue_std',
    'rolling_30_revenue_mean',
    'is_weekend',
    'is_holiday_festival',
    'day_of_week_num'
]
TARGET = 'target_revenue_next_day'

def train_forecasting():
    logger.info("Starting Sales Forecasting model training...")
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

    model = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', Ridge(alpha=10.0, positive=False, random_state=42))
    ])

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    # Clip negative predictions since revenue is non-negative
    y_pred = np.clip(y_pred, 0, None)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))
    total_actual = float(np.sum(y_test))
    wape = float(np.sum(np.abs(y_test - y_pred)) / total_actual) if total_actual > 0 else 0.0

    residuals = y_test - y_pred
    residual_std = float(np.std(residuals))

    logger.info(f"Forecasting trained. Test MAE: INR {mae:.2f}, WAPE: {wape*100:.2f}%, R2: {r2:.4f}, Residual Std: {residual_std:.2f}")

    # Inspect coefficients for interpretability
    coefs = dict(zip(FEATURES, model.named_steps['regressor'].coef_.tolist()))

    artifact = {
        "pipeline": model,
        "features": FEATURES,
        "residual_std": residual_std,
        "feature_coefficients": coefs,
        "version": "v1.0.0"
    }

    out_file = os.path.join(MODELS_DIR, "forecasting_v1.joblib")
    joblib.dump(artifact, out_file)
    logger.info(f"Exported forecasting artifact to {out_file}")

    metrics = {
        "mae_inr": round(mae, 2),
        "rmse_inr": round(rmse, 2),
        "wape_percent": round(wape * 100, 2),
        "r2_score": round(r2, 4),
        "residual_std": round(residual_std, 2),
        "training_samples": len(train_df)
    }
    model_registry.register_metadata("forecasting", "v1.0.0", metrics, FEATURES)
    return metrics

if __name__ == "__main__":
    train_forecasting()
