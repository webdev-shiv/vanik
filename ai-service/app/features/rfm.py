"""
Recency, Frequency, Monetary (RFM) Feature Extractor.
Extracts customer behavioral attributes and standardizes scores for segmentation.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
import pandas as pd
import numpy as np


class RFMFeatureExtractor:
    """
    Extracts customer behavioral metrics:
    - Recency: Days since last transaction (relative to reference date)
    - Frequency: Total distinct transaction count
    - Monetary: Total monetary spend in INR
    - Average Order Value (AOV): Monetary / Frequency
    - Tenure: Days since first recorded transaction
    """

    @staticmethod
    def compute_rfm_from_transactions(
        transactions: List[Dict[str, Any]],
        reference_date: Optional[datetime] = None
    ) -> pd.DataFrame:
        if not transactions:
            return pd.DataFrame(columns=[
                "customer_id", "recency_days", "frequency",
                "monetary_total", "avg_order_value", "tenure_days"
            ])

        df = pd.DataFrame(transactions)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        if reference_date is None:
            reference_date = df["timestamp"].max()

        grouped = df.groupby("customer_id").agg(
            last_purchase=("timestamp", "max"),
            frequency=("transaction_id", "count"),
            monetary_total=("total_amount", "sum"),
            first_purchase=("timestamp", "min")
        ).reset_index()

        grouped["recency_days"] = (
            (reference_date - grouped["last_purchase"]).dt.total_seconds() / 86400.0
        ).clip(lower=0.0).round(1)

        grouped["avg_order_value"] = (
            grouped["monetary_total"] / grouped["frequency"].clip(lower=1)
        ).round(2)

        grouped["tenure_days"] = (
            (reference_date - grouped["first_purchase"]).dt.total_seconds() / 86400.0
        ).clip(lower=0.0).round(1)

        return grouped[[
            "customer_id", "recency_days", "frequency",
            "monetary_total", "avg_order_value", "tenure_days"
        ]]

    @staticmethod
    def calculate_rfm_scores(df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculates 1-5 quintile scores for Recency (inverted), Frequency, and Monetary.
        Higher is better.
        """
        res = df.copy()
        n = len(res)
        if n < 5:
            res["r_score"] = 3
            res["f_score"] = 3
            res["m_score"] = 3
            res["rfm_segment"] = "333"
            return res

        # For Recency: lower days is better -> higher score
        res["r_score"] = pd.qcut(
            res["recency_days"].rank(method="first"),
            q=5,
            labels=[5, 4, 3, 2, 1]
        ).astype(int)

        # For Frequency & Monetary: higher is better -> higher score
        res["f_score"] = pd.qcut(
            res["frequency"].rank(method="first"),
            q=5,
            labels=[1, 2, 3, 4, 5]
        ).astype(int)

        mon_col = "monetary_total" if "monetary_total" in res.columns else "monetary_value"
        if mon_col not in res.columns:
            res[mon_col] = 0.0

        res["m_score"] = pd.qcut(
            res[mon_col].rank(method="first"),
            q=5,
            labels=[1, 2, 3, 4, 5]
        ).astype(int)

        res["rfm_segment"] = (
            res["r_score"].astype(str) +
            res["f_score"].astype(str) +
            res["m_score"].astype(str)
        )
        return res

    @staticmethod
    def map_rfm_to_cohort(r: int, f: int, m: int) -> str:
        """
        Rule-based cohort mapping based on RFM quintile combinations.
        """
        if r >= 4 and f >= 4 and m >= 4:
            return "Champions"
        if f >= 3 and m >= 3 and r >= 3:
            return "Loyal Customers"
        if r >= 4 and f <= 2:
            return "New / Promising"
        if r <= 2 and f >= 3:
            return "At Risk"
        if r <= 2 and f <= 2:
            return "Dormant / Inactive"
        return "Regular Customers"
