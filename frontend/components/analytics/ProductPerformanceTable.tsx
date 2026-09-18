"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, ShoppingBag, ArrowRight, Search, Filter } from "lucide-react";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";
import { ProductPerformance } from "@/lib/types";
import { vanikApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface ProductPerformanceTableProps {
  products?: ProductPerformance[];
  merchantId?: string;
  showAnalyticsButton?: boolean;
}

export const ProductPerformanceTable: React.FC<ProductPerformanceTableProps> = ({
  products: initialProducts,
  merchantId = "m-001",
  showAnalyticsButton = true,
}) => {
  const [productsList, setProductsList] = useState<ProductPerformance[]>(initialProducts || mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProductsList(initialProducts);
    }
  }, [initialProducts]);

  useEffect(() => {
    let active = true;
    if (!initialProducts) {
      const load = async () => {
        try {
          const res = await vanikApi.getProductAnalytics(merchantId);
          if (active && res.products && res.products.length > 0) {
            setProductsList(res.products);
          }
        } catch {
          // Keep default
        }
      };
      load();
    }
    return () => {
      active = false;
    };
  }, [merchantId, initialProducts]);

  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory) return false;
      }
      return true;
    });
  }, [productsList, searchQuery, statusFilter]);

  return (
    <div className="bg-white border border-navy-200/80 rounded-[24px] shadow-card overflow-hidden transition-all duration-200 space-y-0">
      {/* Header Bar with Action CTA to Open in Analytics */}
      <div className="p-5 md:p-6 border-b border-navy-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-navy-900 tracking-tight">Product Performance & Attachment</h3>
            <span className="text-xs font-bold text-navy-700 bg-navy-100/80 px-3 py-0.5 rounded-full border border-navy-200/60">
              {filteredProducts.length} Menu SKUs
            </span>
          </div>
          <p className="text-xs font-medium text-navy-500 mt-0.5">
            Identify high-velocity anchors vs items suffering demand decoupling
          </p>
        </div>

        {showAnalyticsButton && (
          <Link href="/analytics?tab=products" className="self-start sm:self-auto">
            <Button variant="primary" size="sm" className="font-bold shadow-xs">
              <span>Open Product Analytics</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        )}
      </div>

      {/* User-Friendly Filter Controls (Search + Status Filter) */}
      <div className="px-5 py-3 bg-navy-50/50 border-b border-navy-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-navy-400" />
          <input
            type="text"
            placeholder="Search menu item or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white border border-navy-200/80 rounded-full pl-9 pr-3 py-1.5 text-navy-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-navy-400 shrink-0" />
          <span className="font-bold text-navy-700">Status:</span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-navy-200/80">
            {["ALL", "GROWING", "STEADY", "DECLINING"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  statusFilter === st
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-navy-600 hover:text-navy-900 hover:bg-navy-50"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Table with Visual Progress Bar */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-navy-700">
          <thead className="bg-navy-50/80 border-b border-navy-100 text-[11px] font-extrabold uppercase tracking-wider text-navy-400">
            <tr>
              <th className="py-3.5 px-5 font-bold">Product Item</th>
              <th className="py-3.5 px-5 font-bold">Category</th>
              <th className="py-3.5 px-5 font-bold">Units Sold</th>
              <th className="py-3.5 px-5 font-bold">Avg Selling Price</th>
              <th className="py-3.5 px-5 font-bold">Revenue</th>
              <th className="py-3.5 px-5 font-bold">Share</th>
              <th className="py-3.5 px-5 font-bold">Growth Trend</th>
              <th className="py-3.5 px-5 font-bold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100/70">
            {filteredProducts.map((p) => {
              return (
                <tr key={p.id} className="hover:bg-navy-50/60 transition-colors group">
                  <td className="py-3.5 px-5 font-bold text-navy-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 border border-brand-200/50 flex items-center justify-center shrink-0 group-hover:bg-brand-500 group-hover:text-white transition-all">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-navy-600">{p.category}</td>
                  <td className="py-3.5 px-5 font-mono font-bold text-navy-900">
                    {formatNumberIN(p.unitsSold)}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-navy-700">
                    {formatCurrencyINR(p.averageSellingPrice)}
                  </td>
                  <td className="py-3.5 px-5 font-mono font-extrabold text-navy-900">
                    {formatCurrencyINR(p.revenue)}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="space-y-1 min-w-[70px]">
                      <span className="font-bold text-navy-800 text-[11px] block">{p.revenueSharePercent}%</span>
                      <div className="w-full bg-navy-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-brand-500 h-full rounded-full"
                          style={{ width: `${Math.min(p.revenueSharePercent * 2.5, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-xs ${
                        p.growthPercent > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {p.growthPercent > 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      <span>{p.growthPercent > 0 ? `+${p.growthPercent}%` : `${p.growthPercent}%`}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                        p.status === "GROWING"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                          : p.status === "STEADY"
                          ? "bg-brand-50 text-brand-700 border-brand-200/80"
                          : "bg-rose-50 text-rose-700 border-rose-200/80"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
