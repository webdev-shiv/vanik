"""
Training pipeline for Hourly Telemetry Anomaly Detection.
Trains an IsolationForest model on hourly merchant transactions to flag sudden demand slumps,
odd off-peak activity, and abnormal transaction volumes.
"""
import os
import sys
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, precision_score, recall_score, f1_score

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.utils.logger import logger
from app.utils.model_registry import model_registry, MODELS_DIR

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'task3_anomaly_detection.csv'))
FEATURES = [
    'transactions_count',
    'total_revenue',
    'rolling_24h_tx_mean',
    'rolling_24h_rev_mean',
    'z_score_tx',
    'z_score_revenue',
    'drop_ratio_vs_expected'
]

def train_anomaly():
    logger.info("Starting Anomaly Detection model training...")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Training data not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    train_df = df[df['split'] == 'train'].copy()
    test_df = df[df['split'] == 'test'].copy()

    if len(train_df) == 0:
        train_df = df.copy()
        test_df = df.tail(int(len(df) * 0.2)).copy()

    X_train = train_df[FEATURES].fillna(0)
    X_test = test_df[FEATURES].fillna(0)
    y_test = test_df['is_anomaly'].astype(int)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Isolation Forest with 3% expected contamination
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.03,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_train_scaled)

    # In sklearn IsolationForest: -1 is anomaly, 1 is normal
    preds_raw = iso_forest.predict(X_test_scaled)
    preds = np.where(preds_raw == -1, 1, 0)

    prec = float(precision_score(y_test, preds, zero_division=0))
    rec = float(recall_score(y_test, preds, zero_division=0))
    f1 = float(f1_score(y_test, preds, zero_division=0))

    logger.info(f"Anomaly model trained. Test Precision: {prec:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}")

    artifact = {
        "scaler": scaler,
        "isolation_forest": iso_forest,
        "features": FEATURES,
        "threshold_z_score": -2.0,
        "threshold_drop_ratio": 0.35,
        "version": "v1.0.0"
    }

    out_file = os.path.join(MODELS_DIR, "anomaly_v1.joblib")
    joblib.dump(artifact, out_file)
    logger.info(f"Exported anomaly artifact to {out_file}")

    metrics = {
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "contamination": 0.03,
        "training_samples": len(train_df)
    }
    model_registry.register_metadata("anomaly", "v1.0.0", metrics, FEATURES)
    return metrics

if __name__ == "__main__":
    train_anomaly()
