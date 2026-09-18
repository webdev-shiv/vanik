"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const statusData = [
  { name: "Successful", value: 1048, pct: 84, color: "#10b981" },
  { name: "Pending", value: 112, pct: 9, color: "#00b9f5" },
  { name: "Failed", value: 50, pct: 4, color: "#ef4444" },
  { name: "Refunded", value: 38, pct: 3, color: "#f59e0b" },
];

export const TransactionStatusDonut: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 bg-navy-50/50 rounded-[24px] animate-pulse flex items-center justify-center text-xs text-navy-400">
        Loading Transaction Status...
      </div>
    );
  }

  const totalTxns = statusData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 shadow-card flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-navy-900 tracking-tight">Transaction Status</h3>
          <p className="text-[11px] font-semibold text-navy-500">Real-time payment clearance health</p>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          93% Success Rate
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 my-2">
        {/* Donut Chart with Center Total */}
        <div className="h-44 w-44 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {statusData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-navy-900 text-white rounded-xl p-2.5 shadow-xl text-xs font-bold">
                      <span>{d.name}: </span>
                      <span style={{ color: d.color }}>{d.value} ({d.pct}%)</span>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-extrabold text-navy-900 leading-none">
              {totalTxns.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-navy-400 font-bold uppercase mt-0.5">Total Txns</span>
          </div>
        </div>

        {/* Status Legend Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2.5 w-full text-xs">
          {statusData.map((s) => (
            <div
              key={s.name}
              className="p-2 rounded-xl bg-navy-50/60 border border-navy-100/70 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="font-bold text-navy-800">{s.name}</span>
              </div>
              <div className="font-mono text-right">
                <span className="font-extrabold text-navy-900 mr-1">{s.value}</span>
                <span className="text-[10px] text-navy-500 font-bold">({s.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-navy-100/80 text-[11px] text-navy-500 font-semibold flex items-center justify-between">
        <span>Verified via Paytm Payment Gateway</span>
        <span className="text-emerald-600 font-bold">0 Dropouts</span>
      </div>
    </div>
  );
};
