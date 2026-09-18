"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const dayData = [
  { day: "Mon", sales: 42000, txns: 180, isPeak: false },
  { day: "Tue", sales: 38500, txns: 165, isPeak: false },
  { day: "Wed", sales: 45200, txns: 195, isPeak: false },
  { day: "Thu", sales: 49800, txns: 210, isPeak: false },
  { day: "Fri", sales: 62400, txns: 270, isPeak: true },
  { day: "Sat", sales: 78900, txns: 340, isPeak: true },
  { day: "Sun", sales: 71300, txns: 310, isPeak: true },
];

export const SalesByDayChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 bg-navy-50/50 rounded-[24px] animate-pulse flex items-center justify-center text-xs text-navy-400">
        Loading Sales by Day...
      </div>
    );
  }

  return (
    <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 shadow-card flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-navy-900 tracking-tight">Sales by Day</h3>
          <p className="text-[11px] font-semibold text-navy-500">Weekly revenue distribution & peak hours</p>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
          Weekend Surge +42%
        </span>
      </div>

      <div className="h-52 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-navy-900 text-white rounded-xl p-3 shadow-xl border border-navy-800 text-xs space-y-1">
                    <div className="font-bold text-brand-cyan">{d.day}day Sales</div>
                    <div className="font-mono font-bold text-white text-sm">
                      ₹{d.sales.toLocaleString("en-IN")}
                    </div>
                    <div className="text-navy-300 text-[11px]">{d.txns} transactions</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="sales" radius={[8, 8, 0, 0]} maxBarSize={36}>
              {dayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isPeak ? "#0052cc" : "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 mt-2 border-t border-navy-100/80 flex items-center justify-between text-[11px] text-navy-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0052cc]" />
            <span className="font-bold text-navy-700">Peak Days (Fri–Sun)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]" />
            <span>Regular Weekday</span>
          </span>
        </div>
      </div>
    </div>
  );
};
