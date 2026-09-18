"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";
import { RevenueTrendPoint } from "@/lib/types";
import { vanikApi } from "@/lib/api";
import {
  mockRevenueTrends7D,
  mockRevenueTrends30D,
  mockRevenueTrends90D,
  mockRevenueTrends1Y,
} from "@/lib/mock-data";

interface RevenueChartProps {
  className?: string;
  initialTrends?: RevenueTrendPoint[];
  merchantId?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  className,
  initialTrends,
  merchantId = "m-001",
}) => {
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D" | "1Y">("7D");
  const [chartData, setChartData] = useState<RevenueTrendPoint[]>(
    initialTrends && initialTrends.length > 0 ? initialTrends : mockRevenueTrends7D
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialTrends && initialTrends.length > 0 && timeframe === "7D") {
      setChartData(initialTrends);
    }
  }, [initialTrends, timeframe]);

  useEffect(() => {
    let active = true;
    async function fetchTrend() {
      try {
        const res = await vanikApi.getDashboardSummary(merchantId, timeframe);
        if (active && res.revenueTrends && res.revenueTrends.length > 0) {
          setChartData(res.revenueTrends);
        }
      } catch {
        // Fallback to local timeframe data
        if (active) {
          if (timeframe === "30D") setChartData(mockRevenueTrends30D);
          else if (timeframe === "90D") setChartData(mockRevenueTrends90D);
          else if (timeframe === "1Y") setChartData(mockRevenueTrends1Y);
          else setChartData(mockRevenueTrends7D);
        }
      }
    }
    fetchTrend();
    return () => {
      active = false;
    };
  }, [timeframe, merchantId]);

  const data = chartData;
  const totalRev = data.reduce((acc, curr) => acc + (curr.currentRevenue || 0), 0);
  const totalTxns = data.reduce((acc, curr) => acc + (curr.transactions || 0), 0);

  if (!mounted) {
    return (
      <div className="h-80 bg-navy-50/50 rounded-2xl animate-pulse flex items-center justify-center text-navy-400 text-xs">
        Loading Revenue Overview...
      </div>
    );
  }

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-5 md:p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-navy-900 tracking-tight">Revenue Overview</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
              Dual-Axis
            </span>
          </div>
          <p className="text-xs text-navy-500 mt-0.5">
            Settled volume across Paytm QR, Soundbox, and POS
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-navy-100/80 rounded-xl self-start sm:self-auto">
          {(["7D", "30D", "90D", "1Y"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-navy-600 hover:text-navy-900"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Mini metric counters */}
      <div className="flex items-center gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-brand-500" />
          <span className="text-navy-500">Revenue:</span>
          <span className="font-bold text-navy-900">{formatCurrencyINR(totalRev)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-brand-cyan" />
          <span className="text-navy-500">Transactions:</span>
          <span className="font-bold text-navy-900">{formatNumberIN(totalTxns)}</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="vanikRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0052cc" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0052cc" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="period"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            {/* Left Y Axis for Revenue */}
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
            />
            {/* Right Y Axis for Transactions */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-navy-900 text-white rounded-xl p-3 shadow-xl border border-navy-800 text-xs">
                    <div className="font-bold text-navy-200 mb-1.5">{d.period}</div>
                    <div className="flex items-center justify-between gap-4 py-0.5">
                      <span className="text-brand-300">Revenue:</span>
                      <span className="font-mono font-bold text-white">
                        {formatCurrencyINR(d.currentRevenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-0.5">
                      <span className="text-brand-cyan">Transactions:</span>
                      <span className="font-mono font-bold text-white">
                        {formatNumberIN(d.transactions)}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="currentRevenue"
              stroke="#0052cc"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#vanikRevGrad)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="transactions"
              stroke="#00b9f5"
              strokeWidth={2}
              dot={{ r: 3, fill: "#00b9f5" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
