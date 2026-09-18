"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, ShoppingBag } from "lucide-react";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";
import { ProductPerformance } from "@/lib/types";
import { vanikApi } from "@/lib/api";

interface ProductPerformanceTableProps {
  products?: ProductPerformance[];
  merchantId?: string;
}

export const ProductPerformanceTable: React.FC<ProductPerformanceTableProps> = ({
  products: initialProducts,
  merchantId = "m-001",
}) => {
  const [productsList, setProductsList] = useState<ProductPerformance[]>(initialProducts || mockProducts);

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

  return (
    <div className="bg-white border border-navy-100 rounded-2xl shadow-card overflow-hidden">
      <div className="p-5 border-b border-navy-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-navy-900 tracking-tight">Product Performance & Attachment</h3>
          <p className="text-xs text-navy-500 mt-0.5">
            Identify high-velocity anchors vs items suffering demand decoupling
          </p>
        </div>
        <span className="text-xs font-bold text-navy-500 bg-navy-50 px-2.5 py-1 rounded-lg border border-navy-100">
          {productsList.length} Core Menu SKUs
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-navy-700">
          <thead className="bg-navy-50/70 border-b border-navy-100 text-[11px] font-bold uppercase tracking-wider text-navy-400">
            <tr>
              <th className="py-3 px-4 font-bold">Product Item</th>
              <th className="py-3 px-4 font-bold">Category</th>
              <th className="py-3 px-4 font-bold">Units Sold</th>
              <th className="py-3 px-4 font-bold">Avg Selling Price</th>
              <th className="py-3 px-4 font-bold">Revenue</th>
              <th className="py-3 px-4 font-bold">Share</th>
              <th className="py-3 px-4 font-bold">Growth Trend</th>
              <th className="py-3 px-4 font-bold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {productsList.map((p) => {
              const isDeclining = p.status === "DECLINING";
              return (
                <tr key={p.id} className="hover:bg-navy-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-navy-900">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-navy-400" />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-navy-600">{p.category}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-navy-800">
                    {formatNumberIN(p.unitsSold)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-navy-700">
                    {formatCurrencyINR(p.averageSellingPrice)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-navy-900">
                    {formatCurrencyINR(p.revenue)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-navy-600">
                    {p.revenueSharePercent}%
                  </td>
                  <td className="py-3.5 px-4">
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
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        p.status === "GROWING"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : p.status === "STEADY"
                          ? "bg-brand-50 text-brand-700 border-brand-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
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
