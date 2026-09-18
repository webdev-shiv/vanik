"""
Training pipeline for Customer RFM & Behavioral Segmentation.
Fits StandardScaler + KMeans(k=5) on customer RFM data and exports segmentation_v1.joblib.
"""
import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.utils.logger import logger
from app.utils.model_registry import model_registry, MODELS_DIR

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'task1_customer_segmentation.csv'))
FEATURES = [
    'recency_days',
    'frequency',
    'monetary_value',
    'avg_order_value',
    'customer_tenure_days',
    'weekend_tx_ratio',
    'evening_tx_ratio'
]

def train_segmentation():
    logger.info("Starting Customer Segmentation training...")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Training data not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    train_df = df[df['split'] == 'train'].copy()
    if len(train_df) == 0:
        train_df = df.copy()

    X_train = train_df[FEATURES].fillna(0)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_train)

    k = 5
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(X_scaled)

    # Compute validation metric
    sample_size = min(2000, len(X_scaled))
    sil_score = float(silhouette_score(X_scaled[:sample_size], cluster_labels[:sample_size]))
    logger.info(f"K-Means trained. Cluster silhouette score: {sil_score:.4f}")

    # Map cluster index to business cohort name using centroid RFM
    centroids = scaler.inverse_transform(kmeans.cluster_centers_)
    centroid_df = pd.DataFrame(centroids, columns=FEATURES)

    cluster_to_cohort = {}
    for i, row in centroid_df.iterrows():
        r = row['recency_days']
        f = row['frequency']
        m = row['monetary_value']
        
        if r < 30 and f >= 8 and m >= 5000:
            cohort = "Champions"
        elif r < 45 and f >= 5:
            cohort = "Loyal Customers"
        elif r < 45 and f <= 3:
            cohort = "Potential Loyalists"
        elif r >= 60 and f >= 4:
            cohort = "At Risk"
        else:
            cohort = "Dormant / Lost"
        cluster_to_cohort[i] = cohort

    # Ensure uniqueness of top labels if duplicates occur
    used = set()
    for c_id in sorted(cluster_to_cohort.keys()):
        label = cluster_to_cohort[c_id]
        if label in used:
            cluster_to_cohort[c_id] = f"{label} (Group {c_id+1})"
        used.add(cluster_to_cohort[c_id])

    pipeline = {
        "scaler": scaler,
        "kmeans": kmeans,
        "features": FEATURES,
        "cluster_to_cohort": cluster_to_cohort,
        "centroids": centroid_df.to_dict(orient="records"),
        "version": "v1.0.0"
    }

    out_file = os.path.join(MODELS_DIR, "segmentation_v1.joblib")
    joblib.dump(pipeline, out_file)
    logger.info(f"Exported trained model artifact to {out_file}")

    metrics = {
        "silhouette_score": round(sil_score, 4),
        "training_samples": len(train_df),
        "n_clusters": k,
        "cohorts": list(cluster_to_cohort.values())
    }
    model_registry.register_metadata("segmentation", "v1.0.0", metrics, FEATURES)
    return metrics

if __name__ == "__main__":
    train_segmentation()
