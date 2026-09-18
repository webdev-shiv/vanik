"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { SimulationOutcome } from "@/lib/types";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";

interface ComparisonChartProps {
  outcome: SimulationOutcome;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ outcome }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 bg-navy-50/50 rounded-2xl flex items-center justify-center text-xs text-navy-400">
        Loading Comparison Chart...
      </div>
    );
  }

  const chartData = [
    {
      metric: "Revenue (₹)",
      Current: outcome.baseline.revenue,
      Simulated: outcome.scenario.revenue,
    },
    {
      metric: "Orders (Volume)",
      Current: outcome.baseline.transactions * 100, // scaled for visual parity
      Simulated: outcome.scenario.transactions * 100,
      actualCurrent: outcome.baseline.transactions,
      actualSimulated: outcome.scenario.transactions,
    },
  ];

  return (
    <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 md:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-navy-900 tracking-tight">
            Visual Comparison: Baseline vs Scenario
          </h3>
          <p className="text-xs text-navy-500 mt-0.5">
            Side-by-side performance shift based on historical price elasticity
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                const isRevenue = d.metric.includes("Revenue");
                return (
                  <div className="bg-navy-900 text-white rounded-xl p-3 shadow-xl border border-navy-800 text-xs">
                    <div className="font-bold text-navy-200 mb-1.5">{d.metric}</div>
                    <div className="flex items-center justify-between gap-4 py-0.5">
                      <span className="text-navy-400">Current:</span>
                      <span className="font-mono font-bold text-white">
                        {isRevenue ? formatCurrencyINR(d.Current) : formatNumberIN(d.actualCurrent)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-0.5">
                      <span className="text-brand-cyan">Simulated:</span>
                      <span className="font-mono font-bold text-brand-cyan">
                        {isRevenue ? formatCurrencyINR(d.Simulated) : formatNumberIN(d.actualSimulated)}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: "10px", fontSize: "11px" }}
            />
            <Bar dataKey="Current" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={48} />
            <Bar dataKey="Simulated" fill="#0052cc" radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
