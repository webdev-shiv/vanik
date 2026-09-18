"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { CustomerSegment } from "@/lib/types";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";

interface CohortDistributionChartProps {
  segments?: CustomerSegment[];
}

export const CohortDistributionChart: React.FC<CohortDistributionChartProps> = ({ segments = [] }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 bg-navy-50/50 rounded-[24px] flex items-center justify-center text-xs text-navy-400">
        Loading Cohort Breakdown...
      </div>
    );
  }

  const COLORS = ["#10b981", "#0052cc", "#00b9f5", "#f59e0b", "#f43f5e"];

  const data = segments.map((s) => ({
    name: s.segmentName,
    value: s.customerCount,
    revenue: s.revenueContribution,
  }));

  return (
    <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
      <h3 className="text-base font-bold text-navy-900 tracking-tight">Customer Cohort Share</h3>
      <p className="text-xs font-medium text-navy-500 mb-2">Distribution of customer base by RFM behavior</p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-navy-900 text-white rounded-2xl p-3.5 shadow-2xl border border-navy-800 text-xs">
                    <div className="font-bold text-navy-200 mb-1">{d.name} Segment</div>
                    <div>Count: <span className="font-mono font-bold">{formatNumberIN(d.value)} customers</span></div>
                    <div>Revenue: <span className="font-mono font-bold text-brand-cyan">{formatCurrencyINR(d.revenue)}</span></div>
                  </div>
                );
              }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "11px", fontWeight: "600" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

