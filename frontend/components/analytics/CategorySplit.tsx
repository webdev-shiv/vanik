"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { mockCategories } from "@/lib/mock-data";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";
import { vanikApi } from "@/lib/api";
import { PieChart as PieIcon } from "lucide-react";

interface CategorySplitProps {
  categories?: { category: string; revenue: number; percentage: number; transactions: number }[];
  merchantId?: string;
}

const CATEGORY_COLORS = [
  "#0052cc", // Paytm Deep Blue
  "#00b9f5", // Paytm Cyan
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
];

export const CategorySplit: React.FC<CategorySplitProps> = ({
  categories: initialCategories,
  merchantId = "m-001",
}) => {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(initialCategories || mockCategories);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setData(initialCategories);
    }
  }, [initialCategories]);

  useEffect(() => {
    let active = true;
    if (!initialCategories) {
      const load = async () => {
        try {
          const res = await vanikApi.getSalesAnalytics(merchantId);
          if (active && res.categories && res.categories.length > 0) {
            setData(res.categories);
          }
        } catch {
          // Keep mock
        }
      };
      load();
    }
    return () => {
      active = false;
    };
  }, [merchantId, initialCategories]);

  if (!mounted) {
    return (
      <div className="h-72 bg-navy-50/50 rounded-[24px] animate-pulse flex items-center justify-center text-xs text-navy-400">
        Loading Category Pie Chart...
      </div>
    );
  }

  const totalRevenue = data.reduce((acc, c) => acc + c.revenue, 0);

  return (
    <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-base font-bold text-navy-900 tracking-tight">Category Contribution</h3>
          <p className="text-xs font-medium text-navy-500">Gross revenue split across menu departments</p>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60 flex items-center gap-1">
          <PieIcon className="w-3 h-3 text-brand-600" />
          <span>Pie Breakdown</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-4">
        {/* Pie Chart (7 cols on md) */}
        <div className="md:col-span-6 h-64 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                cornerRadius={4}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-navy-900 text-white rounded-2xl p-3 text-xs shadow-2xl border border-navy-800 space-y-1">
                      <div className="font-bold text-navy-200">{d.category}</div>
                      <div className="text-brand-cyan font-mono font-bold">
                        Revenue: {formatCurrencyINR(d.revenue)}
                      </div>
                      <div className="text-navy-300 font-semibold">
                        Share: {d.percentage}% ({formatNumberIN(d.transactions)} orders)
                      </div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Summary Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">Total</span>
            <span className="text-sm font-extrabold text-navy-900 tracking-tight">
              {formatCurrencyINR(totalRevenue)}
            </span>
          </div>
        </div>

        {/* Legend Cards (6 cols on md) */}
        <div className="md:col-span-6 space-y-2.5">
          {data.map((cat, idx) => {
            const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
            return (
              <div
                key={cat.category}
                className="p-3 bg-navy-50/50 hover:bg-navy-50 transition-colors border border-navy-100/80 rounded-2xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-navy-900 block truncate">
                      {cat.category}
                    </span>
                    <span className="text-[10px] font-medium text-navy-400">
                      {formatNumberIN(cat.transactions)} orders
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-extrabold text-navy-900 block">
                    {formatCurrencyINR(cat.revenue)}
                  </span>
                  <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/60 inline-block mt-0.5">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
