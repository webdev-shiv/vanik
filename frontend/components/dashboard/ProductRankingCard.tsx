"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";

interface ProductPerformanceRow {
  name: string;
  category: string;
  sales: number;
  orders: number;
  growth: number;
  percentageWidth: number;
}

const topProductsData: ProductPerformanceRow[] = [
  {
    name: "Special Masala Chai & Ginger Combo",
    category: "Beverages",
    sales: 480000,
    orders: 342,
    growth: 18,
    percentageWidth: 100,
  },
  {
    name: "Paneer Samosa & Chutney Platter",
    category: "Snacks",
    sales: 390000,
    orders: 287,
    growth: 12,
    percentageWidth: 81,
  },
  {
    name: "Bun Maskan & Kulhad Lassi",
    category: "Breakfast & Dairy",
    sales: 310000,
    orders: 219,
    growth: 8,
    percentageWidth: 64,
  },
  {
    name: "Vada Pav Evening Express",
    category: "Fast Food",
    sales: 220000,
    orders: 175,
    growth: 15,
    percentageWidth: 46,
  },
];

export const ProductRankingCard: React.FC = () => {
  return (
    <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 md:p-6 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-navy-900 tracking-tight">
            Top Product & Category Performance
          </h3>
          <p className="text-[11px] font-semibold text-navy-500">
            Instant volume and revenue velocity ranking
          </p>
        </div>

        <Link
          href="/analytics"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Full Product Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3.5">
        {topProductsData.map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-navy-50/40 border border-navy-100/70 hover:bg-navy-50/80 transition-all space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 font-extrabold text-[11px] flex items-center justify-center shrink-0 border border-brand-200/60">
                  #{idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-navy-900 text-xs truncate">{item.name}</div>
                  <div className="text-[10px] text-navy-400 font-medium">{item.category}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-navy-400 block">Revenue</span>
                  <span className="font-mono font-extrabold text-navy-900 text-xs">
                    {formatCurrencyINR(item.sales)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-navy-400 block">Orders</span>
                  <span className="font-mono font-bold text-navy-700 text-xs">
                    {formatNumberIN(item.orders)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-navy-400 block">Growth</span>
                  <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    +{item.growth}%
                  </span>
                </div>
              </div>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="w-full bg-navy-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-700 via-brand-500 to-brand-cyan h-full rounded-full transition-all duration-500"
                style={{ width: `${item.percentageWidth}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
