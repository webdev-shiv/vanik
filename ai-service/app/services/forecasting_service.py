"""
Sales Forecasting Service.
Executes multi-step autoregressive sales forecasting using trained Ridge Regression
with 90% confidence intervals and trend direction indicators.
"""
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Optional

from app.utils.logger import logger
from app.utils.model_registry import model_registry
from app.features.time_series import TimeSeriesFeatureExtractor
from app.schemas.forecasting import (
    ForecastRequest,
    DailyRevenueRecord,
    DailyForecast,
    ForecastResponse,
)

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'task2_sales_forecasting.csv'))


class ForecastingService:
    def __init__(self):
        self.artifact = model_registry.load_model("forecasting", "forecasting_v1.joblib")
        self.version = self.artifact.get("version", "v1.0.0") if self.artifact else "v1.0.0"

    def forecast_sales(self, request: ForecastRequest) -> ForecastResponse:
        logger.info(f"Generating {request.horizon_days}-day sales forecast for merchant: {request.merchant_id}")

        history_records: List[float] = []
        last_date: pd.Timestamp = pd.Timestamp.now().normalize()

        if request.history and len(request.history) >= 7:
            sorted_history = sorted(request.history, key=lambda x: x.date)
            history_records = [float(h.revenue) for h in sorted_history]
            last_date = pd.to_datetime(sorted_history[-1].date)
        else:
            # Fallback to local daily sales dataset
            if os.path.exists(DATA_PATH):
                df = pd.read_csv(DATA_PATH)
                merchant_df = df[df['merchant_id'] == request.merchant_id].sort_values('date')
                if len(merchant_df) < 14:
                    merchant_df = df.tail(60).sort_values('date')
                history_records = merchant_df['revenue'].tail(30).astype(float).tolist()
                last_date = pd.to_datetime(merchant_df['date'].iloc[-1])
            else:
                # Default synthetic history
                base = 2500.0
                history_records = [base + np.sin(i / 2.0) * 400.0 for i in range(30)]

        # Multi-step autoregressive forecasting loop
        pipeline = self.artifact.get("pipeline") if self.artifact else None
        residual_std = float(self.artifact.get("residual_std", 350.0)) if self.artifact else 350.0

        daily_forecasts: List[DailyForecast] = []
        rolling_history = list(history_records)
        current_date = last_date

        dow_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        for step in range(1, request.horizon_days + 1):
            current_date += timedelta(days=1)
            date_str = current_date.strftime("%Y-%m-%d")
            dow_name = dow_names[current_date.dayofweek]

            if pipeline is not None:
                # Feature vector: lag_1, lag_2, lag_7, lag_14, lag_1_txns, rolling_7_m, rolling_7_s, rolling_30_m, is_wknd, is_holiday, dow_num
                lag_1 = float(rolling_history[-1])
                lag_2 = float(rolling_history[-2]) if len(rolling_history) >= 2 else lag_1
                lag_7 = float(rolling_history[-7]) if len(rolling_history) >= 7 else lag_1
                lag_14 = float(rolling_history[-14]) if len(rolling_history) >= 14 else lag_7
                lag_1_txns = max(1.0, lag_1 / 180.0)
                rolling_7_m = float(np.mean(rolling_history[-7:]))
                rolling_7_s = float(np.std(rolling_history[-7:])) if len(rolling_history) >= 7 else 50.0
                rolling_30_m = float(np.mean(rolling_history[-30:]))
                is_wknd = 1 if current_date.dayofweek in [5, 6] else 0
                is_holiday = 0
                dow_num = current_date.dayofweek

                feat_df = pd.DataFrame([{
                    'lag_1_revenue': lag_1,
                    'lag_2_revenue': lag_2,
                    'lag_7_revenue': lag_7,
                    'lag_14_revenue': lag_14,
                    'lag_1_transactions': lag_1_txns,
                    'rolling_7_revenue_mean': rolling_7_m,
                    'rolling_7_revenue_std': rolling_7_s,
                    'rolling_30_revenue_mean': rolling_30_m,
                    'is_weekend': is_wknd,
                    'is_holiday_festival': is_holiday,
                    'day_of_week_num': dow_num
                }])
                pred_val = float(pipeline.predict(feat_df)[0])
                pred_val = max(50.0, pred_val)
            else:
                # Naive weekly lag fallback
                pred_val = float(rolling_history[-7]) if len(rolling_history) >= 7 else float(rolling_history[-1])

            # Calibrate 90% prediction intervals (z=1.645) expanding slightly over horizon
            uncertainty = 1.645 * residual_std * np.sqrt(1.0 + 0.08 * step)
            lower_bound = max(0.0, pred_val - uncertainty)
            upper_bound = pred_val + uncertainty

            # Determine trend direction vs previous day
            prev_val = rolling_history[-1]
            diff_pct = (pred_val - prev_val) / max(1.0, prev_val)
            if diff_pct > 0.05:
                trend = "UP"
            elif diff_pct < -0.05:
                trend = "DOWN"
            else:
                trend = "STABLE"

            daily_forecasts.append(DailyForecast(
                date=date_str,
                day_of_week=dow_name,
                predicted_revenue=round(pred_val, 2),
                lower_bound_90=round(lower_bound, 2),
                upper_bound_90=round(upper_bound, 2),
                trend=trend
            ))

            rolling_history.append(pred_val)

        total_rev = sum(d.predicted_revenue for d in daily_forecasts)
        avg_rev = total_rev / len(daily_forecasts)

        return ForecastResponse(
            merchant_id=request.merchant_id,
            horizon_days=request.horizon_days,
            total_projected_revenue=round(total_rev, 2),
            avg_daily_revenue=round(avg_rev, 2),
            model_version=self.version,
            confidence_interval="90%",
            daily_forecasts=daily_forecasts
        )


forecasting_service = ForecastingService()
