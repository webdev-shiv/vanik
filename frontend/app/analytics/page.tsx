"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { HourlyHeatmapCard } from "@/components/dashboard/HourlyHeatmapCard";
import { ProductPerformanceTable } from "@/components/analytics/ProductPerformanceTable";
import { CategorySplit } from "@/components/analytics/CategorySplit";
import { Tabs } from "@/components/ui/Tabs";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BrainCircuit,
  Calendar,
  IndianRupee,
  ShoppingBag,
  Clock,
  Sparkles,
  ShieldAlert,
  BarChart3,
} from "lucide-react";
import { vanikApi } from "@/lib/api";
import {
  ForecastResponse,
  AnomalyDetectionResponse,
  HourlyActivityPoint,
  ProductPerformance,
  RevenueTrendPoint,
} from "@/lib/types";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [merchantId] = useState("m-001");

  // State
  const [salesSummary, setSalesSummary] = useState<{
    totalRevenue: number;
    totalTransactions: number;
    averageOrderValue: number;
    weekdayRevenue: number;
    weekendRevenue: number;
    weekendSharePercent: number;
    eveningDropPercent?: number;
    trends: RevenueTrendPoint[];
    hourly: HourlyActivityPoint[];
    categories: any[];
  } | null>(null);

  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [anomaly, setAnomaly] = useState<AnomalyDetectionResponse | null>(null);
  const [productsData, setProductsData] = useState<{
    products: ProductPerformance[];
    topSelling: ProductPerformance[];
    topDeclining: ProductPerformance[];
  } | null>(null);

  useEffect(() => {
    let active = true;
    async function loadAllAnalytics() {
      setLoading(true);
      try {
        const [salesRes, forecastRes, anomalyRes, productsRes] = await Promise.all([
          vanikApi.getSalesAnalytics(merchantId),
          vanikApi.getSalesForecast(merchantId, 7),
          vanikApi.getAnomalyDetection(merchantId),
          vanikApi.getProductAnalytics(merchantId),
        ]);

        if (active) {
          setSalesSummary(salesRes);
          setForecast(forecastRes);
          setAnomaly(anomalyRes);
          setProductsData(productsRes);
        }
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAllAnalytics();
    return () => {
      active = false;
    };
  }, [merchantId]);

  const tabs = [
    { id: "all", label: "Full Overview" },
    { id: "revenue", label: "Revenue & ML Forecast" },
    { id: "hourly", label: "Peak Time & Anomalies" },
    { id: "products", label: "Product Performance" },
  ];

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight">
                Merchant Business Analytics
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                Live Telemetry & ML
              </span>
            </div>
            <p className="text-xs md:text-sm text-navy-500 mt-1">
              Multi-dimensional analysis of revenue, basket sizes, peak hours, and machine learning diagnostics
            </p>
          </div>

          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Top KPI Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-navy-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-navy-500">Gross Sales Ledger</span>
              <IndianRupee className="w-4 h-4 text-brand-500" />
            </div>
            <div className="mt-2 text-lg md:text-xl font-extrabold text-navy-900">
              {salesSummary ? formatCurrencyINR(salesSummary.totalRevenue) : "..."}
            </div>
            <p className="text-[11px] text-navy-400 mt-1">Settled transaction volume</p>
          </div>

          <div className="bg-white border border-navy-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-navy-500">Total Transactions</span>
              <BarChart3 className="w-4 h-4 text-brand-cyan" />
            </div>
            <div className="mt-2 text-lg md:text-xl font-extrabold text-navy-900">
              {salesSummary ? formatNumberIN(salesSummary.totalTransactions) : "..."}
            </div>
            <p className="text-[11px] text-navy-400 mt-1">Successful QR & POS tickets</p>
          </div>

          <div className="bg-white border border-navy-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-navy-500">Average Ticket Size</span>
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-lg md:text-xl font-extrabold text-navy-900">
              {salesSummary ? formatCurrencyINR(salesSummary.averageOrderValue) : "..."}
            </div>
            <p className="text-[11px] text-emerald-600 mt-1">Average basket per order</p>
          </div>

          <div className="bg-white border border-navy-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-navy-500">7D ML Projected Revenue</span>
              <BrainCircuit className="w-4 h-4 text-brand-600" />
            </div>
            <div className="mt-2 text-lg md:text-xl font-extrabold text-brand-700">
              {forecast && (forecast.total_projected_revenue || forecast.totalProjectedRevenue)
                ? formatCurrencyINR(forecast.total_projected_revenue || forecast.totalProjectedRevenue || 0)
                : "..."}
            </div>
            <p className="text-[11px] text-brand-500 mt-1">
              {forecast?.confidence_interval || forecast?.confidenceInterval || "90%"} confidence band
            </p>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {(activeTab === "all" || activeTab === "revenue") && (
          <div className="space-y-6">
            <RevenueChart initialTrends={salesSummary?.trends} merchantId={merchantId} />

            {/* ML 7-Day Forecast Card */}
            <div className="bg-white border border-navy-100 rounded-2xl p-5 md:p-6 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-navy-100">
                <div>
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-brand-600" />
                    <h3 className="text-base font-bold text-navy-900 tracking-tight">
                      ML Sales Forecast Engine
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                      Ridge Regression Autoregressive Model ({forecast?.model_version || forecast?.modelVersion || "v1.0.0"})
                    </span>
                  </div>
                  <p className="text-xs text-navy-500 mt-1">
                    7-day projected forward trajectory with 90% confidence interval lower & upper error bounds
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-navy-500 font-medium">Avg Projected / Day:</span>
                  <span className="text-xs font-bold text-navy-900 bg-navy-50 px-2.5 py-1 rounded-md border border-navy-200 font-mono">
                    {forecast && (forecast.avg_daily_revenue || forecast.avgDailyRevenue)
                      ? formatCurrencyINR(forecast.avg_daily_revenue || forecast.avgDailyRevenue || 0)
                      : "..."}
                  </span>
                </div>
              </div>

              {/* Daily Forecast Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                {(forecast?.daily_forecasts || forecast?.dailyForecasts || []).map((day, idx) => {
                  const projected = day.predicted_revenue ?? day.predictedRevenue ?? 0;
                  const lower = day.lower_bound_90 ?? day.lowerBound90 ?? 0;
                  const upper = day.upper_bound_90 ?? day.upperBound90 ?? 0;
                  const dayName = day.day_of_week || day.dayOfWeek || "Day";

                  return (
                    <div
                      key={day.date || idx}
                      className="bg-navy-50/50 hover:bg-navy-50 rounded-xl p-3 border border-navy-100 transition-all text-center flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-[11px] font-semibold text-navy-500 uppercase">
                          {dayName.slice(0, 3)}
                        </div>
                        <div className="text-xs text-navy-400 font-mono mt-0.5">{day.date}</div>
                      </div>

                      <div className="my-2.5">
                        <div className="text-xs text-navy-500 font-medium">Projected</div>
                        <div className="text-sm font-extrabold text-navy-900 font-mono mt-0.5">
                          {formatCurrencyINR(projected)}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-navy-100/80 text-[10px] text-navy-500 space-y-0.5">
                        <div>
                          <span className="text-navy-400">90% Low:</span>{" "}
                          <span className="font-mono font-medium">{formatCurrencyINR(lower)}</span>
                        </div>
                        <div>
                          <span className="text-navy-400">90% High:</span>{" "}
                          <span className="font-mono font-medium">{formatCurrencyINR(upper)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-navy-400 pt-3 border-t border-navy-50 gap-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  <span>Model trained on rolling 365-day transaction seasonality and day-of-week lag indicators</span>
                </div>
                <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Status: Model Active & Calibrated
                </span>
              </div>
            </div>
          </div>
        )}

        {(activeTab === "all" || activeTab === "hourly") && (
          <div className="space-y-6">
            {/* ML Anomaly Alert Banner */}
            {anomaly && (anomaly.anomaly_detected || anomaly.anomalyDetected) && (
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-100 rounded-xl text-rose-700 shrink-0 mt-0.5">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-rose-900">
                          {anomaly.primary_issue || anomaly.primaryIssue || "Detected Demand Anomaly"}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                          ML {anomaly.model_version || anomaly.modelVersion || "v1.0.0"}
                        </span>
                      </div>
                      <p className="text-xs text-rose-700 mt-1">
                        Affected Window:{" "}
                        <span className="font-bold">
                          {anomaly.affected_window || anomaly.affectedWindow || "17:00 - 21:30 Daily"}
                        </span>{" "}
                        | Peak Drop:{" "}
                        <span className="font-extrabold text-rose-950 font-mono">
                          -{(anomaly.peak_drop_percent || anomaly.peakDropPercent || 0).toFixed(1)}%
                        </span>{" "}
                        below rolling expected baseline
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-xs font-bold text-rose-700 bg-white px-3 py-1 rounded-lg border border-rose-200 shadow-2xs">
                      {anomaly.anomaly_count || anomaly.anomalyCount || 0} Incident Windows
                    </span>
                  </div>
                </div>

                {/* Evidence Points */}
                {(anomaly.evidence_points || anomaly.evidencePoints || []).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-rose-200/60 flex flex-wrap gap-2 text-xs text-rose-800">
                    {(anomaly.evidence_points || anomaly.evidencePoints || []).map((point, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-md text-[11px] font-medium border border-rose-200/50"
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        {point}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HourlyHeatmapCard
                data={salesSummary?.hourly}
                anomalyData={anomaly || undefined}
                dropPercent={salesSummary?.eveningDropPercent}
                merchantId={merchantId}
              />
              <CategorySplit categories={salesSummary?.categories} merchantId={merchantId} />
            </div>
          </div>
        )}

        {(activeTab === "all" || activeTab === "products") && (
          <div className="space-y-6">
            <ProductPerformanceTable products={productsData?.products} merchantId={merchantId} />
          </div>
        )}
      </div>
    </AppShell>
  );
}

