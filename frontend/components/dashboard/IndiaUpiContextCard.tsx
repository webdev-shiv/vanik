"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { vanikApi } from "@/lib/api";
import { UpiMarketSummary, UpiMonthlyTrendPoint } from "@/lib/types";
import { mockUpiMarketSummary } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface IndiaUpiContextCardProps {
  className?: string;
}

export const IndiaUpiContextCard: React.FC<IndiaUpiContextCardProps> = ({ className }) => {
  const [marketData, setMarketData] = useState<UpiMarketSummary>(mockUpiMarketSummary);
  const [metricView, setMetricView] = useState<"volume" | "value">("volume");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    async function loadSummary() {
      try {
        const data = await vanikApi.getUpiMarketSummary();
        if (data && data.latest) {
          setMarketData(data);
        }
      } catch {
        // Keeps mockUpiMarketSummary
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, []);

  if (!mounted) {
    return (
      <div className="h-96 bg-navy-50/50 rounded-2xl animate-pulse flex items-center justify-center text-navy-400 text-xs">
        Loading India UPI Context...
      </div>
    );
  }

  const { latest, growth, recentTrends } = marketData;

  const volBillion = latest.transactionVolumeMillion
    ? (latest.transactionVolumeMillion / 1000).toFixed(2) + "B"
    : "--";

  const valLakhCr = latest.transactionValueCrore
    ? "₹" + (latest.transactionValueCrore / 100000).toFixed(2) + "L Cr"
    : "--";

  const avgDailyVol = latest.avgDailyTransactionVolumeMillion
    ? latest.avgDailyTransactionVolumeMillion.toFixed(1) + "M / day"
    : "--";

  const avgDailyVal = latest.avgDailyTransactionValueCrore
    ? "₹" + Math.round(latest.avgDailyTransactionValueCrore).toLocaleString("en-IN") + " Cr / day"
    : "--";

  const momVol = growth.momVolumeGrowthPct;
  const yoyVol = growth.yoyVolumeGrowthPct;
  const momVal = growth.momValueGrowthPct;
  const yoyVal = growth.yoyValueGrowthPct;

  return (
    <div
      className={cn(
        "bg-white border border-navy-100/80 rounded-2xl p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all duration-200",
        className
      )}
    >
      {/* 1. Header Bar with Strict Source Tagging */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-navy-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-navy-900 tracking-tight">
                India UPI Context
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Source: NPCI
              </span>
            </div>
            <p className="text-xs text-navy-500 mt-0.5">
              Macroeconomic payment ecosystem telemetry from the National Payments Corporation of India.
            </p>
          </div>
        </div>

        {/* Chart metric toggle button */}
        <div className="flex items-center gap-1.5 p-1 bg-navy-50 rounded-xl self-start sm:self-auto border border-navy-100/50">
          <button
            onClick={() => setMetricView("volume")}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
              metricView === "volume"
                ? "bg-white text-navy-900 shadow-sm font-bold"
                : "text-navy-500 hover:text-navy-700"
            )}
          >
            Volume (Billion)
          </button>
          <button
            onClick={() => setMetricView("value")}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
              metricView === "value"
                ? "bg-white text-navy-900 shadow-sm font-bold"
                : "text-navy-500 hover:text-navy-700"
            )}
          >
            Value (Lakh Cr ₹)
          </button>
        </div>
      </div>

      {/* 2. Top Macroeconomic Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 my-5">
        {/* Latest Monthly Volume */}
        <div className="bg-navy-50/40 rounded-xl p-3.5 border border-navy-100/60 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-500">
              UPI Transactions
            </span>
            <div className="text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight mt-1">
              {volBillion}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-navy-100/50 flex items-center justify-between text-[11px]">
            <span className="text-navy-400">{latest.month}</span>
            {momVol !== null && momVol !== undefined && (
              <span
                className={cn(
                  "font-bold flex items-center gap-0.5",
                  momVol >= 0 ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {momVol >= 0 ? "+" : ""}
                {momVol}% MoM
              </span>
            )}
          </div>
        </div>

        {/* Latest Monthly Value */}
        <div className="bg-navy-50/40 rounded-xl p-3.5 border border-navy-100/60 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-500">
              Transaction Value
            </span>
            <div className="text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight mt-1 text-brand-700">
              {valLakhCr}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-navy-100/50 flex items-center justify-between text-[11px]">
            <span className="text-navy-400">Total Velocity</span>
            {momVal !== null && momVal !== undefined && (
              <span
                className={cn(
                  "font-bold flex items-center gap-0.5",
                  momVal >= 0 ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {momVal >= 0 ? "+" : ""}
                {momVal}% MoM
              </span>
            )}
          </div>
        </div>

        {/* Avg Daily Volume */}
        <div className="bg-navy-50/40 rounded-xl p-3.5 border border-navy-100/60 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-500">
              Avg. Daily Volume
            </span>
            <div className="text-lg md:text-xl font-bold text-navy-800 tracking-tight mt-1">
              {avgDailyVol}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-navy-100/50 text-[11px] text-navy-500">
            {growth.avgDailyVolumeTrend === "UP" && (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Velocity Accelerating
              </span>
            )}
            {growth.avgDailyVolumeTrend === "DOWN" && (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Daily Dip
              </span>
            )}
            {growth.avgDailyVolumeTrend === "STABLE" && <span>Stable pace</span>}
          </div>
        </div>

        {/* Avg Daily Value */}
        <div className="bg-navy-50/40 rounded-xl p-3.5 border border-navy-100/60 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-500">
              Avg. Daily Value
            </span>
            <div className="text-lg md:text-xl font-bold text-navy-800 tracking-tight mt-1">
              {avgDailyVal}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-navy-100/50 text-[11px] text-navy-500">
            <span>Per 24h cycle</span>
          </div>
        </div>

        {/* Ecosystem Banks live on UPI */}
        <div className="col-span-2 md:col-span-4 lg:col-span-1 bg-gradient-to-br from-indigo-50/50 to-navy-50/50 rounded-xl p-3.5 border border-indigo-100/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-900">
                Banks on UPI
              </span>
              <Building2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl md:text-2xl font-extrabold text-indigo-950 tracking-tight mt-1">
              {latest.banksLiveOnUpi ?? 705}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-indigo-100/60 text-[11px] text-indigo-700 font-medium flex items-center justify-between">
            <span>Live Member Banks</span>
            <span className="font-bold">NPCI Core</span>
          </div>
        </div>
      </div>

      {/* 3. Monthly Trend Chart */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-navy-700">
            UPI transaction activity over time (Last {recentTrends.length} Months)
          </span>
          {yoyVol !== null && yoyVol !== undefined && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              +{yoyVol}% YoY Growth ({growth.previousYearSameMonth ?? "1 Year"})
            </span>
          )}
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={recentTrends}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="upiVolGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="upiValGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  const parts = val.split(" ");
                  return parts[0].slice(0, 3) + " '" + parts[1].slice(-2);
                }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  metricView === "volume" ? `${val}B` : `₹${val}L`
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as UpiMonthlyTrendPoint;
                    return (
                      <div className="bg-white/95 backdrop-blur-sm border border-navy-100 rounded-xl p-3 shadow-xl text-xs space-y-1">
                        <p className="font-bold text-navy-900 border-b border-navy-50 pb-1 mb-1">
                          {data.month}
                        </p>
                        <p className="text-navy-600">
                          Volume: <strong className="text-navy-900">{data.transactionVolumeBillion}B</strong> ({data.transactionVolumeMillion.toLocaleString("en-IN")} Mn)
                        </p>
                        <p className="text-navy-600">
                          Value: <strong className="text-brand-700">₹{data.transactionValueLakhCrore}L Cr</strong> (₹{data.transactionValueCrore.toLocaleString("en-IN")} Cr)
                        </p>
                        {data.avgDailyTransactionVolumeMillion && (
                          <p className="text-navy-500 text-[11px]">
                            Daily Avg: {data.avgDailyTransactionVolumeMillion.toFixed(1)}M txns/day
                          </p>
                        )}
                        {data.banksLiveOnUpi && (
                          <p className="text-indigo-600 text-[11px] font-semibold">
                            Banks Live: {data.banksLiveOnUpi}
                          </p>
                        )}
                        <p className="text-[10px] text-navy-400 pt-1 border-t border-navy-50 mt-1">
                          Source: NPCI
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={metricView === "volume" ? "transactionVolumeBillion" : "transactionValueLakhCrore"}
                stroke={metricView === "volume" ? "#0284c7" : "#6366f1"}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={metricView === "volume" ? "url(#upiVolGradient)" : "url(#upiValGradient)"}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Strict Attribution & Architectural Separation Disclaimer */}
      <div className="mt-4 pt-3 border-t border-navy-50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-navy-400 gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-navy-600">Source Attribution:</span>
          <span>National Payments Corporation of India (NPCI)</span>
        </div>
        <div className="text-[10px] text-navy-400">
          Macroeconomic benchmark • Not mixed with merchant or customer transaction data
        </div>
      </div>
    </div>
  );
};
