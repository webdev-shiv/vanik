"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { HourlyHeatmapCard } from "@/components/dashboard/HourlyHeatmapCard";
import { ProductPerformanceTable } from "@/components/analytics/ProductPerformanceTable";
import { CategorySplit } from "@/components/analytics/CategorySplit";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
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

  const [timeframe, setTimeframe] = useState<string>("7D");

  useEffect(() => {
    let active = true;
    const initialTf = typeof window !== "undefined" ? localStorage.getItem("vanik_selected_timeframe") || "30D" : "30D";
    setTimeframe(initialTf);

    async function loadAllAnalytics(tf: string = initialTf) {
      setLoading(true);
      try {
        const [salesRes, forecastRes, anomalyRes, productsRes] = await Promise.all([
          vanikApi.getSalesAnalytics(merchantId, tf),
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

    loadAllAnalytics(initialTf);

    const handleTimeframeChange = (e: any) => {
      const newTf = e.detail?.timeframe || "30D";
      setTimeframe(newTf);
      loadAllAnalytics(newTf);
    };

    window.addEventListener("vanik_timeframe_change", handleTimeframeChange);

    return () => {
      active = false;
      window.removeEventListener("vanik_timeframe_change", handleTimeframeChange);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-navy-200/80 rounded-[28px] p-6 shadow-card">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">
                Business Analytics & Forecasting
              </h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
                Live Telemetry
              </span>
            </div>
            <p className="text-xs md:text-sm font-medium text-navy-500">
              Deep-dive metrics across sales trends, ML predictive curves, hourly slump anomalies, and SKU velocity
            </p>
          </div>

          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Top KPI Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500">Gross Sales Ledger</span>
              <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight">
              {salesSummary ? formatCurrencyINR(salesSummary.totalRevenue) : "..."}
            </div>
            <p className="text-[11px] font-medium text-navy-500 mt-1">Settled transaction volume</p>
          </div>

          <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500">Total Transactions</span>
              <div className="w-8 h-8 rounded-full bg-sky-50 text-brand-cyan flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight">
              {salesSummary ? formatNumberIN(salesSummary.totalTransactions) : "..."}
            </div>
            <p className="text-[11px] font-medium text-navy-500 mt-1">Successful QR & POS tickets</p>
          </div>

          <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500">Average Ticket Size</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight">
              {salesSummary ? formatCurrencyINR(salesSummary.averageOrderValue) : "..."}
            </div>
            <p className="text-[11px] font-semibold text-emerald-700 mt-1">Average basket per order</p>
          </div>

          <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500">7D ML Forecast</span>
              <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-xl md:text-2xl font-extrabold text-brand-700 tracking-tight">
              {forecast && (forecast.total_projected_revenue || forecast.totalProjectedRevenue)
                ? formatCurrencyINR(forecast.total_projected_revenue || forecast.totalProjectedRevenue || 0)
                : "..."}
            </div>
            <p className="text-[11px] font-semibold text-brand-600 mt-1">
              {forecast?.confidence_interval || forecast?.confidenceInterval || "90%"} confidence band
            </p>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {(activeTab === "all" || activeTab === "revenue") && (
          <div className="space-y-6">
            <RevenueChart initialTrends={salesSummary?.trends} merchantId={merchantId} />
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

