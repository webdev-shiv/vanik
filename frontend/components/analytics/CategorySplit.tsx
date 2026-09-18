"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { mockCategories } from "@/lib/mock-data";
import { formatCurrencyINR } from "@/lib/utils";
import { vanikApi } from "@/lib/api";

interface CategorySplitProps {
  categories?: { category: string; revenue: number; percentage: number; transactions: number }[];
  merchantId?: string;
}

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
      <div className="h-64 bg-navy-50/50 rounded-2xl flex items-center justify-center text-xs text-navy-400">
        Loading Category Breakdown...
      </div>
    );
  }

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-5 md:p-6 shadow-card">
      <h3 className="text-base font-bold text-navy-900 tracking-tight">Category Contribution</h3>
      <p className="text-xs text-navy-500 mb-4">Gross revenue split across menu departments</p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
          >
            <XAxis
              type="number"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              dataKey="category"
              type="category"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-navy-900 text-white rounded-xl p-2.5 text-xs shadow-xl border border-navy-800">
                    <div className="font-bold">{d.category}</div>
                    <div className="text-brand-cyan mt-1">Revenue: {formatCurrencyINR(d.revenue)}</div>
                    <div className="text-navy-300">Share: {d.percentage}% ({d.transactions} txns)</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="revenue" fill="#0052cc" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
