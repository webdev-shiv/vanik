"""
Master training script for Merchant Growth AI.
Executes training for all 4 ML tasks, validates exported artifacts,
and prints the final model registry state.
"""
import os
import sys
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.utils.logger import logger
from app.utils.model_registry import model_registry, MODELS_DIR

from training.train_segmentation import train_segmentation
from training.train_forecasting import train_forecasting
from training.train_anomaly import train_anomaly
from training.train_recommendations import train_recommendations


def run_all():
    logger.info("=== STARTING COMPLETE ML TRAINING PIPELINE ===")
    os.makedirs(MODELS_DIR, exist_ok=True)

    results = {}
    
    logger.info("--> [1/4] Training Customer Segmentation...")
    results["segmentation"] = train_segmentation()

    logger.info("--> [2/4] Training Daily Sales Forecasting...")
    results["forecasting"] = train_forecasting()

    logger.info("--> [3/4] Training Anomaly Detection...")
    results["anomaly"] = train_anomaly()

    logger.info("--> [4/4] Training Recommendation Engine...")
    results["recommendations"] = train_recommendations()

    metadata = model_registry.get_metadata()
    logger.info("=== TRAINING COMPLETED SUCCESSFULLY ===")
    print("\n--- MODEL REGISTRY METADATA ---")
    print(json.dumps(metadata, indent=2))

    # Verify that all 4 model files exist
    expected_files = [
        "segmentation_v1.joblib",
        "forecasting_v1.joblib",
        "anomaly_v1.joblib",
        "recommendation_v1.joblib",
        "model_metadata.json"
    ]
    for fn in expected_files:
        fp = os.path.join(MODELS_DIR, fn)
        assert os.path.exists(fp), f"Missing expected artifact: {fp}"
        size_kb = os.path.getsize(fp) / 1024.0
        print(f"[OK] {fn} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    run_all()
